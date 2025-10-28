import { useBreak } from "@/shared/hooks/useBreak";
import { CountdownClock } from "../CoundownClock";
import Text from "../design/Text";

export function BreakView() {
  const { standard } = useBreak();

  return (
    <div className="flex flex-col gap-y-2">
      <Text.Header>Time for a break</Text.Header>

      <Text.Body>Stand up, walk around, grab a coffee, step outside.</Text.Body>

      <Text.SubHeader>
        Time remaining&nbsp;
        <CountdownClock timeRemainingSeconds={standard?.timeRemainingSeconds} />
      </Text.SubHeader>
    </div>
  );
}
