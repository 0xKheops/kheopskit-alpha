import {
  combineLatest,
  distinct,
  filter,
  map,
  mergeMap,
  Observable,
  of,
  shareReplay,
  take,
} from "rxjs";
import type { ResolvedConfig } from "./config";
import { ethereumWallets$ } from "./ethereum/wallets";
import { polkadotWallets$ } from "./polkadot/wallets";
import { store } from "./store";
import type { Wallet } from "./types";

// lock the list of wallets to auto reconnect on first call
const autoReconnectWalletIds$ = store.observable.pipe(
  map((s) => s.autoReconnect ?? []),
  take(1),
  shareReplay(1)
);

export const getWallets$ = (config: ResolvedConfig) => {
  return new Observable<Wallet[]>((subscriber) => {
    const observables = config.platforms.map<Observable<Wallet[]>>(
      (platform) => {
        switch (platform) {
          case "polkadot":
            return polkadotWallets$;
          case "ethereum":
            return ethereumWallets$;
        }
      }
    );

    const wallets$ = observables.length
      ? combineLatest(observables).pipe(map((wallets) => wallets.flat()))
      : of([]);

    const subAutoReconnect = combineLatest([wallets$, autoReconnectWalletIds$])
      .pipe(
        filter(([, walletIds]) => config.autoReconnect && !!walletIds?.length),
        mergeMap(([wallets, walletIds]) =>
          wallets.filter((wallet) => walletIds?.includes(wallet.id))
        ),
        distinct((w) => w.id)
      )
      .subscribe(async (wallet) => {
        if (wallet.isConnected) {
          console.warn("Wallet %s already connected", wallet.id);
          return;
        }

        try {
          await wallet.connect();
        } catch (err) {
          console.error("Failed to reconnect wallet %s", wallet.id, { err });
        }
      });

    const subWallets = wallets$.subscribe(subscriber);

    return () => {
      subAutoReconnect.unsubscribe();
      subWallets.unsubscribe();
    };
  }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
};
