import {
  ToolDefinition,
  ToolLoader,
  Toolset,
  ToolsetLoader,
} from "@/shared/lib/datastore";
import { InlineModal } from "@/shared/components/layout/InlineModal";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ToolsetBrowserCard } from "./ToolsetBrowserCard";
import { EnhancedToolset } from "./types";
import { EditToolsetModal } from "./EditToolsetModal";

interface Props {
  onBack: VoidFunction;
  onSelectToolset: (toolset: Toolset) => void;
}

export function ToolsetBrowser({ onBack, onSelectToolset }: Props) {
  const [toolsets, setToolsets] = useState<Toolset[]>([]);
  const [toolLookup, setToolLookup] = useState<Record<string, ToolDefinition>>(
    {}
  );
  const [focusedToolsetId, setFocusedToolsetId] = useState<
    string | undefined
  >();
  useEffect(() => {
    const toolLoader = new ToolLoader();
    toolLoader.getStore().then((tools) => {
      setToolLookup(tools ?? []);
    });
  }, [focusedToolsetId]);

  useEffect(() => {
    const toolsetLoader = new ToolsetLoader();
    toolsetLoader.getStore().then((toolsetStore) => {
      setToolsets(Object.values(toolsetStore));
    });
  }, [focusedToolsetId]);

  const toolsetList: EnhancedToolset[] = useMemo(() => {
    return toolsets.map((ts) => {
      return { ...ts, tools: ts.toolIds.map((id) => toolLookup[id]) };
    });
  }, [toolsets, toolLookup]);

  if (focusedToolsetId) {
    return (
      <EditToolsetModal
        toolsetId={focusedToolsetId}
        onBack={() => setFocusedToolsetId(undefined)}
      />
    );
  }

  return (
    <InlineModal onBack={onBack} title="Browse Toolsets">
      <div className="min-h-80">
        <div className="w-full flex flex-wrap gap-2">
          {toolsetList.map((ts) => (
            <ToolsetBrowserCard
              toolset={ts}
              onViewToolsetDetail={setFocusedToolsetId}
              onSelectToolset={(ts) => {
                onSelectToolset(ts);
                onBack();
              }}
            />
          ))}
        </div>
      </div>
    </InlineModal>
  );
}
