interface Props extends React.PropsWithChildren {
  overlay?: React.ReactNode;
}

export default function Layout({ children: content, overlay }: Props) {
  return (
    <>
      <div className="layout bg-base-200">
        <div className="content">{content}</div>
      </div>
      {overlay}
    </>
  );
}
