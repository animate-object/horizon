import { useMemo, useState } from "react";
import { FormElementWrapper } from "../layout/form";
import { Storage } from "@/shared/storage";
import { SessionConfiguration } from "@/shared/session";
import { MessageBuilder } from "@/shared/messages";
import Button from "../design/Button";
import Text from "../design/Text";
import { SessionTools } from "./SessionTools";

const TOOL_DOMAIN_REGEX = /^(?:\w+\.)+\w{2,}(?:\/\w*)*$/;

const isValidToolDef = (toolUrl: string): boolean => {
  return TOOL_DOMAIN_REGEX.test(toolUrl);
};

export function ConfigureSession() {
  const [taskDescription, setTaskDescription] = useState("");
  const [tools, setTools] = useState<string[]>([""]);
  const [duration, setDuration] = useState<number | "not-selected">(
    "not-selected"
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
            <SessionTools tools={tools} onUpdateTools={setTools} />
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
            {!allToolsEmpty && isAnyToolInvalid && (
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
