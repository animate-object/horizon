import { Break } from "../lib/breaks";
import { StorageKeys } from "../lib/storage";
import { useStorageSlice } from "./useStorageSlice";

interface UseBreakReturn {
  breakData: Break | undefined;
  lastChange: string;
}

export function useBreak(): UseBreakReturn {
  const { data: breakData, lastChange } = useStorageSlice<Break>(
    StorageKeys.Break
  );

  return { breakData, lastChange };
}
