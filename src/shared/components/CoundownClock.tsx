import clsx from "clsx";

function leftPadZeros(value: number | string, length: number): string {
  return String(value).padStart(length, "0");
}

interface Props {
  timeRemainingSeconds: number;
  color?: string;
  textColor?: string;
}

export function CountdownClock({
  timeRemainingSeconds,
  color = "bg-green-100",
  textColor = "text-green-950",
}: Props) {
  const seconds = leftPadZeros((timeRemainingSeconds % 60).toFixed(0), 2);

  return (
    <code className={clsx("py-1 px-4", color, textColor)}>
      {Math.floor(parseInt(timeRemainingSeconds.toFixed(0)) / 60)}:
      {seconds === "60" ? "00" : seconds}
    </code>
  );
}
