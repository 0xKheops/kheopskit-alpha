// import { store } from "@/api/store";
// import { throwAfter, type UnsubscribeFn } from "@/utils";
// import { parseWalletId, type WalletId } from "@/utils/injectedWalletId";
// import {
//   connectInjectedExtension,
//   type InjectedExtension,
//   type InjectedPolkadotAccount,
// } from "polkadot-api/pjs-signer";
// import { BehaviorSubject, firstValueFrom, Observable, shareReplay } from "rxjs";

// type EnabledExtension = {
//   extension: InjectedExtension;
//   accounts: InjectedPolkadotAccount[];
//   unsubscribe: UnsubscribeFn;
// };

// const enabledExtensions$ = new BehaviorSubject<Map<WalletId, EnabledExtension>>(
//   new Map()
// );

// export const connectPolkadotInjectedExtension = async (
//   walletId: WalletId,
//   timeout = 2_000
// ): Promise<InjectedPolkadotAccount[]> => {
//   // console.log("connectPolkadotInjectedExtension", id);
//   if (enabledExtensions$.value.has(walletId))
//     throw new Error(`Extension ${walletId} already connected`);

//   const { name } = parseWalletId(walletId);
//   const extension = await connectInjectedExtension(name);

//   const accounts$ = new Observable<InjectedPolkadotAccount[]>((subscriber) => {
//     const unsubscribe = extension.subscribe((accounts) => {
//       subscriber.next(accounts);
//     });
//     return () => {
//       unsubscribe();
//     };
//   }).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

//   const subscription = accounts$.subscribe((accounts) => {
//     const newMap = new Map(enabledExtensions$.value);
//     newMap.set(walletId, {
//       extension,
//       accounts,
//       unsubscribe: () => {
//         subscription.unsubscribe();
//       },
//     });
//     enabledExtensions$.next(newMap);
//   });

//   store.addEnabledWalletId(walletId);

//   return Promise.race([
//     firstValueFrom(accounts$),
//     throwAfter(
//       timeout,
//       `Failed to subscribe to accounts on extension ${walletId}`
//     ),
//   ]);
// };

// export const disconnectPolkadotInjectedExtension = (walletId: WalletId) => {
//   const extension = enabledExtensions$.value.get(walletId);
//   if (extension) {
//     extension.unsubscribe();
//     extension.extension.disconnect();

//     const newMap = new Map(enabledExtensions$.value);
//     newMap.delete(walletId);
//     enabledExtensions$.next(newMap);
//   }

//   store.removeEnabledWalletId(walletId);
// };

// export const polkadotEnabledExtensions$ = enabledExtensions$.asObservable();

// // polkadotEnabledExtensions$.subscribe(() => {
// //   console.count("polkadotEnabledExtensions$ emit");
// // });
