import { Observable } from "rxjs";
import { WithChange } from "./reutils/withChange";

export function debounceSyncWithChanges() {
  return <T>(source$: Observable<WithChange<T, any>>) =>
    new Observable<WithChange<T, any>>((subscriber) => {
      let timeout: any = undefined;
      let lastValue: T = undefined as any;
      let changes: Array<{
        change: "add" | "remove";
        key: any;
      }> = [];

      const tick = () => {
        timeout = undefined;
        const result = Object.assign(lastValue, { changes });
        lastValue = undefined as any;
        changes = [];
        subscriber.next(result);
      };

      const sub = source$.subscribe(
        (value) => {
          lastValue = value;
          changes = changes.concat(value.changes);

          if (timeout) return;
          timeout = setTimeout(tick);
        },
        (e) => subscriber.error(e),
        () => subscriber.complete()
      );

      return () => {
        clearTimeout(timeout);
        sub.unsubscribe();
      };
    });
}
