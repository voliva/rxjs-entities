import {
  Observable,
  combineLatest,
  map,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { filterIterable, mapIterable } from "./iterableUtils";
import { valuesOfKeys$ } from "./reutils/valuesOfKeys$";
import { WithChange } from "./reutils/withChange";

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
  keys$: Observable<WithChange<Iterable<K>, K>>,
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
    map((results) => {
      return results;
      const filtered = filterIterable(results, ([, test]) => test);
      return mapIterable(filtered, ([key]) => key);
    })
  );
}
