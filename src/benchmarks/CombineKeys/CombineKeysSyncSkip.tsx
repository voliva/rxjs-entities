import { bind } from "@react-rxjs/core";
import { combineKeys, partitionByKey } from "@react-rxjs/utils-alpha";
import { map } from "rxjs";
import { elements$ } from "../../elements";
import { createSyncSkip } from "../../lib/syncSkip";

/**
It's probably a good idea to move syncSkip to `keys$` in this case.
 */
const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKey(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  combineKeys(keys$.pipe(syncSkip()), getElement$).pipe(
    map((keys) => keys.size)
  ),
  0
);

export const CombineKeysSyncSkip = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
