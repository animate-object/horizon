import Button from "@/shared/components/design/Button";
import Paper from "@/shared/components/design/Paper";
import Text from "@/shared/components/design/Text";
import Root from "@/shared/components/design/Theme";
import { ActiveSession } from "@/shared/components/session-views/ActiveSession";
import { BreakView } from "@/shared/components/session-views/BreakView";
import { useBreak } from "@/shared/hooks/useBreak";
import { useSession } from "@/shared/hooks/useSession";
import { MessageBuilder } from "@/shared/lib/messages";
import { clearSessionState, computeSessionState } from "@/shared/lib/session";
import { useMemo } from "react";
import ReactDOM from "react-dom/client";

function NewSessionPopup() {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-baseline">
        <Text.Header>Horizon</Text.Header>
        <Text.Header light>&nbsp;-&nbsp;Intentional browsing</Text.Header>
      </div>
      <Text.Body light>To get started, begin a new session</Text.Body>
      <Button
        onClick={() => {
          clearSessionState();
          chrome.runtime.sendMessage(
            MessageBuilder.openExtensionView("landing")
          );
        }}
      >
        New session
      </Button>
    </div>
  );
}

function PopupSessionDetail() {
  return <ActiveSession condensed />;
}
function Popup() {
  const {
    standard: { status: breakStatus },
  } = useBreak();
  const { session } = useSession();
  const sessionState = useMemo(() => computeSessionState(session), [session]);

  const popupView: "break" | "active-session" | "new-session" = useMemo(() => {
    if (sessionState === "active") return "active-session";
    if (breakStatus === "active") return "break";
    return "new-session";
  }, [breakStatus, sessionState]);

  return (
    <Root>
      <div className="min-w-96">
        <Paper>
          {popupView === "break" && <BreakView />}
          {popupView === "active-session" && <PopupSessionDetail />}
          {popupView === "new-session" && <NewSessionPopup />}
        </Paper>
      </div>
    </Root>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);
