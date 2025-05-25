import type { KheopskitConfig } from "./types";

const DEFAULT_CONFIG: KheopskitConfig = {
  autoReconnect: true,
  platforms: ["polkadot"],
};

export const resolveConfig = (
  config: Partial<KheopskitConfig> | undefined,
): KheopskitConfig => {
  return Object.assign({}, DEFAULT_CONFIG, config);
};
