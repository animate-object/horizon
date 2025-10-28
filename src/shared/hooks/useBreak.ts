import { useEffect, useMemo } from "react";
import { Break, setNextBreakIfNeeded } from "../lib/breaks";
import { StorageKeys } from "../lib/storage";
import { useSession } from "./useSession";
import { useStorageSlice } from "./useStorageSlice";
import { computeSessionState, SessionMode } from "../lib/session";
import { useCountdown, UseCountdownReturn } from "./useCountdown";
import { isoDateToEpoch } from "../lib/time";

type UseBreakReturn = Record<SessionMode, UseCountdownReturn>;

export function useBreak(): UseBreakReturn {
  const { data: breakData } = useStorageSlice<Break>(StorageKeys.Break);
  const { session } = useSession();
  const sessionState = useMemo(() => computeSessionState(session), [session]);
  useEffect(() => {
    if (sessionState != "active") {
      setNextBreakIfNeeded();
    }
  }, [sessionState]);

  const breakEnd: Record<SessionMode, number> | undefined = useMemo(() => {
    console.log("Recomputing break end");
    if (breakData) {
      const { free: freeMinutes, standard: standardMinutes } =
        breakData.durationMinutes;

      const free = isoDateToEpoch(breakData.startedAt) + freeMinutes * 60 * 100;
      const standard =
        isoDateToEpoch(breakData.startedAt) + standardMinutes * 60 * 100;
      return { free, standard };
    }
  }, [
    breakData?.startedAt,
    breakData?.durationMinutes.free,
    breakData?.durationMinutes.standard,
  ]);

  const freeStatus = useCountdown({
    countdownEnd: breakEnd?.free,
  });
  const standardStatus = useCountdown({ countdownEnd: breakEnd?.standard });

  return {
    free: freeStatus,
    standard: standardStatus,
  };
}
