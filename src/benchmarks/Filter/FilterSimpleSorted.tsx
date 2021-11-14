import { bind } from "@react-rxjs/core";
import { map } from "rxjs";
import { elements$ } from "../../elements";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { valuesOfKeys$ } from "../../lib/reutils/valuesOfKeys$";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  valuesOfKeys$(
    keys$.pipe(
      syncSkip(),
      map((v) => Array.from(v))
    ),
    getElement$
  ).pipe(map((values) => values.filter((v) => v.active).length)),
  0
);

export const FilterSimpleSorted = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
