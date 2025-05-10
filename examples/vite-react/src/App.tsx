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
import { shortenAddress } from "./lib/shortenAddress";

function App() {
  // const handleClick = useCallback(() => {
  //   connect();
  // }, []);

  return (
    <div className="container mx-auto flex flex-col gap-8 items-center p-8">
      <h1 className="text-3xl font-bold">Kheopskit demo</h1>
      <WalletsCard />
      <AccountsCard />
    </div>
  );
}

const WalletsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Wallets</CardTitle>
      <CardDescription>
        Lists all wallets, including the ones used in the past.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Wallets />
    </CardContent>
  </Card>
);

const Wallets = () => {
  const { wallets, accounts } = useWallets();

  console.log({ wallets, accounts });

  return (
    <Table className="w-xl">
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead className="text-right w-1/3">Accounts</TableHead>
          <TableHead className="text-right w-1/3"> </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wallets.map((wallet) => (
          <TableRow key={wallet.id}>
            <TableCell>{wallet.platform}</TableCell>
            <TableCell>{wallet.name}</TableCell>
            <TableCell className="text-right">
              {accounts.filter((a) => a.wallet === wallet.name).length}
            </TableCell>
            <TableCell className="text-right">
              {wallet.isEnabled ? (
                <Button className="w-28" onClick={wallet.disconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button className="w-28" onClick={wallet.connect}>
                  Connect
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AccountsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Accounts</CardTitle>
      <CardDescription>
        Lists all accounts, including the ones used in the past.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Accounts />
    </CardContent>
  </Card>
);

const Accounts = () => {
  const { accounts } = useWallets();

  return (
    <Table className="w-xl">
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead className="text-right w-1/3">Name</TableHead>
          <TableHead className="text-right w-1/3">Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell>{account.platform}</TableCell>
            <TableCell>{account.wallet}</TableCell>
            <TableCell className="text-right">
              {account.platform === "polkadot" ? account.name : null}
            </TableCell>
            <TableCell className="text-right font-mono">
              {shortenAddress(account.address)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default App;
