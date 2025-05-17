import type { PolkadotAccount, PolkadotWallet } from "@/api/types";
import { getWalletAccountId } from "@/utils";
import { logObservable } from "@/utils/logObservable";
import type {
  InjectedExtension,
  InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
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

    const extension = wallet.extension as InjectedExtension;

    // subscribe to changes
    const unsubscribe = extension.subscribe((accounts) => {
      subscriber.next(accounts.map(getAccount));
    });

    // initial value
    subscriber.next(extension.getAccounts().map(getAccount));

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
        distinctUntilChanged(isSameAccountsList),
      )
      .subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  },
).pipe(
  logObservable("polkadotAccounts$"),
  shareReplay({ refCount: true, bufferSize: 1 }),
);

const isSameAccountsList = (a: PolkadotAccount[], b: PolkadotAccount[]) => {
  if (a.length !== b.length) return false;
  return a.every((account, i) => account.id === b[i]?.id);
};
