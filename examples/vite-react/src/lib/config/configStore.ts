import type { KheopskitConfig } from "@kheopskit/core";
import { useCallback, useSyncExternalStore } from "react";
import { createStore } from "./createStore";
import { ensureConfig } from "./helper";

export const configStore = createStore<Partial<KheopskitConfig>>(
  "demo.config",
  ensureConfig({ autoReconnect: true, platforms: ["polkadot"] }),
);

export const useLocalStorageConfig = () => {
  const config = useSyncExternalStore(
    configStore.subscribe,
    configStore.getSnapshot,
  );

  const setAutoReconnect = useCallback((enabled: boolean) => {
    configStore.mutate((prev) =>
      ensureConfig({
        ...prev,
        autoReconnect: enabled,
      }),
    );
  }, []);

  const setPlatformEnabled = useCallback(
    (platform: KheopskitConfig["platforms"][number], enabled: boolean) => {
      configStore.mutate((prev) => {
        const prevPlatforms = prev?.platforms ?? [];
        const platforms = enabled
          ? prevPlatforms.includes(platform)
            ? prevPlatforms
            : prevPlatforms.concat(platform)
          : prevPlatforms.filter((p) => p !== platform);

        return ensureConfig({
          ...prev,
          platforms,
        });
      });
    },
    [],
  );

  return { config, setAutoReconnect, setPlatformEnabled };
};
