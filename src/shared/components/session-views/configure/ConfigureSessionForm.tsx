import { SessionConfiguration, SessionMode } from "@/shared/lib/session";
import {
  DURATION_CHOICES_LIMITED,
  DurationOption,
  SelectDuration,
} from "../../configure-session/SelectDuration";
import { useCallback, useMemo } from "react";
import { validateTools } from "@/shared/lib/tool";
import { isEmpty, uniq } from "lodash";
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

type DescriptionValidation = { invalidReason?: string; isValid: boolean };

const validateTaskDescription = (
  description: string,
  minWords: number,
  minChars: number
): DescriptionValidation => {
  let invalidReason: string | undefined;
  if (description == null || description.length < minChars) {
    invalidReason = `Say a little bit more.`;
  } else if (description.split(" ").length < minWords) {
    invalidReason = `Express yourself - use at least ${minWords} words.`;
  } else if (uniq(description.split("")).length < 3) {
    invalidReason = `This description doesn't look quite right. Try again.`;
  }

  return {
    invalidReason,
    isValid: invalidReason == null,
  };
};

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
  description: DescriptionValidation;
  isFormValid: boolean;
} => {
  if (sessionMode === "free") {
    return {
      tools: { empty: true, allValid: true },
      isFormValid: typeof duration === "number",
      description: { isValid: true },
    };
  }

  const toolValidation = validateTools(tools);
  const descriptionValidation = validateTaskDescription(taskDescription, 3, 12);

  const isFormValid =
    toolValidation.allValid &&
    !toolValidation.empty &&
    duration !== "not-selected" &&
    !isEmpty(taskDescription);

  return {
    tools: toolValidation,
    isFormValid,
    description: descriptionValidation,
  };
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
            descriptionValidationMessage={
              taskDescription.length > 0
                ? validation.description.invalidReason
                : undefined
            }
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
