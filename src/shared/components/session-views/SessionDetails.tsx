import { SessionConfiguration } from "@/shared/lib/session";
import Text from "@/shared/components/design/Text";
import { useTranslation } from "react-i18next";

function SessionTools({
  allowedToolUrls,
}: Pick<SessionConfiguration, "allowedToolUrls">) {
  const { t } = useTranslation();
  return (
    <>
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
    </>
  );
}

export function SessionDetails({
  allowedToolUrls,
  taskDescription,
  mode,
}: SessionConfiguration) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <Text.Header>{t("activeSession.yourTask")}</Text.Header>
      <Text.Body light>{taskDescription}</Text.Body>
      {mode === "free" && (
        <>
          <Text.SubHeader>{t("common.freeBrowsing")}</Text.SubHeader>
          <Text.Body light>{t("activeSession.freeBrowsingMessage")}</Text.Body>
        </>
      )}
      {mode === "standard" && (
        <SessionTools allowedToolUrls={allowedToolUrls} />
      )}
    </div>
  );
}
