import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWallets } from "@kheopskit/react";

export const Wallets = () => {
  const { wallets, accounts } = useWallets();

  console.log({ wallets, accounts });

  return (
    <Table>
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
