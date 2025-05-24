import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPKIT_CHAINS, VIEM_CHAINS_BY_ID } from "@/lib/config/chains";
import { type PolkadotChainId, getPolkadotApi } from "@/lib/getPolkadotApi";
import type {
  EthereumAccount,
  PolkadotAccount,
  WalletAccount,
} from "@kheopskit/core";
import { useWallets } from "@kheopskit/react";
import { MultiAddress } from "@polkadot-api/descriptors";
import type { TxEvent } from "polkadot-api";
import { type FC, useEffect, useMemo, useState } from "react";
import type { Observable } from "rxjs";
import { toast } from "sonner";
import { http, type RpcError, createPublicClient, isHex } from "viem";
import { AppBlock } from "./AppBlock";

export const SubmitTx = () => (
  <AppBlock
    title="Submitting a transaction"
    description={
      "Demo transfer: selected account will send 0 tokens to self on selected network"
    }
    codeUrl="https://github.com/0xKheops/kheopskit-alpha/blob/main/examples/vite-react/src/app/blocks/SubmitTx.tsx"
  >
    <div className="flex flex-col gap-8">
      <Content />
    </div>
  </AppBlock>
);

const Content = () => {
  const { accounts } = useWallets(); // kheopskit
  const [accountId, setAccountId] = useState<string>();
  const account = useMemo(
    () => accounts.find((a) => a.id === accountId) ?? null,
    [accountId, accounts],
  );
  const [recipientId, setRecipientId] = useState<string>();
  const recipient = useMemo(
    () => accounts.find((a) => a.id === recipientId) ?? null,
    [recipientId, accounts],
  );

  const networks = useMemo(() => {
    if (!account) return [];
    return APPKIT_CHAINS.filter((chain) => {
      switch (account.platform) {
        case "ethereum":
          return chain.chainNamespace === "eip155";
        case "polkadot":
          return chain.chainNamespace === "polkadot";
      }
    });
  }, [account]);
  const [networkId, setNetworkId] = useState<string>();
  const network = useMemo(
    () => networks.find((a) => a.id === networkId) ?? null,
    [networkId, networks],
  );

  useEffect(() => {
    if (!account && accounts.length) setAccountId(accounts[0].id);
  }, [account, accounts]);

  useEffect(() => {
    if (!recipient && accounts.length) setRecipientId(accounts[0].id);
  }, [recipient, accounts]);

  useEffect(() => {
    if (!network && networks.length) setNetworkId(networks[0].id);
  }, [network, networks]);

  console.log("tx", { account, network });

  return (
    <div className="flex flex-col gap-4">
      <div className="inline-grid grid-cols-[100px_auto] gap-4 items-center">
        <div>Account</div>
        <div>
          <Select onValueChange={setAccountId} value={account?.id ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  [{account.walletName}]{" "}
                  {(account.platform === "polkadot" && account.name) ||
                    account.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>Network</div>
        <div>
          <Select onValueChange={setNetworkId} value={network?.id ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network.id} value={network.id}>
                  {network.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>Account</div>
        <div>
          <Select onValueChange={setRecipientId} value={recipient?.id ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Recipient" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  [{account.walletName}]{" "}
                  {(account.platform === "polkadot" && account.name) ||
                    account.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!!network &&
          account?.platform === "ethereum" &&
          isHex(recipient?.address) && (
            <SubmitEthxTx
              chainId={Number(network.id)}
              account={account}
              recipient={recipient}
            />
          )}

        {!!network &&
          account?.platform === "polkadot" &&
          recipient?.platform === "polkadot" && (
            <SubmitTxDot
              chainId={network.id}
              account={account}
              recipient={recipient}
            />
          )}
      </div>
    </div>
  );
};

const SubmitEthxTx: FC<{
  chainId: number;
  account: EthereumAccount;
  recipient: WalletAccount;
}> = ({ chainId, account, recipient }) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const chain = VIEM_CHAINS_BY_ID[chainId] as any;

  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSendClick = async () => {
    if (!isHex(recipient.address)) return;
    try {
      const walletChainId = await account.client.getChainId();

      console.log("walletChainId", walletChainId);
      if (walletChainId !== chainId) {
        try {
          await account.client.switchChain({
            id: chainId,
          });
        } catch (err) {
          console.error("Error switching chain", err);
          await account.client.addChain({
            chain,
          });
        }
      }
      console.log("chain switched");

      const publicClient = createPublicClient({ chain, transport: http() });
      const gas = await publicClient.estimateGas({
        to: recipient.address,
        value: 0n,
      });

      console.log({ gas });

      const hash = await account.client.sendTransaction({
        chain,
        to: recipient.address,
        value: 0n,
        gas,
      });
      setTxHash(hash);

      toast.success(`Transaction submitted: ${hash}`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") toast.success("Transaction successful");
      else toast.error("Transaction reverted");
    } catch (err) {
      toast.error(
        `Error: ${(err as RpcError).shortMessage ?? (err as Error).message}`,
      );
    }
  };

  const blockExplorerUrl = useMemo(() => {
    if (!chain || !txHash) return null;
    const blockExplorer = chain.blockExplorers?.default;
    if (!blockExplorer) return null;
    return `${blockExplorer.url}/tx/${txHash}`;
  }, [chain, txHash]);

  return (
    <>
      <div>
        <Button
          disabled={!account || !chain || !isHex(recipient.address)}
          onClick={handleSendClick}
        >
          Send
        </Button>
      </div>
      <div>
        {!!blockExplorerUrl && (
          <a href={blockExplorerUrl}>View on block explorer</a>
        )}
      </div>
    </>
  );
};

const SubmitTxDot: FC<{
  chainId: string;
  account: PolkadotAccount;
  recipient: PolkadotAccount;
}> = ({ chainId, account, recipient }) => {
  const [tx, setTx] = useState<Observable<TxEvent>>();
  const [txStatus, setTxStatus] = useState<TxEvent | null>(null);

  useEffect(() => {
    if (!tx) return;

    const sub = tx.subscribe((status) => {
      setTxStatus(status);

      const id = status.txHash; // for toasts

      switch (status.type) {
        case "signed": {
          toast.loading(`Transaction signed: ${status.txHash}`, {
            id,
          });
          break;
        }
        case "broadcasted": {
          toast.loading(`Transaction broadcasted: ${status.txHash}`, {
            id,
          });
          break;
        }
        case "txBestBlocksState": {
          if (status.found) {
            if (status.ok) {
              toast.success("Transaction successful", {
                id,
              });
            } else {
              toast.error("Transaction failed", {
                id,
              });
            }
            setTx(undefined);
          }
          break;
        }
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [tx]);

  const handleSendClick = () => {
    try {
      const api = getPolkadotApi(chainId as PolkadotChainId);

      const tx$ = api.tx.Balances.transfer_keep_alive({
        dest: MultiAddress.Id(recipient.address),
        value: 0n,
      }).signSubmitAndWatch(account.polkadotSigner);

      setTx(tx$);
    } catch (err) {
      toast.error(
        `Error: ${(err as RpcError).shortMessage ?? (err as Error).message}`,
      );
    }
  };

  const blockExplorerUrl = useMemo(() => {
    if (!txStatus?.txHash) return null;
    const chain = APPKIT_CHAINS.find((c) => c.id === chainId);
    if (!chain) return null;

    const blockExplorer = chain.blockExplorers?.default;
    if (!blockExplorer) return null;
    return `${blockExplorer.url}/tx/${txStatus.txHash}`;
  }, [txStatus, chainId]);

  return (
    <>
      <div>
        <Button disabled={!account} onClick={handleSendClick}>
          Send
        </Button>
      </div>
      <div>
        {!!blockExplorerUrl && (
          <a href={blockExplorerUrl}>View on block explorer</a>
        )}
      </div>
    </>
  );
};

// const Connectors = () => {
//   const { connectors, connect } = useConnect();
//   const { connector: current, address } = useAccount();

//   return (
//     <div>
//       <h3>Connectors</h3>
//       <div className="text-muted-foreground text-sm">
//         Select active Wagmi connector:
//       </div>
//       <ul className="flex flex-wrap gap-2 py-1">
//         {connectors.map((connector) => (
//           <li key={connector.id}>
//             <Button
//               onClick={() => connect({ connector })}
//               variant={"outline"}
//               disabled={connector.id === current?.id}
//               className="disabled:bg-green-500"
//             >
//               {connector.icon && (
//                 <img src={connector.icon} alt="" className="size-4" />
//               )}{" "}
//               {connector.name}
//             </Button>
//           </li>
//         ))}
//       </ul>
//       <div className="text-sm text-muted-foreground">
//         <div>Active connector: {current?.name ?? "N/A"}</div>
//         <div>Active account: {address ?? "N/A"}</div>
//       </div>
//     </div>
//   );
// };

// const ActiveAccount = () => {
//   const { accounts } = useWallets(); // kheopskit
//   const [accountId, setAccountId] = useState<string>();

//   const account = useMemo(
//     () => accounts.find((a) => a.id === accountId) ?? null,
//     [accountId, accounts],
//   );

//   const handleClick = async () => {
//     const account = accounts.find((a) => a.id === accountId);
//     if (!account || account.platform !== "ethereum") return;

//     try {
//       const signature = await account.client.signMessage({
//         message: "Hello Wagmi!",
//         account: account.address,
//       });

//       toast.success(`Signature: ${signature}`);
//     } catch (err) {
//       console.error(err);
//       toast.error(`Error: ${(err as Error).message}`);
//     }
//   };

//   return (
//     <div>
//       <h3>Best practice with Kheopskit</h3>
//       <p className="text-muted-foreground text-sm">
//         It's bad UX to have to switch the active Wagmi connector prior to do an
//         action with it, as it can trigger wallet prompts.
//         <br />
//         When doing an action using an account from the Kheopskit accounts list,
//         it's best to lookup the associated wagmi connector and pass it as an
//         argument to the hook or method call.
//         <br />
//         This example showcases this approach:
//       </p>
//       <div className="flex gap-4 mt-2">
//         <Select onValueChange={setAccountId}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Account" />
//           </SelectTrigger>
//           <SelectContent>
//             {accounts
//               .filter((a) => a.platform === "ethereum")
//               .map((account) => (
//                 <SelectItem key={account.id} value={account.id}>
//                   {account.walletName} - {account.address}
//                 </SelectItem>
//               ))}
//           </SelectContent>
//         </Select>
//         <Button onClick={handleClick} className="py-0" disabled={!account}>
//           Sign
//         </Button>
//       </div>
//     </div>
//   );
// };
