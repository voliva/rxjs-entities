import { bind } from "@react-rxjs/core";
import { map, merge, of } from "rxjs";
import { createBumpBenchmark, elements$ } from "../../elements";
import { filterEntities } from "../../lib/filterEntities";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkip";

const { useBump, bumpElement$ } = createBumpBenchmark(() => ({
  active: true,
}));

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  merge(elements$.pipe(flatten()), bumpElement$),
  (v) => v.key
);

const [useKeysLength] = bind(
  filterEntities(
    keys$,
    getElement$,
    of((value) => value.active)
  ).pipe(
    syncSkip(),
    map((keys) => keys.length)
  ),
  0
);

export const FilterSorted = () => {
  const count = useKeysLength();

  return (
    <div>
      Count: {count} {useBump()}
    </div>
  );
};
