import { BenchmarkType } from "../benchmarkType";
import { CombineKeys } from "./CombineKeys";
import { CombineKeysCustomPBK } from "./CombineKeysCustomPBK";
import { CombineKeysSyncSkip } from "./CombineKeysSyncSkip";
import { CombineKeysWithChanges } from "./CombineKeysWithChanges";
import { ValuesOfKeys } from "./ValuesOfKeys";

const benchmarks: BenchmarkType[] = [
  {
    name: "CombineKeys",
    element: <CombineKeys />,
    warnLimit: 3_000,
    forbidLimit: 6_000,
  },
  {
    name: "CombineKeys with SyncSkip",
    element: <CombineKeysSyncSkip />,
    warnLimit: 200_000,
    forbidLimit: 800_000,
  },
  {
    name: "CombineKeys with PartitionByKeyWithChanges",
    element: <CombineKeysCustomPBK />,
    warnLimit: 200_000,
    forbidLimit: 800_000,
  },
  {
    name: "CombineKeysWithChanges",
    element: <CombineKeysWithChanges />,
    warnLimit: 200_000,
    forbidLimit: 800_000,
  },
  {
    name: "ValuesOfKeys",
    element: <ValuesOfKeys />,
    warnLimit: 5_000,
    forbidLimit: 10_000,
  },
];
export default benchmarks;
