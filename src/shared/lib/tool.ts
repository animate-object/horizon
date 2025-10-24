const TOOL_DOMAIN_REGEX = /^(?:[\w-]+\.)+[\w-]{2,}(?:\/[\w-]*)*$/;

export const isValidToolUrl = (toolUrl: string): boolean => {
  return TOOL_DOMAIN_REGEX.test(toolUrl);
};
