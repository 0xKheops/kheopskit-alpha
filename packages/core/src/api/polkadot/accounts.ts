import type {
  PolkadotAccount,
  PolkadotAppKitWallet,
  PolkadotInjectedWallet,
  PolkadotWallet,
} from "@/api/types";
import { getWalletAccountId } from "@/utils";
import { logObservable } from "@/utils/logObservable";
import type {
  InjectedExtension,
  InjectedPolkadotAccount,
  PolkadotSigner,
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

const getInjectedWalletAccounts$ = (
  wallet: PolkadotInjectedWallet,
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

const getAppKitAccounts$ = (wallet: PolkadotAppKitWallet) => {
  if (!wallet.isConnected || !wallet.appKit) return of([]);

  return new Observable<PolkadotAccount[]>((subscriber) => {
    // TODO check impact of not being able to unsubscribe
    // const accounts$ = new BehaviorSubject<PolkadotAccount[]>([]);

    const test = wallet.appKit.subscribeAccount((account) => {
      console.log("[AppKit] Polkadot Account changed", account);
      if (account.isConnected && account.address) {
        subscriber.next([
          {
            id: getWalletAccountId(wallet.id, account.address),
            platform: "polkadot",
            walletName: "AppKit",
            walletId: "appkit",
            address: account.address,
            polkadotSigner: null as unknown as PolkadotSigner,
            genesisHash: null,
            name: "AppKit Polkadot",
            type: "sr25519",
          },
        ]);
      } else {
        subscriber.next([]);
      }
    }, "polkadot");

    console.log({ test });

    return () => {
      // unsubscribe();
    };
  });
};

export const getPolkadotAccounts$ = (
  polkadotWallets$: Observable<PolkadotWallet[]>,
) =>
  new Observable<PolkadotAccount[]>((subscriber) => {
    const sub = polkadotWallets$
      .pipe(
        map((wallets) => wallets.filter((w) => w.isConnected)),
        switchMap((wallets) =>
          wallets.length
            ? combineLatest([
                ...wallets
                  .filter((w) => w.type === "injected")
                  .map(getInjectedWalletAccounts$),
                ...wallets
                  .filter((w) => w.type === "appKit")
                  .map(getAppKitAccounts$),
                // todo appkit
              ])
            : of([]),
        ),
        map((accounts) => accounts.flat()),
        distinctUntilChanged(isSameAccountsList),
      )
      .subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  }).pipe(
    logObservable("polkadotAccounts$", true),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

const isSameAccountsList = (a: PolkadotAccount[], b: PolkadotAccount[]) => {
  if (a.length !== b.length) return false;
  return a.every((account, i) => account.id === b[i]?.id);
};
