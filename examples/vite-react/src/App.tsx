import { useWallets } from "@kheopskit/react";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

function App() {
  // const handleClick = useCallback(() => {
  //   connect();
  // }, []);

  return (
    <div className="container">
      {/* <div className="grid grid-cols-3 gap-4">
        <Button onClick={handleClick}>Connect Polkadot</Button>
        <Button onClick={handleClick}>Connect Ethereum</Button>
        <Button onClick={handleClick}>Connect Polkadot or Ethereum</Button>
      </div> */}
      <div>
        <InjectedPolkadotWallets />
      </div>
    </div>
  );
}

const InjectedPolkadotWallets = () => {
  const { wallets, accounts } = useWallets();

  return (
    <Table className="max-w-xl">
      <TableHeader>
        <TableRow>
          <TableHead>Wallet</TableHead>
          <TableHead className="text-right">Accounts</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wallets.map((wallet) => (
          <TableRow key={wallet.id}>
            <TableCell>{wallet.name}</TableCell>
            <TableCell className="text-right">
              {accounts.filter((a) => a.wallet === wallet.id).length}
            </TableCell>
            <TableCell className="text-right">
              {wallet.status === "connected" && (
                <Button className="w-28" onClick={wallet.disconnect}>
                  Disconnect
                </Button>
              )}
              {wallet.status === "injected" && (
                <Button className="w-28" onClick={wallet.connect}>
                  Connect
                </Button>
              )}
              {wallet.status === "unavailable" && <div>Unavailable</div>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default App;
