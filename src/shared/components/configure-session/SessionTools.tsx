import { useCallback, useState } from "react";
import Button from "../design/Button";
import { RemoveIcon } from "../icons/RemoveIcon";
import { ToolTypeahead } from "./ToolTypeahead";

interface Props {
  tools: string[];
  onUpdateTools: React.Dispatch<React.SetStateAction<string[]>>;
}

export function SessionTools({ tools, onUpdateTools }: Props) {
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  const handleAddTool = useCallback(() => {
    onUpdateTools([...tools, ""]);
  }, [tools, onUpdateTools]);

  const handleUpdateTool = useCallback(
    (newValue: string, idx: number) => {
      onUpdateTools((tools) => [
        ...tools.slice(0, idx),
        newValue,
        ...tools.slice(idx + 1),
      ]);
    },
    [onUpdateTools]
  );

  const handleRemoveTool = useCallback(
    (idx: number) => {
      if (tools.length < 2) {
        return;
      }

      onUpdateTools((tools) => {
        console.log("remove", {
          idx,
          atIdx: tools[idx],
          before: tools.slice(0, idx),
          after: tools.slice(idx + 1),
        });
        return [...tools.slice(0, idx), ...tools.slice(idx + 1)];
      });
    },
    [onUpdateTools, tools]
  );
  return (
    <div className="flex flex-col gap-y-3">
      {tools.map((toolUrl, idx) => {
        return (
          <div key={idx} className="flex gap-x-4 items-center">
            <ToolTypeahead
              onSelect={(data) => handleUpdateTool(data?.url ?? "", idx)}
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
              <RemoveIcon />
            </Button>
          </div>
        );
      })}
      <div>
        <Button soft onClick={handleAddTool}>
          + Add another
        </Button>
      </div>
    </div>
  );
}
