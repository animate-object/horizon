import Text from "../design/Text";

export function FormElementWrapper({
  label,
  children,
}: React.PropsWithChildren & { label: string }) {
  return (
    <fieldset className="fieldset">
      <legend className="text-sm">{label}</legend>
      {children}
    </fieldset>
  );
}

export function FormContainer({
  children,
  title,
}: React.PropsWithChildren & { title: string }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text.SubHeader>{title}</Text.SubHeader>
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
