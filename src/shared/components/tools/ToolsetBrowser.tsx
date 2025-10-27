import {
  ToolDefinition,
  ToolLoader,
  Toolset,
  ToolsetLoader,
} from "@/shared/lib/datastore";
import { InlineModal } from "@/shared/components/layout/InlineModal";
import { useEffect, useMemo, useState } from "react";
import { ToolsetBrowserCard } from "./ToolsetBrowserCard";
import { EnhancedToolset } from "./types";

interface Props {
  onBack: VoidFunction;
  onSelectToolset: (toolset: Toolset) => void;
}

export function ToolsetBrowser({ onBack, onSelectToolset }: Props) {
  const [toolsets, setToolsets] = useState<Toolset[]>([]);
  const [toolLookup, setToolLookup] = useState<Record<string, ToolDefinition>>(
    {}
  );

  useEffect(() => {
    const toolLoader = new ToolLoader();
    toolLoader.getStore().then((tools) => {
      setToolLookup(tools ?? []);
    });
  }, []);

  useEffect(() => {
    const toolsetLoader = new ToolsetLoader();
    toolsetLoader.getStore().then((toolsetStore) => {
      setToolsets(Object.values(toolsetStore));
    });
  });

  const toolsetList: EnhancedToolset[] = useMemo(() => {
    return toolsets.map((ts) => {
      return { ...ts, tools: ts.toolIds.map((id) => toolLookup[id]) };
    });
  }, [toolsets, toolLookup]);

  return (
    <InlineModal onBack={onBack} title="Browse Toolsets">
      <div className="min-h-80 w-full flex flex-wrap justify-start items-start gap-2">
        {toolsetList.map((ts) => (
          <ToolsetBrowserCard
            toolset={ts}
            onSelectToolset={(ts) => {
              onSelectToolset(ts);
              onBack();
            }}
          />
        ))}
      </div>
    </InlineModal>
  );
}
