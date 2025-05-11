import {
  combineLatest,
  map,
  type Observable,
  shareReplay,
  switchMap,
  tap,
} from "rxjs";
import { platforms$ } from "./config";
import { ethereumAccounts$ } from "./ethereum/accounts";
import { polkadotAccounts$ } from "./polkadot/accounts";
import type { WalletAccount } from "./types";

export const accounts$ = platforms$.pipe(
  tap((val) => {
    console.log("[kheopskit] wallets$ platforms", val);
    return val;
  }),
  switchMap((platforms) => {
    const observables = platforms.map<Observable<WalletAccount[]>>(
      (platform) => {
        switch (platform) {
          case "polkadot":
            return polkadotAccounts$;
          case "ethereum":
            return ethereumAccounts$;
        }
      }
    );

    return combineLatest(observables);
  }),
  map((accounts) => accounts.flat()),
  shareReplay({ refCount: true, bufferSize: 1 })
);

accounts$.subscribe(() => {
  console.count("[kheopskit] accounts$ emit");
});
