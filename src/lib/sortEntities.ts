import { mergeWithKey, MapWithChanges } from "@react-rxjs/utils";
import { Observable, defer, scan, filter, map } from "rxjs";
import { debounceSyncWithChanges } from "./debounceSyncWithChanges";
import { combineKeysWithChanges } from "./reutils/combineKeysWithChanges";
import { WithChange } from "./reutils/withChange";
import { SortedKeyedArray } from "./sortedKeyedArray";

export function sortEntities<K, T>(
  keys$: Observable<WithChange<Iterable<K>, K>>,
  getObservable$: (key: K) => Observable<T>,
  compareFn$: Observable<(valueA: T, valueB: T) => number>
) {
  return defer(() =>
    mergeWithKey({
      compareFn$,
      mapWithChanges$: combineKeysWithChanges(
        keys$.pipe(debounceSyncWithChanges()),
        getObservable$
      ),
    }).pipe(
      scan(
        (acc, change) => {
          acc[change.type] = change.payload as any;
          acc.lastChange = change.type;
          return acc;
        },
        {
          compareFn$: undefined as any as (valueA: T, valueB: T) => number,
          mapWithChanges$: undefined as any as MapWithChanges<K, T>,
          lastChange: undefined as any as "compareFn$" | "mapWithChanges$",
        }
      ),
      filter(
        ({ compareFn$, mapWithChanges$ }) =>
          Boolean(compareFn$) && Boolean(mapWithChanges$)
      ),
      scan((sortedKeys, acc) => {
        const { compareFn$, mapWithChanges$, lastChange } = acc;

        if (sortedKeys === null) {
          const result = new SortedKeyedArray<T, K>(compareFn$);
          result.insertElements(
            Array.from(mapWithChanges$.keys()),
            (key) => mapWithChanges$.get(key)!
          );
          return result;
        }

        if (lastChange === "mapWithChanges$") {
          const changes = Array.from(mapWithChanges$.changes);
          const updatedKeys: K[] = [];
          const removedKeys: K[] = [];
          changes.forEach((key) => {
            if (mapWithChanges$.has(key)) {
              updatedKeys.push(key);
            } else {
              removedKeys.push(key);
            }
          });

          sortedKeys.removeElements(removedKeys);
          sortedKeys.insertElements(
            updatedKeys,
            (key) => mapWithChanges$.get(key)!
          );
        } else {
          sortedKeys.setCompareFn(
            compareFn$,
            (key) => mapWithChanges$.get(key)!
          );
        }

        return sortedKeys;
      }, null as SortedKeyedArray<T, K> | null),
      map((sortedArray) => sortedArray!.toArray())
    )
  );
}
