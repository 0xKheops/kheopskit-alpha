import { accounts$ } from "./accounts";
import {
  connectedExtensions$,
  connectExtension,
  disconnectExtension,
  injectedExtensionIds$,
} from "./extensions";

export const polkadot = {
  accounts$,
  injectedExtensionIds$,
  connectedExtensions$,
  connectExtension,
  disconnectExtension,
};
