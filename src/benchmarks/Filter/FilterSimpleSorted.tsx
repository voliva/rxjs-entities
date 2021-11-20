import { bind } from "@react-rxjs/core";
import { map, scan, startWith, switchMap } from "rxjs";
import { createBumpBenchmark, elements$ } from "../../elements";

const { useBump, bumpElement$ } = createBumpBenchmark(() => ({
  active: true,
}));

const [useKeysLength] = bind(
  elements$.pipe(
    switchMap((initialValue) =>
      bumpElement$.pipe(
        scan((acc, v) => [...acc, v], initialValue),
        startWith(initialValue)
      )
    ),
    map((values) => values.filter((v) => v.active).length)
  ),
  0
);

export const FilterSimpleSorted = () => {
  const count = useKeysLength();

  return (
    <div>
      Count: {count} {useBump()}
    </div>
  );
};
