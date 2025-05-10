import {
  connectPolkadotInjectedExtension,
  disconnectPolkadotInjectedExtension,
  polkadotConnectedExtensions$,
} from "@/polkadot/extensions.connect";
import { polkadotInjectedExtensionIds$ } from "@/polkadot/extensions.injected";
import { polkadotAutoReconnect } from "@/polkadot/extensions.reconnect";
import { polkadotConnectedExtensionIds$ } from "@/polkadot/extensions.store";
import { isTruthy } from "@/utils";
import { getWalletId } from "@/utils/injectedWalletId";
import { sortWallets } from "@/utils/sortWallets";
import { uniq } from "lodash";
import { combineLatest, map, shareReplay } from "rxjs";
import { setConfig } from "./config";
import { store } from "./store";
import type { Wallet } from "./types";

const ethereumConnectedExtensionIds$ = store.observable.pipe(
  map((s) => s.ethereum?.connectedExtensionIds ?? []),
  shareReplay(1)
);

const polkadotAccounts$ = store.observable.pipe(
  map((s) => s.polkadot?.accounts ?? []),
  shareReplay(1)
);

const ethereumAccounts$ = store.observable.pipe(
  map((s) => s.ethereum?.accounts ?? []),
  shareReplay(1)
);

const accounts$ = combineLatest([polkadotAccounts$, ethereumAccounts$]).pipe(
  map(([polkadotAccounts, ethereumAccounts]) => [
    ...polkadotAccounts,
    ...ethereumAccounts,
  ]),
  shareReplay(1)
);

const getAccount$ = (id: string) =>
  accounts$.pipe(
    map(
      (accounts) => accounts.find((account) => account.address === id) ?? null
    )
  );

// TODO construct only from injectedExtensions$ and storedExtensions$

const polkadotWallets$ = combineLatest([
  polkadotInjectedExtensionIds$,
  polkadotConnectedExtensions$,
  polkadotConnectedExtensionIds$,
]).pipe(
  map(([injectedExtensionIds, connectedExtensions, connectedExtensionIds]) => {
    const knownExtensionIds = uniq([
      ...injectedExtensionIds,
      ...connectedExtensionIds,
      ...connectedExtensions.keys(),
    ]);

    return knownExtensionIds
      .sort(sortWallets)
      .map((id): Wallet | null => {
        const connectedExtension = connectedExtensions.get(id);

        const connect = async () => {
          if (connectedExtension)
            throw new Error(`Extension ${id} already connected`);
          if (!injectedExtensionIds.includes(id))
            throw new Error(`Extension ${id} not found`);

          await connectPolkadotInjectedExtension(id);
        };

        const disconnect = () => {
          if (!connectedExtension)
            throw new Error(`Extension ${id} is not connected`);

          disconnectPolkadotInjectedExtension(id);
        };

        if (!connectedExtension) return null;

        return {
          id: getWalletId("poladot", connectedExtension.extension.name),
          platform: "polkadot",
          type: "injected",
          name: connectedExtension.extension.name,
          status: connectedExtension
            ? "connected"
            : injectedExtensionIds.includes(id)
            ? "injected"
            : "unavailable",
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

// auto reconnect to injected extensions
polkadotAutoReconnect();

export const kheopskit = {
  polkadotConnectedExtensionIds$,
  ethereumConnectedExtensionIds$,

  polkadotInjectedExtensionIds$,

  accounts$,
  polkadotAccounts$,
  ethereumAccounts$,
  getAccount$,

  polkadotWallets$,

  init: setConfig,
};
