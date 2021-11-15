import { bind } from "@react-rxjs/core";
import { map, merge, of, tap, withLatestFrom } from "rxjs";
import { createBumpBenchmark, elements$ } from "../../elements";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { sortEntities } from "../../lib/sortEntities";
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
  sortEntities(
    keys$,
    getElement$,
    of((a, b) => a.valueA - b.valueB)
  ).pipe(
    syncSkip(),
    withLatestFrom(elements$),
    tap(([sortedKeys, elements]) => {
      const sortedElements = [...elements].sort(
        (e1, e2) => e1.valueA - e2.valueB
      );
      console.log(
        sortedKeys,
        sortedElements.map((el) => el.key)
      );
    }),
    map(([keys]) => keys.length)
  ),
  0
);

export const Sort = () => {
  const count = useKeysLength();

  return (
    <div>
      Count: {count} {useBump()}
    </div>
  );
};
