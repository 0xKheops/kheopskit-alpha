import { ReplaySubject } from "rxjs";
import type { KheopskitConfig } from "./types";

export const DEFAULT_CONFIG: KheopskitConfig = {
  autoReconnect: true,
};

const config$ = new ReplaySubject<KheopskitConfig>(1);

export const setConfig = (config: Partial<KheopskitConfig>) => {
  config$.next(Object.assign({}, DEFAULT_CONFIG, config));
};
