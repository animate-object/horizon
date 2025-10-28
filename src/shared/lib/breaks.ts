import { PastSession, PastSessionLoader } from "./datastore";
import { computeSessionEndEpoch, SessionMode } from "@/shared/lib/session";
import { epochToIso, isoDateToEpoch, minutesAgo } from "./time";
import { Storage, StorageKeys } from "./storage";

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
  }
  if (sessionsInLastHour > 10) {
    duration = 3;
  }
  if (sessionsInLastHour > 5) {
    duration = 2;
  }
  duration = 1;

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

  if (lastSession.durationMinutes > 60) {
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
    return undefined;
  }
  const lastSession = recentSessions[0];
  const endOfLastSessionEpoch = computeSessionEndEpoch(lastSession);

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

  if (duration.free === 0 && duration.standard === 0) {
    return undefined;
  }

  return {
    durationMinutes: duration,
    startedAt: epochToIso(endOfLastSessionEpoch),
  };
}

export async function setNextBreak() {
  const sessions = await new PastSessionLoader().recentSessions(50);

  const nextBreak = computeNextBreak(sessions);
  if (nextBreak == null) return;

  Storage.set(StorageKeys.Break, nextBreak);
}
