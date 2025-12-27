export enum StorageKeys {
  // --- App state keys ---
  // the in progress browsing session
  ActiveSessionConfig = "active-session-config",
  // the current/next/last break being enforced between sessions
  Break = "break",
  // used to surface UI around accidental blocks
  RecentAutoBlockedPages = "recentAutoBlockedPages",
  // dev facing
  HideDevPanelUntil = "hide-dev-panel-until",
  // -- Datastore keys ---
  // previously used site / webapp urls to power a typeahead
  DatastoreTools = "datastore.tools",
  // user defined collections for sites that are ferquently used together
  DatastoreToolsets = "datastore.toolsets",
  // the last 50 user sessions - anticipated future use for features like
  // repeat my last session or create toolset from past session
  DatastorePastSessions = "datastore.pastSessions",
}

const set = (
  key: StorageKeys,
  data: string | object | number | undefined
): Promise<void> => {
  return chrome.storage.local.set({ [key]: data });
};

const get = async <T>(key: StorageKeys, default_?: T): Promise<T> => {
  const result = await chrome.storage.local.get(key);
  const data = result?.[key];
  return data ?? default_;
};

const clear = (key: StorageKeys): Promise<void> => {
  return chrome.storage.local.remove(key.toString());
};

export const Storage = {
  set,
  get,
  clear,
  keys: StorageKeys,
};
