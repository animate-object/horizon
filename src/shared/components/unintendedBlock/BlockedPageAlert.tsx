import { useCallback, useMemo, useState } from "react";
import Button from "../design/Button";
import Text from "../design/Text";
import { UnclickableLinKText } from "./UnclickableLinkText";
import { MessageBuilder } from "@/shared/lib/messages";
import { ToolLoader } from "@/shared/lib/datastore";
import { useSession } from "@/shared/hooks/useSession";
import { MAX_IN_SESSION_EXEMPTIONS } from "@/shared/lib/rules";

interface Props {
  title: string;
  blockDetail: React.ReactNode;
  pageToAllow: string;
  pageToNavigateTo: string;
}

export function BlockedPageAlert({
  title,
  blockDetail,
  pageToAllow,
  pageToNavigateTo,
}: Props) {
  const [hide, setHide] = useState(false);

  const { session } = useSession();
  const remainingExemptions = useMemo(() => {
    return MAX_IN_SESSION_EXEMPTIONS - (session?.usedExemptions ?? 0);
  }, [session?.usedExemptions]);

  const handleAllowAndNavigate = useCallback(async () => {
    await chrome.runtime.sendMessage(MessageBuilder.addExemption(pageToAllow));
    window.location.href = pageToNavigateTo;
  }, [pageToAllow, pageToNavigateTo]);

  const handleCreateTool = useCallback(async () => {
    const loader = new ToolLoader();
    await loader.upsertMany([{ url: pageToAllow }]);
    handleAllowAndNavigate();
  }, [pageToAllow]);

  if (hide) return;

  return (
    <div role="alert" className="alert alert-soft alert-horizontal flex">
      <div className="flex flex-col gap-y-2 w-full">
        <div className="flex flex-row justify-between">
          <Text.SubHeader>{title}</Text.SubHeader>
          <Button
            onClick={() => setHide(true)}
            color="secondary"
            soft
            circle
            small
          >
            x
          </Button>
        </div>
        {blockDetail}
        {remainingExemptions > 0 && (
          <div className="space-x-1">
            Would you like to add&nbsp;
            <UnclickableLinKText link={pageToAllow} />
            &nbsp;to your session? You can do this {remainingExemptions} more
            times this session.
          </div>
        )}
        {remainingExemptions <= 0 && (
          <>You have no remaining exemptions for this session</>
        )}
        <div className="flex flex-row justify-end gap-2 w-full">
          {remainingExemptions > 0 && (
            <>
              <Button color="primary" small onClick={handleAllowAndNavigate}>
                Allow this time
              </Button>
              <Button color="primary" soft small onClick={handleCreateTool}>
                Save tool and allow
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
