import { Toolset } from "@/shared/lib/datastore";
import Text from "../design/Text";
import { InlineModal } from "../layout/InlineModal";

interface Props {
  onBack: VoidFunction;
}

const EXAMPLE_TOOLSETS: Pick<Toolset, "toolIds" | "name">[] = [
  {
    name: "Check messages",
    toolIds: [],
  },
  {
    name: "Check messages",
    toolIds: [],
  },
  {
    name: "Check messages",
    toolIds: [],
  },
];

export function ToolsetBrowser({ onBack }: Props) {
  return (
    <InlineModal onBack={onBack} title="Browse Toolsets">
      <div className="min-h-80 w-full flex flex-col items-center justify-center">
        <Text.Header>Tool Browser</Text.Header>

        <Text.SubHeader light>Placeholder...</Text.SubHeader>
      </div>
    </InlineModal>
  );
}
