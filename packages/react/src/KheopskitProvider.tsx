import { kheopskit, type KheopskitConfig } from "@kheopskit/core";
import { useEffect, type FC, type PropsWithChildren } from "react";
import { Subscribe } from "@react-rxjs/core";

export const KheopskitProvider: FC<
  PropsWithChildren & { config: KheopskitConfig }
> = ({ children, config }) => {
  useEffect(() => {
    kheopskit.init(config);
  }, [config]);

  return (
    // TODO set source
    <Subscribe>{children}</Subscribe>
  );
};
