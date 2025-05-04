import { getAccountAddressType } from "@/utils/getAccountAddressType";
import { AccountAddressType } from "@/utils/types";
import { entries } from "lodash";
import { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { combineLatest, distinctUntilChanged, map, shareReplay } from "rxjs";
import { accountsByExtension$ } from "./extensions";
import { getInjectedAccountId, InjectedAccountId } from "./injectedAccountId";

export type DotInjectedAccount = InjectedPolkadotAccount & {
  id: InjectedAccountId;
  wallet: string;
  addressType: AccountAddressType;
};

export const accounts$ = combineLatest([
  accountsByExtension$,
  // wcAccounts$,
]).pipe(
  map(
    ([
      accountsByExtension,
      //  wcAccounts
    ]) => ({
      ...accountsByExtension,
      //[WALLET_CONNECT_NAME]: wcAccounts,
    })
  ),
  map((connectedAccounts) =>
    entries(connectedAccounts).flatMap(
      ([wallet, accounts]) =>
        accounts?.map(
          (account): DotInjectedAccount => ({
            id: getInjectedAccountId(wallet, account.address),
            ...account,
            wallet,
            addressType: getAccountAddressType(account.address),
          })
        ) ?? []
    )
  ),
  shareReplay(1)
);

export const getAccount$ = (id: string) => {
  return accounts$.pipe(
    map((accounts) => accounts.find((account) => account.id === id) ?? null),
    distinctUntilChanged((a1, a2) => a1?.address === a2?.address),
    shareReplay({ refCount: true, bufferSize: 1 })
  );
};

accounts$.subscribe(console.log);
