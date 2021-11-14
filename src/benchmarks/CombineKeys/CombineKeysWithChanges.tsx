import { bind } from "@react-rxjs/core";
import { map } from "rxjs";
import { elements$ } from "../../elements";
import { combineKeysWithChanges } from "../../lib/reutils/combineKeysWithChanges";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  combineKeysWithChanges(keys$, getElement$).pipe(
    syncSkip(),
    map((keys) => keys.size)
  ),
  0
);

export const CombineKeysWithChanges = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
