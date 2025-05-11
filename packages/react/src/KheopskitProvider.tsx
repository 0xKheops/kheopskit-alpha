import type { KheopskitConfig } from "@kheopskit/core";
import { Subscribe } from "@react-rxjs/core";
import type { FC, PropsWithChildren } from "react";
import { KheopskitContext } from "./context";
import { SuspenseMonitor } from "./SuspenseMonitor";

export const KheopskitProvider: FC<
  PropsWithChildren & { config: KheopskitConfig }
> = ({ children, config }) => {
  return (
    // TODO set source
    <KheopskitContext.Provider value={{ config }}>
      <Subscribe fallback={<SuspenseMonitor label="KheopskitProvider" />}>
        {children}
      </Subscribe>
    </KheopskitContext.Provider>
  );
};
