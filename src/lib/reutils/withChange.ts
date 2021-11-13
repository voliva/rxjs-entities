export type Change<K> = {
  change: "add" | "remove";
  key: K;
};

export type WithChange<T, K> = T & {
  changes: Array<{
    change: "add" | "remove";
    key: K;
  }>;
};
