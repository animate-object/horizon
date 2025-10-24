import { useMemo, useState } from "react";
import { FormElementWrapper } from "../layout/form";
import { Storage } from "@/shared/storage";
import { SessionConfiguration, SessionMode } from "@/shared/session";
import { MessageBuilder } from "@/shared/messages";
import Button from "../design/Button";
import Text from "../design/Text";
import { SessionTools } from "../configure-session/SessionTools";
import {
  DURATION_CHOICES_LIMITED,
  DurationOption,
  SelectDuration,
} from "../configure-session/SelectDuration";
import { useLocation } from "@/shared/hooks/useLocation";
import { updateQuery } from "@/shared/lib/query";
import { Tabs } from "../design/Tabs";
import { isEmpty } from "lodash";
import { ToolsetBrowser } from "../tools/ToolsetBrowser";
import StartIcon from "../icons/StartIcon";
import ToolsetsIcon from "../icons/ToolsetsIcon";
import { isValidToolUrl } from "@/shared/lib/tool";

type SetToolsCb = React.Dispatch<React.SetStateAction<string[]>>;

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

function StandardSessionSettings({
  description,
  tools,
  onSetDescription,
  onSetTools,
  onBrowseToolsets,
}: {
  description: string;
  tools: string[];
  onSetDescription: (d: string) => void;
  onSetTools: SetToolsCb;
  onBrowseToolsets: VoidFunction;
}) {
  return (
    <>
      <FormElementWrapper label="What are you here to do?">
        <textarea
          id="description"
          className="textarea w-full"
          value={description}
          onChange={(evt) => {
            onSetDescription(evt.currentTarget.value);
          }}
        />
      </FormElementWrapper>
      <FormElementWrapper
        label={
          <div className="flex justify-between items-center">
            <Text.Body>What tools will you use?</Text.Body>
            <Button color="primary" soft onClick={onBrowseToolsets}>
              <ToolsetsIcon /> Browse toolsets
            </Button>
          </div>
        }
      >
        <SessionTools tools={tools} onUpdateTools={onSetTools} />
      </FormElementWrapper>
    </>
  );
}

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

  const toolsEmpty = !tools.some((tool) => tool !== "");
  const allToolsValid = tools.every(isValidToolUrl);

  const isFormValid =
    allToolsValid &&
    !toolsEmpty &&
    duration !== "not-selected" &&
    !isEmpty(taskDescription);

  return { tools: { empty: toolsEmpty, allValid: allToolsValid }, isFormValid };
};

interface FormProps {
  sessionMode: SessionMode;
  taskDescription: string;
  tools: string[];
  duration: DurationOption;
  onChangeTaskDescription: (text: string) => void;
  onSelectTab: (tab: SessionMode) => void;
  onSetDuration: (duration: DurationOption) => void;
  onSetTools: SetToolsCb;
}
function ConfigureSessionForm({
  sessionMode,
  taskDescription,
  tools,
  duration,
  onChangeTaskDescription,
  onSetTools,
  onSetDuration,
  onSelectTab,
}: FormProps) {
  const validation = useMemo(
    () => validateFormState({ taskDescription, tools, duration, sessionMode }),
    [taskDescription, tools, duration, sessionMode]
  );

  const handleSubmit = () => {
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
  };

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
            onSetDescription={onChangeTaskDescription}
            onSetTools={onSetTools}
            onBrowseToolsets={() => updateQuery({ modal: "tools" })}
          />
          <div className="flex flex-col gap-y-2 text-error">
            {!validation.tools.empty && !validation.tools.allValid && (
              <span>One or more tools are not valid URLs</span>
            )}
          </div>
        </>
      )}

      {sessionMode === "free" && (
        <>
          <Text.Body light>
            Browse the internet without restrictions for a limited amount of
            time
          </Text.Body>
          <div className="divider divider-accent my-0" />
        </>
      )}

      <FormElementWrapper label="How long will you work?">
        <SelectDuration
          choices={
            sessionMode === "free" ? DURATION_CHOICES_LIMITED : undefined
          }
          classNames={["w-half"]}
          value={duration}
          onChange={onSetDuration}
        />
      </FormElementWrapper>

      <div>
        <Button onClick={handleSubmit} disabled={!validation.isFormValid}>
          <StartIcon /> Start session
        </Button>
      </div>
    </div>
  );
}

export function ConfigureSession() {
  const [taskDescription, setTaskDescription] = useState("");
  const [tools, setTools] = useState<string[]>([""]);
  const [duration, setDuration] = useState<number | "not-selected">(
    "not-selected"
  );
  const { search } = useLocation();
  const {
    sessionMode,
    modalView,
  }: {
    sessionMode: SessionMode;
    modalView?: "tools" | undefined;
  } = useMemo(() => {
    const params = new URLSearchParams(search);
    const sessionMode =
      params.get("sessionMode") === "free" ? "free" : "standard";
    const modalView = params.get("modal") === "tools" ? "tools" : undefined;

    return { sessionMode, modalView };
  }, [search]);
  const showForm = modalView != "tools";
  const showToolBrowser = modalView === "tools";

  const handleChangeTab = (tabId: string) => {
    if (tabId === "free") {
      updateQuery({ sessionMode: "free" });
    } else {
      updateQuery({ sessionMode: "standard" });
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      {showForm && (
        <ConfigureSessionForm
          sessionMode={sessionMode}
          taskDescription={taskDescription}
          tools={tools}
          duration={duration}
          onChangeTaskDescription={setTaskDescription}
          onSetTools={setTools}
          onSetDuration={setDuration}
          onSelectTab={handleChangeTab}
        />
      )}
      {showToolBrowser && (
        <ToolsetBrowser onBack={() => updateQuery({ modal: undefined })} />
      )}
    </div>
  );
}
