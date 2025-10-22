import { useState, useEffect } from "react";

interface LocationState {
  path: string;
  search: string;
  hash: string;
}

const getLocationState = (): LocationState => ({
  path: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
});

export function useLocation(): LocationState {
  const [location, setLocation] = useState<LocationState>(getLocationState());

  useEffect(() => {
    const handleLocationChange = () => {
      setLocation(getLocationState());
    };

    window.addEventListener("popstate", handleLocationChange);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      handleLocationChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return location;
}
