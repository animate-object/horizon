import { useMemo } from "react";

type ButtonColor = "primary" | "secondary" | "destructive";

const classForColor = (color: ButtonColor) => {
  switch (color) {
    case "primary":
      return "btn-primary";
    case "destructive":
      return "btn-error";
    default:
      return "btn-secondary";
  }
};

interface Props extends Omit<React.ComponentProps<"button">, "className"> {
  color?: ButtonColor;
  soft?: boolean;
  circle?: boolean;
}

export default function Button({ color, circle, soft, ...rest }: Props) {
  //   const className =
  //     "btn " + classForColor(color ?? "primary") + (circle ? " btn-circle" : "");
  const className = useMemo(() => {
    let cls = "btn ";
    cls += classForColor(color ?? "primary") + " ";
    if (circle) cls += "btn-circle ";
    if (soft) cls += "btn-soft ";
    return cls;
  }, [color, circle, soft]);

  return <button className={className} {...rest} />;
}
