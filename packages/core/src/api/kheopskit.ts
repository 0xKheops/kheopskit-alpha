import {
  Observable,
  combineLatest,
  map,
  shareReplay,
  throttleTime,
} from "rxjs";
import { getAccounts$ } from "./accounts";
import { resolveConfig } from "./config";
import type { KheopskitConfig, Wallet, WalletAccount } from "./types";
import { getWallets$ } from "./wallets";

export type { KheopskitConfig } from "./types";

export type KheopskitState = {
  wallets: Wallet[];
  accounts: WalletAccount[];
  config: KheopskitConfig;
};

export const getKheopskit$ = (config?: Partial<KheopskitConfig>) => {
  const kc = resolveConfig(config);

  console.log("[kheopskit] config", kc);

  return new Observable<KheopskitState>((subscriber) => {
    const wallets$ = getWallets$(kc);

    const subscription = combineLatest({
      wallets: wallets$,
      accounts: getAccounts$(kc, wallets$),
    })
      .pipe(map(({ wallets, accounts }) => ({ config: kc, wallets, accounts })))
      .subscribe((next) => {
        console.log("[kheopskit] next", next);
        subscriber.next(next);
      });

    return () => {
      subscription.unsubscribe();
    };
  }).pipe(
    throttleTime(50, undefined, { leading: true, trailing: true }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
};
