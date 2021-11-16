import { Observable, Subscription } from "rxjs";
import { WithChange } from "./withChange";

/**
 * This is like combineKeys, but keeps the original order of the keys.
 */
export function valuesOfKeys$<K, T>(
  keys$: Observable<WithChange<Iterable<K>, K>>,
  getObservable$: (key: K) => Observable<T>
) {
  return new Observable<Array<T>>((observer) => {
    const latestValues: T[] = [];
    let activeKeys = new Map<
      K,
      {
        sub: Subscription;
        index: number;
        latestValue: T;
      }
    >();

    const keysSub = keys$.subscribe(function vokMainsub(keys) {
      if (
        keys.changes.some(
          ({ change, index }) => change === "add" && index === undefined
        )
      ) {
        // Too bad, we neeed a full scan :(
        throw new Error("not implemented");
      }

      let minIndex = Number.POSITIVE_INFINITY;
      keys.changes.forEach(({ change, key, index }) => {
        if (change === "add") {
          const keyV = {
            index: index!,
            latestValue: undefined as any,
          };

          // Reserve the spot
          Object.assign(keyV, {
            sub: getObservable$(key).subscribe((value) => {
              keyV.latestValue = value;
              latestValues[keyV.index] = value;

              if (!initializing) {
                observer.next(latestValues);
              }
            }),
          });
          newKeys.set(key, keyV as any);
          minIndex = Math.min(minIndex, index!);
        } else {
        }
      });

      let newKeys = new Map<
        K,
        {
          sub: Subscription;
          index: number;
          latestValue: T;
        }
      >();
      let initializing = true;

      let index = 0;
      for (const key of keys) {
        if (activeKeys.has(key)) {
          const keyV = activeKeys.get(key)!;
          keyV.index = index;
          latestValues[index] = keyV.latestValue;
          activeKeys.delete(key);
          newKeys.set(key, keyV);
        } else {
          const keyV = {
            index,
            latestValue: undefined as any,
          };
          Object.assign(keyV, {
            sub: getObservable$(key).subscribe((value) => {
              keyV.latestValue = value;
              latestValues[keyV.index] = value;

              if (!initializing) {
                observer.next(latestValues);
              }
            }),
          });
          newKeys.set(key, keyV as any);
        }
        index++;
      }
      latestValues.length = index;
      initializing = false;

      for (const keyV of activeKeys.values()) {
        keyV.sub.unsubscribe();
      }
      activeKeys.clear();

      activeKeys = newKeys;

      observer.next(latestValues);
    });

    return () => {
      keysSub.unsubscribe();
      for (const keyV of activeKeys.values()) {
        keyV.sub.unsubscribe();
      }
      activeKeys.clear();
      latestValues.length = 0;
    };
  });
}
