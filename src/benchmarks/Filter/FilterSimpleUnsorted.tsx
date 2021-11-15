import { bind } from "@react-rxjs/core";
import { map, merge } from "rxjs";
import { createBumpBenchmark, elements$ } from "../../elements";
import { combineKeysWithChanges } from "../../lib/reutils/combineKeysWithChanges";
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
  combineKeysWithChanges(keys$, getElement$).pipe(
    map((map) => Array.from(map.values()).filter((v) => v.active).length),
    syncSkip()
  ),
  0
);

export const FilterSimpleUnsorted = () => {
  const count = useKeysLength();

  return (
    <div>
      Count: {count} {useBump()}
    </div>
  );
};
