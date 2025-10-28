import { PastSession, PastSessionLoader } from "./datastore";
import { computeSessionEndEpoch, SessionMode } from "@/shared/lib/session";
import { epochToIso, isoDateToEpoch, minutesAgo } from "./time";
import { Storage, StorageKeys } from "./storage";
import { isEqual } from "lodash";
import { prefixLogger } from "./log";

const logger = prefixLogger("breaks:");

type BreakDuration = Record<SessionMode, number>;

export interface Break {
  startedAt: string;
  durationMinutes: BreakDuration;
}

function countSessionsInLastHour(recentSessions: PastSession[]): number {
  const hourMark = minutesAgo(60);

  const matches = recentSessions.filter(
    (session) => isoDateToEpoch(session.startedAt) > hourMark
  );

  return matches?.length ?? 0;
}

function recentSessionCountPenalty(
  recentSessions: PastSession[]
): BreakDuration {
  const sessionsInLastHour = countSessionsInLastHour(recentSessions);
  let duration: number;
  if (sessionsInLastHour < 1) {
    duration = 0;
  } else if (sessionsInLastHour > 10) {
    duration = 3;
  } else if (sessionsInLastHour > 5) {
    duration = 2;
  } else {
    duration = 1;
  }

  return {
    free: duration,
    standard: duration,
  };
}

function lastSessionLengthPenalty(
  recentSessions: PastSession[]
): BreakDuration {
  if (recentSessions.length < 1) {
    return { free: 0, standard: 0 };
  }

  const lastSession = recentSessions[0];

  if (lastSession.durationMinutes >= 60) {
    return { free: 2, standard: 2 };
  } else {
    return { free: 0, standard: 0 };
  }
}

function lastSessionWasFreeBrowsingPenalty(
  recentSessions: PastSession[]
): BreakDuration {
  const lastSessionWasFree =
    recentSessions.length > 0 ? recentSessions[0].mode === "free" : false;

  if (lastSessionWasFree) {
    return {
      free: 5,
      standard: 0,
    };
  }

  return { free: 0, standard: 0 };
}

export function computeNextBreak(
  recentSessions: PastSession[]
): Break | undefined {
  if (recentSessions.length < 1) {
    logger.info("No previous session");
    return undefined;
  }
  const lastSession = recentSessions[0];
  logger.info("Last session", lastSession);

  let endOflastSessionISO;
  if (lastSession.endedEarlyAt) {
    endOflastSessionISO = lastSession.endedEarlyAt;
  } else {
    endOflastSessionISO = epochToIso(computeSessionEndEpoch(lastSession));
  }
  logger.info(
    `End of last session: ${new Date(endOflastSessionISO).toLocaleTimeString()}`
  );

  const baseDuration: BreakDuration = { free: 0, standard: 0 };

  const duration = [
    recentSessionCountPenalty,
    lastSessionLengthPenalty,
    lastSessionWasFreeBrowsingPenalty,
  ].reduce((duration, nextFn) => {
    const penalty = nextFn(recentSessions);
    return {
      free: duration.free + penalty.free,
      standard: duration.standard + penalty.standard,
    };
  }, baseDuration);

  logger.info("Computed break duration", duration);

  if (duration.free === 0 && duration.standard === 0) {
    logger.info("No break needed, duration 0");
    return undefined;
  }

  const break_ = {
    durationMinutes: duration,
    startedAt: endOflastSessionISO,
  };

  logger.info(
    `Computed standard=${duration.standard}m free=${
      duration.free
    } break starting at ${new Date(
      endOflastSessionISO
    ).toLocaleTimeString()} - current time is ${new Date().toLocaleTimeString()}`
  );

  return break_;
}

export async function setNextBreakIfNeeded() {
  const sessions = await new PastSessionLoader().recentSessions(50);

  const nextBreak = computeNextBreak(sessions);

  if (nextBreak == null) return;
  const currentBreak = await Storage.get<Break>(StorageKeys.Break);
  if (currentBreak == null) {
    Storage.set(StorageKeys.Break, nextBreak);
  } else if (!isEqual(currentBreak, nextBreak)) {
    Storage.set(StorageKeys.Break, nextBreak);
  }
}
