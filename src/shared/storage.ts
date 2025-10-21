enum StorageKeys {
  ActiveSessionConfig = "active-session-config",
  HideDevPanelUntil = "hide-dev-panel-until",
  Datastore = "datastore",
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
