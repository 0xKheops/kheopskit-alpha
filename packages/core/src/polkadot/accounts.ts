import type { PolkadotWallet } from "@/api/types";
import { getInjectedAccountId, type InjectedAccountId } from "@/utils";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import {
  combineLatest,
  distinct,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import { polkadotWallets$ } from "./wallets";

export type PolkadotAccount = InjectedPolkadotAccount & {
  id: InjectedAccountId;
  platform: "polkadot";
  wallet: string;
};

const getWalletAccounts$ = (
  wallet: PolkadotWallet
): Observable<PolkadotAccount[]> => {
  if (!wallet.isEnabled) return of([]);

  return new Observable<PolkadotAccount[]>((subscriber) => {
    const getAccount = (account: InjectedPolkadotAccount): PolkadotAccount => ({
      id: getInjectedAccountId(wallet.id, account.address),
      ...account,
      platform: "polkadot",
      wallet: wallet.name,
    });

    // console.log("[kheopskit] getWalletAccounts$ subscribe", wallet.name);

    // subscribe to changes
    const unsubscribe = wallet.extension.subscribe((accounts) => {
      //      console.log("accounts for ", wallet.name, { accounts });
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
        map((accounts) => accounts.flat()),
        distinct((a) => a.map((a) => a.id).join(","))
      )
      .subscribe((val) => {
        subscriber.next(val);
      });

    return () => {
      sub.unsubscribe();
    };
  }
).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

polkadotAccounts$.subscribe(() => {
  console.count("[kheopskit] polkadotAccounts$ emit");
});
