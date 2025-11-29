import { clearSessionState } from "@/shared/lib/session";
import Button from "@/shared/components/design/Button";
import Text from "@/shared/components/design/Text";
import { useTranslation } from "react-i18next";

export function SessionComplete() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-y-2">
      <Text.Header>{t("postSession.sessionComplete")}</Text.Header>
      <Text.Body>{t("postSession.whenYoureReady")}</Text.Body>
      <div className="w-full flex justify-end">
        <Button
          onClick={() => {
            clearSessionState();
            window.location.reload();
          }}
        >
          {t("common.newSession")}
        </Button>
      </div>
    </div>
  );
}
