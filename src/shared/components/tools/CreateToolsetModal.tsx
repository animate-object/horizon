import {
  ToolLoader,
  ToolsetFactory,
  ToolsetLoader,
} from "@/shared/lib/datastore";
import { InlineModal } from "@/shared/components/layout/InlineModal";
import { useCallback, useMemo, useState } from "react";
import Button from "@/shared/components/design/Button";
import { EditableToolList } from "./EditableToolList";
import { FormElementWrapper } from "@/shared/components/layout/form";
import { validateTools } from "@/shared/lib/tool";
import { isEmpty } from "lodash";
import ToolsetsIcon from "@/shared/components/icons/ToolsetsIcon";

interface Props {
  onBack: VoidFunction;
  tools: string[];
  onUpdateTools: React.Dispatch<React.SetStateAction<string[]>>;
}

export function CreateToolsetModal({
  onBack,
  tools: toolUrls,
  onUpdateTools,
}: Props) {
  const [name, setName] = useState<string>("");

  const toolValidation = useMemo(() => validateTools(toolUrls), [toolUrls]);

  const handleCreateToolset = useCallback(async () => {
    try {
      console.log("CreateToolsetModal: handle create toolset");
      const tools = await new ToolLoader().upsertMany(
        toolUrls.map((url) => ({ url }))
      );
      console.log("CreateToolsetModal: tools", tools);
      const toolset = ToolsetFactory.create({
        toolIds: tools.map((t) => t.id),
        name: name,
      });
      await new ToolsetLoader().upsert(toolset);
      console.log("CreateToolsetModal: created", toolset);

      onBack();
    } catch (err) {
      console.error("Failed to create toolset", err);
      alert("Something went wrong!");
    }
  }, [name, toolUrls]);

  return (
    <InlineModal
      title={"Create Toolset"}
      onBack={onBack}
      actions={
        <div className="flex justify-end">
          <Button
            disabled={
              isEmpty(name) || toolValidation.empty || !toolValidation.allValid
            }
            onClick={handleCreateToolset}
          >
            <ToolsetsIcon />
            Create Toolset
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-y-2">
        <FormElementWrapper label="Name this toolset">
          <input
            id="toolset-name"
            placeholder="My favorite toolset"
            type="text"
            className="input w-full"
            value={name}
            onChange={(evt) => {
              setName(evt.currentTarget.value);
            }}
          />
        </FormElementWrapper>
        <FormElementWrapper label="Edit tools">
          <EditableToolList tools={toolUrls} onUpdateTools={onUpdateTools} />
        </FormElementWrapper>
      </div>
    </InlineModal>
  );
}
