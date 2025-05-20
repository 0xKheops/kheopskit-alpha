import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import {
  type EIP1193Provider,
  type WalletClient,
  createWalletClient,
  custom,
} from "viem";

// this is an unused draft
export const getInjectedWalletClient$ = (provider: EIP1193Provider) => {
  return new Observable<WalletClient>((subscriber) => {
    const client = createWalletClient({
      transport: custom(provider),
    });

    const connected$ = new BehaviorSubject<boolean>(false);
    const chainId$ = new BehaviorSubject<string | undefined>(undefined);
    const addresses$ = new BehaviorSubject<string[]>([]);

    const handleAccountsChanged = (addresses: string[]) => {
      console.log("[client] injected accounts changed", addresses);
      addresses$.next(addresses);
    };
    const handleChainChanged = (chainId: string) => {
      console.log("[client] injected chain changed", chainId);
      chainId$.next(chainId);
    };
    const handleDisconnect = (error: Error) => {
      console.log("[client] injected wallet disconnect", error);
      connected$.next(false);
    };
    const handleConnect = (info: { chainId: string }) => {
      console.log("[client] injected wallet connect", info);
      connected$.next(true);
      chainId$.next(info.chainId);
    };

    provider.on("chainChanged", handleChainChanged);
    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("disconnect", handleDisconnect);
    provider.on("connect", handleConnect);

    combineLatest([connected$, chainId$, addresses$]).subscribe(() => {
      subscriber.next(
        createWalletClient({
          transport: custom(provider),
        }),
      );
      console.log("[client] client updated", {
        chain: client.chain,
        account: client.account,
      });
    });

    return () => {
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("disconnect", handleDisconnect);
      provider.removeListener("connect", handleConnect);
    };
  });
};
