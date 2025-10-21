import { isEmpty } from "lodash";

export async function clearAllBlockingRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((rule) => rule.id),
  });
}

interface BlockSitesOpts {
  except?: string[];
}

const UNIVERSAL_BLOCK_RULE: chrome.declarativeNetRequest.Rule = {
  id: 1,
  priority: 1,
  action: {
    type: "redirect",
    redirect: {
      extensionPath: "/src/pages/blocked.html",
    },
  },
  condition: {
    urlFilter: "*",
    resourceTypes: ["main_frame"],
  },
};

const allowUrlRule = (
  url: string,
  idx: number,
  priority: number = 10
): chrome.declarativeNetRequest.Rule => {
  return {
    id: idx + 2,
    priority,
    action: { type: "allow" },
    condition: {
      urlFilter: `||${url}`,
      resourceTypes: ["main_frame"],
    },
  };
};

const DEFAULT_OPTS = { except: undefined };
export async function blockAllSites(opts: BlockSitesOpts = DEFAULT_OPTS) {
  const { except: exceptions } = opts;

  const rules = [UNIVERSAL_BLOCK_RULE];
  if (!isEmpty(exceptions)) {
    const sessionRules = exceptions!.map((url, idx) =>
      allowUrlRule(url, idx + 2)
    );
    rules.push(...sessionRules);
  }
  console.log("Setting network request rules!", rules);
  await clearAllBlockingRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
  });
}
