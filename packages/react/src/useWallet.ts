import { kheopskit } from "@kheopskit/core";
import { bind } from "@react-rxjs/core";
import { useMemo } from "react";

// const [usePolkadotInjectedExtensionIds] = bind(
//   kheopskit.polkadotInjectedExtensionIds$
// );
// const [usePolkadotConnectedExtensionIds] = bind(
//   kheopskit.polkadotConnectedExtensionIds$
// );
const [useAccounts] = bind(kheopskit.accounts$);

const [usePolkadotWallets] = bind(kheopskit.polkadotWallets$);

export const useWallets = () => {
  // const polkadotInjectedExtensionIds = usePolkadotInjectedExtensionIds();
  // const polkadotConnectedExtensionIds = usePolkadotConnectedExtensionIds();
  const polkadotWallets = usePolkadotWallets();

  const accounts = useAccounts();

  // const connectPolkadotExtension = useCallback(
  //   (name: string) => kheopskit.connectPolkadotExtension(name),
  //   []
  // );

  // const disconnectPolkadotExtension = useCallback(
  //   (name: string) => kheopskit.disconnectPolkadotExtension(name),
  //   []
  // );

  const wallets = useMemo(() => {
    return [...polkadotWallets];
  }, [polkadotWallets]);

  return {
    wallets,
    // polkadotInjectedExtensionIds,
    // polkadotConnectedExtensionIds,
    // connectPolkadotExtension,
    // disconnectPolkadotExtension,
    accounts,
  };
};
