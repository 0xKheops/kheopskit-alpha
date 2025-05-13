import type { KheopskitConfig } from "./types";

const DEFAULT_CONFIG: Required<KheopskitConfig> = {
  autoReconnect: true,
  platforms: ["polkadot"],
};

export const getConfig = (
  config: Partial<KheopskitConfig> | undefined,
): Required<KheopskitConfig> => {
  return Object.assign({}, DEFAULT_CONFIG, config);
};
