import { bind } from "@react-rxjs/core";
import { map, merge } from "rxjs";
import { createBumpBenchmark, elements$ } from "../../elements";
import { combineKeysWithChanges } from "../../lib/reutils/combineKeysWithChanges";
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
  combineKeysWithChanges(keys$, getElement$).pipe(
    map(
      (mapWithChanges) =>
        Array.from(mapWithChanges.entries()).sort(
          (a, b) => a[1].valueA - b[1].valueB
        ).length
    ),
    syncSkip()
  ),
  0
);

export const SortSimple = () => {
  const count = useKeysLength();

  return (
    <div>
      Count: {count} {useBump()}
    </div>
  );
};
