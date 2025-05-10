import { map, shareReplay } from "rxjs";
import { polkadotEnabledExtensions$ } from "./extensions.enabled";
import { getInjectedAccountId } from "@/utils";

export const connectedAccounts$ = polkadotEnabledExtensions$.pipe(
  map((extensionsMap) =>
    Array.from(extensionsMap.entries()).flatMap(([wallet, extension]) =>
      extension.accounts.map((account) => ({
        id: getInjectedAccountId(wallet, account.address),
        wallet,
        platform: "polkadot",
        ...account,
      }))
    )
  ),
  shareReplay(1)
);

connectedAccounts$.subscribe((val) => {
  console.log("connectedAccounts$ emit", val);
});
