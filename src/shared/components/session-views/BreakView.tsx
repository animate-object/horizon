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

      <Text.Body light>{t("break.thisIsAGoodTime")}</Text.Body>
      <Text.Body light>
        <ul className="list">
          <li>- {t("break.thisIsAGoodTime1")}</li>
          <li>- {t("break.thisIsAGoodTime2")}</li>
          <li>- {t("break.thisIsAGoodTime3")}</li>
        </ul>
      </Text.Body>
      <Text.Body>{t("break.why")}</Text.Body>
      <Text.Body light>{t("break.whyExplanation1")}</Text.Body>
      <Text.Body light>{t("break.whyExplanation2")}</Text.Body>
      <Text.SubHeader>
        {t("common.timeRemaining")}&nbsp;
        <CountdownClock timeRemainingSeconds={standard?.timeRemainingSeconds} />
      </Text.SubHeader>
    </div>
  );
}
