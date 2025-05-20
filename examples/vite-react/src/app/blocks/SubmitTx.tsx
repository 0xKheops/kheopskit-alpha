import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CHAINS, VIEM_CHAINS_BY_ID } from "@/lib/config/chains";
import type {
  EthereumAccount,
  EthereumWallet,
  PolkadotAccount,
} from "@kheopskit/core";
import { useWallets } from "@kheopskit/react";
import { type FC, useEffect, useMemo, useState } from "react";
import type { Chain } from "viem";
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

  const networks = useMemo(() => {
    if (!account) return [];
    return SUPPORTED_CHAINS.filter((chain) => {
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
    if (!network && networks.length) setNetworkId(networks[0].id);
  }, [network, networks]);

  console.log("tx", { account, network });

  return (
    <div>
      <div className="inline-grid grid-cols-[auto_auto] gap-4 items-center">
        <div>Account</div>
        <div className="min-w-[300px]">
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
      </div>

      {!!network && account?.platform === "ethereum" && (
        <SubmitEthxTx chainId={network.id} account={account} />
      )}

      {!!network && account?.platform === "polkadot" && (
        <SubmitTxDot chainId={network.id} account={account} />
      )}
    </div>
  );
};

const SubmitEthxTx: FC<{ chainId: string; account: EthereumAccount }> = ({
  chainId,
  account,
}) => {
  const { wallets } = useWallets();

  const wallet = useMemo(() => {
    return wallets.find(
      (w) => w.id === account.walletId,
    ) as EthereumWallet | null;
  }, [account.walletId, wallets]);

  const activeChain = useMemo<Chain | null>(() => {
    if (!account.client.chain) return null;
    return VIEM_CHAINS_BY_ID[account.client.chain.id] ?? null;
  }, [account.client.chain]);
  // const {switchChainAsync} = useSwitchChain({

  // })

  // account.client.chain?.id

  // const handleClick = async () => {
  //   if (!client) return;
  //   try {
  //     const tx = await client.sendTransaction({
  //       to: address,
  //       value: "0",
  //       chainId,
  //     });
  //     console.log("tx", tx);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <div>
      <div>Target chain: {chainId}</div>
      <div>Wallet active chain: {activeChain?.name ?? "unknown"}</div>
      <div>Account client chain: {account.client.chain?.id ?? "undefined"}</div>
      <div>Wallet is connected: {wallet?.isConnected}</div>

      {/* <button onClick={handleClick}>Send</button> */}
    </div>
  );
};

const SubmitTxDot: FC<{ chainId: string; account: PolkadotAccount }> = ({
  chainId,
  account,
}) => {
  return (
    <div>
      <div>Target Chain: {chainId}</div>
      <div>
        Account public key: {account.polkadotSigner.publicKey.toString()}
      </div>
      {/* <button onClick={handleClick}>Send</button> */}
    </div>
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
