import Text from "../design/Text";
import { InlineModal } from "../layout/InlineModal";

interface Props {
  onBack: VoidFunction;
}
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
