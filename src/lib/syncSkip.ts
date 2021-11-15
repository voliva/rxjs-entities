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
} from "rxjs";

interface SyncSkipFunction {
  <T>(): MonoTypeOperatorFunction<T>;
  <T>(accumulator: (acc: T, value: T) => T): MonoTypeOperatorFunction<T>;
  <T, A>(
    accumulator: (acc: A, value: T) => T,
    initialValue: () => A
  ): OperatorFunction<T, A>;
}

export function createSyncSkip(): {
  flatten: <V>() => OperatorFunction<Iterable<V>, V>;
  syncSkip: SyncSkipFunction;
} {
  let emitting = new BehaviorSubject(false);

  function flatten<V>(): OperatorFunction<Iterable<V>, V> {
    return pipe(
      mergeMap((value) => {
        emitting.next(true);
        return from(value).pipe(
          finalize(() => {
            emitting.next(false);
          })
        );
      })
    );
  }
  function syncSkip<T, A>(
    accumulator: (acc: A, value: T) => A = (_, v) => v as any,
    initialValue: (() => A) | undefined = undefined
  ): OperatorFunction<T, T | A> {
    return (source) =>
      combineLatest({
        emitting,
        source,
      }).pipe(
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
