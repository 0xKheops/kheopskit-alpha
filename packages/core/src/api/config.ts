import { map, ReplaySubject, shareReplay, take } from "rxjs";
import type { KheopskitConfig } from "./types";

export const DEFAULT_CONFIG: KheopskitConfig = {
  autoReconnect: true,
  platforms: ["polkadot"],
};

const config$ = new ReplaySubject<KheopskitConfig>(1);

export const setConfig = (config: KheopskitConfig) => {
  config$.next(Object.assign({}, DEFAULT_CONFIG, config));
};

export const shouldAutoReconnect$ = config$.pipe(
  map((c) => !!c.autoReconnect),
  take(1), // emit only once
  shareReplay(1)
);

export const platforms$ = config$.pipe(
  map((c) => c.platforms),
  take(1), // emit only once
  shareReplay(1)
);

config$.subscribe((config) => {
  console.log("[kheopskit] config$", config);
});
