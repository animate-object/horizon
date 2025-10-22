import { Storage } from "./storage";

export interface SessionConfiguration {
  taskDescription: string;
  durationMinutes: number;
  startedAt: string;
  allowedToolUrls: string[];
  mode?: "standard" | "free";
}
export type SessionState = "configure" | "active" | "complete";

export const computeSessionEndEpoch = (
  config: SessionConfiguration
): number => {
  const start = new Date(config.startedAt).getTime();
  const end = start + config.durationMinutes * 60 * 1000;
  return end;
};

export function getSessionMode(
  config: SessionConfiguration
): NonNullable<SessionConfiguration["mode"]> {
  return config?.mode || "standard";
}

export const computeSessionState = (
  config?: SessionConfiguration
): SessionState => {
  if (config == null) return "configure";
  const end = computeSessionEndEpoch(config);
  const now = Date.now();
  if (now < end) return "active";
  return "complete";
};

export const clearSessionState = () => {
  Storage.clear(Storage.keys.ActiveSessionConfig);
  console.info("Cleared");
};
