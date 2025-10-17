export const clearAllBlockingRules = async () => {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((rule) => rule.id),
  });
};
