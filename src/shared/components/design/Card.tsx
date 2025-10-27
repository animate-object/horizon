interface Props {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Card({ title, content, actions }: Props) {
  return (
    <div className="card card-border bg-base-100 p-2 w-1/3">
      <div className="card-body p-0">
        <h2 className="card-title text-sm">{title}</h2>
        {content}
        <div className="card-actions justify-end">{actions}</div>
      </div>
    </div>
  );
}
