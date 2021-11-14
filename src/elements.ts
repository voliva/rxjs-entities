import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { delay, distinctUntilChanged, map, startWith } from "rxjs";

const [quantityChange$, changeQuantity] = createSignal<number>();

export const [useSelectedQuantity, selectedQuantity$] = bind(
  quantityChange$,
  1000
);

export { changeQuantity };
export const elements$ = selectedQuantity$.pipe(
  delay(500),
  distinctUntilChanged(),
  map((n) =>
    new Array(n).fill(0).map((_, i) => ({
      key: i,
      active: Math.random() > 0.2,
      valueA: Math.random(),
      valueB: Math.random(),
    }))
  ),
  shareLatest()
);
