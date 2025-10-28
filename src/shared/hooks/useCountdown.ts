import { useEffect, useMemo, useState } from "react";

type TimeRemainingStatus = "init" | "complete" | "active";

interface UseCountdownReturn {
  status: TimeRemainingStatus;
  timeRemainingSeconds: number;
}

interface UseCountdownOpts {
  countdownEnd: number | undefined;
  countdownTickMs?: number;
  onComplete?: VoidFunction;
}

export function useCountdown({
  countdownEnd,
  countdownTickMs = 1000,
  onComplete,
}: UseCountdownOpts): UseCountdownReturn {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, countdownTickMs);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const { timeRemainingSeconds, status }: UseCountdownReturn = useMemo(() => {
    if (countdownEnd == undefined) {
      return { status: "init", timeRemainingSeconds: Number.POSITIVE_INFINITY };
    }
    const remainingMs = countdownEnd - now;
    const timeRemainingSeconds = remainingMs / 1000;
    if (timeRemainingSeconds < 0) {
      return { status: "complete", timeRemainingSeconds };
    }
    return { status: "active", timeRemainingSeconds };
  }, [now, countdownEnd]);

  useEffect(() => {
    if (status === "complete") {
      onComplete?.();
    }
  }, [status, onComplete]);

  return { timeRemainingSeconds, status };
}
