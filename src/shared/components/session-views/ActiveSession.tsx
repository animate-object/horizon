import { computeSessionEndEpoch, SessionConfiguration } from "@/shared/session";
import { Storage } from "@/shared/storage";
import { useEffect, useMemo, useState } from "react";
import Text from "../design/Text";
import { SessionDetails } from "./SessionDetails";
import { SessionActions } from "./SessionActions";
import { useIsBrowserTabActive } from "@/shared/hooks/useTabActive";

function leftPadZeros(value: number | string, length: number): string {
  return String(value).padStart(length, "0");
}

function TimeRemainingClock({
  timeRemainingSeconds,
}: {
  timeRemainingSeconds: number;
}) {
  return (
    <code className="text-green-950 py-1 px-4 bg-green-100">
      {Math.floor(timeRemainingSeconds / 60)}:
      {leftPadZeros((timeRemainingSeconds % 60).toFixed(0), 2)}
    </code>
  );
}

export function ActiveSession() {
  const [now, setNow] = useState<number>(Date.now());
  const { lastTabActiveTime, isTabVisible } = useIsBrowserTabActive();
  const [sessionData, setSessionData] = useState<
    SessionConfiguration | undefined
  >();
  const sessionEnd = useMemo(
    () => (sessionData ? computeSessionEndEpoch(sessionData) : undefined),
    [sessionData]
  );

  useEffect(() => {
    if (isTabVisible) {
      console.log("activessession: checking session state");
      Storage.get<SessionConfiguration | undefined>(
        Storage.keys.ActiveSessionConfig,
        undefined
      ).then((data) => {
        console.log("acctivesession: data", data);
        if (data) setSessionData(data);
        else window.location.reload();
      });
    }
  }, [lastTabActiveTime, isTabVisible]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const timeRemainingSeconds: "loading" | "complete" | number = useMemo(() => {
    if (sessionEnd == null) return "loading";
    const remainingMs = sessionEnd - now;
    if (remainingMs < 0) return "complete";

    return remainingMs / 1000;
  }, [now, sessionEnd]);

  useEffect(() => {
    if (timeRemainingSeconds === "complete") {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [timeRemainingSeconds]);

  if (timeRemainingSeconds === "loading") return "Loading";
  if (timeRemainingSeconds === "complete")
    return <Text.Header>"Complete"</Text.Header>;
  return (
    <div className="flex flex-col gap-4">
      {sessionData && <SessionDetails {...sessionData} />}

      <div className="flex justify-between">
        <div>
          <SessionActions session={sessionData} />
        </div>
        <Text.SubHeader>
          Time remaining&nbsp;
          <TimeRemainingClock timeRemainingSeconds={timeRemainingSeconds} />
        </Text.SubHeader>
      </div>
    </div>
  );
}
