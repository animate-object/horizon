import { SessionConfiguration, SessionMode } from "@/shared/lib/session";
import { DurationOption } from "../../configure-session/SelectDuration";
import { useCallback, useMemo } from "react";
import { MessageBuilder } from "@/shared/lib/messages";
import { Storage } from "@/shared/lib/storage";
import Text from "../../design/Text";
import { Tabs } from "../../design/Tabs";
import Button from "../../design/Button";
import StartIcon from "../../icons/StartIcon";
import { SetToolsCb } from "./types";
import { useBreak } from "@/shared/hooks/useBreak";
import { CountdownClock } from "../../CoundownClock";
import { useTranslation } from "react-i18next";
import { ConfigureFreeBrowsing } from "./ConfigureFreeBrowsing";
import { validateFormState } from "@/shared/lib/sessionSettingsValidation";
import { ConfigureStandardSession } from "./ConfigureStandardSession";

const TABS = [
  {
    id: "standard",
    label: "Session",
  },
  {
    id: "free",
    label: "Free Browse",
  },
];

interface Props {
  sessionMode: SessionMode;
  taskDescription: string;
  tools: string[];
  duration: DurationOption;
  onChangeTaskDescription: (text: string) => void;
  onSelectTab: (tab: SessionMode) => void;
  onSetDuration: (duration: DurationOption) => void;
  onSetTools: SetToolsCb;
}

export function ConfigureSessionForm({
  sessionMode,
  taskDescription,
  tools,
  duration,
  onChangeTaskDescription,
  onSetTools,
  onSetDuration,
  onSelectTab,
}: Props) {
  const { t } = useTranslation();
  const { free } = useBreak();

  const validation = useMemo(
    () =>
      validateFormState({ taskDescription, tools, duration, sessionMode }, t),
    [taskDescription, tools, duration, sessionMode]
  );

  const handleSubmit = useCallback(() => {
    if (duration === "not-selected") {
      return alert(t("configureSession.alertMissingDuration"));
    }
    if (!validation.isFormValid && validation.tools.empty) {
      return alert(t("configureSession.alertMissingTools"));
    }

    const config: SessionConfiguration = {
      taskDescription,
      durationMinutes: duration,
      startedAt: new Date().toISOString(),
      allowedToolUrls: sessionMode === "standard" ? tools : [],
      mode: sessionMode,
    };

    Storage.set(Storage.keys.ActiveSessionConfig, config);
    chrome.runtime.sendMessage(MessageBuilder.sessionStarted());
  }, [
    duration,
    sessionMode,
    taskDescription,
    tools,
    JSON.stringify(validation),
  ]);

  const disableStartFreeSession = useMemo(
    () => free.status === "active" && sessionMode === "free",
    [free.status, sessionMode]
  );

  return (
    <div className="flex flex-col gap-y-2">
      <Text.Header>{t("common.newSession")}</Text.Header>
      <Tabs
        activeTabId={sessionMode}
        tabs={TABS}
        onChange={(tabId) => onSelectTab(tabId as SessionMode)}
      />
      {sessionMode === "standard" && (
        <ConfigureStandardSession
          taskDescription={taskDescription}
          tools={tools}
          duration={duration}
          validation={validation}
          onChangeTaskDescription={onChangeTaskDescription}
          onSetDuration={onSetDuration}
          onSetTools={onSetTools}
        />
      )}
      {sessionMode === "free" && (
        <ConfigureFreeBrowsing
          duration={duration}
          description={taskDescription}
          descriptionValidationMessage={validation.description.invalidReason}
          startFreeSessionDisabled={disableStartFreeSession}
          startFreeSessionDisabledRemainingSeconds={free.timeRemainingSeconds}
          onSetDuration={onSetDuration}
          onSetDescription={onChangeTaskDescription}
        />
      )}
      <div className="w-full flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!validation.isFormValid || disableStartFreeSession}
        >
          <StartIcon /> {t("common.startSession")}
        </Button>
      </div>
    </div>
  );
}
