import { useEffect } from "react";
import { Benchmark } from "./Benchmark";
import benchmarks from "./benchmarks";
import { changeQuantity, elements$, useSelectedQuantity } from "./elements";

function App() {
  const count = useSelectedQuantity();

  useEffect(() => {
    const sub = elements$.subscribe();
    return () => sub.unsubscribe();
  }, []);

  return (
    <div className="App">
      <label style={{ position: "sticky", top: 0, background: "white" }}>
        Count: {count}
        <input
          style={{ marginLeft: "1rem" }}
          type="number"
          step="1"
          defaultValue={count}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            !Number.isNaN(e.currentTarget.valueAsNumber) &&
            changeQuantity(
              Math.max(0, Math.min(2000000, e.currentTarget.valueAsNumber))
            )
          }
        />
      </label>
      <div key={count}>
        {Object.entries(benchmarks).map(([name, group]) => (
          <div key={name}>
            <h3>{name}</h3>
            {group.map(({ element, name, ...rest }) => (
              <Benchmark key={name} name={name} {...rest}>
                {element}
              </Benchmark>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
