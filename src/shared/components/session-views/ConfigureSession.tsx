import { useCallback, useMemo, useState } from "react";
import { FormElementWrapper } from "../layout/form";
import { Storage } from "@/shared/storage";
import { SessionConfiguration } from "@/shared/session";
import { MessageBuilder } from "@/shared/messages";
import Button from "../design/Button";
import Text from "../design/Text";
import { ToolTypeahead } from "../ToolTypeahead";

const TOOL_DOMAIN_REGEX = /^(?:\w+\.)+\w{2,}(?:\/\w*)*$/;

const isValidToolDef = (toolUrl: string): boolean => {
  return TOOL_DOMAIN_REGEX.test(toolUrl);
};

export function ConfigureSession() {
  const [taskDescription, setTaskDescription] = useState("");
  const [tools, setTools] = useState<string[]>([""]);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | "not-selected">(
    "not-selected"
  );

  const handleAddTool = useCallback(() => {
    setTools([...tools, ""]);
  }, [tools, setTools]);

  const handleUpdateTool = useCallback(
    (newValue: string, idx: number) => {
      setTools((tools) => [
        ...tools.slice(0, idx),
        newValue,
        ...tools.slice(idx + 1),
      ]);
    },
    [setTools]
  );

  const handleRemoveTool = useCallback(
    (idx: number) => {
      console.log(tools.length);
      if (tools.length < 2) {
        return;
      }

      setTools((tools) => {
        console.log("remove", {
          idx,
          atIdx: tools[idx],
          before: tools.slice(0, idx),
          after: tools.slice(idx + 1),
        });
        return [...tools.slice(0, idx), ...tools.slice(idx + 1)];
      });
    },
    [setTools, tools]
  );

  const allToolsEmpty = useMemo(
    () => !tools.some((tool) => tool !== ""),
    [tools]
  );
  const isAnyToolInvalid = useMemo(
    () => tools.some((tool) => !isValidToolDef(tool)),
    [tools]
  );

  const isFormValid = useMemo(
    () =>
      !isAnyToolInvalid &&
      taskDescription !== "" &&
      duration !== "not-selected",
    [isAnyToolInvalid, taskDescription, duration]
  );

  const handleSubmit = () => {
    if (duration === "not-selected") {
      return alert("Select duration");
    }
    if (allToolsEmpty) {
      return alert("Specify at least one tool");
    }

    const config: SessionConfiguration = {
      taskDescription,
      durationMinutes: duration,
      startedAt: new Date().toISOString(),
      allowedToolUrls: tools,
    };

    Storage.set(Storage.keys.ActiveSessionConfig, config);
    chrome.runtime.sendMessage(MessageBuilder.sessionStarted());
  };

  return (
    <>
      <Text.Header>New Session</Text.Header>
      <div className="flex flex-col items-center w-full h-full">
        <div className="flex flex-col py-6 gap-2 w-full">
          <FormElementWrapper label="What are you here to do?">
            <textarea
              id="description"
              className="textarea textarea-primary w-full"
              value={taskDescription}
              onChange={(evt) => {
                setTaskDescription(evt.currentTarget.value);
              }}
            />
          </FormElementWrapper>
          <FormElementWrapper label="What tools will you use?">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "1rem",
              }}
            >
              {tools.map((toolUrl, idx) => {
                return (
                  <div key={idx} className="flex gap-4  items-center">
                    <ToolTypeahead
                      onSelect={(data) =>
                        handleUpdateTool(data?.url ?? "", idx)
                      }
                      onFocus={() => setFocusedIdx(idx)}
                      onBlur={() => setFocusedIdx(null)}
                      value={toolUrl}
                    />
                    <Button
                      color="destructive"
                      circle
                      soft
                      onClick={() => handleRemoveTool(idx)}
                      style={{ flexShrink: 0 }}
                      disabled={tools.length < 2}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </Button>
                  </div>
                );
              })}
              <div>
                <Button onClick={handleAddTool}>+ Add another</Button>
              </div>
            </div>
          </FormElementWrapper>

          <FormElementWrapper label="How long will you work?">
            <select
              className="select w-half"
              value={duration}
              onChange={(evt) => {
                const value = evt.currentTarget.value;
                if (value === "not-selected") {
                  setDuration(value);
                }
                setDuration(parseInt(value));
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
          </FormElementWrapper>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "1rem",
              color: "red",
            }}
          >
            {!allToolsEmpty && isAnyToolInvalid && focusedIdx == null && (
              <span>One or more tools are not valid URLs</span>
            )}
          </div>
          <div>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              Start session
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
