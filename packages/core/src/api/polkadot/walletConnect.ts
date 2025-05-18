import { getWalletId } from "@/utils/WalletId";
import { logObservable } from "@/utils/logObservable";
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
} from "rxjs";
import type { PolkadotAppKitWallet, PolkadotWallet } from "../types";

import type { AppKit } from "@reown/appkit/core";

// const getPolkadotNetworks = (
//   config: KheopskitConfig,
// ): [AppKitNetwork, ...AppKitNetwork[]] | null => {
//   return (
//     (config.walletConnect?.networks.filter(
//       (n) => "caipNetworkId" in n && n.caipNetworkId.startsWith("polkadot:"),
//     ) as [AppKitNetwork, ...AppKitNetwork[]]) ?? null
//   );
// };

export const getPolkadotAppKitWallet$ = (appKit: AppKit | null) => {
  if (!appKit?.chainNamespaces.includes("polkadot"))
    return of(null).pipe(
      logObservable("getPolkadotWalletConnect null"),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

  return new Observable<PolkadotWallet>((subscriber) => {
    const isConnected$ = new BehaviorSubject(false);

    const unsubProviders = appKit.subscribeProviders((providers) => {
      console.log("[AppKit] Providers changed", {
        providers,
        polkadot: !!providers.polkadot,
      });
      const isConnected = !!providers.polkadot;
      if (isConnected$.value !== isConnected) isConnected$.next(isConnected);
    });

    // appKit.subscribeAccount((account) => {
    //   if (isConnected$.value !== account.isConnected)
    //     isConnected$.next(account.isConnected);
    // }, "polkadot");

    isConnected$
      .pipe(
        distinctUntilChanged(),
        map(
          (isConnected): PolkadotAppKitWallet => ({
            id: getWalletId("polkadot", "walletconnect"),
            platform: "polkadot",
            type: "appKit",
            appKit,
            name: "WalletConnect",
            connect: () => appKit.open(),
            disconnect: () => appKit.disconnect(),
            isConnected,
          }),
        ),
      )
      .subscribe(subscriber);

    return () => {
      unsubProviders();
    };
  }).pipe(
    logObservable("getPolkadotWalletConnect"),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
  // TODO include session in init
};
