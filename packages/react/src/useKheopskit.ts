import { getKheopskit$, type KheopskitConfig } from "@kheopskit/core";
import { bind } from "@react-rxjs/core";
import { useContext } from "react";
import { KheopskitContext } from "./context";

const [useKheopskit] = bind((config: KheopskitConfig) => getKheopskit$(config));

export const useWallets = () => {
  const ctx = useContext(KheopskitContext);
  if (!ctx)
    throw new Error("useWallets must be used within a KheopskitProvider");

  const kheopskit = useKheopskit(ctx.config);

  return {
    wallets: kheopskit.wallets,
    accounts: kheopskit.accounts,
  };
};
