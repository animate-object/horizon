import clsx from "clsx";

type TextColor = "primary" | "body" | "secondary" | "light";

interface TextProps extends React.PropsWithChildren {
  light?: boolean;
}

const textClass = (base: string, opts: { light?: boolean }): string => {
  return clsx(base, { "font-light": opts.light });
};

const Header = ({ children, ...opts }: TextProps) => (
  <h1 className={textClass("text-xl", opts)}>{children}</h1>
);
const SubHeader = ({ children, ...opts }: TextProps) => (
  <h2 className={textClass("text-lg", opts)}>{children}</h2>
);
const SectionHeader = ({ children, ...opts }: TextProps) => (
  <h3 className={textClass("text-md", opts)}>{children}</h3>
);

const Body = ({ children, ...opts }: TextProps) => (
  <p className={textClass("text-sm", opts)}>{children}</p>
);

const Text = {
  Header,
  SubHeader,
  SectionHeader,
  Body,
};

export default Text;
