import { useSession } from "@/shared/hooks/useSession";
import { MessageBuilder } from "@/shared/messages";
import { clearSessionState } from "@/shared/session";
import { Storage } from "@/shared/storage";
import { useState } from "react";
import Button from "../design/Button";
import Text from "../design/Text";

export function SessionComplete() {
  const { session } = useSession();
  const [newSessionDurationMinutes, setNewSessionDurationMinutes] = useState<
    number | "not-selected"
  >(session?.durationMinutes ?? "not-selected");
  const startNewSessionWithSameTools = () => {
    Storage.set(Storage.keys.ActiveSessionConfig, {
      ...session,
      startedAt: new Date().toISOString(),
      durationMinutes: newSessionDurationMinutes,
    });
    chrome.runtime.sendMessage(MessageBuilder.sessionStarted());
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "fit-content",
      }}
    >
      <Text.Header>Session Complete</Text.Header>
      <Text.Body>This is a good time to take a break.</Text.Body>
      <br />
      <Text.Body>When your ready, you can start new session</Text.Body>
      <span>
        <Button
          onClick={() => {
            clearSessionState();
            window.location.reload();
          }}
        >
          New sesion
        </Button>
      </span>

      <Text.Body>Or . . .</Text.Body>

      <div className="join">
        <Button
          onClick={startNewSessionWithSameTools}
          disabled={newSessionDurationMinutes === "not-selected"}
        >
          New with same tools
        </Button>
        <select
          className="select"
          value={newSessionDurationMinutes}
          onChange={(evt) => {
            const value = evt.currentTarget.value;
            if (value === "not-selected") {
              setNewSessionDurationMinutes(value);
            }
            setNewSessionDurationMinutes(parseInt(value));
          }}
        >
          <option value="not-selected">--</option>
          <option value="1">1 minutes (testing)</option>
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
          <option value="120">120 minutes</option>
        </select>
      </div>
    </div>
  );
}
