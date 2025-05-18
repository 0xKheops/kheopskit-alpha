import { getWalletId } from "@/utils/WalletId";
import { createAppKit } from "@reown/appkit/core";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
} from "rxjs";
import type {
  EthereumAppKitWallet,
  KheopskitConfig,
  PolkadotAppKitWallet,
} from "./types";

type AppKitWallets = {
  polkadot?: PolkadotAppKitWallet;
  ethereum?: EthereumAppKitWallet;
};

// once it exists, appKit object should never be recreated
let cachedAppKit: Observable<AppKitWallets> | null = null;

export const getAppKitWallets$ = (
  config: KheopskitConfig,
): Observable<AppKitWallets> => {
  if (!config.walletConnect) return of({}); // of(null).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  const walletConnect = config.walletConnect;

  if (!cachedAppKit) {
    cachedAppKit = new Observable<AppKitWallets>((subscriber) => {
      const appKit = createAppKit({
        projectId: walletConnect.projectId,
        metadata: walletConnect.metadata,
        networks: walletConnect.networks,
        universalProviderConfigOverride: {
          methods: {
            polkadot: ["polkadot_signTransaction", "polkadot_signMessage"],
          },
        },
      });

      const status$ = new BehaviorSubject({
        isPolkadotConnected: false,
        isEthereumConnected: false,
      });

      const unsubProviders = appKit.subscribeProviders((providers) => {
        status$.next({
          isPolkadotConnected: !!providers.polkadot,
          isEthereumConnected: !!providers.eip155,
        });
      });

      const polkadotWallet$ = appKit.chainNamespaces.includes("polkadot")
        ? status$.pipe(
            map((s) => s.isPolkadotConnected),
            distinctUntilChanged(),
            map((isConnected): PolkadotAppKitWallet => {
              const walletInfo = appKit.getWalletInfo();

              return {
                id: getWalletId("polkadot", "walletconnect"),
                platform: "polkadot",
                type: "appKit",
                appKit, // todo maybe we dont want to expose the appKit instance
                name: walletInfo?.name ?? "WalletConnect",
                // icon: walletInfo?.icon,
                connect: async () => {
                  if (!isConnected) await appKit.open();
                },
                disconnect: () => {
                  if (isConnected) appKit.disconnect();
                },
                isConnected,
              };
            }),
          )
        : of(undefined);

      const ethereumWallet$ = appKit.chainNamespaces.includes("eip155")
        ? status$.pipe(
            map((s) => s.isEthereumConnected),
            distinctUntilChanged(),
            map((isConnected): EthereumAppKitWallet => {
              const walletInfo = appKit.getWalletInfo();

              return {
                id: getWalletId("ethereum", "walletconnect"),
                platform: "ethereum",
                type: "appKit",
                appKit,
                icon: walletInfo?.icon ?? "",
                name: "WalletConnect",
                connect: () => appKit.open(),
                disconnect: () => appKit.disconnect(),
                isConnected,
              };
            }),
          )
        : of(undefined);

      const sub = combineLatest({
        polkadot: polkadotWallet$,
        ethereum: ethereumWallet$,
      }).subscribe(subscriber);

      return () => {
        console.log("[AppKit] Unsubscribe providers");
        sub.unsubscribe();
        unsubProviders();
      };
    }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  }

  return cachedAppKit;
};
