import {
  computeSessionState,
  SessionConfiguration,
} from "@/shared/lib/session";
import Button from "@/shared/components/design/Button";
import { MessageBuilder } from "@/shared/lib/messages";
import StopIcon from "@/shared/components/icons/StopIcon";
import { useTranslation } from "react-i18next";

interface Props {
  session?: SessionConfiguration;
  condensed?: boolean;
}

export function SessionActions({ session, condensed }: Props) {
  const { t } = useTranslation();
  const state = computeSessionState(session);
  if (state !== "active") return;

  const handleEndSession = async () => {
    const response = await chrome.runtime.sendMessage(
      MessageBuilder.endSession()
    );
    if (response?.type === "task-complete") {
      if (!window.location.href.endsWith("/src/pages/landing.html")) {
        window.location.href = "/src/pages/landing.html";
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <>
      <Button
        small={condensed}
        soft
        color="destructive"
        onClick={handleEndSession}
      >
        <StopIcon /> {t("common.endSession")}
      </Button>
    </>
  );
}
