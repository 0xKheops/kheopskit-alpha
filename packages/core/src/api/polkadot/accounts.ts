import type { PolkadotAccount, PolkadotWallet } from "@/api/types";
import { getWalletAccountId } from "@/utils";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import {
  Observable,
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import { polkadotWallets$ } from "./wallets";

const getWalletAccounts$ = (
  wallet: PolkadotWallet,
): Observable<PolkadotAccount[]> => {
  if (!wallet.isConnected) return of([]);

  return new Observable<PolkadotAccount[]>((subscriber) => {
    const getAccount = (account: InjectedPolkadotAccount): PolkadotAccount => ({
      id: getWalletAccountId(wallet.id, account.address),
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
        map((wallets) => wallets.filter((w) => w.isConnected)),
        switchMap((wallets) =>
          wallets.length
            ? combineLatest(wallets.map(getWalletAccounts$))
            : of([]),
        ),
        map((accounts) => accounts.flat()),
      )
      .subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  },
).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

polkadotAccounts$.subscribe(() => {
  console.count("[kheopskit] polkadotAccounts$ emit");
});
