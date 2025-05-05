import {
  connectPolkadotExtension,
  disconnectPolkadotExtension,
  polkadotConnectedExtensionIds$,
} from "@/polkadot/extensions";
import { polkadotInjectedExtensionIds$ } from "@/polkadot/injected";
import { combineLatest, map, shareReplay } from "rxjs";
import { store } from "./store";

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

// auto reconnect to injected extensions

export const kheopskit = {
  polkadotConnectedExtensionIds$,
  ethereumConnectedExtensionIds$,

  polkadotInjectedExtensionIds$,

  accounts$,
  polkadotAccounts$,
  ethereumAccounts$,
  getAccount$,

  connectPolkadotExtension,
  disconnectPolkadotExtension,
};
