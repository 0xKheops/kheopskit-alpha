import { combineLatest, distinct, mergeMap, take } from "rxjs";
import { polkadotConnectedExtensionIds$ } from "./extensions.store";
import { polkadotInjectedExtensionIds$ } from "./extensions.injected";
import { connectPolkadotInjectedExtension } from "./extensions.connect";
import { intersection } from "lodash";

export const polkadotAutoReconnect = () => {
  // auto reconnect previously injected extensions
  combineLatest([
    polkadotConnectedExtensionIds$.pipe(take(1)),
    polkadotInjectedExtensionIds$,
  ])
    .pipe(
      mergeMap(([reconnectIds, injectedIds]) =>
        intersection(reconnectIds, injectedIds)
      ),
      distinct()
    )
    .subscribe(async (id) => {
      console.log("reconnect", id);

      try {
        await connectPolkadotInjectedExtension(id);
      } catch (err) {
        console.error("Failed to reconnect wallet %s", id, { err });
      }
    });
};
