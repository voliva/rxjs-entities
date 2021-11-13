import { mergeWithKey } from "@react-rxjs/utils";
import { Observable, defer, scan, filter, map } from "rxjs";
import {
  combineKeysWithChanges,
  MapWithChanges,
} from "./reutils/combineKeysWithChanges";
import { WithChange } from "./reutils/withChange";

/**
 * Same, but doesn't keep original sorting.
 * Theoretically more performant, because it doesn't need to filter through the whole thing on every emission.
 */
export function filterEntitiesUnsorted<K, T>(
  keys$: Observable<WithChange<Iterable<K>, K>>,
  getObservable$: (key: K) => Observable<T>,
  testFn$: Observable<(value: T) => boolean>
) {
  return defer(() =>
    mergeWithKey({
      testFn$,
      mapWithChanges$: combineKeysWithChanges(keys$, getObservable$),
    }).pipe(
      scan(
        function feuScan(acc, change) {
          acc[change.type] = change.payload as any;
          acc.lastChange = change.type;
          return acc;
        },
        {
          testFn$: undefined as any as (value: T) => boolean,
          mapWithChanges$: undefined as any as MapWithChanges<K, T>,
          lastChange: undefined as any as "testFn$" | "mapWithChanges$",
        }
      ),
      filter(function feuFilter({ testFn$, mapWithChanges$ }) {
        return Boolean(testFn$) && Boolean(mapWithChanges$);
      }),
      scan(function feuScan2(keySet, acc) {
        const { testFn$, mapWithChanges$, lastChange } = acc;

        if (keySet === null) {
          const result = new Set<K>(
            Array.from(mapWithChanges$.keys()).filter((key) =>
              testFn$(mapWithChanges$.get(key)!)
            )
          );
          return Object.assign(result, {
            changes: Array.from(result).map((key) => ({
              change: "add" as const,
              key,
            })),
          });
        }

        if (lastChange === "mapWithChanges$") {
          const changes = Array.from(mapWithChanges$.changes);
          keySet.changes = [];
          changes.forEach(function feuChanges(key) {
            if (mapWithChanges$.has(key)) {
              if (testFn$(mapWithChanges$.get(key)!)) {
                if (!keySet.has(key)) {
                  keySet.changes.push({ change: "add", key });
                  keySet.add(key);
                }
              } else {
                if (keySet.has(key)) {
                  keySet.changes.push({ change: "remove", key });
                  keySet.delete(key);
                }
              }
            } else {
              keySet.changes.push({ change: "remove", key });
              keySet.delete(key);
            }
          });
          return keySet;
        } else {
          const result: WithChange<Set<K>, K> = Object.assign(new Set<K>(), {
            changes: [],
          });
          for (const [key, value] of mapWithChanges$) {
            const had = keySet.has(key);
            const has = testFn$(value);
            if (has) {
              result.add(key);
              if (!had) {
                result.changes.push({
                  change: "add",
                  key,
                });
              }
            } else if (had) {
              result.changes.push({
                change: "remove",
                key,
              });
            }
          }
          return result;
        }
      }, null as WithChange<Set<K>, K> | null),
      map((keySet) => keySet!)
    )
  );

  /*
  return combineKeys(keys$, (key) =>
    combineLatest([getObservable$(key), testFn$]).pipe(
      map(([value, testFn]) => testFn(value)),
      distinctUntilChanged()
    )
  ).pipe(
    scan((set, mapWithChanges) => {
      Array.from(mapWithChanges.changes).forEach((changedKey) => {
        if (mapWithChanges.has(changedKey)) {
          const testResult = mapWithChanges.get(changedKey)!;
          if (testResult) {
            set.add(changedKey);
          } else {
            set.delete(changedKey);
          }
        } else {
          set.delete(changedKey);
        }
      });
      return set;
    }, new Set<K>()),
    debounceTime(0)
  );
  */

  /*
  Seems like switchMap is evil: Every time subscriptions are remade it takes a nice penalty
  Doesn't seem anything else can improve in partitionByKey though

  return testFn$.pipe(
    switchMap((testFn) =>
      combineKeys(keys$, getObservable$).pipe(
        scan((set, mapWithChanges) => {
          Array.from(mapWithChanges.changes).forEach((changedKey) => {
            if (mapWithChanges.has(changedKey)) {
              const value = mapWithChanges.get(changedKey)!;
              if (testFn(value)) {
                set.add(changedKey);
              } else {
                set.delete(changedKey);
              }
            } else {
              set.delete(changedKey);
            }
          });
          return set;
        }, new Set<K>())
      )
    )
  );
  */
}

/**
Old
export function filterEntitiesUnsorted<K, T>(
  keys$: Observable<Iterable<K>>,
  getObservable$: (key: K) => Observable<T>,
  testFn$: Observable<(value: T) => boolean>
) {
  return defer(() =>
    mergeWithKey({
      testFn$,
      mapWithChanges$: combineKeys(keys$, getObservable$)
    }).pipe(
      scan(
        (acc, change) => {
          acc[change.type] = change.payload as any;
          acc.lastChange = change.type;
          return acc;
        },
        {
          testFn$: (undefined as any) as (value: T) => boolean,
          mapWithChanges$: (undefined as any) as MapWithChanges<K, T>,
          lastChange: (undefined as any) as "testFn$" | "mapWithChanges$"
        }
      ),
      filter(
        ({ testFn$, mapWithChanges$ }) =>
          Boolean(testFn$) && Boolean(mapWithChanges$)
      ),
      scan((keySet, acc) => {
        const { testFn$, mapWithChanges$, lastChange } = acc;

        if (keySet === null) {
          return new Set<K>(
            Array.from(mapWithChanges$.keys()).filter((key) =>
              testFn$(mapWithChanges$.get(key)!)
            )
          );
        }

        if (lastChange === "mapWithChanges$") {
          const changes = Array.from(mapWithChanges$.changes);
          changes.forEach((key) => {
            console.log("bump");
            if (mapWithChanges$.has(key)) {
              if (testFn$(mapWithChanges$.get(key)!)) {
                keySet.add(key);
              } else {
                keySet.delete(key);
              }
            } else {
              keySet.delete(key);
            }
          });
        } else {
          return new Set<K>(
            Array.from(mapWithChanges$.keys()).filter((key) =>
              testFn$(mapWithChanges$.get(key)!)
            )
          );
        }

        return keySet;
      }, null as Set<K> | null),
      map((keySet) => keySet!)
    )
  );
    }
 */
