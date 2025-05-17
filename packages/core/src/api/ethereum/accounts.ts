import type { EthereumAccount, EthereumWallet } from "@/api/types";
import { getWalletAccountId } from "@/utils";
import { logObservable } from "@/utils/logObservable";
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import { type EIP1193Provider, getAddress } from "viem";
import { ethereumWallets$ } from "./wallets";

const getWalletAccounts$ = (
  wallet: EthereumWallet,
): Observable<EthereumAccount[]> => {
  if (!wallet.isConnected) return of([]);

  return new Observable<EthereumAccount[]>((subscriber) => {
    const getAccount = (address: string, i: number): EthereumAccount => ({
      id: getWalletAccountId(wallet.id, address),
      platform: "ethereum",
      provider: wallet.provider as EIP1193Provider,
      address: getAddress(address),
      walletName: wallet.name,
      walletId: wallet.id,
      isWalletDefault: i === 0,
    });

    const listener = (addresses: string[]) => {
      subscriber.next(addresses.map(getAccount));
    };

    // subscribe to changes
    wallet.provider.on("accountsChanged", listener);

    // initial value
    wallet.provider
      .request({ method: "eth_accounts" })
      .then((addresses: string[]) => {
        subscriber.next(addresses.map(getAccount));
      })
      .catch((err) => {
        console.error("Failed to get accounts", err);
        subscriber.next([]);
      });

    return () => {
      wallet.provider.removeListener("accountsChanged", listener);
    };
  });
};

export const ethereumAccounts$ = new Observable<EthereumAccount[]>(
  (subscriber) => {
    const sub = ethereumWallets$
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
  logObservable("ethereumAccounts$"),
  shareReplay({ refCount: true, bufferSize: 1 }),
);

const isSameAccountsList = (a: EthereumAccount[], b: EthereumAccount[]) => {
  if (a.length !== b.length) return false;
  return a.every((account, i) => account.id === b[i]?.id);
};
