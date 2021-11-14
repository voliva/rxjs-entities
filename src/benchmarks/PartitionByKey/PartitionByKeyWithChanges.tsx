import { bind } from "@react-rxjs/core";
import { map, scan } from "rxjs";
import { elements$ } from "../../elements";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [_, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  keys$.pipe(
    scan((acc, v) => {
      v.changes.forEach((change) => {
        acc.changes.push(change);
      });
      v.changes = acc.changes;
      return v;
    }),
    syncSkip(),
    map((keys) => Array.from(keys).length)
  ),
  0
);

export const PartitionByKeyWithChanges = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
