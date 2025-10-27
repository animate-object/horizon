const TOOL_DOMAIN_REGEX = /^(?:[\w@-]+\.)+[\w-]{2,}(?:\/[\w@-]*)*$/;

export const isValidToolUrl = (toolUrl: string): boolean => {
  return TOOL_DOMAIN_REGEX.test(toolUrl);
};

export const validateTools = (
  toolUrls: string[]
): {
  empty: boolean;
  allValid: boolean;
} => {
  const toolsEmpty = !toolUrls.some((tool) => tool !== "");
  const allToolsValid = toolUrls.every(isValidToolUrl);

  return {
    empty: toolsEmpty,
    allValid: allToolsValid,
  };
};
