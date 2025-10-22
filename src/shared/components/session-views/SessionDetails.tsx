import { SessionConfiguration } from "@/shared/session";
import Text from "../design/Text";

export function SessionDetails({
  allowedToolUrls,
  taskDescription,
  mode,
}: SessionConfiguration) {
  if (mode === "free") {
    return (
      <div className="flex flex-col gap-2">
        <Text.SubHeader>Free browsing</Text.SubHeader>
        <Text.Body light>Do whatever! Anything goes.</Text.Body>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Text.SubHeader>Your task</Text.SubHeader>
      <Text.Body light>{taskDescription}</Text.Body>
      <Text.SubHeader>You can use these tools:</Text.SubHeader>
      <ul className="list bg-base-300 shadow-xs">
        {allowedToolUrls.map((tool) => (
          <a
            key={tool}
            className="link"
            target="_blank"
            href={`https://${tool}`}
          >
            <li className="list-row" key={tool}>
              {tool}
            </li>
          </a>
        ))}
      </ul>
    </div>
  );
}
