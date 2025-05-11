import { accounts$ } from "./accounts";
import { setConfig } from "./config";
import { wallets$ } from "./wallets";

// TODO transform in a method that takes config as input ?
export const kheopskit = {
  accounts$,
  wallets$,
  //polkadotWallets$,
  init: setConfig,
};
