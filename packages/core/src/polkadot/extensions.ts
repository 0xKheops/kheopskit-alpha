// import { logger } from "@/utils/logger";
// import { store } from "@/api";
// import { type Dictionary, fromPairs, isEqual } from "lodash";
// import {
//   type InjectedExtension,
//   type InjectedPolkadotAccount,
//   connectInjectedExtension,
//   getInjectedExtensions,
// } from "polkadot-api/pjs-signer";
// import {
//   BehaviorSubject,
//   combineLatest,
//   distinctUntilChanged,
//   map,
//   mergeMap,
//   Observable,
//   of,
//   timer,
// } from "rxjs";
// import { sortWallets } from "./sortWallets";

import {
  connectInjectedExtension,
  type InjectedExtension,
} from "polkadot-api/pjs-signer";
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  shareReplay,
} from "rxjs";
import { polkadotInjectedExtensionIds$ } from "./injected";
import { store } from "@/api/store";
import { intersection, uniq } from "lodash";
import { logger } from "@/utils";

// const getInjectedWalletsIds = () =>
//   getInjectedExtensions()?.concat().sort(sortWallets) ?? [];

// export const injectedExtensionIdsSubject = new BehaviorSubject<string[]>(
//   getInjectedWalletsIds()
// );

// export const injectedExtensionIds$ = injectedExtensionIdsSubject.asObservable();

// injectedExtensionIds$.subscribe((val) => {
//   console.log("injectedExtensionIds$", val);
// });

// // poll for wallets that are slow to register
// of(100, 500, 1000)
//   .pipe(mergeMap((time) => timer(time)))
//   .subscribe(() => {
//     const ids = getInjectedWalletsIds();
//     if (!isEqual(ids, injectedExtensionIdsSubject.value)) {
//       console.log("CHANGING INJECTED IDS");
//       injectedExtensionIdsSubject.next(ids);
//     }
//   });

// const connectedExtensions = new Map<string, Promise<InjectedExtension>>();

// export const connectedExtensions$ = combineLatest([
//   injectedExtensionIds$,
//   store.observable.pipe(
//     map((settings) => settings.polkadot?.connectedExtensionIds ?? [])
//   ),
// ]).pipe(
//   distinctUntilChanged<[string[], string[]]>(isEqual),
//   mergeMap(async ([injectedExtensions, connectedExtensionIds]) => {
//     console.log("connectedExtension$ EMIT");
//     const injectedWallets = await Promise.all(
//       connectedExtensionIds
//         .filter((id) => injectedExtensions.includes(id))
//         .map(async (name) => {
//           try {
//             const stop = logger.timer(`connecting wallet ${name}`);
//             if (!connectedExtensions.has(name)) {
//               logger.debug("connecting wallet %s", name);
//               connectedExtensions.set(name, connectInjectedExtension(name));
//             }
//             const connected = (await connectedExtensions.get(
//               name
//             )) as InjectedExtension;
//             stop();
//             return connected ?? null;
//           } catch (err) {
//             console.error("Failed to connect wallet %s", name, { err });
//             connectedExtensions.delete(name);
//             store.mutate((prev) => ({
//               ...prev,
//               polkadot: {
//                 ...(prev.polkadot || { defaultAccountId: null }),
//                 connectedExtensionIds: connectedExtensionIds.filter(
//                   (id) => id !== name
//                 ),
//               },
//             }));
//             return null;
//           }
//         })
//     );

//     return injectedWallets.filter(Boolean) as InjectedExtension[];
//   })
// );

// const getExtensionAccounts$ = (extension: InjectedExtension) =>
//   new Observable<InjectedPolkadotAccount[]>((subscriber) => {
//     const accounts = extension.getAccounts();
//     subscriber.next(accounts);
//     return extension.subscribe((newAccounts) => {
//       subscriber.next(newAccounts);
//     });
//   });

// export const accountsByExtension$ = connectedExtensions$.pipe(
//   mergeMap((extensions) => {
//     if (!extensions.length)
//       return of({} as Dictionary<InjectedPolkadotAccount[] | undefined>);

