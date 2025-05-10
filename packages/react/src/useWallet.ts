import { kheopskit } from "@kheopskit/core";
import { bind } from "@react-rxjs/core";

const [useAccounts] = bind(kheopskit.accounts$);
const [useAllWallets] = bind(kheopskit.wallets$);

export const useWallets = () => {
  const wallets = useAllWallets();
  const accounts = useAccounts();

  // const wallets = useMemo(() => {
  //   return [
  //     ...polkadotWallets,
  //     // ...ethereumWallets
  //   ];
  // }, [polkadotWallets]);

  return {
    wallets,
    accounts,
  };
};
