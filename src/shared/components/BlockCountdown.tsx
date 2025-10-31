import { useEffect, useState } from "react";
import { useCountdown } from "../hooks/useCountdown";
import { minutesToMs } from "../lib/time";
import { CountdownClock } from "./CoundownClock";

interface Props {
  minutes?: number;
}

export function BlockCountdown({ minutes = 0.5 }: Props) {
  const [countdownEnd, setCountdownEnd] = useState<number | undefined>();
  useEffect(() => {
    setCountdownEnd(Date.now() + minutesToMs(minutes));
  }, [minutes]);
  const { timeRemainingSeconds, status } = useCountdown({ countdownEnd });

  useEffect(() => {
    if (status === "complete") {
      const url = chrome.runtime.getURL(`src/pages/blocked.html`);
      window.location.href = url;
    }
  }, [status]);

  return (
    <div
      style={{
        zIndex: 1000000,
        position: "fixed",
        bottom: 10,
        left: 10,
        background: "white",
        border: "0.5px solid black",
        padding: "1rem",
        opacity: 0.8,
      }}
      className="shadow-md"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: "bolder",
          }}
        >
          Page will be blocked
        </div>{" "}
        {status == "active" ? (
          <CountdownClock timeRemainingSeconds={timeRemainingSeconds} />
        ) : (
          <div></div>
        )}
      </div>
      <div
        style={{
          fontSize: 18,
          marginBottom: "0.75rem",
        }}
      >
        <div>This page is not allowed and will be blocked soon.</div>
      </div>
    </div>
  );
}
