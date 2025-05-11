import type { PolkadotWallet } from "@/api/types";
import { getAccountId, type AccountId } from "@/utils";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import {
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import { polkadotWallets$ } from "./wallets";

export type PolkadotAccount = InjectedPolkadotAccount & {
  id: AccountId;
  platform: "polkadot";
  walletName: string;
  walletId: string;
};

const getWalletAccounts$ = (
  wallet: PolkadotWallet
): Observable<PolkadotAccount[]> => {
  if (!wallet.isEnabled) return of([]);

  return new Observable<PolkadotAccount[]>((subscriber) => {
    const getAccount = (account: InjectedPolkadotAccount): PolkadotAccount => ({
      id: getAccountId(wallet.id, account.address),
      ...account,
      platform: "polkadot",
      walletName: wallet.name,
      walletId: wallet.id,
    });

    // subscribe to changes
    const unsubscribe = wallet.extension.subscribe((accounts) => {
      subscriber.next(accounts.map(getAccount));
    });

    // initial value
    subscriber.next(wallet.extension.getAccounts().map(getAccount));

    return () => {
      return unsubscribe();
    };
  });
};

export const polkadotAccounts$ = new Observable<PolkadotAccount[]>(
  (subscriber) => {
    const sub = polkadotWallets$
      .pipe(
        map((wallets) => wallets.filter((w) => w.isEnabled)),
        switchMap((wallets) =>
          wallets.length
            ? combineLatest(wallets.map(getWalletAccounts$))
            : of([])
        ),
        map((accounts) => accounts.flat())
      )
      .subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  }
).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

polkadotAccounts$.subscribe(() => {
  console.count("[kheopskit] polkadotAccounts$ emit");
});
