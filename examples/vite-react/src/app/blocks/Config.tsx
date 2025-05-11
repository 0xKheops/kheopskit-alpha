import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorageConfig } from "@/lib/configStore";
import { AppBlock } from "./AppBlock";

export const Config = () => (
  <AppBlock title="Config" description="Set initialization parameters">
    <div className="flex flex-col gap-4">
      <Platforms />
      <AutoReconnect />
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

const PLATFORMS = ["polkadot", "ethereum"] as const;

const Platforms = () => {
  const { config, setPlatformEnabled } = useLocalStorageConfig();

  return (
    <div className="items-top flex space-x-2">
      <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Platforms:
      </div>
      {PLATFORMS.map((platform) => (
        <div key={platform} className="flex items-center space-x-2">
          <Checkbox
            id={platform}
            checked={config.platforms.includes(platform)}
            onCheckedChange={(checked) => {
              if (typeof checked !== "boolean") return;
              setPlatformEnabled(platform, checked);
            }}
          />
          <label
            htmlFor={platform}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {platform}
          </label>
        </div>
      ))}
    </div>
  );
};
