import { useCallback, useState } from "react";
import { ToolTypeahead } from "@/shared/components/configure-session/ToolTypeahead";
import Button from "@/shared/components/design/Button";
import RemoveIcon from "@/shared/components/icons/RemoveIcon";
import AddIcon from "@/shared/components/icons/AddIcon";
import ToolsetsIcon from "../icons/ToolsetsIcon";
import { EditableToolList } from "../tools/EditableToolList";

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
  return (
    <EditableToolList
      tools={tools}
      onUpdateTools={onUpdateTools}
      secondaryAuthoringAction={
        <Button
          color="secondary"
          onClick={onSaveAsToolset}
          disabled={!saveToolsetEnabled}
        >
          <ToolsetsIcon /> Save as toolset
        </Button>
      }
    />
  );
}
