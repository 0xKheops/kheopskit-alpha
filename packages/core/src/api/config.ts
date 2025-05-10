import { map, ReplaySubject, take } from "rxjs";
import type { KheopskitConfig } from "./types";

export const DEFAULT_CONFIG: KheopskitConfig = {
  autoReconnect: true,
};

const config$ = new ReplaySubject<KheopskitConfig>(1);

export const setConfig = (config: KheopskitConfig) => {
  config$.next(Object.assign({}, DEFAULT_CONFIG, config));
};

export const autoReconnect$ = config$.pipe(
  map((c) => !!c.autoReconnect),
  take(1) // emit only once
);
