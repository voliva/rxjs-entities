import { bind } from "@react-rxjs/core";
import { combineKeys } from "@react-rxjs/utils-alpha";
import { map } from "rxjs";
import { elements$ } from "../../elements";
import { partitionByKeyWithChanges } from "../../lib/reutils/partitionByKeyWithChanges";
import { createSyncSkip } from "../../lib/syncSkip";

/**
With custom partitionByKeyWithChanges is faster because of change in getGroupedObservable
marked by "CHANGED - this was critical" (it unsubscribes from stream when inner stream is found)
-> On every new key, the observer had to go through every existing inner observable to notify them, and it was later ignored
    on big numbers, this had O(n^2) behaviour when initialising without syncSkip, O(n) behaviour for each new key.

Interestingly though, it has a greater effect on unsubscription. partitionByKeyWithChanges is incomplete, I'm not sure
how to do the "on source complete/error" branch without being subscribed on it.

This can be tested by changing the count after running the benchmark:
-> "CombineKeys with SyncSkip" hangs.
-> "CombineKeys with PartitionByKeyWithChanges" takes a second to unsubscribe.
 */
const { flatten, syncSkip } = createSyncSkip();
const [getElement$, keys$] = partitionByKeyWithChanges(
  elements$.pipe(flatten()),
  (v) => v.key
);

const [useKeysLength] = bind(
  combineKeys(keys$.pipe(syncSkip()), getElement$).pipe(
    map((keys) => keys.size)
  ),
  0
);

export const CombineKeysCustomPBK = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