//     return combineLatest(
//       extensions.map((extension) => getExtensionAccounts$(extension))
//     ).pipe(
//       map((arExtensionAccounts) =>
//         fromPairs(
//           extensions.map((ext, i) => [ext.name, arExtensionAccounts[i]])
//         )
//       )
//     );
//   })
// );

// export const connectExtension = (id: string) => {
//   store.mutate((prev) => ({
//     ...prev,
//     polkadot: {
//       ...(prev.polkadot || { defaultAccountId: null }),
//       connectedExtensionIds: [
//         ...(prev.polkadot?.connectedExtensionIds || []).filter((n) => n !== id),
//         id,
//       ],
//     },
//   }));
// };

// export const disconnectExtension = (id: string) => {
//   store.mutate((prev) => ({
//     ...prev,
//     polkadot: {
//       ...(prev.polkadot || { defaultAccountId: null }),
//       connectedExtensionIds: (
//         prev.polkadot?.connectedExtensionIds || []
//       ).filter((n) => n !== id),
//     },
//   }));
// };

export const polkadotConnectedExtensionIds$ = store.observable.pipe(
  map((s) => s.polkadot?.connectedExtensionIds ?? []),
  shareReplay(1)
);

const connectedPolkadotExtensionsSubject = new BehaviorSubject<
  Map<string, InjectedExtension>
>(new Map());

export const connectPolkadotExtension = async (id: string) => {
  const extensionsById = new Map(connectedPolkadotExtensionsSubject.value);
  if (extensionsById.has(id))
    return extensionsById.get(id) as InjectedExtension;

  const injectedExtensionIds = await firstValueFrom(
    polkadotInjectedExtensionIds$
  );
  if (!injectedExtensionIds.includes(id))
    throw new Error(`Polkadot extension ${id} not found`);

  const extension = await connectInjectedExtension(id); // TODO dapp name

  extensionsById.set(id, extension);
  connectedPolkadotExtensionsSubject.next(extensionsById);

  store.mutate((prev) => ({
    ...prev,
    polkadot: {
      ...(prev.polkadot || { defaultAccountId: null, accounts: [] }),
      connectedExtensionIds: uniq([
        ...(prev.polkadot?.connectedExtensionIds ?? []),
        id,
      ]),
    },
  }));

  return extension;
};

export const disconnectPolkadotExtension = (id: string) => {
  const extensionsById = new Map(connectedPolkadotExtensionsSubject.value);

  const extension = extensionsById.get(id);
  if (extension) {
    extension.disconnect();
    extensionsById.delete(id);
    connectedPolkadotExtensionsSubject.next(extensionsById);
  }

  store.mutate((prev) => ({
    ...prev,
    polkadot: {
      ...(prev.polkadot || { defaultAccountId: null, accounts: [] }),
      connectedExtensionIds:
        prev.polkadot?.connectedExtensionIds.filter((extId) => extId !== id) ??
        [],
    },
  }));
};

const ignoredInjectedExtensionIds: string[] = [];

// lets see if they can execute concurrently
let isAutoConnecting = false;

// auto reconnect previously injected extensions
combineLatest([
  polkadotConnectedExtensionIds$,
  polkadotInjectedExtensionIds$,
  connectedPolkadotExtensionsSubject,
])
  .pipe(
    // identify extension ids that need to be connected automatically
    map(([connectedExtensionIds, injectedExtensionIds, extensions]) =>
      intersection(connectedExtensionIds, injectedExtensionIds).filter(
        (id) => !extensions.has(id) && !ignoredInjectedExtensionIds.includes(id)
      )
    )
  )
  .subscribe(async (extensionsIdsToConnect) => {
    if (isAutoConnecting) {
      logger.warn("Already auto connecting wallets");
    }
    const stop = logger.timer("auto reconnect wallets");
    isAutoConnecting = true;

    await Promise.all(
      extensionsIdsToConnect.map(async (id) => {
        try {
          logger.debug("auto connecting wallet %s", id);
          await connectPolkadotExtension(id);
        } catch (err) {
          console.error("Failed to connect wallet %s", id, { err });
          ignoredInjectedExtensionIds.push(id);
        }
      })
    );

    stop();
    isAutoConnecting = false;
  });
