export function JsonView({ data }: { data: object }) {
  return (
    <div className="bg-indigo-950 overflow-scroll p-1">
      <code
        style={{
          color: "var(--color-base-100)",
        }}
      >
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </code>
    </div>
  );
}
