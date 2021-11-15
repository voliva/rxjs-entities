import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { useRef } from "react";
import { delay, distinctUntilChanged, map, tap } from "rxjs";

export interface Element {
  key: number;
  active: boolean;
  valueA: number;
  valueB: number;
}

const [quantityChange$, changeQuantity] = createSignal<number>();

export const [useSelectedQuantity, selectedQuantity$] = bind(
  quantityChange$,
  1000
);

export { changeQuantity };
let topWatermark = 0;
export const elements$ = selectedQuantity$.pipe(
  delay(500),
  distinctUntilChanged(),
  tap((v) => {
    topWatermark = v;
  }),
  map(
    (n): Array<Element> =>
      new Array(n).fill(0).map((_, i) => ({
        key: i,
        active: Math.random() > 0.2,
        valueA: Math.random(),
        valueB: Math.random(),
      }))
  ),
  shareLatest()
);

export function createBumpBenchmark(
  generateElement: () => Partial<Element> = () => ({})
) {
  const [bump$, bump] = createSignal();

  const useBump = () => {
    const bumpRef = useRef<number>();

    return (
      <button
        onClick={() => {
          bumpRef.current = performance.now();
          bump();
        }}
      >
        Bump{" "}
        {bumpRef.current !== undefined
          ? Math.floor((performance.now() - bumpRef.current) * 1000)
          : null}
      </button>
    );
  };

  return {
    useBump,
    bumpElement$: bump$.pipe(
      map(() => ({
        key: ++topWatermark,
        active: Math.random() > 0.2,
        valueA: Math.random(),
        valueB: Math.random(),
        ...generateElement(),
      }))
    ),
  };
}
