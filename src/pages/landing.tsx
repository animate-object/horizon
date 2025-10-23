import Layout from "@/shared/components/design/Layout";
import Paper from "@/shared/components/design/Paper";
import Root from "@/shared/components/design/Theme";
import DevPanel from "@/shared/components/dev/DevPanel";
import { ActiveSession } from "@/shared/components/session-views/ActiveSession";
import { ConfigureSession } from "@/shared/components/session-views/ConfigureSession";
import { SessionComplete } from "@/shared/components/session-views/SessionComplete";
import { useIsBrowserTabActive } from "@/shared/hooks/useTabActive";
import { MessageBuilder } from "@/shared/messages";
import {
  computeSessionState,
  SessionConfiguration,
  SessionState,
} from "@/shared/session";
import { Storage } from "@/shared/storage";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const SessionPages: Record<SessionState, React.ReactNode> = {
  configure: <ConfigureSession />,
  active: <ActiveSession />,
  complete: <SessionComplete />,
};

type OnChangeListener = Parameters<
  typeof chrome.storage.onChanged.addListener
>[0];

function Landing() {
  const [sessionState, setSessionState] = useState<SessionState>("configure");
  const { isTabVisible, lastTabActiveTime } = useIsBrowserTabActive();
  useEffect(() => {
    if (isTabVisible) {
      chrome.runtime.sendMessage(MessageBuilder.landingViewed());
    }
  }, [isTabVisible, lastTabActiveTime]);

  useEffect(() => {
    Storage.get<SessionConfiguration | undefined>(
      Storage.keys.ActiveSessionConfig,
      undefined
    ).then((config) => {
      console.log("initial state", config);
      setSessionState(computeSessionState(config));
    });
  }, []);

  useEffect(() => {
    const listener: OnChangeListener = (changes, area) => {
      if (area !== "local") return;
      const activeSessionConfig = changes[Storage.keys.ActiveSessionConfig];
      if (activeSessionConfig?.newValue) {
        setSessionState(computeSessionState(activeSessionConfig.newValue));
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const page = SessionPages[sessionState];

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
