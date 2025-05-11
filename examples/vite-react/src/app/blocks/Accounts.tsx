import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { shortenAddress } from "@/lib/shortenAddress";
import type { WalletAccount } from "@kheopskit/core";
import { useWallets } from "@kheopskit/react";
import { type FC, useMemo } from "react";

export const Accounts = () => {
  const { accounts } = useWallets();

  return (
    <Table>
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
          <AccountRow key={account.id} account={account} />
        ))}
      </TableBody>
    </Table>
  );
};

const AccountRow: FC<{ account: WalletAccount }> = ({ account }) => {
  const { platform, wallet, address } = account;

  const shortAddress = useMemo(() => shortenAddress(address), [address]);

  return (
    <TableRow key={account.id}>
      <TableCell>{platform}</TableCell>
      <TableCell>{wallet}</TableCell>
      <TableCell className="text-right">
        {account.platform === "polkadot" ? account.name : null}
      </TableCell>
      <TableCell className="text-right font-mono">{shortAddress}</TableCell>
    </TableRow>
  );
};
