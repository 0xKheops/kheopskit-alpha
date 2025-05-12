import {
  type KheopskitConfig,
  type KheopskitState,
  getKheopskit$,
} from "@kheopskit/core";
import {
  type FC,
  type PropsWithChildren,
  useMemo,
  useSyncExternalStore,
} from "react";
import { KheopskitContext } from "./context";
import { createStore } from "./createStore";

const DEFAULT_VALUE: KheopskitState = {
  wallets: [],
  accounts: [],
};

export const KheopskitProvider: FC<
  PropsWithChildren & { config?: Partial<KheopskitConfig> }
> = ({ children, config }) => {
  const store = useMemo(
    () => createStore(getKheopskit$(config), DEFAULT_VALUE),
    [config],
  );

  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const value = useMemo(() => ({ state }), [state]);

  return (
    <KheopskitContext.Provider value={value}>
      {children}
    </KheopskitContext.Provider>
  );
};
