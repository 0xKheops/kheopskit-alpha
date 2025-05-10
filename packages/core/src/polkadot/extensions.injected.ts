import { getWalletId, type WalletId } from "@/utils/injectedWalletId";
import { isEqual } from "lodash";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { distinctUntilChanged, map, mergeMap, of, timer } from "rxjs";

const getInjectedWalletsIds = () =>
  getInjectedExtensions().map((name) => getWalletId("polkadot", name));

export const polkadotInjectedWalletIds$ = of(0, 200, 500, 1000) // poll for wallets that register after page load
  .pipe(
    mergeMap((time) => timer(time)),
    map(() => getInjectedWalletsIds()),
    distinctUntilChanged<WalletId[]>(isEqual)
  );

polkadotInjectedWalletIds$.subscribe((val) => {
  console.log("injectedExtensionIds$", val);
});
