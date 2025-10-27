import { useCallback, useMemo, useState } from "react";
import { FormElementWrapper } from "@/shared/components/layout/form";
import { Storage } from "@/shared/lib/storage";
import { SessionConfiguration, SessionMode } from "@/shared/lib/session";
import { MessageBuilder } from "@/shared/lib/messages";
import Button from "@/shared/components/design/Button";
import Text from "@/shared/components/design/Text";
import { SessionTools } from "@/shared/components/configure-session/SessionTools";
import {
  DURATION_CHOICES_LIMITED,
  DurationOption,
  SelectDuration,
} from "@/shared/components/configure-session/SelectDuration";
import { useLocation } from "@/shared/hooks/useLocation";
import { updateQuery } from "@/shared/lib/query";
import { Tabs } from "@/shared/components/design/Tabs";
import { isEmpty, isNil } from "lodash";
import { ToolsetBrowser } from "@/shared/components/tools/ToolsetBrowser";
import StartIcon from "@/shared/components/icons/StartIcon";
import ToolsetsIcon from "@/shared/components/icons/ToolsetsIcon";
import { validateTools } from "@/shared/lib/tool";
import { CreateToolsetModal } from "@/shared/components/tools/CreateToolsetModal";
import { ToolLoader, Toolset } from "@/shared/lib/datastore";

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
  saveToolsetEnabled,
  onSetDescription,
  onSetTools,
  onBrowseToolsets,
  onSaveAsToolset,
}: {
  description: string;
  tools: string[];
  saveToolsetEnabled: boolean;
  onSetDescription: (d: string) => void;
  onSetTools: SetToolsCb;
  onBrowseToolsets: VoidFunction;
  onSaveAsToolset: VoidFunction;
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
        <SessionTools
          tools={tools}
          saveToolsetEnabled={saveToolsetEnabled}
          onUpdateTools={onSetTools}
          onSaveAsToolset={onSaveAsToolset}
        />
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

  const toolValidation = validateTools(tools);

  const isFormValid =
    toolValidation.allValid &&
    !toolValidation.empty &&
    duration !== "not-selected" &&
    !isEmpty(taskDescription);

  return { tools: toolValidation, isFormValid };
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

type Modals = "tools" | "new-toolset";

const validModal = (
  modalParam: string | undefined | null
): modalParam is Modals => {
  return modalParam === "tools" || modalParam === "new-toolset";
};

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
    modalView?: "tools" | "new-toolset" | undefined;
  } = useMemo(() => {
    const params = new URLSearchParams(search);
    const sessionMode =
      params.get("sessionMode") === "free" ? "free" : "standard";
    const modalParam = params.get("modal");
    const modalView = validModal(modalParam) ? modalParam : undefined;

    return { sessionMode, modalView };
  }, [search]);
  const showForm = isEmpty(modalView);
  const showToolBrowser = modalView === "tools";
  const showSaveAsToolset = modalView === "new-toolset";

  const handleChangeTab = useCallback((tabId: string) => {
    if (tabId === "free") {
      updateQuery({ sessionMode: "free" });
    } else {
      updateQuery({ sessionMode: "standard" });
    }
  }, []);

  const closeModal = useCallback(() => {
    updateQuery({ modal: undefined });
  }, []);

  const handleSelectToolset = useCallback(
    async (toolset: Toolset) => {
      const loader = new ToolLoader();
      const tools = await Promise.all(
        toolset.toolIds.map(async (id) => await loader.get(id))
      );
      setTools(tools.filter((tool) => !isNil(tool)).map((tool) => tool.url));
    },
    [setTools]
  );

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
        <ToolsetBrowser
          onBack={closeModal}
          onSelectToolset={handleSelectToolset}
        />
      )}
      {showSaveAsToolset && (
        <CreateToolsetModal
          tools={tools}
          onBack={closeModal}
          onUpdateTools={setTools}
        />
      )}
    </div>
  );
}
