import { useEffect, useState, useCallback } from "react";

export function useIsBrowserTabActive(): {
  isTabVisible: boolean;
  lastTabActiveTime: number;
} {
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [lastTabActiveTime, setLastTabActiveTime] = useState<number>(
    Date.now()
  );

  const handleVisibilityChange = useCallback(() => {
    console.debug("Tab switch");
    setIsTabVisible(document.visibilityState === "visible");
    if (document.visibilityState === "visible") {
      console.debug("Tab switch");

      setLastTabActiveTime(Date.now());
    }
  }, []);

  const handleWindowFocusChange = useCallback((focused: boolean) => {
    setIsTabVisible(focused);
    if (focused) {
      console.debug("Window focused");

      setLastTabActiveTime(Date.now());
    }
  }, []);

  const focusWindow = useCallback(
    () => handleWindowFocusChange(true),
    [handleWindowFocusChange]
  );
  const blurWindow = useCallback(
    () => handleWindowFocusChange(true),
    [handleWindowFocusChange]
  );

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", focusWindow);
    window.addEventListener("blur", blurWindow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", focusWindow);
      window.removeEventListener("blur", blurWindow);
    };
  }, [handleVisibilityChange]);

  return { isTabVisible, lastTabActiveTime };
}
