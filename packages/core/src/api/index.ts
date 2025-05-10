import { polkadotInjectedExtensionIds$ } from "@/polkadot/extensions.injected";
import { combineLatest, map, shareReplay } from "rxjs";
import { store } from "./store";
import {
  connectPolkadotInjectedExtension,
  disconnectPolkadotInjectedExtension,
  polkadotConnectedExtensions$,
} from "@/polkadot/extensions.connect";
import { polkadotConnectedExtensionIds$ } from "@/polkadot/extensions.store";
import { uniq } from "lodash";
import { sortWallets } from "@/utils/sortWallets";
import { polkadotAutoReconnect } from "@/polkadot/extensions.reconnect";

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

type Wallet = {
  id: string;
  platform: "polkadot" | "ethereum";
  type: "injected" | "walletconnect" | "ledger" | "polkadot-vault";
  name: string;
  status: "connected" | "injected" | "unavailable";
  connect: () => Promise<void>;
  disconnect: () => void;
};

const polkadotWallets$ = combineLatest([
  polkadotInjectedExtensionIds$,
  polkadotConnectedExtensions$,
  polkadotConnectedExtensionIds$,
]).pipe(
  map(
    ([
      injectedExtensionIds,
      connectedExtensions,
      connectedExtensionIds,
    ]): Wallet[] => {
      const knownExtensionIds = uniq([
        ...injectedExtensionIds,
        ...connectedExtensionIds,
        ...connectedExtensions.keys(),
      ]);

      return knownExtensionIds.sort(sortWallets).map((id) => {
        const extension = connectedExtensions.get(id);

        const connect = async () => {
          if (extension) throw new Error(`Extension ${id} already connected`);
          if (!injectedExtensionIds.includes(id))
            throw new Error(`Extension ${id} not found`);

          await connectPolkadotInjectedExtension(id);
        };

        const disconnect = () => {
          if (!extension) throw new Error(`Extension ${id} is not connected`);

          disconnectPolkadotInjectedExtension(id);
        };

        return {
          id,
          platform: "polkadot",
          type: "injected",
          name: extension?.extension.name ?? id,
          status: extension
            ? "connected"
            : injectedExtensionIds.includes(id)
            ? "injected"
            : "unavailable",
          connect,
          disconnect,
        };
      });
    }
  ),
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
};
