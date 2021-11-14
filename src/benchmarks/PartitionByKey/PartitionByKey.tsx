import { bind } from "@react-rxjs/core";
import { partitionByKey } from "@react-rxjs/utils";
import { map, tap } from "rxjs";
import { elements$ } from "../../elements";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [_, keys$] = partitionByKey(elements$.pipe(flatten()), (v) => v.key);

const [useKeysLength] = bind(
  keys$.pipe(
    syncSkip(),
    map((keys) => keys.length)
  ),
  0
);

export const PartitionByKey = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
