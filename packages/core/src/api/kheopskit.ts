import { Observable, combineLatest, shareReplay } from "rxjs";
import { getAccounts$ } from "./accounts";
import { getConfig } from "./config";
import type { KheopskitConfig, Wallet, WalletAccount } from "./types";
import { getWallets$ } from "./wallets";

export type { KheopskitConfig } from "./types";

export type KheopskitState = { wallets: Wallet[]; accounts: WalletAccount[] };

export const getKheopskit$ = (config?: Partial<KheopskitConfig>) => {
  const kc = getConfig(config);

  console.log("[kheopskit] config", kc);

  return new Observable<KheopskitState>((subscriber) => {
    const wallets$ = getWallets$(kc);

    const subscription = combineLatest({
      wallets: wallets$,
      accounts: getAccounts$(kc, wallets$),
    }).subscribe(subscriber);

    return () => {
      subscription.unsubscribe();
    };
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
};
