export const updateQuery = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  history.pushState(
    null,
    "",
    `${window.location.pathname}?${searchParams.toString()}${
      window.location.hash
    }`
  );
};
