import { Toolset } from "@/shared/lib/datastore";
import { Card } from "@/shared/components/design/Card";
import Button from "@/shared/components/design/Button";
import SelectIcon from "@/shared/components/icons/SelectIcon";

interface Props {
  toolset: Toolset;
  onSelectToolset: (toolset: Toolset) => void;
  onViewToolsetDetail: (toolsetId: string) => void;
}

export function ToolsetBrowserCard({
  toolset,
  onSelectToolset,
  onViewToolsetDetail,
}: Props) {
  return (
    <Card
      title={toolset.name}
      content={undefined}
      styles={{ width: "calc(1 / 3 * 100% - 6px)" }}
      onClick={() => onViewToolsetDetail(toolset.id)}
      actions={
        <Button small onClick={() => onSelectToolset(toolset)}>
          <SelectIcon width={12} /> Use
        </Button>
      }
    />
  );
}
