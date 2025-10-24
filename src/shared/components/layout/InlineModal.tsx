import Button from "../design/Button";
import Text from "../design/Text";
import BackIcon from "../icons/BackIcon";

interface Props extends React.PropsWithChildren {
  onBack: VoidFunction;
  title: string;
  actions?: React.ReactNode;
}

export function InlineModal({ onBack, actions, title, children }: Props) {
  return (
    <div className="flex flex-col h-full justify-between items-start">
      <div className="flex flex-row w-full justify-center items-center">
        <Button
          role="button"
          onClick={onBack}
          style={{ left: "0.5rem", position: "absolute" }}
          color="secondary"
          ghost
          circle
        >
          <BackIcon />
        </Button>
        <Text.Header>{title}</Text.Header>
      </div>
      <div className="h-full w-full flex flex-col" style={{ flexGrow: 1 }}>
        {children}
      </div>
      {actions && (
        <div className="w-full" style={{ flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
