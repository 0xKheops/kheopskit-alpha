import { Wallets } from "./blocks/Wallets";
import { AppBlock } from "./blocks/AppBlock";
import { Accounts } from "./blocks/Accounts";
import { Config } from "./blocks/Config";
import { useConfig } from "@/lib/configStore";
import { KheopskitProvider } from "@kheopskit/react";

function App() {
  const { config } = useConfig();

  return (
    <KheopskitProvider config={config}>
      <div className="container mx-auto flex flex-col gap-8 items-center p-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Kheopskit demo</h1>
        <Config />

        <AppBlock title="Wallets" description="Lists all injected wallets">
          <Wallets />
        </AppBlock>
        <AppBlock title="Accounts" description="Lists all injected accounts">
          <Accounts />
        </AppBlock>
      </div>
    </KheopskitProvider>
  );
}

export default App;
