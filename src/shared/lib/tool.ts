import { isEmpty } from "lodash";

const TOOL_DOMAIN_REGEX = /^(?:[\w@-]+\.)+[\w-]{2,}(?:\/[\w@-]*)*$/;

function isLocalhost(toolUrl: string) {
  return toolUrl.startsWith("localhost:") && toolUrl.indexOf(".") === -1;
}

export const stripUrl = (original: string) => {
  let original_ = original;
  if (isEmpty(original_)) return original_;
  if (original_.startsWith("https://")) {
    original_ = original_.slice(8);
  }
  if (original_.startsWith("http://")) {
    original_ = original_.slice(7);
  }

  if (original_.endsWith("/")) {
    original_ = original_.slice(0, original_.length - 1);
  }
  return original_;
};

export const stripPathFromUrl = (original: string) => {
  const url = new URL(original);
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return stripUrl(url.toString());
};

export const isValidToolUrl = (toolUrl: string): boolean => {
  if (isLocalhost(toolUrl)) return true;

  return TOOL_DOMAIN_REGEX.test(toolUrl);
};

export const isValidToolUrlIfStripped = (toolUrl: string): boolean => {
  return isValidToolUrl(stripUrl(toolUrl));
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
