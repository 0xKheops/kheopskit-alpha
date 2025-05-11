import { Wallets } from "./blocks/Wallets";
import { Accounts } from "./blocks/Accounts";
import { Config } from "./blocks/Config";
import { useLocalStorageConfig } from "@/lib/configStore";
import { KheopskitProvider } from "@kheopskit/react";
import { Toaster } from "@/components/ui/sonner";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Wagmi } from "./blocks/Wagmi";

const queryClient = new QueryClient();

export const App = () => {
  // IMPORTANT Kheopskit config should be hardcoded in most apps
  // This hook allows modifying the config live, to showcase capabilities of the library.
  // It is only for demo purposes and should not be used in production.
  const { config } = useLocalStorageConfig();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <KheopskitProvider config={config}>
          <AppContent />
          <Toaster />
        </KheopskitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const AppContent = () => (
  <div className="container mx-auto flex flex-col gap-8 items-center p-8 max-w-3xl">
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold">Kheopskit demo</h1>
      <div className="text-sm text-muted-foreground">
        Designed for multi platform/wallets/accounts DApps
      </div>
    </div>
    <Config />
    <Wallets />
    <Accounts />
    <Wagmi />
  </div>
);
