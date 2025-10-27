import { ToolDefinition, ToolLoader, Toolset } from "@/shared/lib/datastore";
import Text from "@/shared/components/design/Text";
import { InlineModal } from "@/shared/components/layout/InlineModal";
import { useEffect, useState } from "react";

interface Props {
  onBack: VoidFunction;
}

export function ToolsetBrowser({ onBack }: Props) {
  const [toolsets, setToolsets] = useState<Toolset[]>();
  const [toolLookup, setToolLookup] =
    useState<Record<string, ToolDefinition>>();

  useEffect(() => {
    const toolLoader = new ToolLoader();
    toolLoader.getStore().then((tools) => {
      setToolLookup(tools);
    });
  }, []);

  return (
    <InlineModal onBack={onBack} title="Browse Toolsets">
      <div className="min-h-80 w-full flex flex-col items-center justify-center">
        <Text.Header>Tool Browser</Text.Header>

        <Text.SubHeader light>Placeholder...</Text.SubHeader>
      </div>
    </InlineModal>
  );
}
