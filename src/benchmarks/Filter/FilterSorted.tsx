import { bind } from "@react-rxjs/core";
import { map, of } from "rxjs";
import { elements$ } from "../../elements";
import { filterEntities } from "../../lib/filterEntities";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  filterEntities(
    keys$.pipe(
      syncSkip(),
      map((v) => Array.from(v))
    ),
    getElement$,
    of((value) => value.active)
  ).pipe(map((keys) => keys.length)),
  0
);

export const FilterSorted = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
