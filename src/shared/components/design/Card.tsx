interface Props {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Card({ title, content, actions }: Props) {
  return (
    <div className="card card-border bg-base-100 w-96">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {content}
        <div className="card-actions justify-end">{actions}</div>
      </div>
    </div>
  );
}
