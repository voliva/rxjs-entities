import { Sort } from "./Sort";
import { SortSimple } from "./SortSimple";
import { BenchmarkType } from "../benchmarkType";

const benchmarks: BenchmarkType[] = [
  {
    name: "Sort",
    element: <Sort />,
    warnLimit: 40_000,
    forbidLimit: 70_000,
  },
  {
    name: "SortSimple",
    element: <SortSimple />,
    warnLimit: 4_000,
    forbidLimit: 8_000,
  },
];
export default benchmarks;
