import Layout from "@/shared/components/design/layout";
import Paper from "@/shared/components/design/Paper";
import Text from "@/shared/components/design/Text";
import Root from "@/shared/components/design/Theme";
import DevPanel from "@/shared/components/dev/DevPanel";
import { SessionDetails } from "@/shared/components/SessionDetails";
import { useSession } from "@/shared/hooks/useSession";
import ReactDOM from "react-dom/client";

function BlockedPage() {
  const { session } = useSession();
  return (
    <Root>
      <Layout overlay={<DevPanel />}>
        <Paper>
          <Text.Header>This page was blocked</Text.Header>
          <div className="flex flex-col gap-2 mt-6">
            <Text.Body>
              Here's a reminder about what you set out to do:
            </Text.Body>
            {session && <SessionDetails {...session} />}
          </div>
        </Paper>
      </Layout>
    </Root>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<BlockedPage />);
