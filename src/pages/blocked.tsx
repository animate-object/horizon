import Button from "@/shared/components/design/Button";
import Layout from "@/shared/components/design/Layout";
import Paper from "@/shared/components/design/Paper";
import Text from "@/shared/components/design/Text";
import Root from "@/shared/components/design/Theme";
import DevPanel from "@/shared/components/dev/DevPanel";
import { SessionActions } from "@/shared/components/session-views/SessionActions";
import { SessionDetails } from "@/shared/components/session-views/SessionDetails";
import { useSession } from "@/shared/hooks/useSession";
import { initI18n } from "@/shared/lib/i18n";
import { clearSessionState, computeSessionState } from "@/shared/lib/session";
import { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";

initI18n();

function BlockedPage() {
  const { session } = useSession();
  const { t } = useTranslation();
  const sessionState = useMemo(() => computeSessionState(session), [session]);
  return (
    <Root>
      <Layout overlay={<DevPanel />}>
        <Paper>
          <div className="flex flex-col gap-4">
            <Text.Header>{t("blocked.thisPageWasBlocked")}</Text.Header>
            {sessionState !== "active" && (
              <div>
                <Button
                  onClick={() => {
                    clearSessionState();
                    window.location.href = "/src/pages/landing.html";
                  }}
                  color="primary"
                  ghost
                >
                  {t("common.startANewSession")}
                </Button>
              </div>
            )}
            {sessionState === "active" && (
              <div className="flex flex-col gap-2">
                <Text.Body light>{t("blocked.reminder")}</Text.Body>
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
