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
} from "rxjs";

// export function createSyncSkip(): {
//   flatten: <V>() => OperatorFunction<Iterable<V>, V>;
//   syncSkip: <T>() => MonoTypeOperatorFunction<T>;
// };
// export function createSyncSkip<T>(accumulator: (acc: T, value: T) => T): {
//   flatten: <V>() => OperatorFunction<Iterable<V>, V>;
//   syncSkip: () => MonoTypeOperatorFunction<T>;
// };
// export function createSyncSkip<T, A>(
//   accumulator: (acc: A, value: T) => A,
//   initialValue: A
// ): {
//   flatten: <V>() => OperatorFunction<Iterable<V>, V>;
//   syncSkip: () => MonoTypeOperatorFunction<T>;
// };
// export function createSyncSkip<T, A>(
//   accumulator: (acc: A, value: T) => A = (_, v) => v as any,
//   initialValue: A | undefined = undefined
// ) {

export function createSyncSkip() {
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
  function syncSkip<T>(): MonoTypeOperatorFunction<T> {
    return (source) =>
      combineLatest({
        emitting,
        source,
      }).pipe(
        filter(({ emitting }) => !emitting),
        map(({ source }) => source)
      );
  }

  return { flatten, syncSkip };
}
