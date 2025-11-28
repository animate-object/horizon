import { SessionConfiguration } from "@/shared/lib/session";
import Text from "@/shared/components/design/Text";
import { useTranslation } from "react-i18next";

export function SessionDetails({
  allowedToolUrls,
  taskDescription,
  mode,
}: SessionConfiguration) {
  const { t } = useTranslation();
  if (mode === "free") {
    return (
      <div className="flex flex-col gap-2">
        <Text.Header>{t("common.freeBrowsing")}</Text.Header>
        <Text.Body light>{t("activeSession.freeBrowsingMessage")}</Text.Body>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Text.Header>{t("activeSession.yourTask")}</Text.Header>
      <Text.Body light>{taskDescription}</Text.Body>
      <Text.SubHeader>{t("activeSession.yourTools")}</Text.SubHeader>
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
