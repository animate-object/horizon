import clsx from "clsx";

interface Props {
  value: number | "not-selected";
  onChange: (value: number | "not-selected") => void;
  choices?: number[];
  classNames?: string[];
}

export const DURATION_CHOICES = [1, 5, 10, 20, 30, 60, 90, 120];
export const DURATION_CHOICES_LIMITED = [1, 5, 10, 20, 30];

const label = (minutes: number) => {
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
};

const NO_CLASSES: string[] = [];

export function SelectDuration({
  value,
  onChange,
  choices = DURATION_CHOICES,
  classNames = NO_CLASSES,
}: Props) {
  return (
    <select
      className={clsx("select", ...classNames)}
      value={value}
      onChange={(evt) => {
        const value = evt.currentTarget.value;
        if (value === "not-selected") {
          onChange(value);
        }
        onChange(parseInt(value));
      }}
    >
      <option value="not-selected">--</option>
      {choices.map((minutes) => (
        <option key={minutes} value={minutes.toString()}>
          {label(minutes)}
        </option>
      ))}
    </select>
  );
}
