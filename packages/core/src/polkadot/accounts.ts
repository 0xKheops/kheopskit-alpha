import { map, shareReplay } from "rxjs";
import { polkadotEnabledExtensions$ } from "./extensions.enabled";
import { getInjectedAccountId } from "@/utils";
import { parseWalletId } from "@/utils/injectedWalletId";

export const connectedAccounts$ = polkadotEnabledExtensions$.pipe(
  map((extensionsMap) =>
    Array.from(extensionsMap.entries()).flatMap(([walletId, extension]) =>
      extension.accounts.map((account) => {
        const { platform, name: wallet } = parseWalletId(walletId);
        return {
          id: getInjectedAccountId(walletId, account.address),
          platform,
          wallet,
          ...account,
        };
      })
    )
  ),
  shareReplay(1)
);

connectedAccounts$.subscribe((val) => {
  console.log("connectedAccounts$ emit", val);
});
