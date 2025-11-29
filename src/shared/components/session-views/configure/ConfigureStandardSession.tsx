import { updateQuery } from "@/shared/lib/query";
import {
  DurationOption,
  SelectDuration,
} from "../../configure-session/SelectDuration";
import { FormElementWrapper } from "../../layout/form";
import { StandardSessionSettings } from "./StandardSessionSettings";
import { SetToolsCb } from "./types";
import { FormValidationState } from "@/shared/lib/sessionSettingsValidation";
import { useTranslation } from "react-i18next";

interface Props {
  taskDescription: string;
  tools: string[];
  duration: DurationOption;
  validation: FormValidationState;
  onChangeTaskDescription: (text: string) => void;
  onSetDuration: (duration: DurationOption) => void;
  onSetTools: SetToolsCb;
}

export function ConfigureStandardSession({
  taskDescription,
  tools,
  duration,
  validation,
  onChangeTaskDescription,
  onSetTools,
  onSetDuration,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <StandardSessionSettings
        description={taskDescription}
        descriptionValidationMessage={validation.description.invalidReason}
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
          <span>{t("toolSelection.invalidToolUrl")}</span>
        )}
      </div>
      <FormElementWrapper label={t("configureSession.durationPrompt")}>
        <SelectDuration
          classNames={["w-half"]}
          value={duration}
          onChange={onSetDuration}
        />
      </FormElementWrapper>
    </>
  );
}
