import type { EthereumAccount, EthereumWallet } from "@/api/types";
import { getWalletAccountId } from "@/utils";
import {
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import { getAddress, type EIP1193Provider } from "viem";
import { ethereumWallets$ } from "./wallets";

const getWalletAccounts$ = (
  wallet: EthereumWallet
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

ethereumAccounts$.subscribe(() => {
  console.count("[kheopskit] ethereumAccounts$ emit");
});
