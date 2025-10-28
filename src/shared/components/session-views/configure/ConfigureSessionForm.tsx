import { SessionConfiguration, SessionMode } from "@/shared/lib/session";
import {
  DURATION_CHOICES_LIMITED,
  DurationOption,
  SelectDuration,
} from "../../configure-session/SelectDuration";
import { useCallback, useEffect, useMemo } from "react";
import { validateTools } from "@/shared/lib/tool";
import { isEmpty } from "lodash";
import { MessageBuilder } from "@/shared/lib/messages";
import { Storage } from "@/shared/lib/storage";
import Text from "../../design/Text";
import { Tabs } from "../../design/Tabs";
import { updateQuery } from "@/shared/lib/query";
import { FormElementWrapper } from "../../layout/form";
import Button from "../../design/Button";
import StartIcon from "../../icons/StartIcon";
import { SetToolsCb } from "./types";
import { StandardSessionSettings } from "./StandardSessionSettings";
import { useBreak } from "@/shared/hooks/useBreak";
import { CountdownClock } from "../../CoundownClock";
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
const validateFormState = ({
  taskDescription,
  tools,
  duration,
  sessionMode,
}: {
  taskDescription: string;
  tools: string[];
  duration: number | "not-selected";
  sessionMode: "free" | "standard";
}): {
  tools: { empty: boolean; allValid: boolean };
  isFormValid: boolean;
} => {
  if (sessionMode === "free") {
    return {
      tools: { empty: true, allValid: true },
      isFormValid: typeof duration === "number",
    };
  }

  const toolValidation = validateTools(tools);

  const isFormValid =
    toolValidation.allValid &&
    !toolValidation.empty &&
    duration !== "not-selected" &&
    !isEmpty(taskDescription);

  return { tools: toolValidation, isFormValid };
};

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
  const { free } = useBreak();

  const validation = useMemo(
    () => validateFormState({ taskDescription, tools, duration, sessionMode }),
    [taskDescription, tools, duration, sessionMode]
  );

  const handleSubmit = useCallback(() => {
    if (duration === "not-selected") {
      return alert("Select duration");
    }
    if (!validation.isFormValid && validation.tools.empty) {
      return alert("Specify at least one tool");
    }

    const config: SessionConfiguration = {
      taskDescription:
        sessionMode === "standard" ? taskDescription : "free browsing",
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
      <Text.Header>New Session</Text.Header>
      <Tabs
        activeTabId={sessionMode}
        tabs={TABS}
        onChange={(tabId) => onSelectTab(tabId as SessionMode)}
      />
      {sessionMode === "standard" && (
        <>
          <StandardSessionSettings
            description={taskDescription}
            tools={tools}
            saveToolsetEnabled={
              validation.tools.allValid && !validation.tools.empty
            }
            onSetDescription={onChangeTaskDescription}
            onSetTools={onSetTools}
            onBrowseToolsets={() => updateQuery({ modal: "tools" })}
            onSaveAsToolset={() => updateQuery({ modal: "new-toolset" })}
          />
          <div className="flex flex-col gap-y-2 text-error">
            {!validation.tools.empty && !validation.tools.allValid && (
              <span>One or more tools are not valid URLs</span>
            )}
          </div>

          <FormElementWrapper label="How long will you work?">
            <SelectDuration
              classNames={["w-half"]}
              value={duration}
              onChange={onSetDuration}
            />
          </FormElementWrapper>
        </>
      )}

      {sessionMode === "free" && !disableStartFreeSession && (
        <>
          <Text.Body light>
            Browse the internet without restrictions for a limited amount of
            time
          </Text.Body>
          <div className="divider divider-accent my-0" />

          <FormElementWrapper label="How long will you work?">
            <SelectDuration
              choices={DURATION_CHOICES_LIMITED}
              classNames={["w-half"]}
              value={duration}
              onChange={onSetDuration}
            />
          </FormElementWrapper>
        </>
      )}
      {disableStartFreeSession && (
        <div className="w-full flex justify-between mb-4 mt-2">
          <Text.Body light>
            Free browsing is disabled for a bit longer.
          </Text.Body>
          <Text.Body>
            Time remaining&nbsp;
            <CountdownClock timeRemainingSeconds={free.timeRemainingSeconds} />
          </Text.Body>
        </div>
      )}

      <div className="w-full flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!validation.isFormValid || disableStartFreeSession}
        >
          <StartIcon /> Start session
        </Button>
      </div>
    </div>
  );
}
