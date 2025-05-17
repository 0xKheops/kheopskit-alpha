import { sortAccounts } from "@/utils/sortAccounts";
import { Observable, combineLatest, map, of, shareReplay } from "rxjs";
import { ethereumAccounts$ } from "./ethereum/accounts";
import { getPolkadotAccounts$ } from "./polkadot/accounts";
import type { KheopskitConfig, Wallet, WalletAccount } from "./types";

export const getAccounts$ = (
  config: KheopskitConfig,
  wallets: Observable<Wallet[]>,
) => {
  return new Observable<WalletAccount[]>((subscriber) => {
    const observables = config.platforms.map<Observable<WalletAccount[]>>(
      (platform) => {
        switch (platform) {
          case "polkadot":
            return getPolkadotAccounts$(
              wallets.pipe(
                map((w) => w.filter((w) => w.platform === "polkadot")),
              ),
            );
          case "ethereum":
            return ethereumAccounts$;
        }
      },
    );

    const accounts$ = observables.length
      ? combineLatest(observables).pipe(
          map((accounts) => accounts.flat().sort(sortAccounts)),
        )
      : of([]);

    const sub = accounts$.subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
};
