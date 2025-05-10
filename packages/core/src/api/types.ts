import type { WalletPlatform } from "@/utils";
import type { WalletId } from "@/utils/injectedWalletId";
import type { InjectedAccount, PolkadotSigner } from "polkadot-api/pjs-signer";

type AccountStorageBase = {
  wallet: string;
  address: string;
};

export type EthereumAccountStorage = AccountStorageBase & {
  platform: "ethereum";
};

export type PolkadotAccountStorage = AccountStorageBase & {
  platform: "polkadot";
  name: InjectedAccount["name"];
  type: InjectedAccount["type"]; // required, right?
  genesisHash: InjectedAccount["genesisHash"];
};

export type AccountStorage = PolkadotAccountStorage | EthereumAccountStorage;

export type Account<T extends AccountStorage> = T & {
  id: string;
  signer: T extends PolkadotAccountStorage ? PolkadotSigner : null;
};

export type PlatformData<T extends AccountStorageBase> = {
  connectedExtensionIds: string[];
  accounts: T[];
  defaultAccountId: string | null;
};

export type KheopskitStoreData = {
  polkadot?: PlatformData<PolkadotAccountStorage>;
  ethereum?: PlatformData<EthereumAccountStorage>;
};

export type KheopskitConfig = {
  autoReconnect?: boolean;
};

export type Wallet = {
  id: WalletId;
  platform: WalletPlatform;
  type: "injected" | "walletconnect" | "ledger" | "polkadot-vault";
  name: string;
  status: "connected" | "injected" | "unavailable";
  connect: () => Promise<void>;
  disconnect: () => void;
};
