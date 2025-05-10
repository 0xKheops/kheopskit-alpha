import { ethereumWallets$ } from "@/ethereum/wallets";
import { type PolkadotAccount, polkadotAccounts$ } from "@/polkadot/accounts";
import { polkadotWallets$ } from "@/polkadot/wallets";
import {
  combineLatest,
  distinct,
  filter,
  map,
  mergeMap,
  type Observable,
  shareReplay,
  switchMap,
  take,
  tap,
} from "rxjs";
import { platforms$, setConfig, shouldAutoReconnect$ } from "./config";
import { store } from "./store";
import type { Wallet } from "./types";
import { type EthereumAccount, ethereumAccounts$ } from "@/ethereum/accounts";

// const ethereumEnabledExtensionIds$ = store.observable.pipe(
//   map((s) => s.ethereum?.enabledExtensionIds ?? []),
//   shareReplay(1)
// );

// const polkadotAccounts$ = store.observable.pipe(
//   map((s) => s.polkadot?.accounts ?? []),
//   shareReplay(1)
// );

// const ethereumAccounts$ = store.observable.pipe(
//   map((s) => s.ethereum?.accounts ?? []),
//   shareReplay(1)
// );

// const accounts$ = combineLatest([polkadotAccounts$, ethereumAccounts$]).pipe(
//   map(([polkadotAccounts, ethereumAccounts]) => [
//     ...polkadotAccounts,
//     ...ethereumAccounts,
//   ]),
//   shareReplay(1)
// );

// const getAccount$ = (id: string) =>
//   accounts$.pipe(
//     map(
//       (accounts) => accounts.find((account) => account.address === id) ?? null
//     )
//   );

// TODO construct only from injectedExtensions$ and storedExtensions$
// const polkadotWallets$ = combineLatest([
//   polkadotInjectedWalletIds$,
//   polkadotEnabledExtensions$,
//   store.observable.pipe(map((s) => s.autoReconnect ?? [])),
// ]).pipe(
//   map(([injectedWalletIds, enabledExtensions, enabledExtensionIds]) => {
//     const knownExtensionIds = uniq([
//       ...injectedWalletIds,
//       ...enabledExtensions.keys(),
//       ...enabledExtensionIds,
//     ]);

//     // console.log("knownExtensionIds", knownExtensionIds);

//     return knownExtensionIds
//       .map((walletId): PolkadotWallet | null => {
//         const enabledExtension = enabledExtensions.get(walletId);

//         const connect = async () => {
//           if (enabledExtension)
//             throw new Error(`Extension ${walletId} already connected`);
//           if (!injectedWalletIds.includes(walletId))
//             throw new Error(`Extension ${walletId} not found`);

//           await connectPolkadotInjectedExtension(walletId);
//         };

//         const disconnect = () => {
//           if (!enabledExtension)
//             throw new Error(`Extension ${walletId} is not connected`);

//           disconnectPolkadotInjectedExtension(walletId);
//         };

//         // console.log({ enabledExtension });

//         // const status = enabledExtension
//         //   ? "connected"
//         //   : injectedWalletIds.includes(walletId)
//         //   ? "injected"
//         //   : "unavailable";

//         const { name } = parseWalletId(walletId);

//         return {
//           platform: "polkadot",
//           id: walletId,
//           name,
//           isEnabled: !!enabledExtension,
//           connect,
//           disconnect,
//           provider: enabledExtension,
//         };
//       })
//       .filter(isTruthy);
//   }),
//   shareReplay({ refCount: true, bufferSize: 1 })
// );

const wallets$ = platforms$.pipe(
  tap((val) => {
    console.log("[kheopskit] wallets$ platforms", val);
    return val;
  }),
  switchMap((platforms) => {
    const observables = platforms.map<Observable<Wallet[]>>((platform) => {
      switch (platform) {
        case "polkadot":
          return polkadotWallets$;
        case "ethereum":
          return ethereumWallets$;
      }
    });

    return combineLatest(observables);
  }),

  map((wallets) => wallets.flat()),
  shareReplay({ refCount: true, bufferSize: 1 })
);

wallets$.subscribe(() => {
  console.count("[kheopskit] wallets$ emit");
});
// wallets.forEach((wallet) => {

combineLatest([
  shouldAutoReconnect$,
  wallets$,
  store.observable.pipe(
    map((s) => s.autoReconnect),
    take(1)
  ),
])
  .pipe(
    filter(
      ([autoReconnect, , walletIds]) => autoReconnect && !!walletIds?.length
    ),
    mergeMap(([, wallets, walletIds]) =>
      wallets.filter((wallet) => walletIds?.includes(wallet.id))
    ),
    distinct((w) => w.id)
  )
  .subscribe(async (wallet) => {
    if (wallet.isEnabled) {
      console.log("Wallet %s already connected", wallet.id);
      return;
    }
    console.log("Reconnecting", wallet.id);
    try {
      await wallet.connect();
    } catch (err) {
      console.error("Failed to reconnect wallet %s", wallet.id, { err });
    }
  });

type Account = PolkadotAccount | EthereumAccount;

const accounts$ = platforms$.pipe(
  tap((val) => {
    console.log("[kheopskit] wallets$ platforms", val);
    return val;
  }),
  switchMap((platforms) => {
    const observables = platforms.map<Observable<Account[]>>((platform) => {
      switch (platform) {
        case "polkadot":
          console.log("loading polkadotAccounts$");
          return polkadotAccounts$;
        case "ethereum":
          console.log("loading ethereumAccounts$");
          return ethereumAccounts$;
      }
    });

    return combineLatest(observables);
  }),

  map((accounts) => accounts.flat()),
  shareReplay({ refCount: true, bufferSize: 1 })
);

accounts$.subscribe(() => {
  console.count("[kheopskit] accounts$ emit");
});

// ethereumWallets$,
// const ethereumWallets = eip6963InjectedProviders$.pipe(
//   map((providers) => providers.map((provider) => ({

//   })))
// );

// polkadotWallets$.subscribe((wallets) => {
//   console.log("[kheopskit] polkadotWallets$", wallets);
// });

// auto reconnect as soon as config is set
// autoReconnect$.subscribe((autoReconnect) => {
//   console.log("[kheopskit] autoReconnect", autoReconnect);
//   if (autoReconnect) polkadotAutoReconnect();
// });

// subscribed to by the Subscribe component
// TODO combine all observables
export const isLoaded$ = combineLatest(shouldAutoReconnect$);

// TODO transform in a method that takes config as input ?
export const kheopskit = {
  accounts$,
  wallets$,
  //polkadotWallets$,
  init: setConfig,
};
