import { useSession } from "@/shared/hooks/useSession";
import { MessageBuilder } from "@/shared/lib/messages";
import { clearSessionState } from "@/shared/lib/session";
import { Storage } from "@/shared/lib/storage";
import { useState } from "react";
import Button from "@/shared/components/design/Button";
import Text from "@/shared/components/design/Text";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";

export function SessionComplete() {
  const { t } = useTranslation();
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
      <Text.Header>{t("postSession.sessionComplete")}</Text.Header>
      <Text.Body>{t("postSession.goodTimeToTakeABreak")}</Text.Body>
      <br />
      <Text.Body>{t("postSession.whenYoureReady")}</Text.Body>
      <span>
        <Button
          onClick={() => {
            clearSessionState();
            window.location.reload();
          }}
        >
          {t("common.newSession")}
        </Button>
      </span>

      <Text.Body>{capitalize(t("common.or"))}&nbsp;. . .</Text.Body>

      <div className="join">
        <Button
          onClick={startNewSessionWithSameTools}
          disabled={newSessionDurationMinutes === "not-selected"}
        >
          {t("postSession.newWithSameTools")}
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
          <option value="1">1 {t("common.minute")}</option>
          <option value="5">5 {t("common.minutes")}</option>
          <option value="10">10 {t("common.minutes")}</option>
          <option value="30">30 {t("common.minutes")}</option>
          <option value="60">60 {t("common.minutes")}</option>
          <option value="90">90 {t("common.minutes")}</option>
          <option value="120">120 {t("common.minutes")}</option>
        </select>
      </div>
    </div>
  );
}
