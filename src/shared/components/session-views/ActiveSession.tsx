import {
  computeSessionEndEpoch,
  SessionConfiguration,
} from "@/shared/lib/session";
import { Storage } from "@/shared/lib/storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "@/shared/components/design/Text";
import { SessionDetails } from "@/shared/components/session-views/SessionDetails";
import { SessionActions } from "@/shared/components/session-views/SessionActions";
import { useIsBrowserTabActive } from "@/shared/hooks/useTabActive";
import { CountdownClock } from "../CoundownClock";
import { useCountdown } from "@/shared/hooks/useCountdown";

export function ActiveSession() {
  const { lastTabActiveTime, isTabVisible } = useIsBrowserTabActive();
  const [sessionData, setSessionData] = useState<
    SessionConfiguration | undefined
  >();
  const sessionEnd = useMemo(
    () => (sessionData ? computeSessionEndEpoch(sessionData) : undefined),
    [sessionData]
  );

  const handleComplete = useCallback(() => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, []);

  const { timeRemainingSeconds, status } = useCountdown({
    countdownEnd: sessionEnd,
    onComplete: handleComplete,
  });

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

  if (status === "init") return "Loading";
  if (status === "complete") return <Text.Header>Complete</Text.Header>;
  return (
    <div className="flex flex-col gap-4">
      {sessionData && <SessionDetails {...sessionData} />}

      <div className="flex justify-between">
        <div>
          <SessionActions session={sessionData} />
        </div>
        <Text.SubHeader>
          Time remaining&nbsp;
          <CountdownClock timeRemainingSeconds={timeRemainingSeconds} />
        </Text.SubHeader>
      </div>
    </div>
  );
}
