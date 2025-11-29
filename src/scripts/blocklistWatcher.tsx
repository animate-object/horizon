import { BlockCountdown } from "@/shared/components/BlockCountdown";
import { prefixLogger } from "@/shared/lib/log";
import { DecisionResponse, MessageBuilder } from "@/shared/lib/messages";
import ReactDOM from "react-dom/client";

const logger = prefixLogger("blocklistWatcher: ");

logger.debug("Block list watcher is active");

async function shouldPageBeBlocked(): Promise<boolean> {
  logger.debug("shouldPageBeBlocked");

  const decision: DecisionResponse = await chrome.runtime.sendMessage(
    MessageBuilder.testBlockList(window.location.href)
  );

  logger.debug(
    `Decision response ${window.location.href} = ${
      decision?.decision == null
        ? "INVALID RESPONSE"
        : decision.decision
        ? "BLOCKED"
        : "ALLOWED"
    }`
  );
  return decision?.decision ?? false;
}

const REACT_ROOT_ID = "horizon-block-countdown";

function mountBlockWarning() {
  const reactRoot = document.createElement("div");
  reactRoot.id = REACT_ROOT_ID;
  document.body.appendChild(reactRoot);
  reactRoot.attachShadow({ mode: "open" });

  ReactDOM.createRoot(reactRoot.shadowRoot!).render(<BlockCountdown />);
}

async function handlePageFocusedOrActive() {
  logger.debug("handlePageFocusedOrActive");

  if (document.getElementById(REACT_ROOT_ID) != null) {
    logger.info("Already blocked");
    return;
  }
  if (await shouldPageBeBlocked()) {
    mountBlockWarning();
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    handlePageFocusedOrActive();
  }
});

window.addEventListener("focus", handlePageFocusedOrActive);
