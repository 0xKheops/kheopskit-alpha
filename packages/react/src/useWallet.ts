import { kheopskit } from "@kheopskit/core";
import { bind } from "@react-rxjs/core";
import { useMemo } from "react";

const [useAccounts] = bind(kheopskit.accounts$);
const [usePolkadotWallets] = bind(kheopskit.polkadotWallets$);

export const useWallets = () => {
  const polkadotWallets = usePolkadotWallets();

  const accounts = useAccounts();

  const wallets = useMemo(() => {
    return [
      ...polkadotWallets,
      // ...ethereumWallets
    ];
  }, [polkadotWallets]);

  return {
    wallets,
    accounts,
  };
};
