import Layout from "@/shared/components/design/Layout";
import Paper from "@/shared/components/design/Paper";
import Root from "@/shared/components/design/Theme";
import DevPanel from "@/shared/components/dev/DevPanel";
import { ActiveSession } from "@/shared/components/session-views/ActiveSession";
import { ConfigureSession } from "@/shared/components/session-views/ConfigureSession";
import { SessionComplete } from "@/shared/components/session-views/SessionComplete";
import { useSession } from "@/shared/hooks/useSession";
import { useIsBrowserTabActive } from "@/shared/hooks/useTabActive";
import { MessageBuilder } from "@/shared/lib/messages";
import { computeSessionState, SessionState } from "@/shared/lib/session";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";

type AppState = SessionState;

const SessionPages: Record<AppState, React.ReactNode> = {
  configure: <ConfigureSession />,
  active: <ActiveSession />,
  complete: <SessionComplete />,
};

function Landing() {
  const { session } = useSession();
  const { isTabVisible, lastTabActiveTime } = useIsBrowserTabActive();
  const sessionState = useMemo(() => computeSessionState(session), [session]);

  useEffect(() => {
    if (isTabVisible) {
      chrome.runtime.sendMessage(MessageBuilder.landingViewed());
    }
  }, [isTabVisible, lastTabActiveTime]);

  const appState = useMemo(() => {
    // TODO combine with break state
    return sessionState;
  }, [
    sessionState,
    // TODO - get breakState
  ]);

  const page = SessionPages[appState];

  return (
    <Root>
      <Layout>
        <Paper>{page}</Paper>
      </Layout>
      <DevPanel />
    </Root>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Landing />);
