export class SortedKeyedArray<T, K> {
  private sortedArray: K[] = [];
  private keyToIndex = new Map<K, number>();

  constructor(private compareFn: (valueA: T, valueB: T) => number) {
    (window as any).keyToIndex = this.keyToIndex;
  }

  insertElements(keys: K[], valueOf: (key: K) => T) {
    const keysWithValue = keys.map<[K, T]>((key) => [key, valueOf(key)]);
    if (this.sortedArray.length === 0) {
      this.sortedArray = keysWithValue
        .sort(([, v1], [, v2]) => this.compareFn(v1, v2))
        .map(([key], i) => {
          this.keyToIndex.set(key, i);
          return key;
        });
    } else {
      const indices = keys
        .map((key) => this.keyToIndex.get(key)!)
        .filter((index) => index !== undefined);

      const copy = this.sortedArray.filter((_, i) => !indices.includes(i));

      let minIdx = indices.reduce(
        (min, v) => Math.min(min, v),
        Number.POSITIVE_INFINITY
      );
      keysWithValue.forEach((keyWithValue) => {
        const [key, value] = keyWithValue;

        const newPosition = binarySearchPosition(copy, (key) =>
          this.compareFn(valueOf(key), value)
        );
        minIdx = Math.min(minIdx, newPosition);
        copy.splice(newPosition, 0, key);
      });

      for (let i = minIdx; i < copy.length; i++) {
        this.keyToIndex.set(copy[i], i);
      }
      this.sortedArray = copy;
    }
  }

  removeElements(keys: K[]) {
    if (!keys.length) return;

    const indices = keys
      .map((key) => this.keyToIndex.get(key)!)
      .filter((index) => index !== undefined);

    this.sortedArray = this.sortedArray.filter((_, i) => !indices.includes(i));
    keys.forEach((key) => this.keyToIndex.delete(key));

    const minIdx = indices.reduce(
      (min, v) => Math.min(min, v),
      Number.POSITIVE_INFINITY
    );
    for (let i = minIdx; i < this.sortedArray.length; i++) {
      this.keyToIndex.set(this.sortedArray[i], i);
    }
  }

  toArray(): K[] {
    return this.sortedArray;
  }

  setCompareFn(
    compareFn: (valueA: T, valueB: T) => number,
    valueOf: (key: K) => T
  ) {
    console.log("setCompareFn"); // Slow
    this.compareFn = compareFn;

    this.sortedArray = this.sortedArray
      .map<[K, T]>((key) => [key, valueOf(key)])
      .sort(([, v1], [, v2]) => this.compareFn(v1, v2))
      .map(([key], i) => {
        this.keyToIndex.set(key, i);
        return key;
      });
  }
}

function binarySearchPosition<T>(array: T[], compareFn: (value: T) => number) {
  let low = 0,
    high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    const comparison = compareFn(array[mid]);
    if (comparison === 0) return mid;
    if (comparison < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
Old


class SortedKeyedArray<T, K> {
  private sortedArray: K[] = [];
  private keyToIndex = new Map<K, number>();

  constructor(private compareFn: (valueA: T, valueB: T) => number) {}

  insertElements(keys: K[], valueOf: (key: K) => T) {
    // console.log("insert", keys.length);
    const keysWithValue = keys.map<[K, T]>((key) => [key, valueOf(key)]);
    if (this.sortedArray.length === 0) {
      this.sortedArray = keysWithValue
        .sort(([, v1], [, v2]) => this.compareFn(v1, v2))
        .map(([key], i) => {
          this.keyToIndex.set(key, i);
          return key;
        });
    } else {
      const indices = keys
        .map((key) => this.keyToIndex.get(key)!)
        .filter((index) => index !== undefined);

      const copy = this.sortedArray.filter((_, i) => !indices.includes(i));

      keysWithValue.forEach((keyWithValule) => {
        const [key, value] = keyWithValule;

        const newPosition = binarySearchPosition(this.sortedArray, (key) =>
          this.compareFn(valueOf(key), value)
        );
        copy.splice(newPosition, 0, key);
      });

      const minIdx = indices.reduce(
        (min, v) => Math.min(min, v),
        Number.POSITIVE_INFINITY
      );
      for (let i = minIdx; i < copy.length; i++) {
        this.keyToIndex.set(copy[i], i);
      }
      this.sortedArray = copy;
    }
  }

  removeElements(keys: K[]) {
    // console.log("remove", keys.length); // Slow
    logTime("removeElements");

    const indices = keys
      .map((key) => this.keyToIndex.get(key)!)
      .filter((index) => index !== undefined);

    logTime("removeElements 1");

    this.sortedArray = this.sortedArray.filter((_, i) => !indices.includes(i));

    logTime("removeElements 2");

    this.keyToIndex.clear();
    this.sortedArray.forEach((key, i) => {
      this.keyToIndex.set(key, i);
    });

    logTime("removeElements 3");
  }

  toArray(): K[] {
    return this.sortedArray;
  }

  setCompareFn(
    compareFn: (valueA: T, valueB: T) => number,
    valueOf: (key: K) => T
  ) {
    this.compareFn = compareFn;

    this.sortedArray = this.sortedArray
      .map<[K, T]>((key) => [key, valueOf(key)])
      .sort(([, v1], [, v2]) => this.compareFn(v1, v2))
      .map(([key]) => key);
  }
}
 */
