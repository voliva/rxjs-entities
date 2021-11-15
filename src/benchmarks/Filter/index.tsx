import { FilterSorted } from "./FilterSorted";
import { FilterUnsorted } from "./FilterUnsorted";
import { FilterSimpleSorted } from "./FilterSimpleSorted";
import { FilterSimpleUnsorted } from "./FilterSimpleUnsorted";
import { BenchmarkType } from "../benchmarkType";

const benchmarks: BenchmarkType[] = [
  {
    name: "FilterUnsorted",
    element: <FilterUnsorted />,
    warnLimit: 200_000,
    forbidLimit: 700_000,
  },
  {
    name: "FilterSimpleUnsorted",
    element: <FilterSimpleUnsorted />,
    warnLimit: 15_000,
    forbidLimit: 35_000,
  },
  {
    name: "FilterSorted",
    element: <FilterSorted />,
    warnLimit: 5_000,
    forbidLimit: 10_000,
  },
  {
    name: "FilterSimpleSorted",
    element: <FilterSimpleSorted />,
    warnLimit: 5_000,
    forbidLimit: 10_000,
  },
];
export default benchmarks;
