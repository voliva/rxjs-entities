import { bind } from "@react-rxjs/core";
import { partitionByKey, combineKeys } from "@react-rxjs/utils-alpha";
import { map } from "rxjs";
import { elements$ } from "../../elements";
import { createSyncSkip } from "../../lib/syncSkipBenchmark";

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKey(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  combineKeys(keys$, getElement$).pipe(
    syncSkip(),
    map((keys) => keys.size)
  ),
  0
);

export const CombineKeys = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
