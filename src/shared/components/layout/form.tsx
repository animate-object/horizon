export function FormElementWrapper({
  label,
  children,
}: React.PropsWithChildren & { label: React.ReactNode }) {
  return (
    <fieldset className="fieldset">
      <div className="mb-1 w-full">
        {typeof label === "string" && (
          <legend className="text-sm">{label}</legend>
        )}
        {typeof label !== "string" && label}
      </div>
      {children}
    </fieldset>
  );
}
