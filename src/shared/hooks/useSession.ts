import { useEffect, useState } from "react";
import { Storage } from "../storage";
import { SessionConfiguration } from "../session";

interface UseSessionDataReturn {
  session: SessionConfiguration | undefined;
  lastChange: string;
}

export function useSession(): UseSessionDataReturn {
  const [sessionData, setSessionData] = useState<
    SessionConfiguration | undefined
  >();
  const [lastChange, setLastChange] = useState(new Date().toISOString());
  useEffect(() => {
    const listener: Parameters<
      typeof chrome.storage.onChanged.addListener
    >[0] = (changes, area) => {
      if (area !== "local") return;
      const activeSessionConfig =
        changes[Storage.keys.ActiveSessionConfig]?.newValue;

      if (activeSessionConfig) {
        setSessionData(activeSessionConfig);
      }
      setLastChange(lastChange);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    Storage.get(Storage.keys.ActiveSessionConfig, undefined).then((data) => {
      setSessionData(data);
    });
  });

  return { session: sessionData, lastChange };
}
