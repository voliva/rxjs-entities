import { bind } from "@react-rxjs/core";
import { map, of, scan } from "rxjs";
import { elements$ } from "../../elements";
import { filterEntitiesUnsorted } from "../../lib/filterEntitiesUnsorted";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  filterEntitiesUnsorted(
    keys$,
    getElement$,
    of((value) => value.active)
  ).pipe(
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

export const FilterUnsorted = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
