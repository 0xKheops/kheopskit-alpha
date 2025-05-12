import type { KheopskitConfig } from "@kheopskit/core";
import { Subscribe } from "@react-rxjs/core";
import type { FC, PropsWithChildren } from "react";
import { SuspenseMonitor } from "./SuspenseMonitor";
import { KheopskitContext } from "./context";

export const KheopskitProvider: FC<
  PropsWithChildren & { config: KheopskitConfig }
> = ({ children, config }) => {
  return (
    <KheopskitContext.Provider value={{ config }}>
      <Subscribe fallback={<SuspenseMonitor label="KheopskitProvider" />}>
        {children}
      </Subscribe>
    </KheopskitContext.Provider>
  );
};
