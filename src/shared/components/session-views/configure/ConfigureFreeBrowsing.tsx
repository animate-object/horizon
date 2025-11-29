import { useTranslation } from "react-i18next";
import {
  DURATION_CHOICES_LIMITED,
  DurationOption,
  SelectDuration,
} from "../../configure-session/SelectDuration";
import Text from "../../design/Text";
import { FormElementWrapper } from "../../layout/form";
import { CountdownClock } from "../../CoundownClock";

interface Props {
  duration: DurationOption;
  description: string;
  descriptionValidationMessage?: string;
  startFreeSessionDisabled: boolean;
  startFreeSessionDisabledRemainingSeconds: number;
  onSetDuration: (duration: DurationOption) => void;
  onSetDescription: (d: string) => void;
}

function FreeSessionDisabledMessage({
  remainingSeconds,
}: {
  remainingSeconds: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-between mb-4 mt-2">
      <Text.Body light>{t("configureSession.freeBrowseDisabled")}</Text.Body>
      <Text.Body>
        {t("common.timeRemaining")}&nbsp;
        <CountdownClock timeRemainingSeconds={remainingSeconds} />
      </Text.Body>
    </div>
  );
}

export function ConfigureFreeBrowsing({
  duration,
  description,
  descriptionValidationMessage,
  startFreeSessionDisabled,
  startFreeSessionDisabledRemainingSeconds,
  onSetDuration,
  onSetDescription,
}: Props) {
  const { t } = useTranslation();

  if (startFreeSessionDisabled) {
    return (
      <FreeSessionDisabledMessage
        remainingSeconds={startFreeSessionDisabledRemainingSeconds}
      />
    );
  }

  return (
    <>
      <Text.Body light>{t("configureSession.freeBrowseDescription")}</Text.Body>
      <FormElementWrapper label={t("configureSession.descriptionPrompt")}>
        <textarea
          id="description"
          className="textarea w-full"
          value={description}
          onChange={(evt) => {
            onSetDescription(evt.currentTarget.value);
          }}
        />
      </FormElementWrapper>
      <div className="flex flex-col gap-y-2 text-error">
        {descriptionValidationMessage && description.length > 0 && (
          <span>{descriptionValidationMessage}</span>
        )}
      </div>
      <FormElementWrapper label={t("configureSession.durationPrompt")}>
        <SelectDuration
          choices={DURATION_CHOICES_LIMITED}
          classNames={["w-half"]}
          value={duration}
          onChange={onSetDuration}
        />
      </FormElementWrapper>
    </>
  );
}
