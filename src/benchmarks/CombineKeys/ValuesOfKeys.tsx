import { bind } from "@react-rxjs/core";
import { map, tap } from "rxjs";
import { elements$ } from "../../elements";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { valuesOfKeys$ } from "../../lib/reutils/valuesOfKeys$";
import { createSyncSkip } from "../../lib/syncSkipBenchmark";

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  valuesOfKeys$(keys$, getElement$).pipe(
    syncSkip(),
    map((keys) => Array.from(keys).length)
  ),
  0
);

export const ValuesOfKeys = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
