import { computeSessionState, SessionConfiguration } from "@/shared/session";
import Button from "../design/Button";
import { MessageBuilder } from "@/shared/messages";

export function SessionActions({
  session,
}: {
  session?: SessionConfiguration;
}) {
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
      <Button soft color="destructive" onClick={handleEndSession}>
        End session
      </Button>
    </>
  );
}
