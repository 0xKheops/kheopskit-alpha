import { type MonoTypeOperatorFunction, tap } from "rxjs";

export const logObservable = <T>(
  label: string,
  printOutput = false,
): MonoTypeOperatorFunction<T> =>
  tap((data) => {
    if (!label) return;

    const text = `[kheopskit] observable ${label} emit`;

    if (printOutput) console.debug(text, { data });
    else console.debug(text);
  });
