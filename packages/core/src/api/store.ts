import { createStore } from "@/utils/createStore";
import type { KheopskitStoreData } from "./types";

const LOCAL_STORAGE_KEY = "kheopskit";

const DEFAULT_SETTINGS: KheopskitStoreData = {};

export const store = createStore(LOCAL_STORAGE_KEY, DEFAULT_SETTINGS);

store.observable.subscribe((val) => console.log("kheopskit store", val));
