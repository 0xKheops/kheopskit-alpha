import type {
  PolkadotAccount,
  PolkadotAppKitWallet,
  PolkadotInjectedWallet,
  PolkadotWallet,
} from "@/api/types";
import { getWalletAccountId } from "@/utils";
import { logObservable } from "@/utils/logObservable";
import type { AppKit } from "@reown/appkit/core";
import type UniversalProvider from "@walletconnect/universal-provider";
import {
  type InjectedExtension,
  type InjectedPolkadotAccount,
  getPolkadotSignerFromPjs,
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

const getPolkadotSigner = (appKit: AppKit, address: string) => {
  const provider = appKit.getProvider<UniversalProvider>("polkadot");
  if (!provider) throw new Error("No provider found");
  if (!provider.session) throw new Error("No session found");

  // console.log("session", provider.session);

  // const networks = appKit.getCaipNetworks("polkadot");
  // const chainId = networks[0]?.caipNetworkId;
  // console.log("networks", networks);

  return getPolkadotSignerFromPjs(
    address,
    (transactionPayload) => {
      if (!provider.session) throw new Error("No session found");

      return provider.client.request({
        topic: provider.session.topic,
        chainId: `polkadot:${transactionPayload.genesisHash.substring(2, 34)}`,
        request: {
          method: "polkadot_signTransaction",
          params: {
            address,
            transactionPayload,
          },
        },
      });
    },
    async ({ address, data }) => {
      if (!provider.session) throw new Error("No session found");
      const networks = appKit.getCaipNetworks("polkadot");
      const chainId = networks[0]?.caipNetworkId;
      if (!chainId) throw new Error("No chainId found");

      return provider.client.request({
        topic: provider.session.topic,
        chainId, // `polkadot:${provider.session.namespaces.polkadot.chains[0]}`,
        request: {
          method: "polkadot_signMessage",
          params: {
            address,
            message: data,
          },
        },
      });
    },
  );
};

const getAppKitAccounts$ = (wallet: PolkadotAppKitWallet) => {
  const account = wallet.appKit.getAccount("polkadot");

  if (!account?.address || !wallet.isConnected || !wallet.appKit) return of([]);

  return new Observable<PolkadotAccount[]>((subscriber) => {
    // TODO check impact of not being able to unsubscribe
    // const accounts$ = new BehaviorSubject<PolkadotAccount[]>([]);

    const address = account.address as string;

    const providerType = wallet.appKit.getProviderType("polkadot");
    console.log("Provider type", { providerType });

    const provider = wallet.appKit.getProvider<UniversalProvider>("polkadot");
    console.log("Provider", { provider });

    subscriber.next([
      {
        id: getWalletAccountId(wallet.id, address as string),
        platform: "polkadot",
        walletName: "AppKit",
        walletId: "appkit",
        address,
        polkadotSigner: getPolkadotSigner(wallet.appKit, address),
        genesisHash: null,
        name: "AppKit Polkadot",
        type: "sr25519",
      },
    ]);

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
