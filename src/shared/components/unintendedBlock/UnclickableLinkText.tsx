interface Props {
  link: string;
}

export function UnclickableLinKText({ link }: Props) {
  return <span className="text-primary">{link}</span>;
}
