export function mapIterable<T, R>(
  iterable: Iterable<T>,
  mapFn: (value: T) => R
): Iterable<R> {
  function* generator() {
    for (let value of iterable) {
      yield mapFn(value);
    }
  }
  return generator();
}

export function filterIterable<T>(
  iterable: Iterable<T>,
  filterFn: (value: T) => boolean
): Iterable<T> {
  function* generator() {
    let i = 0;
    for (let value of iterable) {
      if (filterFn(value)) {
        yield value;
      }
      i++;
    }
  }
  return generator();
}
