import { Toolset } from "@/shared/lib/datastore";
import { Card } from "@/shared/components/design/Card";
import Button from "@/shared/components/design/Button";

interface Props {
  toolset: Toolset;
  onSelectToolset: (toolset: Toolset) => void;
}

export function ToolBrowserCard({ toolset, onSelectToolset }: Props) {
  return (
    <Card
      title={toolset.name}
      content={undefined}
      actions={<Button onClick={() => onSelectToolset(toolset)} />}
    />
  );
}
