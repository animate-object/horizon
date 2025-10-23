export const updateQuery = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  });

  history.pushState(
    null,
    "",
    `${window.location.pathname}?${searchParams.toString()}${
      window.location.hash
    }`
  );
};
