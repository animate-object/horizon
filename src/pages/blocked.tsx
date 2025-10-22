import Layout from "@/shared/components/design/Layout";
import Paper from "@/shared/components/design/Paper";
import Text from "@/shared/components/design/Text";
import Root from "@/shared/components/design/Theme";
import DevPanel from "@/shared/components/dev/DevPanel";
import { SessionActions } from "@/shared/components/session-views/SessionActions";
import { SessionDetails } from "@/shared/components/session-views/SessionDetails";
import { useSession } from "@/shared/hooks/useSession";
import { computeSessionState } from "@/shared/session";
import { useMemo } from "react";
import ReactDOM from "react-dom/client";

function BlockedPage() {
  const { session } = useSession();
  const sessionState = useMemo(() => computeSessionState(session), [session]);
  return (
    <Root>
      <Layout overlay={<DevPanel />}>
        <Paper>
          <div className="flex flex-col gap-4">
            <Text.Header>This page was blocked</Text.Header>
            {sessionState !== "active" && (
              <Text.Body>
                <a href="/src/pages/landing.html">Start new session</a>
              </Text.Body>
            )}
            {sessionState === "active" && (
              <div className="flex flex-col gap-2">
                <Text.Body light>
                  Here's a reminder about what you set out to do:
                </Text.Body>
                {session && <SessionDetails {...session} />}
              </div>
            )}
            <div>
              <SessionActions session={session} />
            </div>
          </div>
        </Paper>
      </Layout>
    </Root>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<BlockedPage />);
