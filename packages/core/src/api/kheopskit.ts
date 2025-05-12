import { Observable, combineLatest, shareReplay, tap } from "rxjs";
import { getAccounts$ } from "./accounts";
import { getConfig } from "./config";
import type { KheopskitConfig, Wallet, WalletAccount } from "./types";
import { getWallets$ } from "./wallets";

export type { KheopskitConfig } from "./types";

export type KheopskitState = { wallets: Wallet[]; accounts: WalletAccount[] };

export const getKheopskit$ = (config?: Partial<KheopskitConfig>) => {
  const kc = getConfig(config);

  return new Observable<KheopskitState>((subscriber) => {
    const subscription = combineLatest({
      wallets: getWallets$(kc),
      accounts: getAccounts$(kc),
    }).subscribe(subscriber);

    return () => {
      subscription.unsubscribe();
    };
  }).pipe(
    tap((state) => {
      console.debug(
        "EMIT kheopskit$ wallets:%s accounts:%s",
        state.wallets.length ?? 0,
        state.accounts.length ?? 0,
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
};
