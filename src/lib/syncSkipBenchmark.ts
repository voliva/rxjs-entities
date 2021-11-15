import {
  BehaviorSubject,
  combineLatest,
  filter,
  finalize,
  from,
  map,
  mergeMap,
  MonoTypeOperatorFunction,
  OperatorFunction,
  pipe,
  scan,
  tap,
} from "rxjs";

export function createSyncSkip(): {
  flatten: <V>() => OperatorFunction<Iterable<V>, V>;
  syncSkip: <T>() => MonoTypeOperatorFunction<T>;
};
export function createSyncSkip<T>(accumulator: (acc: T, value: T) => T): {
  flatten: <V>() => OperatorFunction<Iterable<V>, V>;
  syncSkip: () => MonoTypeOperatorFunction<T>;
};
export function createSyncSkip<T, A>(
  accumulator: (acc: A, value: T) => A,
  initialValue: () => A
): {
  flatten: <V>() => OperatorFunction<Iterable<V>, V>;
  syncSkip: () => OperatorFunction<T, A>;
};
export function createSyncSkip<T, A>(
  accumulator: (acc: A, value: T) => A = (_, v) => v as any,
  initialValue: (() => A) | undefined = undefined
) {
  let emitting = new BehaviorSubject(false);
  let performanceValues: {
    durations: Array<{ i: number; t: number }>;
    lastTimestamp: number | null;
    index: number;
  } | null = null;

  function flatten<V>(): OperatorFunction<Iterable<V>, V> {
    return pipe(
      mergeMap((value) => {
        emitting.next(true);
        performanceValues = {
          durations: new Array(),
          lastTimestamp: 0,
          index: 0,
        };
        return from(value).pipe(
          tap(() => {
            performanceValues!.lastTimestamp = performance.now();
            performanceValues!.index++;
          }),
          finalize(() => {
            emitting.next(false);
            logResults(performanceValues!.durations);
            performanceValues = null;
          })
        );
      })
    );
  }
  function syncSkip(): OperatorFunction<T, T | A> {
    return (source) =>
      combineLatest({
        emitting,
        source,
      }).pipe(
        tap(({ emitting }) => {
          if (performanceValues?.lastTimestamp) {
            if (emitting) {
              if (
                performanceValues.index >=
                //Math.pow(1.61, performanceValues.durations.length)
                Math.pow(performanceValues.durations.length + 1, 4)
              ) {
                performanceValues.durations.push({
                  i: performanceValues.index,
                  t: Math.round(
                    (performance.now() - performanceValues.lastTimestamp) * 1000
                  ),
                });
                performanceValues.lastTimestamp = null;
              }
            } else {
              performanceValues!.durations.push({
                i: performanceValues!.index,
                t: Math.round(
                  (performance.now() - performanceValues.lastTimestamp) * 1000
                ),
              });
            }
          }
        }),
        scan((innerAcc, { emitting, source }) => {
          const acc = innerAcc?.acc ?? EMPTY;
          const prevEmitting = innerAcc?.prevEmitting ?? true;

          if (!emitting) {
            if (acc !== EMPTY) {
              // We have just gone "emitting -> !emitting", send in the acc value.
              return {
                acc: EMPTY,
                value: acc,
                prevEmitting: emitting,
              };
            }
            if (initialValue) {
              // We got a new value and we're not emitting: We need to call the accumulator with the initial value
              return {
                acc: EMPTY,
                value: accumulator(initialValue(), source),
                prevEmitting: emitting,
              };
            }
            // Without an initial value, we just return the value itself.
            return {
              acc: EMPTY,
              value: source,
              prevEmitting: emitting,
            };
          }

          if (prevEmitting === emitting) {
            // means source has changed
            if (acc === EMPTY) {
              if (initialValue) {
                return {
                  acc: accumulator(initialValue(), source),
                  value: EMPTY,
                  prevEmitting: emitting,
                };
              }
              return {
                acc: source as any,
                value: EMPTY,
                prevEmitting: emitting,
              };
            }
            return {
              acc: accumulator(acc, source),
              value: EMPTY,
              prevEmitting: emitting,
            };
          }

          return innerAcc;
        }, null as any as State<T, A>),
        filter(({ value }) => value !== EMPTY),
        map(({ value }) => value)
      );
  }

  return { flatten, syncSkip };
}

const EMPTY: any = {};
interface State<T, A> {
  prevEmitting: boolean;
  acc: A;
  value: T | A;
}

function logResults(durations: Array<{ i: number; t: number }>) {
  durations.forEach((d) => {
    const totalHashes = Math.round(d.t / 20);
    if (totalHashes === 0) return;
    const hashes = new Array(totalHashes).fill("#").join("");
    console.log(`${hashes} ${d.t} (index: ${d.i})`);
  });
}
