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
        <ul className="list list-disc ps-5">
          <li>{t("break.thisIsAGoodTime1")}</li>
          <li>{t("break.thisIsAGoodTime2")}</li>
          <li>{t("break.thisIsAGoodTime3")}</li>
        </ul>
      </Text.Body>
      <div className="collapse bg-base-100 border border-base-300">
        <input className="ps-0" type="radio" name="break-collapse" />
        <div className="collapse-title font-semibold ps-0 py-1">
          <Text.Body>{t("break.why")}</Text.Body>
        </div>
        <div className="collapse-content text-sm ps-0">
          <Text.Body light>{t("break.whyExplanation1")}</Text.Body>
          <br />
          <Text.Body light>{t("break.whyExplanation2")}</Text.Body>
        </div>
      </div>
      <Text.SubHeader>
        {t("common.timeRemaining")}&nbsp;
        <CountdownClock timeRemainingSeconds={standard?.timeRemainingSeconds} />
      </Text.SubHeader>
    </div>
  );
}
