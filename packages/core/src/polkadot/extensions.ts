import { logger } from "@/utils/logger";
import { settings } from "@/utils/settings";
import { type Dictionary, fromPairs, isEqual } from "lodash";
import {
  type InjectedExtension,
  type InjectedPolkadotAccount,
  connectInjectedExtension,
  getInjectedExtensions,
} from "polkadot-api/pjs-signer";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  mergeMap,
  Observable,
  of,
  timer,
} from "rxjs";
import { sortWallets } from "./sortWallets";

const getInjectedWalletsIds = () =>
  getInjectedExtensions()?.concat().sort(sortWallets) ?? [];

export const injectedExtensionIdsSubject = new BehaviorSubject<string[]>(
  getInjectedWalletsIds()
);

export const injectedExtensionIds$ = injectedExtensionIdsSubject.asObservable();

injectedExtensionIds$.subscribe((val) => {
  console.log("injectedExtensionIds$", val);
});

// poll for wallets that are slow to register
of(100, 500, 1000)
  .pipe(mergeMap((time) => timer(time)))
  .subscribe(() => {
    const ids = getInjectedWalletsIds();
    if (!isEqual(ids, injectedExtensionIdsSubject.value)) {
      console.log("CHANGING INJECTED IDS");
      injectedExtensionIdsSubject.next(ids);
    }
  });

const connectedExtensions = new Map<string, Promise<InjectedExtension>>();

export const connectedExtensions$ = combineLatest([
  injectedExtensionIds$,
  settings.observable.pipe(
    map((settings) => settings.polkadot?.connectedExtensionIds ?? [])
  ),
]).pipe(
  distinctUntilChanged<[string[], string[]]>(isEqual),
  mergeMap(async ([injectedExtensions, connectedExtensionIds]) => {
    console.log("connectedExtension$ EMIT");
    const injectedWallets = await Promise.all(
      connectedExtensionIds
        .filter((id) => injectedExtensions.includes(id))
        .map(async (name) => {
          try {
            const stop = logger.timer(`connecting wallet ${name}`);
            if (!connectedExtensions.has(name)) {
              logger.debug("connecting wallet %s", name);
              connectedExtensions.set(name, connectInjectedExtension(name));
            }
            const connected = (await connectedExtensions.get(
              name
            )) as InjectedExtension;
            stop();
            return connected ?? null;
          } catch (err) {
            console.error("Failed to connect wallet %s", name, { err });
            connectedExtensions.delete(name);
            settings.mutate((prev) => ({
              ...prev,
              polkadot: {
                ...(prev.polkadot || { defaultAccountId: null }),
                connectedExtensionIds: connectedExtensionIds.filter(
                  (id) => id !== name
                ),
              },
            }));
            return null;
          }
        })
    );

    return injectedWallets.filter(Boolean) as InjectedExtension[];
  })
);

const getExtensionAccounts$ = (extension: InjectedExtension) =>
  new Observable<InjectedPolkadotAccount[]>((subscriber) => {
    const accounts = extension.getAccounts();
    subscriber.next(accounts);
    return extension.subscribe((newAccounts) => {
      subscriber.next(newAccounts);
    });
  });

export const accountsByExtension$ = connectedExtensions$.pipe(
  mergeMap((extensions) => {
    if (!extensions.length)
      return of({} as Dictionary<InjectedPolkadotAccount[] | undefined>);

    return combineLatest(
      extensions.map((extension) => getExtensionAccounts$(extension))
    ).pipe(
      map((arExtensionAccounts) =>
        fromPairs(
          extensions.map((ext, i) => [ext.name, arExtensionAccounts[i]])
        )
      )
    );
  })
);

export const connectExtension = (id: string) => {
  settings.mutate((prev) => ({
    ...prev,
    polkadot: {
      ...(prev.polkadot || { defaultAccountId: null }),
      connectedExtensionIds: [
        ...(prev.polkadot?.connectedExtensionIds || []).filter((n) => n !== id),
        id,
      ],
    },
  }));
};

export const disconnectExtension = (id: string) => {
  settings.mutate((prev) => ({
    ...prev,
    polkadot: {
      ...(prev.polkadot || { defaultAccountId: null }),
      connectedExtensionIds: (
        prev.polkadot?.connectedExtensionIds || []
      ).filter((n) => n !== id),
    },
  }));
};
