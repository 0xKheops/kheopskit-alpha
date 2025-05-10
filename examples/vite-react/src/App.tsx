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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

function App() {
  // const handleClick = useCallback(() => {
  //   connect();
  // }, []);

  return (
    <div className="container mx-auto flex flex-col gap-8 items-center p-8">
      <h1 className="text-3xl font-bold">Kheopskit demo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Polkadot Wallets</CardTitle>
          <CardDescription>
            Lists all your Polkadot wallets, including the ones injected in the
            past.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InjectedPolkadotWallets />
        </CardContent>
      </Card>
    </div>
  );
}

const InjectedPolkadotWallets = () => {
  const { wallets, accounts } = useWallets();

  return (
    <Table className="w-xl">
      <TableHeader>
        <TableRow>
          <TableHead>Wallet</TableHead>
          <TableHead className="text-right w-1/3">Accounts</TableHead>
          <TableHead className="text-right w-1/3">Action</TableHead>
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
