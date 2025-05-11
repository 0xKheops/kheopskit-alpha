import { store } from "@/api/store";
import type { PolkadotWallet } from "@/api/types";
import {
  getWalletId,
  parseWalletId,
  type WalletId,
} from "@/utils/injectedWalletId";
import { isEqual } from "lodash";
import {
  connectInjectedExtension,
  getInjectedExtensions,
  type InjectedExtension,
} from "polkadot-api/pjs-signer";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  mergeMap,
  Observable,
  of,
  shareReplay,
  timer,
} from "rxjs";

const getInjectedWalletsIds = () =>
  getInjectedExtensions().map((name) => getWalletId("polkadot", name));

const polkadotInjectedWallets$ = new Observable<PolkadotWallet[]>(
  (subscriber) => {
    const enabledExtensions$ = new BehaviorSubject<
      Map<WalletId, InjectedExtension>
    >(new Map());

    const connect = async (walletId: WalletId) => {
      if (enabledExtensions$.value.has(walletId))
        throw new Error(`Extension ${walletId} already connected`);
      const { name } = parseWalletId(walletId);
      const extension = await connectInjectedExtension(name);

      const newMap = new Map(enabledExtensions$.value);
      newMap.set(walletId, extension);
      enabledExtensions$.next(newMap);

      store.addEnabledWalletId(walletId);
    };

    const disconnect = (walletId: WalletId) => {
      if (!enabledExtensions$.value.has(walletId))
        throw new Error(`Extension ${walletId} is not connected`);

      const newMap = new Map(enabledExtensions$.value);
      newMap.delete(walletId);
      enabledExtensions$.next(newMap);

      store.removeEnabledWalletId(walletId);
    };

    const walletIds$ = of(0, 200, 500, 1000) // poll for wallets that register after page load
      .pipe(
        mergeMap((time) => timer(time)),
        map(() => getInjectedWalletsIds()),
        distinctUntilChanged<WalletId[]>(isEqual)
      );

    const subscription = combineLatest([walletIds$, enabledExtensions$])
      .pipe(
        map(([walletIds, enabledExtensions]) => {
          return walletIds.map((id): PolkadotWallet => {
            const { name } = parseWalletId(id);
            const extension = enabledExtensions.get(id);

            return extension
              ? {
                  id,
                  platform: "polkadot",
                  name,
                  isEnabled: true,
                  extension,
                  disconnect: () => disconnect(id),
                }
              : {
                  id,
                  platform: "polkadot",
                  name,
                  isEnabled: false,
                  connect: () => connect(id),
                };
          });
        })
      )
      .subscribe(subscriber);

    return () => {
      subscription.unsubscribe();
    };
  }
).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

// TODO merge with wallet connect
export const polkadotWallets$ = polkadotInjectedWallets$;

polkadotWallets$.subscribe(() => {
  console.count("[kheopskit] polkadotWallets$ emit");
});
