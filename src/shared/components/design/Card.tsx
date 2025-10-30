import clsx from "clsx";

interface Props {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  extraClassNames?: string;
  styles?: React.CSSProperties;
  onClick?: VoidFunction;
}

export function Card({
  title,
  content,
  actions,
  extraClassNames,
  styles,
  onClick,
}: Props) {
  return (
    <div
      className={clsx(
        "card card-border bg-base-100 p-2 w-40 h-24",
        extraClassNames,
        {
          "cursor-pointer": !!onClick,
        }
      )}
      style={{ flexShrink: 0, ...styles }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="card-body flex flex-col justify-between p-0">
        <h2 className="card-title text-sm">{title}</h2>
        {content}
        <div className="card-actions justify-end">{actions}</div>
      </div>
    </div>
  );
}
