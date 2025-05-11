import { combineLatest, map, Observable, of, shareReplay } from "rxjs";
import type { ResolvedConfig } from "./config";
import { ethereumAccounts$ } from "./ethereum/accounts";
import { polkadotAccounts$ } from "./polkadot/accounts";
import type { WalletAccount } from "./types";

export const getAccounts$ = (config: ResolvedConfig) => {
  return new Observable<WalletAccount[]>((subscriber) => {
    const observables = config.platforms.map<Observable<WalletAccount[]>>(
      (platform) => {
        switch (platform) {
          case "polkadot":
            return polkadotAccounts$;
          case "ethereum":
            return ethereumAccounts$;
        }
      }
    );

    const accounts$ = observables.length
      ? combineLatest(observables).pipe(map((accounts) => accounts.flat()))
      : of([]);

    const sub = accounts$.subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
};
