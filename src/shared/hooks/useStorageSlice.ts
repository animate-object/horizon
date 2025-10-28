import { useCallback, useEffect, useState } from "react";
import { Storage, StorageKeys } from "../lib/storage";

type OnChangeListener = Parameters<
  typeof chrome.storage.onChanged.addListener
>[0];

interface UseStorageSliceReturn<T> {
  data: T | undefined;
  lastChange: string;
}

type StorageSliceValidator<T> = (data: unknown) => data is T;

export function useStorageSlice<T>(
  key: StorageKeys,
  validate?: StorageSliceValidator<T>
): UseStorageSliceReturn<T> {
  const [lastChange, setLastChange] = useState(new Date().toISOString());
  const [data, setData] = useState<T | undefined>();

  // respect a validator if provided
  const setValidData = useCallback(
    (data: unknown) => {
      if (data == null) {
        setData(undefined);
        return;
      }
      if (validate) {
        if (validate(data)) {
          setData(data);
        } else {
          return;
        }
      } else {
        setData(data as T);
      }
    },
    [validate, setData]
  );

  useEffect(() => {
    const listener: OnChangeListener = (changes, area) => {
      if (area !== "local") return;
      const data = changes[key]?.newValue;
      if (data) {
        setValidData(data);
        setLastChange(new Date().toISOString());
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    Storage.get(key, undefined).then((data) => {
      setValidData(data);
    });
  }, []);

  return { data, lastChange };
}
