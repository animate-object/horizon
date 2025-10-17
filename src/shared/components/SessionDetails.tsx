import { SessionConfiguration } from "../session";
import Text from "./design/Text";

export function SessionDetails({
  allowedToolUrls,
  taskDescription,
}: SessionConfiguration) {
  return (
    <div className="flex flex-col gap-2">
      <Text.SubHeader>Your task</Text.SubHeader>
      <Text.Body>{taskDescription}</Text.Body>
      <Text.SubHeader>You can use these tools:</Text.SubHeader>
      <ul className="list bg-base-300 shadow-xs">
        {allowedToolUrls.map((tool) => (
          <a className="link" target="_blank" href={`https://${tool}`}>
            <li className="list-row" key={tool}>
              {tool}
            </li>
          </a>
        ))}
      </ul>
    </div>
  );
}
