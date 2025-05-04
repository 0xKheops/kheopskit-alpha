import { createStore } from "./store";

const LOCAL_STORAGE_KEY = "kheopskit";

type ExtensionTypeSettings = {
  connectedExtensionIds: string[];
  defaultAccountId: string | null;
};

type KheopskitSettings = {
  polkadot?: ExtensionTypeSettings;
  ethereum?: ExtensionTypeSettings;
};

const DEFAULT_SETTINGS: KheopskitSettings = {};

export const settings = createStore(LOCAL_STORAGE_KEY, DEFAULT_SETTINGS);

settings.observable.subscribe((val) => console.log("settings", val));

// const parseSettings = (str: string | null): KheopskitSettings => {
//   try {
//     if (str) return JSON.parse(str);
//   } catch {
//     // invalid data
//   }
//   return DEFAULT_SETTINGS;
// };

// const getStoredSettings = (): KheopskitSettings => {
//   const str = localStorage.getItem(LOCAL_STORAGE_KEY);
//   return parseSettings(str);
// };

// const setStoredSettings = (val: KheopskitSettings) => {
//   const str = JSON.stringify(val);
//   localStorage.setItem(LOCAL_STORAGE_KEY, str);
// };

// const subject = new BehaviorSubject<KheopskitSettings>(getStoredSettings());

// // Cross-tab sync via 'storage' event
// fromEvent<StorageEvent>(window, "storage")
//   .pipe(
//     filter((event) => event.key === LOCAL_STORAGE_KEY),
//     map((event) => parseSettings(event.newValue))
//   )
//   .subscribe((newValue) => subject.next(newValue));

// export const settings$ = subject.asObservable();

// export const getSettings = () => structuredClone(subject.getValue());

// export function setSettings(newValue: KheopskitSettings) {
//   setStoredSettings(newValue);
//   subject.next(newValue);
// }

// export const mutateSettings = (
//   transform: (prev: KheopskitSettings) => KheopskitSettings
// ) => {
//   const newValue = transform(subject.value);
//   setSettings(newValue);
// };
