import { PartitionByKey } from "./PartitionByKey";
import { PartitionByKeyAlpha } from "./PartitionByKeyAlpha";
import { PartitionByKeyWithChanges } from "./PartitionByKeyWithChanges";
import { BenchmarkType } from "../benchmarkType";

const benchmarks: BenchmarkType[] = [
  {
    name: "PartitionByKey",
    element: <PartitionByKey />,
    warnLimit: 5_000,
    forbidLimit: 10_000,
  },
  {
    name: "PartitionByKeyAlpha",
    element: <PartitionByKeyAlpha />,
    warnLimit: 400_000,
    forbidLimit: 1_500_000,
  },
  {
    name: "PartitionByKeyWithChanges",
    element: <PartitionByKeyWithChanges />,
    warnLimit: 400_000,
    forbidLimit: 1_500_000,
  },
];
export default benchmarks;
