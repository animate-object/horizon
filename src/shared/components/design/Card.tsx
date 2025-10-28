import clsx from "clsx";

interface Props {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  extraClassNames?: string;
  styles?: React.CSSProperties;
}

export function Card({
  title,
  content,
  actions,
  extraClassNames,
  styles,
}: Props) {
  return (
    <div
      className={clsx("card card-border bg-base-100 p-2 w-32", extraClassNames)}
      style={{ flexShrink: 0, ...styles }}
    >
      <div className="card-body p-0">
        <h2 className="card-title text-sm">{title}</h2>
        {content}
        <div className="card-actions justify-end">{actions}</div>
      </div>
    </div>
  );
}
