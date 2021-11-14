import { FC, useEffect, useRef, useState } from "react";
import { useSelectedQuantity } from "./elements";

export const Benchmark: FC<{
  name: string;
  warnLimit?: number;
  forbidLimit?: number;
}> = ({ name, children, warnLimit, forbidLimit }) => {
  const count = useSelectedQuantity();
  const startTime = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const [testResult, setTestResult] = useState(0);

  useEffect(() => {
    if (isActive) {
      setTestResult(Date.now() - startTime.current);
    }
  }, [isActive]);

  if (!isActive) {
    return (
      <div
        style={{
          border: "1px solid black",
          borderRadius: 5,
          margin: "0.5rem 0",
          padding: "0.5rem",
        }}
      >
        <button
          onClick={() => {
            startTime.current = Date.now();
            setIsActive(true);
          }}
          disabled={forbidLimit ? count > forbidLimit : false}
        >
          {name}
        </button>
        <div>
          {warnLimit && (
            <div
              style={{ color: warnLimit < count ? "darkorange" : undefined }}
            >
              Warn: {warnLimit.toLocaleString()}
            </div>
          )}
          {forbidLimit && (
            <div style={{ color: forbidLimit < count ? "darkred" : undefined }}>
              Forbid: {forbidLimit.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid black",
        borderRadius: 5,
        margin: "0.5rem 0",
        padding: "0.5rem",
      }}
    >
      <div>{name}</div>
      <div>
        {warnLimit && (
          <div style={{ color: warnLimit < count ? "darkorange" : undefined }}>
            Warn: {warnLimit.toLocaleString()}
          </div>
        )}
        {forbidLimit && (
          <div style={{ color: forbidLimit < count ? "darkred" : undefined }}>
            Forbid: {forbidLimit.toLocaleString()}
          </div>
        )}
      </div>
      <div>Result: {testResult}</div>
      {children}
    </div>
  );
};
