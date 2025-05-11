import type { WalletId } from "@/utils/WalletId";
import type { EIP1193Provider } from "viem";
import type {
  InjectedAccount,
  InjectedExtension,
  PolkadotSigner,
} from "polkadot-api/pjs-signer";
import type { PolkadotAccount } from "./polkadot/accounts";
import type { EthereumAccount } from "./ethereum/accounts";

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
  enabledExtensionIds: string[];
  accounts: T[];
  defaultAccountId: string | null;
};

export type KheopskitStoreData = {
  // polkadot?: PlatformData<PolkadotAccountStorage>;
  // ethereum?: PlatformData<EthereumAccountStorage>;
  autoReconnect?: WalletId[];
};

export type KheopskitConfig = {
  autoReconnect?: boolean;
  platforms: WalletPlatform[];
};

export type PolkadotDisabledInjectedWallet = {
  id: WalletId;
  platform: "polkadot";
  extensionId: string;
  name: string;
  isEnabled: false;
  connect: () => Promise<void>;
};

export type PolkadotEnabledInjectedWallet = {
  id: WalletId;
  platform: "polkadot";
  extensionId: string;
  extension: InjectedExtension;
  name: string;
  isEnabled: true;
  disconnect: () => void;
};

// TODO export type PolkadotWalletConnectWallet = {}

export type PolkadotWallet =
  | PolkadotDisabledInjectedWallet
  | PolkadotEnabledInjectedWallet;

export type EthereumWallet = {
  platform: "ethereum";
  id: WalletId;
  providerId: string;
  provider: EIP1193Provider;
  name: string;
  icon: string;
  isEnabled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export type Wallet = PolkadotWallet | EthereumWallet;

export type WalletPlatform = Wallet["platform"];

export type WalletAccount = PolkadotAccount | EthereumAccount;
