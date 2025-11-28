import Button from "@/shared/components/design/Button";
import { EditableToolList } from "@/shared/components/tools/EditableToolList";
import SaveIcon from "@/shared/components/icons/SaveIcon";
import { useTranslation } from "react-i18next";

interface Props {
  tools: string[];
  saveToolsetEnabled: boolean;
  onUpdateTools: React.Dispatch<React.SetStateAction<string[]>>;
  onSaveAsToolset: VoidFunction;
}

export function SessionTools({
  tools,
  saveToolsetEnabled,
  onUpdateTools,
  onSaveAsToolset,
}: Props) {
  const { t } = useTranslation();
  return (
    <EditableToolList
      tools={tools}
      onUpdateTools={onUpdateTools}
      secondaryAuthoringAction={
        <Button
          color="secondary"
          ghost
          onClick={onSaveAsToolset}
          disabled={!saveToolsetEnabled}
        >
          <SaveIcon /> {t("toolSelection.saveAsToolset")}
        </Button>
      }
    />
  );
}
