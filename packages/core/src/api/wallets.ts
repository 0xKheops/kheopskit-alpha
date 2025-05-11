import {
  combineLatest,
  distinct,
  filter,
  map,
  mergeMap,
  type Observable,
  shareReplay,
  switchMap,
  take,
  tap,
} from "rxjs";
import { platforms$, shouldAutoReconnect$ } from "./config";
import type { Wallet } from "./types";
import { polkadotWallets$ } from "./polkadot/wallets";
import { ethereumWallets$ } from "./ethereum/wallets";
import { store } from "./store";

export const wallets$ = platforms$.pipe(
  tap((val) => {
    console.log("[kheopskit] wallets$ platforms", val);
    return val;
  }),
  switchMap((platforms) => {
    const observables = platforms.map<Observable<Wallet[]>>((platform) => {
      switch (platform) {
        case "polkadot":
          return polkadotWallets$;
        case "ethereum":
          return ethereumWallets$;
      }
    });

    return combineLatest(observables);
  }),

  map((wallets) => wallets.flat()),
  shareReplay({ refCount: true, bufferSize: 1 })
);

wallets$.subscribe(() => {
  console.count("[kheopskit] wallets$ emit");
});

combineLatest([
  shouldAutoReconnect$,
  wallets$,
  store.observable.pipe(
    map((s) => s.autoReconnect),
    take(1)
  ),
])
  .pipe(
    filter(
      ([autoReconnect, , walletIds]) => autoReconnect && !!walletIds?.length
    ),
    mergeMap(([, wallets, walletIds]) =>
      wallets.filter((wallet) => walletIds?.includes(wallet.id))
    ),
    distinct((w) => w.id)
  )
  .subscribe(async (wallet) => {
    if (wallet.isEnabled) {
      console.log("Wallet %s already connected", wallet.id);
      return;
    }
    console.log("Reconnecting", wallet.id);
    try {
      await wallet.connect();
    } catch (err) {
      console.error("Failed to reconnect wallet %s", wallet.id, { err });
    }
  });
