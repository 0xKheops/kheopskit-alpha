import { store } from "@/api/store";
import { intersection } from "lodash";
import { combineLatest, distinct, map, mergeMap, take } from "rxjs";
import { connectPolkadotInjectedExtension } from "./extensions.enabled";
import { polkadotInjectedWalletIds$ } from "./extensions.injected";

// TODO async so Subscribe can suspense it ?
export const polkadotAutoReconnect = () => {
  // auto reconnect previously injected extensions
  const sub = combineLatest([
    store.observable.pipe(
      map((s) => s.autoReconnect),
      take(1)
    ),
    polkadotInjectedWalletIds$,
  ])
    .pipe(
      mergeMap(([autoReconnect, injectedIds]) => {
        console.log("polkadotAutoReconnect", {
          autoReconnect,
          injectedIds,
        });
        return intersection(autoReconnect, injectedIds);
      }),
      distinct()
    )
    .subscribe(async (id) => {
      console.log("Reconnecting", id);

      try {
        await connectPolkadotInjectedExtension(id);
      } catch (err) {
        console.error("Failed to reconnect wallet %s", id, { err });
      }
    });

  // kill after 5 seconds
  setTimeout(() => {
    sub.unsubscribe();
  }, 5_000);
};
