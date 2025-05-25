import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorageConfig } from "@/lib/config/configStore";
import type { WalletPlatform } from "@kheopskit/core";
import { useCallback } from "react";
import { AppBlock } from "./AppBlock";

export const Config = () => (
  <AppBlock title="Config" description="Set initialization parameters">
    <div className="flex flex-col gap-4">
      <Platforms />
      <AutoReconnect />
      <Reset />
    </div>
  </AppBlock>
);

const AutoReconnect = () => {
  const { config, setAutoReconnect } = useLocalStorageConfig();

  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id="autoReconnect"
        checked={config.autoReconnect}
        onCheckedChange={(checked) => {
          if (typeof checked !== "boolean") return;
          setAutoReconnect(checked);
          window.location.reload();
        }}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="autoReconnect"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Auto reconnect
        </label>
        <p className="text-sm text-muted-foreground">
          Reconnects previously connected wallets on page reload
        </p>
      </div>
    </div>
  );
};

const PLATFORMS: Record<WalletPlatform, string> = {
  polkadot: "Polkadot (with PAPI)",
  ethereum: "Ethereum (with Viem or Wagmi)",
};

const Platforms = () => {
  const { config, setPlatformEnabled } = useLocalStorageConfig();

  return (
    <div className="items-top flex space-x-2">
      <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Platforms:
      </div>
      {Object.entries(PLATFORMS)
        .map((p) => p as [WalletPlatform, string])
        .map(([platform, label]) => (
          <div key={platform} className="flex items-center space-x-2">
            <Checkbox
              id={platform}
              checked={config.platforms?.includes(platform)}
              onCheckedChange={(checked) => {
                if (typeof checked !== "boolean") return;
                setPlatformEnabled(platform, checked);
                window.location.reload();
              }}
            />
            <label
              htmlFor={platform}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          </div>
        ))}
    </div>
  );
};

const Reset = () => {
  const reset = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <div className="w-full text-right">
      <Button onClick={reset}>Reset to defaults</Button>
    </div>
  );
};
