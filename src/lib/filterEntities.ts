import { Observable, combineLatest, map, distinctUntilChanged } from "rxjs";
import { valuesOfKeys$ } from "./reutils/valuesOfKeys$";

/*
keys$: Observable<string>
observable$: (key: string) => Observable<T>
testFn$: Observable<(value: T) => boolean>

Returns: Observable<string[]> (or Observable<T[]>, but you can get it with combineKeys?)
The list of elements filtered by the testFn

-> When keys$ change:
  The keys that disappeared are removed from the result
  The keys that entered are evaluated

-> When observable$ change:
  The testFn is ran against that specific observable, updating the result if needed.

-> When testFn$ changes:
  All the observables are evaluated for the new change.
*/
export function filterEntities<K, T>(
  keys$: Observable<K[]>,
  getObservable$: (key: K) => Observable<T>,
  testFn$: Observable<(value: T) => boolean>
) {
  return valuesOfKeys$(keys$, (key) =>
    combineLatest([getObservable$(key), testFn$]).pipe(
      map(([value, testFn]) => testFn(value)),
      distinctUntilChanged(),
      map((testResult) => [key, testResult] as const)
    )
  ).pipe(
    map((results) => results.filter(([, test]) => test).map(([key]) => key))
  );

  /*
  combineKeys don't keep the same order, I think this was wrong.
  return combineKeys(keys$, (key) =>
    combineLatest([getObservable$(key), testFn$]).pipe(
      map(([value, testFn]) => testFn(value)),
      distinctUntilChanged()
    )
  ).pipe(
    map((mapResult) =>
      Array.from(mapResult)
        .filter(([, test]) => test)
        .map(([key]) => key)
    )
  );
  */
}
