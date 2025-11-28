import { useBreak } from "@/shared/hooks/useBreak";
import { CountdownClock } from "../CoundownClock";
import Text from "../design/Text";
import { useTranslation } from "react-i18next";

export function BreakView() {
  const { t } = useTranslation();
  const { standard } = useBreak();

  return (
    <div className="flex flex-col gap-y-2">
      <Text.Header>{t("break.title")}</Text.Header>

      <Text.Body>{t("break.description")}</Text.Body>

      <Text.SubHeader>
        {t("common.timeRemaining")}&nbsp;
        <CountdownClock timeRemainingSeconds={standard?.timeRemainingSeconds} />
      </Text.SubHeader>
    </div>
  );
}
