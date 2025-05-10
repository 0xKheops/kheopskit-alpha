import { store } from "@/api/store";
import { map, shareReplay } from "rxjs";

// TODO rename, they actually might not be connected
export const polkadotConnectedExtensionIds$ = store.observable.pipe(
  map((s) => s.polkadot?.connectedExtensionIds ?? []),
  shareReplay(1)
);
