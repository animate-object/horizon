const isDev = () => {
  return !("update_url" in chrome.runtime.getManifest());
};

import { useSession } from "@/shared/hooks/useSession";
import { clearAllBlockingRules } from "@/shared/lib/rules";
import { clearSessionState, computeSessionEndEpoch } from "@/shared/session";
import { Storage } from "@/shared/storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import Paper from "../design/Paper";
import Text from "../design/Text";
import Button from "../design/Button";

function JsonView({ data }: { data: object }) {
  return (
    <div className="bg-indigo-950 overflow-scroll p-1">
      <code
        style={{
          color: "var(--color-base-100)",
        }}
      >
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </code>
    </div>
  );
}

function SessionData() {
  const [sessionData, setSessionData] = useState<object>({});

  useEffect(() => {
    Storage.get(Storage.keys.ActiveSessionConfig, {}).then((config) => {
      setSessionData(config);
    });
  }, []);

  useEffect(() => {
    const listener: Parameters<
      typeof chrome.storage.onChanged.addListener
    >[0] = (changes, area) => {
      if (area !== "local") return;
      const activeSessionConfig =
        changes[Storage.keys.ActiveSessionConfig]?.newValue;
      setSessionData(activeSessionConfig ?? {});
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return (
    <div>
      <Text.SectionHeader>Session data</Text.SectionHeader>
      <JsonView data={sessionData} />
    </div>
  );
}

function DevPanel({ onHide }: { onHide: VoidFunction }) {
  const clearSession = () => {
    clearSessionState();
    window.location.reload();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Text.SubHeader>Dev Panel</Text.SubHeader>
      <SessionData />

      <div className="flex flex-wrap justify-end gap-2">
        <Button soft color="secondary" onClick={clearSession}>
          Clear session
        </Button>
        <Button soft color="secondary" onClick={clearAllBlockingRules}>
          Clear rules
        </Button>
        <Button soft color="primary" onClick={onHide}>
          Hide for session
        </Button>
      </div>
    </div>
  );
}

export default function DevPanelWrapper() {
  const { session, lastChange } = useSession();
  const [hideUntil, setHideUntil] = useState<number | undefined>();
  useEffect(() => {
    Storage.get(Storage.keys.HideDevPanelUntil, undefined).then((hideUntil) => {
      if (hideUntil) {
        setHideUntil(parseInt(hideUntil));
      }
    });
  });

  const showDevPanel = useMemo(() => {
    const shouldHide = hideUntil != null && Date.now() < hideUntil;
    return isDev() && !shouldHide;
  }, [hideUntil, lastChange]);

  const handleHide = useCallback(() => {
    if (session == null) return;
    const sessionEndEpoch = computeSessionEndEpoch(session);
    Storage.set(Storage.keys.HideDevPanelUntil, sessionEndEpoch);
    setHideUntil(sessionEndEpoch);
  }, [setHideUntil, session]);

  if (!showDevPanel) return;

  return (
    <Paper
      style={{
        position: "absolute",
        bottom: "1rem",
        right: "1rem",
        width: "26rem",
      }}
    >
      <DevPanel onHide={handleHide} />
    </Paper>
  );
}
