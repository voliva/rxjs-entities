import { bind } from "@react-rxjs/core";
import { map, merge } from "rxjs";
import { createBumpBenchmark, elements$ } from "../../elements";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { valuesOfKeys$ } from "../../lib/reutils/valuesOfKeys$";
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
  valuesOfKeys$(keys$, getElement$).pipe(
    map((values) => values.filter((v) => v.active).length),
    syncSkip()
  ),
  0
);

export const FilterSimpleSorted = () => {
  const count = useKeysLength();

  return (
    <div>
      Count: {count} {useBump()}
    </div>
  );
};
