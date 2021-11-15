import { bind } from "@react-rxjs/core";
import { map, merge, of, scan } from "rxjs";
import { createBumpBenchmark, elements$ } from "../../elements";
import { filterEntitiesUnsorted } from "../../lib/filterEntitiesUnsorted";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkipBenchmark";

const { useBump, bumpElement$ } = createBumpBenchmark(() => ({
  active: true,
}));

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  merge(elements$.pipe(flatten()), bumpElement$),
  (v) => v.key
);

const [useKeysLength] = bind(
  filterEntitiesUnsorted(
    keys$,
    getElement$,
    of((value) => value.active)
  ).pipe(
    syncSkip((acc, v) => {
      v.changes.forEach((change) => {
        acc.changes.push(change);
      });
      v.changes = acc.changes;
      return v;
    }),
    map((keys) => Array.from(keys).length)
  ),
  0
);

export const FilterUnsorted = () => {
  const count = useKeysLength();

  return (
    <div>
      Count: {count} {useBump()}
    </div>
  );
};
