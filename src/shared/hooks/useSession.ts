import { StorageKeys } from "@/shared/lib/storage";
import { SessionConfiguration } from "@/shared/lib/session";
import { useStorageSlice } from "./useStorageSlice";

interface UseSessionDataReturn {
  session: SessionConfiguration | undefined;
  lastChange: string;
}

export function useSession(): UseSessionDataReturn {
  const { data: sessionData, lastChange } =
    useStorageSlice<SessionConfiguration>(StorageKeys.ActiveSessionConfig);

  return { session: sessionData, lastChange };
}
