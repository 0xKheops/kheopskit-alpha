import { createStore } from "@/utils/createStore";
import type { KheopskitStoreData } from "./types";
import { uniq } from "lodash";
import { parseWalletId, type WalletId } from "@/utils/injectedWalletId";

const LOCAL_STORAGE_KEY = "kheopskit";

const DEFAULT_SETTINGS: KheopskitStoreData = {};

const storage = createStore(LOCAL_STORAGE_KEY, DEFAULT_SETTINGS);

storage.observable.subscribe((val) => console.log("kheopskit store", val));

export const addEnabledWalletId = (walletId: WalletId) => {
  parseWalletId(walletId); // validate walletId
  storage.mutate((prev) => ({
    ...prev,
    autoReconnect: uniq((prev.autoReconnect ?? []).concat(walletId)),
  }));
};

export const removeEnabledWalletId = (walletId: WalletId) => {
  storage.mutate((prev) => ({
    ...prev,
    autoReconnect: uniq(
      (prev.autoReconnect ?? []).filter((id) => id !== walletId)
    ),
  }));
};

export const store = {
  observable: storage.observable,
  addEnabledWalletId,
  removeEnabledWalletId,
};
