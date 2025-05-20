import { store } from "@/api/store";
import type {
  EthereumInjectedWallet,
  EthereumWallet,
  KheopskitConfig,
} from "@/api/types";
import { type WalletId, getWalletId } from "@/utils/WalletId";
import { logObservable } from "@/utils/logObservable";
import { type EIP6963ProviderDetail, createStore } from "mipd";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  shareReplay,
} from "rxjs";
import type { EIP1193Provider } from "viem";
import { getAppKitWallets$ } from "../appKit";

const providersDetails$ = new Observable<EIP6963ProviderDetail[]>(
  (subscriber) => {
    const store = createStore();

    const unsubscribe = store.subscribe((providerDetails) => {
      subscriber.next(providerDetails as EIP6963ProviderDetail[]);
    });

    const providerDetails = store.getProviders();

    subscriber.next(providerDetails as EIP6963ProviderDetail[]);

    return () => {
      unsubscribe();
      store.destroy();
    };
  },
).pipe(
  logObservable("providersDetails$"),
  shareReplay({ refCount: true, bufferSize: 1 }),
);

// const getInjectedWalletClient$ = (provider: EIP1193Provider) => {
//   return new Observable<WalletClient>((subscriber) => {
//     const client = createWalletClient({
//       transport: custom(provider),
//     });

//     const connected$ = new BehaviorSubject<boolean>(false);
//     const chainId$ = new BehaviorSubject<string | undefined>(undefined);
//     const addresses$ = new BehaviorSubject<string[]>([]);

//     const handleAccountsChanged = (addresses: string[]) => {
//       console.log("injected accounts changed", addresses);
//       addresses$.next(addresses);
//     };
//     const handleChainChanged = (chainId: string) => {
//       console.log("injected chain changed", chainId);
//       chainId$.next(chainId);
//     };
//     const handleDisconnect = (error: Error) => {
//       console.log("injected wallet disconnect", error);
//       connected$.next(false);
//     };
//     const handleConnect = (info: { chainId: string }) => {
//       console.log("injected wallet connect", info);
//       connected$.next(true);
//       chainId$.next(info.chainId);
//     };

//     provider.on("chainChanged", handleChainChanged);
//     provider.on("accountsChanged", handleAccountsChanged);
//     provider.on("disconnect", handleDisconnect);
//     provider.on("connect", handleConnect);

//     combineLatest([connected$, chainId$, addresses$]).subscribe(() => {
//       subscriber.next(client);
//     });

//     return () => {
//       provider.removeListener("chainChanged", handleChainChanged);
//       provider.removeListener("accountsChanged", handleAccountsChanged);
//       provider.removeListener("disconnect", handleDisconnect);
//       provider.removeListener("connect", handleConnect);
//     };
//   });
// };

const ethereumInjectedWallets$ = new Observable<EthereumInjectedWallet[]>(
  (subscriber) => {
    const enabledWalletIds$ = new BehaviorSubject<Set<WalletId>>(new Set());

    const connectWallet = async (
      walletId: WalletId,
      provider: EIP1193Provider,
    ) => {
      if (enabledWalletIds$.value.has(walletId))
        throw new Error(`Extension ${walletId} already connected`);

      await provider.request({
        method: "eth_requestAccounts",
      });

      const newSet = new Set(enabledWalletIds$.value);
      newSet.add(walletId);
      enabledWalletIds$.next(newSet);

      store.addEnabledWalletId(walletId);
    };

    const disconnectWallet = async (
      walletId: WalletId,
      _provider: EIP1193Provider,
    ) => {
      if (!enabledWalletIds$.value.has(walletId))
        throw new Error(`Extension ${walletId} is not connected`);
      const newSet = new Set(enabledWalletIds$.value);
      newSet.delete(walletId);
      enabledWalletIds$.next(newSet);

      store.removeEnabledWalletId(walletId);
    };

    const sub = combineLatest([providersDetails$, enabledWalletIds$])
      .pipe(
        map(([providerDetails, enabledWalletIds]) => {
          return providerDetails.map((pd): EthereumInjectedWallet => {
            const walletId = getWalletId("ethereum", pd.info.rdns);
            const provider = pd.provider as EIP1193Provider;

            return {
              platform: "ethereum",
              type: "injected",
              id: walletId,
              name: pd.info.name,
              icon: pd.info.icon,
              provider,
              isConnected: enabledWalletIds.has(walletId),
              providerId: pd.info.rdns,
              connect: () => connectWallet(walletId, provider),
              disconnect: () => disconnectWallet(walletId, provider),
            };
          });
        }),
      )
      .subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  },
).pipe(
  logObservable("ethereumWallets$"),
  shareReplay({ refCount: true, bufferSize: 1 }),
);

export const getEthereumWallets$ = (config: KheopskitConfig) => {
  return new Observable<EthereumWallet[]>((subscriber) => {
    const subscription = combineLatest([
      ethereumInjectedWallets$,
      getAppKitWallets$(config)?.pipe(map((w) => w.ethereum)),
    ])
      .pipe(
        map(([injectedWallets, appKitWallet]) =>
          appKitWallet ? [...injectedWallets, appKitWallet] : injectedWallets,
        ),
      )
      .subscribe(subscriber);

    return () => {
      subscription.unsubscribe();
    };
  }).pipe(
    logObservable("getEthereumWallets$"),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
};
