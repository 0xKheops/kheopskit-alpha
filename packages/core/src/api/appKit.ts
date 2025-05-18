import { getWalletId } from "@/utils/WalletId";
import { createAppKit } from "@reown/appkit/core";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
} from "rxjs";
import type { KheopskitConfig, PolkadotAppKitWallet } from "./types";

// const CACHE = new Map<string, AppKit>();

// export const getAppKit = (config: KheopskitConfig): AppKit | null => {
//   if (!config.walletConnect?.projectId) return null;

//   const key = JSON.stringify(config.walletConnect);
//   if (!CACHE.has(key)) {
//     CACHE.set(
//       key,
//       createAppKit({
//         projectId: config.walletConnect.projectId,
//         metadata: config.walletConnect.metadata,
//         networks: config.walletConnect.networks,
//         universalProviderConfigOverride: {
//           methods: {
//             polkadot: ["polkadot_signTransaction", "polkadot_signMessage"],
//           },
//         },
//       }),
//     );
//   }

//   // biome-ignore lint/style/noNonNullAssertion: <explanation>
//   return CACHE.get(key)!;
// };

type AppKitWallets = {
  polkadot?: PolkadotAppKitWallet;
  //ethereum?: EthereumAppKitWallet;
};

// once it exists, appKit object should never be recreated
let cachedAppKit: Observable<AppKitWallets> | null = null;

// const OBS_CACHE = new Map<string, Observable<AppKit | null>>();

export const getAppKitWallets$ = (
  config: KheopskitConfig,
): Observable<AppKitWallets> => {
  if (!config.walletConnect) return of({}); // of(null).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  const walletConnect = config.walletConnect;

  if (!cachedAppKit) {
    cachedAppKit = new Observable<AppKitWallets>((subscriber) => {
      const appKit = createAppKit({
        projectId: walletConnect.projectId,
        metadata: walletConnect.metadata,
        networks: walletConnect.networks,
        universalProviderConfigOverride: {
          methods: {
            polkadot: ["polkadot_signTransaction", "polkadot_signMessage"],
          },
        },
      });

      const status$ = new BehaviorSubject({
        isPolkadotConnected: false,
        isEthereumConnected: false,
      });

      // const polkadotWallet = new BehaviorSubject<PolkadotAppKitWallet | null>(
      //   null,
      // );

      console.log("[AppKit] Subscribe providers");
      const unsubProviders = appKit.subscribeProviders((providers) => {
        status$.next({
          isPolkadotConnected: !!providers.polkadot,
          isEthereumConnected: !!providers.eip155,
        });
      });

      const polkadotWallet$ = appKit.chainNamespaces.includes("polkadot")
        ? status$.pipe(
            map((s) => s.isPolkadotConnected),
            distinctUntilChanged(),
            map((isConnected): PolkadotAppKitWallet => {
              const walletInfo = appKit.getWalletInfo();

              return {
                id: getWalletId("polkadot", "walletconnect"),
                platform: "polkadot",
                type: "appKit",
                appKit, // todo maybe we dont want to expose the appKit instance
                name: walletInfo?.name ?? "WalletConnect",
                // icon: walletInfo?.icon,
                connect: async () => {
                  if (!isConnected) await appKit.open();
                },
                disconnect: () => {
                  if (isConnected) appKit.disconnect();
                },
                isConnected,
              };
            }),
          )
        : of(undefined);

      // const ethereumWallet$ = status$
      // .pipe(
      //   map((s) => s.isEthereumConnected),
      //   distinctUntilChanged(),
      //   map(
      //     (isConnected): EthereumAppKitWallet => ({
      //       id: getWalletAccountId("eip155", "walletconnect"),
      //       platform: "ethereum",
      //       type: "appKit",
      //       appKit,
      //       name: "WalletConnect",
      //       connect: () => appKit.open(),
      //       disconnect: () => appKit.disconnect(),
      //       isConnected,
      //     }),
      //   ),
      // );

      const sub = combineLatest({
        polkadot: polkadotWallet$,
        // ethereum: ethereumWallet$,
      }).subscribe(subscriber);

      return () => {
        console.log("[AppKit] Unsubscribe providers");
        sub.unsubscribe();
        unsubProviders();
      };
    }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  }

  return cachedAppKit;
};
