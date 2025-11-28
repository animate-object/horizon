import clsx from "clsx";
import { useTranslation } from "react-i18next";

type NotSelected = "not-selected";
export type DurationOption = number | NotSelected;

interface Props {
  value: DurationOption;
  onChange: (value: DurationOption) => void;
  choices?: number[];
  classNames?: string[];
}

export const DURATION_CHOICES = [1, 5, 10, 20, 30, 60, 90, 120, 240];
export const DURATION_CHOICES_LIMITED = [1, 5, 10, 20, 30];

const label = (
  minutes: number,
  { unit, unitPl }: { unit: string; unitPl: string }
) => {
  // if (minutes === 1) return "1 minute";
  if (minutes === 1) return `1 ${unit}`;
  return `${minutes} ${unitPl}`;
};

const NO_CLASSES: string[] = [];

export function SelectDuration({
  value,
  onChange,
  choices = DURATION_CHOICES,
  classNames = NO_CLASSES,
}: Props) {
  const { t } = useTranslation();
  const timeUnit = { unit: t("minute"), unitPl: t("minutes") };
  return (
    <select
      className={clsx("select", ...classNames)}
      value={value}
      onChange={(evt) => {
        const value = evt.currentTarget.value;
        if (value === "not-selected") {
          onChange(value);
        } else {
          onChange(parseInt(value));
        }
      }}
    >
      <option value="not-selected">--</option>
      {choices.map((minutes) => (
        <option key={minutes} value={minutes.toString()}>
          {label(minutes, timeUnit)}
        </option>
      ))}
    </select>
  );
}
