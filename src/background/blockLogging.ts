import { StorageKeys } from "@/shared/lib/storage";

const trackNavigation = () => {
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) {
      // Main frame only
      // Store the URL being navigated to
      chrome.storage.session.set({
        [`pending_${details.tabId}`]: details,
      });
    }
  });
};

const trackTransitions = () => {
  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0) {
      chrome.storage.session.set({
        [`transition_${details.tabId}`]: {
          ...details,
        },
      });
    }

    // Check if THIS navigation is to blocked page
    if (
      details.url.includes(chrome.runtime.getURL("/src/pages/blocked.html"))
    ) {
      chrome.storage.session.get(
        [`pending_${details.tabId}`, `transition_${details.tabId}`],
        (result) => {
          const blocked: chrome.webNavigation.WebNavigationParentedCallbackDetails =
            result[`pending_${details.tabId}`];
          const transition: chrome.webNavigation.WebNavigationTransitionCallbackDetails =
            result[`transition_${details.tabId}`];
          3;

          if (blocked && transition) {
            const wasAutoRedirect =
              transition.transitionQualifiers?.includes("server_redirect") ||
              transition.transitionQualifiers?.includes("client_redirect");

            // Store and send to blocked page...

            chrome.storage.local.get(
              [StorageKeys.RecentAutoBlockedPages],
              (data) => {
                const pastBlocks = Array.isArray(data.recentAutoBlockedPages)
                  ? [...data.recentAutoBlockedPages]
                  : [];
                const next = {
                  url: blocked.url,
                  tabId: details.tabId,
                  timestamp: blocked.timeStamp,
                  autoRedirect: wasAutoRedirect,
                  transitionType: transition.transitionType,
                  transitionQualifiers: transition.transitionQualifiers,
                  transition,
                };
                chrome.storage.local.set({
                  [StorageKeys.RecentAutoBlockedPages]: [
                    next,
                    ...pastBlocks,
                  ].slice(0, 5),
                });
              }
            );
          }
        }
      );
    }
  });
};

export const initTracking = () => {
  trackNavigation();
  trackTransitions();
};
