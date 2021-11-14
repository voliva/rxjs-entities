import { bind } from "@react-rxjs/core";
import { combineKeys } from "@react-rxjs/utils-alpha";
import { map } from "rxjs";
import { elements$ } from "../../elements";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  combineKeys(keys$.pipe(syncSkip()), getElement$).pipe(
    map((map) => Array.from(map.values()).filter((v) => v.active).length)
  ),
  0
);

export const FilterSimpleUnsorted = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
