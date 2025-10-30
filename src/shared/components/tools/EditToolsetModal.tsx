import {
  ToolLoader,
  ToolsetFactory,
  ToolsetLoader,
} from "@/shared/lib/datastore";
import { InlineModal } from "@/shared/components/layout/InlineModal";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/shared/components/design/Button";
import { EditableToolList } from "./EditableToolList";
import { FormElementWrapper } from "@/shared/components/layout/form";
import { validateTools } from "@/shared/lib/tool";
import { isEmpty } from "lodash";
import ToolsetsIcon from "@/shared/components/icons/ToolsetsIcon";
import { prefixLogger } from "@/shared/lib/log";
import RemoveIcon from "../icons/RemoveIcon";

const logger = prefixLogger("UpdateToolsetModal: ");

interface Props {
  onBack: VoidFunction;
  toolsetId: string;
}

export function EditToolsetModal({ onBack, toolsetId }: Props) {
  const [toolUrls, setToolUrls] = useState<string[]>([]);
  const [name, setName] = useState<string>("");

  const loadToolset = useCallback(
    async (toolsetId: string) => {
      const toolset = await new ToolsetLoader().get(toolsetId);
      const toolLoader = new ToolLoader();
      if (toolset == null) {
        logger.warn(`Toolset ${toolsetId} not found`);
        return;
      }
      const toolUrls: string[] = [];
      for (const toolId of toolset.toolIds) {
        const tool = await toolLoader.get(toolId);
        if (tool) {
          toolUrls.push(tool.url);
        }
      }

      setToolUrls(toolUrls);
      setName(toolset.name);
    },
    [setName, setToolUrls]
  );

  useEffect(() => {
    loadToolset(toolsetId);
  }, [toolsetId, loadToolset]);

  const toolValidation = useMemo(() => validateTools(toolUrls), [toolUrls]);

  const handleUpdateToolset = useCallback(async () => {
    try {
      const toolsetLoader = await new ToolsetLoader();
      const toolset = await toolsetLoader.get(toolsetId);
      if (toolset == null) {
        logger.warn(`Toolset ${toolsetId} not found`);
        return;
      }

      logger.log("Handle create toolset");
      const tools = await new ToolLoader().upsertMany(
        toolUrls.map((url) => ({ url }))
      );
      logger.log("Tools", tools);
      const updated = ToolsetFactory.update(toolset, {
        toolIds: tools.map((t) => t.id),
        name: name,
      });
      await new ToolsetLoader().upsert(updated);
      logger.log("Created", toolset);

      onBack();
    } catch (err) {
      logger.error("Failed to update toolset", err);
      alert("Something went wrong!");
    }
  }, [name, toolUrls]);

  const handleDelete = useCallback(async () => {
    try {
      if (confirm(`Delete ${name}?`)) {
        const loader = new ToolsetLoader();
        await loader.delete(toolsetId);
        onBack();
      }
    } catch {
      logger.warn("Failed to delete toolset");
    }
  }, [toolsetId, name]);

  return (
    <InlineModal
      title={"Edit Toolset"}
      onBack={onBack}
      actions={
        <div className="flex justify-end gap-x-2">
          <Button color="destructive" soft onClick={handleDelete}>
            <RemoveIcon />
            Delete
          </Button>

          <Button
            disabled={
              isEmpty(name) || toolValidation.empty || !toolValidation.allValid
            }
            onClick={handleUpdateToolset}
          >
            <ToolsetsIcon />
            Update Toolset
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
          <EditableToolList tools={toolUrls} onUpdateTools={setToolUrls} />
        </FormElementWrapper>
      </div>
    </InlineModal>
  );
}
