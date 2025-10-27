import { Toolset } from "@/shared/lib/datastore";
import { Card } from "@/shared/components/design/Card";
import Button from "@/shared/components/design/Button";
import SelectIcon from "@/shared/components/icons/SelectIcon";

interface Props {
  toolset: Toolset;
  onSelectToolset: (toolset: Toolset) => void;
}

export function ToolsetBrowserCard({ toolset, onSelectToolset }: Props) {
  return (
    <Card
      title={toolset.name}
      content={undefined}
      actions={
        <Button small onClick={() => onSelectToolset(toolset)}>
          <SelectIcon width={12} /> Use
        </Button>
      }
    />
  );
}
