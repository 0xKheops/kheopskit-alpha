import { getKheopskit$, type KheopskitConfig } from "@kheopskit/core";
import { useEffect, useMemo, type FC, type PropsWithChildren } from "react";
import { Subscribe } from "@react-rxjs/core";
import { KheopskitContext } from "./context";

export const KheopskitProvider: FC<
  PropsWithChildren & { config: KheopskitConfig }
> = ({ children, config }) => {
  return (
    // TODO set source
    <KheopskitContext.Provider value={{ config }}>
      <Subscribe>{children}</Subscribe>
    </KheopskitContext.Provider>
  );
};
