import { Observable, Subscription } from "rxjs";

/**
 * This is like combineKeys, but keeps the original order of the keys.
 */
export function valuesOfKeys$<K, T>(
  keys$: Observable<K[]>,
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
      latestValues.length = keys.length;

      let newKeys = new Map<
        K,
        {
          sub: Subscription;
          index: number;
          latestValue: T;
        }
      >();
      let initializing = true;
      keys.forEach(function vokEachKey(key, index) {
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
      });
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

/**
Old

export function valuesOfKeys$<K, T>(
  keys$: Observable<K[]>,
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

    const keysSub = keys$.subscribe((keys) => {
      latestValues.length = keys.length;

      let newKeys = new Map<
        K,
        {
          sub: Subscription;
          index: number;
          latestValue: T;
        }
      >();
      let initializing = true;
      keys.forEach((key, index) => {
        if (activeKeys.has(key)) {
          const keyV = activeKeys.get(key)!;
          keyV.index = index;
          latestValues[index] = keyV.latestValue;
          activeKeys.delete(key);
          newKeys.set(key, keyV);
        } else {
          const keyV = {
            index,
            latestValue: undefined as any
          };
          Object.assign(keyV, {
            sub: getObservable$(key).subscribe((value) => {
              keyV.latestValue = value;
              latestValues[keyV.index] = value;

              if (!initializing) {
                observer.next(latestValues);
              }
            })
          });
          newKeys.set(key, keyV as any);
        }
      });
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

 */
