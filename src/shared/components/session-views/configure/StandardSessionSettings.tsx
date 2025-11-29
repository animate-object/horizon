import { useTranslation } from "react-i18next";
import { SessionTools } from "../../configure-session/SessionTools";
import Button from "../../design/Button";
import Text from "../../design/Text";
import ToolsetsIcon from "../../icons/ToolsetsIcon";
import { FormElementWrapper } from "../../layout/form";
import { SetToolsCb } from "./types";

interface Props {
  description: string;
  descriptionValidationMessage?: string;
  tools: string[];
  saveToolsetEnabled: boolean;
  onSetDescription: (d: string) => void;
  onSetTools: SetToolsCb;
  onBrowseToolsets: VoidFunction;
  onSaveAsToolset: VoidFunction;
}

export function StandardSessionSettings({
  description,
  descriptionValidationMessage,
  tools,
  saveToolsetEnabled,
  onSetDescription,
  onSetTools,
  onBrowseToolsets,
  onSaveAsToolset,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <FormElementWrapper label={t("configureSession.descriptionPrompt")}>
        <textarea
          id="description"
          className="textarea w-full"
          value={description}
          onChange={(evt) => {
            onSetDescription(evt.currentTarget.value);
          }}
        />
      </FormElementWrapper>
      <div className="flex flex-col gap-y-2 text-error">
        {descriptionValidationMessage && description.length > 0 && (
          <span>{descriptionValidationMessage}</span>
        )}
      </div>

      <FormElementWrapper
        label={
          <div className="flex justify-between items-center">
            <Text.Body>{t("configureSession.toolPrompt")}</Text.Body>
            <Button color="primary" soft onClick={onBrowseToolsets}>
              <ToolsetsIcon /> {t("toolsets.browseToolsets")}
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
