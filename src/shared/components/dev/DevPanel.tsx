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
  const [collapsed, setCollapsed] = useState(true);
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
        width: collapsed ? undefined : "26rem",
        padding: collapsed ? "2px" : undefined,
      }}
    >
      {!collapsed && <DevPanel onHide={handleHide} />}
      {collapsed && (
        <Button
          onClick={() => setCollapsed(false)}
          color="secondary"
          ghost
          noPad
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
            />
          </svg>
        </Button>
      )}
    </Paper>
  );
}
