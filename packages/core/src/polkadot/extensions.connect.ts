import { throwAfter, type UnsubscribeFn } from "@/utils";
import { isEqual } from "lodash";
import {
  connectInjectedExtension,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import { BehaviorSubject, firstValueFrom, Observable, shareReplay } from "rxjs";

type ConnectedExtension = {
  extension: InjectedExtension;
  accounts: InjectedPolkadotAccount[];
  unsubscribe: UnsubscribeFn;
};

const mapConnectedExtensions$ = new BehaviorSubject<
  Map<string, ConnectedExtension>
>(new Map());

export const connectPolkadotInjectedExtension = async (
  id: string,
  timeout = 2_000
): Promise<InjectedPolkadotAccount[]> => {
  // console.log("connectPolkadotInjectedExtension", id);
  if (mapConnectedExtensions$.value.has(id))
    throw new Error(`Extension ${id} already connected`);

  const extension = await connectInjectedExtension(id);

  const accounts$ = new Observable<InjectedPolkadotAccount[]>((subscriber) => {
    const unsubscribe = extension.subscribe((accounts) => {
      subscriber.next(accounts);
    });
    return () => {
      unsubscribe();
    };
  }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  const subscription = accounts$.subscribe((accounts) => {
    const newMap = new Map(mapConnectedExtensions$.value);
    if (!isEqual(newMap.get(id)?.accounts, accounts)) {
      newMap.set(id, {
        extension,
        accounts,
        unsubscribe: () => {
          subscription.unsubscribe();
        },
      });
      mapConnectedExtensions$.next(newMap);
    }
  });

  return Promise.race([
    firstValueFrom(accounts$),
    throwAfter(timeout, `Failed to subscribe to accounts on extension ${id}`),
  ]);
};

export const disconnectPolkadotInjectedExtension = (id: string) => {
  const extension = mapConnectedExtensions$.value.get(id);
  if (extension) {
    extension.unsubscribe();
    extension.extension.disconnect();

    const newMap = new Map(mapConnectedExtensions$.value);
    newMap.delete(id);
    mapConnectedExtensions$.next(newMap);
  }
};

export const polkadotConnectedExtensions$ =
  mapConnectedExtensions$.asObservable();

polkadotConnectedExtensions$.subscribe(() => {
  console.count("polkadotConnectedExtensions$ emit");
});

// export const autoReconnect = (ids:string[]) => {

//     const ignoredInjectedExtensionIds: string[] = [];

//     // lets see if they can execute concurrently
//     let isAutoConnecting = false;

//     // auto reconnect previously injected extensions
//     combineLatest([
//       polkadotConnectedExtensionIds$,
//       polkadotInjectedExtensionIds$,
//       connectedPolkadotExtensionsSubject,
//     ])
//       .pipe(
//         // identify extension ids that need to be connected automatically
//         map(([connectedExtensionIds, injectedExtensionIds, extensions]) =>
//           intersection(connectedExtensionIds, injectedExtensionIds).filter(
//             (id) => !extensions.has(id) && !ignoredInjectedExtensionIds.includes(id)
//           )
//         )
//       )
//       .subscribe(async (extensionsIdsToConnect) => {
//         if (isAutoConnecting) {
//           logger.warn("Already auto connecting wallets");
//         }
//         const stop = logger.timer("auto reconnect wallets");
//         isAutoConnecting = true;

//         await Promise.all(
//           extensionsIdsToConnect.map(async (id) => {
//             try {
//               logger.debug("auto connecting wallet %s", id);
//               await connectPolkadotExtension(id);
//             } catch (err) {
//               console.error("Failed to connect wallet %s", id, { err });
//               ignoredInjectedExtensionIds.push(id);
//             }
//           })
//         );

//         stop();
//         isAutoConnecting = false;
//       });

// }
