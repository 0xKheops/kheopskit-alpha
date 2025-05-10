import { connectedAccounts$ } from "@/polkadot/accounts";
import {
  connectPolkadotInjectedExtension,
  disconnectPolkadotInjectedExtension,
  polkadotEnabledExtensions$,
} from "@/polkadot/extensions.enabled";
import { polkadotInjectedWalletIds$ } from "@/polkadot/extensions.injected";
import { polkadotAutoReconnect } from "@/polkadot/extensions.reconnect";
import { isTruthy } from "@/utils";
import { getWalletId } from "@/utils/injectedWalletId";
import { uniq } from "lodash";
import { combineLatest, map, shareReplay } from "rxjs";
import { autoReconnect$, setConfig } from "./config";
import { store } from "./store";
import type { Wallet } from "./types";

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
const polkadotWallets$ = combineLatest([
  polkadotInjectedWalletIds$,
  polkadotEnabledExtensions$,
  store.observable.pipe(map((s) => s.autoReconnect ?? [])),
]).pipe(
  map(([injectedWalletIds, enabledExtensions, enabledExtensionIds]) => {
    console.log({
      injectedWalletIds,
      enabledExtensions,
      enabledExtensionIds,
    });

    const knownExtensionIds = uniq([
      ...injectedWalletIds,
      ...enabledExtensions.keys(),
      ...enabledExtensionIds,
    ]);

    console.log("knownExtensionIds", knownExtensionIds);

    return knownExtensionIds
      .map((id): Wallet | null => {
        const enabledExtension = enabledExtensions.get(id);

        const connect = async () => {
          if (enabledExtension)
            throw new Error(`Extension ${id} already connected`);
          if (!injectedWalletIds.includes(id))
            throw new Error(`Extension ${id} not found`);

          await connectPolkadotInjectedExtension(id);
        };

        const disconnect = () => {
          if (!enabledExtension)
            throw new Error(`Extension ${id} is not connected`);

          disconnectPolkadotInjectedExtension(id);
        };

        console.log({ enabledExtension });

        const status = enabledExtension
          ? "connected"
          : injectedWalletIds.includes(id)
          ? "injected"
          : "unavailable";

        return {
          id: getWalletId("polkadot", id),
          platform: "polkadot",
          type: "injected",
          name: id,
          status,
          connect,
          disconnect,
        };
      })
      .filter(isTruthy);
  }),
  shareReplay(1)
);

polkadotWallets$.subscribe((wallets) => {
  console.log("[kheopskit] polkadotWallets$", wallets);
});

// auto reconnect as soon as config is set
autoReconnect$.subscribe((autoReconnect) => {
  console.log("[kheopskit] autoReconnect", autoReconnect);
  if (autoReconnect) polkadotAutoReconnect();
});

// subscribed to by the Subscribe component
// TODO combine all observables
export const isLoaded$ = combineLatest(autoReconnect$);

// auto reconnect to injected extensions
export const kheopskit = {
  // polkadotEnabledExtensionIds$: polkadotStoredEnabledExtensionIds$,
  //   ethereumEnabledExtensionIds$: ethereumEnabledExtensionIds$,

  // polkadotInjectedExtensionIds$,

  accounts$: connectedAccounts$,
  // polkadotAccounts$,
  // ethereumAccounts$,
  // getAccount$,

  polkadotWallets$,

  init: setConfig,
};
