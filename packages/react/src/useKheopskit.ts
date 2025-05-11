import { getKheopskit$, type KheopskitConfig } from "@kheopskit/core";
import { bind } from "@react-rxjs/core";
import { useContext } from "react";
import { KheopskitContext } from "./context";

const DEFAULT_VALUE = {
  wallets: [],
  accounts: [],
};

const [useKheopskit] = bind(
  (config: KheopskitConfig) => getKheopskit$(config),
  DEFAULT_VALUE
);

export const useWallets = () => {
  const ctx = useContext(KheopskitContext);
  if (!ctx)
    throw new Error("useWallets must be used within a KheopskitProvider");

  return useKheopskit(ctx.config);
};
