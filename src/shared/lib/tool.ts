const TOOL_DOMAIN_REGEX = /^(?:[\w@-]+\.)+[\w-]{2,}(?:\/[\w@-]*)*$/;

function isLocalhost(toolUrl: string) {
  return toolUrl.startsWith("localhost:") && toolUrl.indexOf(".") === -1;
}

export const isValidToolUrl = (toolUrl: string): boolean => {
  if (isLocalhost(toolUrl)) return true;

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
