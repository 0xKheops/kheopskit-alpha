import { Observable, combineLatest, shareReplay } from "rxjs";
import { getAccounts$ } from "./accounts";
import { getAppKit } from "./appKit";
import { getConfig } from "./config";
import type { KheopskitConfig, Wallet, WalletAccount } from "./types";
import { getWallets$ } from "./wallets";

export type { KheopskitConfig } from "./types";

export type KheopskitState = { wallets: Wallet[]; accounts: WalletAccount[] };

export const getKheopskit$ = (config?: Partial<KheopskitConfig>) => {
  const kc = getConfig(config);
  const appKit = getAppKit(kc);

  console.log("[kheopskit] config", kc);

  return new Observable<KheopskitState>((subscriber) => {
    const wallets$ = getWallets$(kc, appKit);

    const subscription = combineLatest({
      wallets: wallets$,
      accounts: getAccounts$(kc, wallets$),
    }).subscribe(subscriber);

    return () => {
      subscription.unsubscribe();
    };
  }).pipe(
    // tap((state) => {
    //   console.debug(
    //     "[kheopskit] observable kheopskit$ wallets:%s accounts:%s",
    //     state.wallets.length ?? 0,
    //     state.accounts.length ?? 0,
    //   );
    // }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
};
