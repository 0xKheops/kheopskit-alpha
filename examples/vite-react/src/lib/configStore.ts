import type { KheopskitConfig } from "@kheopskit/core";
import { useCallback, useSyncExternalStore } from "react";
import { createStore } from "./createStore";

export const configStore = createStore<Partial<KheopskitConfig>>(
  "demo.config",
  { autoReconnect: true, platforms: ["polkadot"] },
);

export const useLocalStorageConfig = () => {
  const config = useSyncExternalStore(
    configStore.subscribe,
    configStore.getSnapshot,
  );

  const setAutoReconnect = useCallback((enabled: boolean) => {
    configStore.mutate((prev) => ({
      ...prev,
      autoReconnect: enabled,
    }));
  }, []);

  const setPlatformEnabled = useCallback(
    (platform: KheopskitConfig["platforms"][number], enabled: boolean) => {
      configStore.mutate((prev) => {
        const platforms = prev?.platforms ?? [];
        return {
          ...(prev ?? {}),
          platforms: enabled
            ? platforms.includes(platform)
              ? platforms
              : platforms.concat(platform)
            : platforms.filter((p) => p !== platform),
        };
      });
    },
    [],
  );

  return { config, setAutoReconnect, setPlatformEnabled };
};
