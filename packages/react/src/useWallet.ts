import { useCallback } from "react";
import { bind } from "@react-rxjs/core";
import { kheopskit } from "@kheopskit/core";

const [usePolkadotInjectedExtensionIds] = bind(
  kheopskit.polkadotInjectedExtensionIds$
);
const [usePolkadotConnectedExtensionIds] = bind(
  kheopskit.polkadotConnectedExtensionIds$
);
const [useAccounts] = bind(kheopskit.accounts$);

export const useWallets = () => {
  const polkadotInjectedExtensionIds = usePolkadotInjectedExtensionIds();
  const polkadotConnectedExtensionIds = usePolkadotConnectedExtensionIds();
  const accounts = useAccounts();

  const connectPolkadotExtension = useCallback(
    (name: string) => kheopskit.connectPolkadotExtension(name),
    []
  );

  const disconnectPolkadotExtension = useCallback(
    (name: string) => kheopskit.disconnectPolkadotExtension(name),
    []
  );

  return {
    polkadotInjectedExtensionIds,
    polkadotConnectedExtensionIds,
    connectPolkadotExtension,
    disconnectPolkadotExtension,
    accounts,
  };
};
