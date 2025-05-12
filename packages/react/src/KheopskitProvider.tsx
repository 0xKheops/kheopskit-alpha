import {
  DEFAULT_CONFIG,
  type KheopskitConfig,
  getKheopskit$,
} from "@kheopskit/core";
import { Subscribe } from "@react-rxjs/core";
import { type FC, type PropsWithChildren, useMemo } from "react";
import { SuspenseMonitor } from "./SuspenseMonitor";
import { KheopskitContext } from "./context";

export const KheopskitProvider: FC<
  PropsWithChildren & { config?: Partial<KheopskitConfig> }
> = ({ children, config: userConfig }) => {
  const [value, source$] = useMemo(() => {
    const config = Object.assign({}, DEFAULT_CONFIG, userConfig);
    return [{ config }, getKheopskit$(config)];
  }, [userConfig]);

  return (
    <KheopskitContext.Provider value={value}>
      <Subscribe
        source$={source$}
        fallback={<SuspenseMonitor label="KheopskitProvider" />}
      >
        {children}
      </Subscribe>
    </KheopskitContext.Provider>
  );
};
