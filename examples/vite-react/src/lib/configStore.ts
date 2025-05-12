import type { KheopskitConfig } from "@kheopskit/core";
import { useSyncExternalStore } from "react";
import { createStore } from "./createStore";

const DEFAULT_CONFIG: KheopskitConfig = {
  platforms: ["ethereum", "polkadot"],
  autoReconnect: true,
};

export const configStore = createStore("config", DEFAULT_CONFIG);

export const useLocalStorageConfig = () => {
  const config = useSyncExternalStore(
    configStore.subscribe,
    configStore.getSnapshot,
  );

  const setAutoReconnect = (enabled: boolean) => {
    configStore.mutate((prev) => ({
      ...prev,
      autoReconnect: enabled,
    }));
  };

  const setPlatformEnabled = (
    platform: KheopskitConfig["platforms"][number],
    enabled: boolean,
  ) => {
    configStore.mutate((prev) => ({
      ...prev,
      platforms: enabled
        ? prev.platforms.includes(platform)
          ? prev.platforms
          : [...prev.platforms, platform]
        : prev.platforms.filter((p) => p !== platform),
    }));
  };

  return { config, setAutoReconnect, setPlatformEnabled };
};
