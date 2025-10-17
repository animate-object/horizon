type TextColor = "primary" | "body" | "secondary" | "muted";

interface TextProps extends React.PropsWithChildren {
  color?: TextColor;
}

const TEXT_COLOR_CSS: Record<TextColor, string> = {
  primary: "var(--color-ink)",
  body: "var(--color-gray-900)",
  secondary: "var(--color-gray-700)",
  muted: "var(--color-gray-500)",
};

const Header = ({ color = "primary", ...rest }: TextProps) => (
  <h1 className="text-xl" {...rest} />
);
const SubHeader = ({ color = "primary", ...rest }: TextProps) => (
  <h2 className="text-lg" {...rest} />
);
const SectionHeader = ({ color = "secondary", ...rest }: TextProps) => (
  <h3 className="text-md" {...rest} />
);

const Body = ({ color = "body", ...rest }: TextProps) => (
  <p className="text-sm" {...rest} />
);

const Text = {
  Header,
  SubHeader,
  SectionHeader,
  Body,
};

export default Text;
