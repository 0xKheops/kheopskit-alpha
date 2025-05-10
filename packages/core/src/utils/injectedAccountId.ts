import type { SS58String } from "polkadot-api";

import { isValidAddress } from "./isValidAddress";

export type InjectedAccountId = string;

export const getInjectedAccountId = (
  walletId: string,
  address: SS58String
): InjectedAccountId => {
  if (!walletId) throw new Error("Missing walletId");
  if (!isValidAddress(address)) throw new Error("Invalid address");
  return `${walletId}::${address}`;
};

export const parseInjectedAccountId = (accountId: string) => {
  if (!accountId) throw new Error("Invalid walletAccountId");
  const [walletId, address] = accountId.split("::");
  if (!walletId) throw new Error("Missing walletId");
  if (!address || !isValidAddress(address)) throw new Error("Invalid address");
  return { walletId, address };
};
