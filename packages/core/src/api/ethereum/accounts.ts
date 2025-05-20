import type {
  EthereumAccount,
  EthereumAppKitWallet,
  EthereumInjectedWallet,
  EthereumWallet,
} from "@/api/types";
import { getWalletAccountId } from "@/utils";
import { logObservable } from "@/utils/logObservable";
import type UniversalProvider from "@walletconnect/universal-provider";
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import {
  type EIP1193Provider,
  createWalletClient,
  custom,
  getAddress,
} from "viem";
import { mainnet } from "viem/chains";

const getInjectedWalletAccounts$ = (
  wallet: EthereumInjectedWallet,
): Observable<EthereumAccount[]> => {
  if (!wallet.isConnected) return of([]);

  return new Observable<EthereumAccount[]>((subscriber) => {
    const getAccount = (address: string, i: number): EthereumAccount => {
      const client = createWalletClient({
        transport: custom(wallet.provider as EIP1193Provider),
      });

      return {
        id: getWalletAccountId(wallet.id, address),
        platform: "ethereum",
        client,
        address: getAddress(address),
        walletName: wallet.name,
        walletId: wallet.id,
        isWalletDefault: i === 0,
      };
    };

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

const wrapWalletConnectProvider = (
  provider: EIP1193Provider,
  sessionTopic: string,
  caipNetworkId: string,
): EIP1193Provider => {
  return new Proxy(provider, {
    get(target, prop, receiver) {
      if (prop !== "request") return Reflect.get(target, prop, receiver);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return (args: any) => {
        if (args && typeof args === "object" && args.method) {
          if (!args.topic) args.topic = sessionTopic;
          if (!args.chainId) args.chainId = caipNetworkId;
        }
        return target.request(args);
      };
    },
  });
};

const getAppKitAccounts$ = (
  wallet: EthereumAppKitWallet,
): Observable<EthereumAccount[]> => {
  const account = wallet.appKit.getAccount("eip155");
  const provider = wallet.appKit.getProvider<UniversalProvider>("eip155");

  if (
    !wallet.isConnected ||
    !wallet.appKit ||
    !account?.allAccounts.length ||
    !provider?.session
  )
    return of([]);

  const wrappedProvider = wrapWalletConnectProvider(
    provider as EIP1193Provider,
    provider.session.topic,
    "eip155:1",
  );

  return of(
    account.allAccounts.map((acc, i): EthereumAccount => {
      const client = createWalletClient({
        account: acc.address as `0x${string}`,
        chain: mainnet,
        transport: custom(wrappedProvider),
      });

      return {
        id: getWalletAccountId(wallet.id, acc.address),
        platform: "ethereum",
        walletName: wallet.name,
        walletId: wallet.id,
        address: acc.address as `0x${string}`,
        client,
        isWalletDefault: i === 0,
      };
    }),
  );
};

export const getEthereumAccounts$ = (
  ethereumWallets: Observable<EthereumWallet[]>,
) =>
  new Observable<EthereumAccount[]>((subscriber) => {
    const sub = ethereumWallets
      .pipe(
        map((wallets) => wallets.filter((w) => w.isConnected)),
        switchMap((wallets) => {
          console.log("Ethereum wallets", wallets);
          return wallets.length
            ? combineLatest([
                ...wallets
                  .filter((w) => w.type === "injected")
                  .map(getInjectedWalletAccounts$),
                ...wallets
                  .filter((w) => w.type === "appKit")
                  .map(getAppKitAccounts$),
                // todo appkit
              ])
            : of([]);
        }),
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

const isSameAccountsList = (a: EthereumAccount[], b: EthereumAccount[]) => {
  if (a.length !== b.length) return false;
  return a.every((account, i) => account.id === b[i]?.id);
};
