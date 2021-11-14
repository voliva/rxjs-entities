import { bind } from "@react-rxjs/core";
import { partitionByKey } from "@react-rxjs/utils-alpha";
import { map } from "rxjs";
import { elements$ } from "../../elements";
import { createSyncSkip } from "../../lib/syncSkip";

const { flatten, syncSkip } = createSyncSkip();
const [_, keys$] = partitionByKey(elements$.pipe(flatten()), (v) => v.key);

const [useKeysLength] = bind(
  keys$.pipe(
    syncSkip(),
    map((keys) => Array.from(keys).length)
  ),
  0
);

export const PartitionByKeyAlpha = () => {
  const count = useKeysLength();

  return <div>Count: {count}</div>;
};
