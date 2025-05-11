import { store } from "@/api/store";
import type { EthereumWallet } from "@/api/types";
import { getWalletId, type WalletId } from "@/utils/WalletId";
import { createStore, type EIP6963ProviderDetail } from "mipd";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  shareReplay,
} from "rxjs";
import type { EIP1193Provider } from "viem";

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
  }
).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

providersDetails$.subscribe(() => {
  console.count("[kheopskit] providers$ emit");
});

export const ethereumWallets$ = new Observable<EthereumWallet[]>(
  (subscriber) => {
    const enabledWalletIds$ = new BehaviorSubject<Set<WalletId>>(new Set());

    const connectWallet = async (
      walletId: WalletId,
      provider: EIP1193Provider
    ) => {
      if (enabledWalletIds$.value.has(walletId))
        throw new Error(`Extension ${walletId} already connected`);

      provider.request({
        method: "eth_requestAccounts",
      });

      const newSet = new Set(enabledWalletIds$.value);
      newSet.add(walletId);
      enabledWalletIds$.next(newSet);

      store.addEnabledWalletId(walletId);
    };

    const disconnectWallet = async (
      walletId: WalletId,
      _provider: EIP1193Provider
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
          return providerDetails.map((pd): EthereumWallet => {
            const walletId = getWalletId("ethereum", pd.info.rdns);
            const provider = pd.provider as EIP1193Provider;

            return {
              platform: "ethereum",
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
        })
      )
      .subscribe(subscriber);

    return () => {
      sub.unsubscribe();
    };
  }
).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

ethereumWallets$.subscribe(() => {
  console.count("[kheopskit] ethereumWallets$ emit");
});
