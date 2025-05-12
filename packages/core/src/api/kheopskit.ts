import { Observable, combineLatest, map, shareReplay } from "rxjs";
import { getAccounts$ } from "./accounts";
import { getConfig } from "./config";
import type { KheopskitConfig, Wallet, WalletAccount } from "./types";
import { getWallets$ } from "./wallets";

export type { KheopskitConfig } from "./types";

export const getKheopskit$ = (config?: Partial<KheopskitConfig>) => {
  const c = getConfig(config);

  return new Observable<{ wallets: Wallet[]; accounts: WalletAccount[] }>(
    (subscriber) => {
      const subscription = combineLatest([getWallets$(c), getAccounts$(c)])
        .pipe(map(([wallets, accounts]) => ({ wallets, accounts })))
        .subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
      };
    },
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
};
