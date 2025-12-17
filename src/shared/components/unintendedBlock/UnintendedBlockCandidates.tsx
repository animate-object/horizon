import { useStorageSlice } from "@/shared/hooks/useStorageSlice";
import { StorageKeys } from "@/shared/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { secondsAgo } from "@/shared/lib/time";
import { shouldPageBeBlocked } from "@/scripts/blocklistWatcher";
import { BlockedPageAlert } from "./BlockedPageAlert";
import { stripPathFromUrl } from "@/shared/lib/tool";
import { UnclickableLinKText } from "./UnclickableLinkText";
import { useSession } from "@/shared/hooks/useSession";
import { computeSessionState } from "@/shared/lib/session";

type TransitionQualifier =
  | "server_redirect"
  | "client_redirect"
  | "from_address_bar"
  | "forward_back";
type TransitionType =
  | "link" // we care about this one
  | "typed"
  | "auto_bookmark"
  | "auto_subframe"
  | "manual_subframe"
  | "generated"
  | "start_page"
  | "form_submit"
  | "reload"
  | "keyword"
  | "keyword_generated";

interface BlockData {
  autoRedirect: boolean;
  tabId: number;
  timestamp: number;
  transitionQualifiers: TransitionQualifier[];
  transitionType: TransitionType;
  url: string;
}

export function LikelyUnexpectedRedirect({
  blockData,
}: {
  blockData: BlockData;
}) {
  const [redirectedTo, setRedirectTo] = useState<
    { state: "loading" } | { state: "loaded"; url: string } | { state: "err" }
  >({ state: "loading" });
  useEffect(() => {
    fetch(blockData.url)
      .then((response) => {
        if (response.url !== blockData.url) {
          setRedirectTo({
            state: "loaded",
            url: response.url,
          });
        } else {
          console.error("Unxpected same redirect", response);
          setRedirectTo({ state: "err" });
        }
      })
      .catch((err) => {
        console.error(err);
        setRedirectTo({ state: "err" });
      });
  }, [setRedirectTo]);

  if (redirectedTo.state === "loaded") {
    return (
      <BlockedPageAlert
        title="It looks like you were redirected"
        blockDetail={
          <div className="space-x-1">
            <UnclickableLinKText link={blockData.url} />
            redirected you to <UnclickableLinKText link={redirectedTo.url} />
          </div>
        }
        pageToNavigateTo={redirectedTo.url}
        pageToAllow={stripPathFromUrl(redirectedTo.url)}
      />
    );
  }
}

export function LinkYouMightHaveClickedFromAnAllowedPage({
  blockData,
}: {
  blockData: BlockData;
}) {
  const { url } = blockData;

  return (
    <BlockedPageAlert
      title="It looks like you clicked a link"
      blockDetail={
        <div className="space-x-1">
          It looks like you tried to navigate to&nbsp;
          <UnclickableLinKText link={url} /> from an allowed page
        </div>
      }
      pageToNavigateTo={url}
      pageToAllow={stripPathFromUrl(url)}
    />
  );
}

export function AlertForBlockedPage({ blockData }: { blockData: BlockData }) {
  const [didWeExpectThisPageToBeBlocked, setBlockDecision] = useState<
    boolean | undefined
  >();
  useEffect(() => {
    shouldPageBeBlocked(blockData.url).then((data) => setBlockDecision(data));
  }, [blockData.url]);

  if (!didWeExpectThisPageToBeBlocked) {
    return <LikelyUnexpectedRedirect blockData={blockData} />;
  } else if (blockData.transitionType === "link") {
    return <LinkYouMightHaveClickedFromAnAllowedPage blockData={blockData} />;
  } else return null;
}

export function UnintendedBlockCandidates() {
  const { data } = useStorageSlice<BlockData[]>(
    StorageKeys.RecentAutoBlockedPages
  );

  const candidateCutOff = useMemo(() => secondsAgo(1), []);

  const filtered = useMemo(() => {
    return (data ?? [])?.filter((datum) => {
      return datum.timestamp > candidateCutOff;
    });
  }, [candidateCutOff, data]);

  const { session } = useSession();

  if (computeSessionState(session) !== "active") {
    return;
  }

  return (
    <>
      {filtered.map((data) => (
        <AlertForBlockedPage key={data.timestamp} blockData={data} />
      ))}
    </>
  );
}
