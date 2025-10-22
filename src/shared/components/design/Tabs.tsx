import clsx from "clsx";

interface Props {
  activeTabId: string;
  tabs: Array<{ id: string; label: string }>;
  onChange: (activeTabId: string) => void;
}

export function Tabs({ activeTabId, tabs, onChange }: Props) {
  return (
    <div role="tablist" className="tabs tabs-border">
      {tabs.map(({ id, label }) => (
        <a
          key={id}
          onClick={() => onChange(id)}
          role="tab"
          className={clsx("tab", { "tab-active": activeTabId === id })}
        >
          {label}
        </a>
      ))}
    </div>
  );
}
