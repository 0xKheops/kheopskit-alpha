import type { KheopskitConfig } from "./types";

export type ResolvedConfig = Required<KheopskitConfig>;

export const DEFAULT_CONFIG: ResolvedConfig = {
  autoReconnect: true,
  platforms: ["polkadot"],
};

export const resolveConfig = (config: KheopskitConfig): ResolvedConfig => {
  return Object.assign({}, DEFAULT_CONFIG, config);
};
