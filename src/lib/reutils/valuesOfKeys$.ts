import { Observable, Subscription } from "rxjs";
import { mapIterable } from "../iterableUtils";
import { WithChange } from "./withChange";

/**
 * This is like combineKeys, but keeps the original order of the keys.
 */
export function valuesOfKeys$<K, T>(
  keys$: Observable<WithChange<Iterable<K>, K>>,
  getObservable$: (key: K) => Observable<T>
) {
  return new Observable<Iterable<T>>((observer) => {
    let latestKeys: Iterable<K> = [];
    let activeKeys = new Map<
      K,
      {
        sub: Subscription;
        latestValue: T;
      }
    >();

    function emitChange() {
      observer.next(
        mapIterable(latestKeys, (key) => activeKeys.get(key)!.latestValue!)
      );
    }

    const keysSub = keys$.subscribe(function vokMainsub(keys) {
      latestKeys = keys;

      let initializing = true;

      keys.changes.forEach(({ change, key }) => {
        if (change === "add") {
          const keyV = {
            latestValue: undefined as any,
          };

          // Reserve the spot
          Object.assign(keyV, {
            sub: getObservable$(key).subscribe((value) => {
              keyV.latestValue = value;

              if (!initializing) {
                emitChange();
              }
            }),
          });
          activeKeys.set(key, keyV as any);
        } else {
          // Delete
          const keyV = activeKeys.get(key);
          if (keyV) {
            keyV.sub.unsubscribe();
            activeKeys.delete(key);
          }
        }
      });

      initializing = false;
      emitChange();
    });

    return () => {
      keysSub.unsubscribe();
      for (const keyV of activeKeys.values()) {
        keyV.sub.unsubscribe();
      }
      activeKeys.clear();
    };
  });
}
