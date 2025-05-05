import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { sortWallets } from "./sortWallets";
import { BehaviorSubject, mergeMap, of, timer } from "rxjs";
import { isEqual } from "lodash";

const getInjectedWalletsIds = () =>
  getInjectedExtensions()?.concat().sort(sortWallets) ?? [];

const injectedExtensionIdsSubject = new BehaviorSubject<string[]>(
  getInjectedWalletsIds()
);

export const polkadotInjectedExtensionIds$ =
  injectedExtensionIdsSubject.asObservable();

polkadotInjectedExtensionIds$.subscribe((val) => {
  console.log("injectedExtensionIds$", val);
});

// poll for wallets that are slow to register
of(100, 500, 1000)
  .pipe(mergeMap((time) => timer(time)))
  .subscribe(() => {
    const ids = getInjectedWalletsIds();
    if (!isEqual(ids, injectedExtensionIdsSubject.value)) {
      injectedExtensionIdsSubject.next(ids);
    }
  });
