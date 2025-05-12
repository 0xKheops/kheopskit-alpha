import type { WalletAccountId } from "@/utils";
import type { WalletId } from "@/utils/WalletId";
import type {
  InjectedExtension,
  InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import type { EIP1193Provider } from "viem";

export type KheopskitStoreData = {
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
  isConnected: false;
  connect: () => Promise<void>;
};

export type PolkadotEnabledInjectedWallet = {
  id: WalletId;
  platform: "polkadot";
  extensionId: string;
  extension: InjectedExtension;
  name: string;
  isConnected: true;
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
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export type Wallet = PolkadotWallet | EthereumWallet;

export type WalletPlatform = Wallet["platform"];

export type PolkadotAccount = InjectedPolkadotAccount & {
  id: WalletAccountId;
  platform: "polkadot";
  walletName: string;
  walletId: string;
};

export type EthereumAccount = {
  id: WalletAccountId;
  platform: "ethereum";
  provider: EIP1193Provider;
  address: `0x${string}`;
  walletName: string;
  walletId: string;
  isWalletDefault: boolean;
};

export type WalletAccount = PolkadotAccount | EthereumAccount;
