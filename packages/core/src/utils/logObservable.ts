import { type MonoTypeOperatorFunction, tap } from "rxjs";

export const logObservable = <T>(
  label: string,
  printOutput = false,
): MonoTypeOperatorFunction<T> =>
  tap((value) => {
    if (!label) return;

    const text = `[kheopskit] observable ${label} emit`;

    if (printOutput) console.debug(text, { value });
    else console.debug(text);
  });
