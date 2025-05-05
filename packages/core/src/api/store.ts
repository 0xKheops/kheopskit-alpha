import { createStore } from "@/utils/createStore";
import type { InjectedAccount, PolkadotSigner } from "polkadot-api/pjs-signer";

type AccountStorageBase = {
  wallet: string;
  address: string;
};

type EthereumAccountStorage = AccountStorageBase & {
  platform: "ethereum";
};

type PolkadotAccountStorage = AccountStorageBase & {
  platform: "polkadot";
  name: string;
  type: Required<InjectedAccount["type"]>; // required, right?
  genesisHash?: `0x${string}`;
};

type AccountStorage = PolkadotAccountStorage | EthereumAccountStorage;

type Account<T extends AccountStorage> = T & {
  id: string;
  signer: T extends PolkadotAccountStorage ? PolkadotSigner : null;
};

type PlatformData<T extends AccountStorageBase> = {
  connectedExtensionIds: string[];
  accounts: T[];
  defaultAccountId: string | null;
};

type KheopskitStoreData = {
  polkadot?: PlatformData<PolkadotAccountStorage>;
  ethereum?: PlatformData<EthereumAccountStorage>;
};

const LOCAL_STORAGE_KEY = "kheopskit";

const DEFAULT_SETTINGS: KheopskitStoreData = {};

export const store = createStore(LOCAL_STORAGE_KEY, DEFAULT_SETTINGS);

store.observable.subscribe((val) => console.log("kheopskit store", val));
