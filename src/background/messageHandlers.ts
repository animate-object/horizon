import {
  addOneExemption,
  blockAllSites,
  clearAllBlockingRules,
  MAX_IN_SESSION_EXEMPTIONS,
} from "@/shared/lib/rules";
import {
  PastSession,
  PastSessionFactory,
  PastSessionLoader,
  ToolLoader,
} from "@/shared/lib/datastore";
import {
  AddExemption,
  AlarmType,
  Message,
  MessageType,
  OpenExtensionView,
  ResponseBuilder,
  TestBlockListMessage,
} from "@/shared/lib/messages";
import {
  computeSessionState,
  SessionConfiguration,
} from "@/shared/lib/session";
import { Storage, StorageKeys } from "@/shared/lib/storage";
import { act } from "react";

type MessageHandler = Parameters<
  typeof chrome.runtime.onMessage.addListener
>[0];

export const messageRoutingHandler: MessageHandler = (
  message,
  _sender,
  sendResponse
) => {
  if (message.type == null) {
    console.warn("Unhandled message", message);
    return false;
  }
  handleKnownMessage(message as Message, sendResponse).catch((err) => {
    console.error("Error handling message", err);
  });

  return true;
};

const applyRulesForActiveSession = async (config: SessionConfiguration) => {
  if (config.mode === "free") {
    await clearAllBlockingRules();
  } else {
    await blockAllSites({ except: config.allowedToolUrls });
  }
};

const handleSessionStarted = async () => {
  console.log("handling session start");
  const toolLoader = new ToolLoader();

  const config = await Storage.get<SessionConfiguration | undefined>(
    Storage.keys.ActiveSessionConfig,
    undefined
  );
  if (config == null) {
    console.warn("Failed to start session, config was null");
    return;
  }

  await applyRulesForActiveSession(config);

  chrome.alarms.create(AlarmType.sessionFinished, {
    delayInMinutes: config.durationMinutes,
  });

  const toolDefinitions = await toolLoader.upsertMany(
    config.allowedToolUrls.map((url) => ({ url }))
  );

  const pastSession: PastSession = PastSessionFactory.create({
    startedAt: config.startedAt,
    durationMinutes: config.durationMinutes,
    toolIds: toolDefinitions.map((td) => td.id),
    taskDescription: config.taskDescription,
    mode: config.mode ?? "standard",
  });

  await new PastSessionLoader().addRecentSession(pastSession);
};

const handleLandingViewed = async () => {
  console.info("LandingViewHandler: handling");
  const config = await Storage.get(Storage.keys.ActiveSessionConfig, undefined);
  if (computeSessionState(config) != "active") {
    console.info("LandingViewHandler: Session is not active");
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    if (rules.length === 1 && rules[0].id === 1) {
      console.info("LandingViewHandler: URL Blocking state is correct");
      return;
    }
    console.info("LandingViewHandler: Blocking all URLs");
    await blockAllSites();
  }
};

const handleEndSessionEarly = async (sendResponse: (message?: any) => void) => {
  const sessionLoader = new PastSessionLoader();
  const lastSessions = await sessionLoader.recentSessions(1);
  if (lastSessions.length > 0) {
    const lastSession = lastSessions[0];
    console.info("messageHandler", lastSession.taskDescription);

    const updated = PastSessionFactory.update(lastSession, {
      endedEarlyAt: new Date().toISOString(),
    });
    await sessionLoader.waitForUpsert(updated);
  }

  await Storage.clear(Storage.keys.ActiveSessionConfig);
  await chrome.alarms.clear(AlarmType.sessionFinished);
  await blockAllSites();
  sendResponse(ResponseBuilder.taskComplete());
};

const handleTestBlocklist = async (
  message: TestBlockListMessage,
  sendResponse: (message?: any) => void
) => {
  const rules = await chrome.declarativeNetRequest.testMatchOutcome({
    url: message.url,
    type: "main_frame",
  });

  if (rules.matchedRules.length === 0) {
    console.info("Free browsing mode");
    sendResponse(ResponseBuilder.decision(false));
  }

  console.debug(`URL matched ${rules.matchedRules.length} rules`);
  const activeRules = await chrome.declarativeNetRequest.getDynamicRules();

  let isBlocked = true;

  for (const match of rules.matchedRules) {
    const rule = activeRules.find((r) => r.id === match.ruleId);
    if (rule?.action?.type === "allow") {
      isBlocked = false;
      break;
    }
  }

  sendResponse(ResponseBuilder.decision(isBlocked));
};

async function handleOpenExtensionView(message: OpenExtensionView) {
  await chrome.tabs.create({
    url: chrome.runtime.getURL(`src/pages/${message.view}.html`),
  });
}

async function handleAddExemption(
  message: AddExemption,
  sendResponse: (message?: any) => void
) {
  const activeSession = await Storage.get<SessionConfiguration | undefined>(
    Storage.keys.ActiveSessionConfig
  );
  if (activeSession == null) {
    console.warn("Cannot add exemption with no active session");
    return;
  }

  const usedExemptions = activeSession.usedExemptions ?? 0;

  if (usedExemptions >= MAX_IN_SESSION_EXEMPTIONS) {
    console.warn(
      `Cannot add more than ${MAX_IN_SESSION_EXEMPTIONS} exemptions in one session`
    );
  }

  await addOneExemption(message.exemptToolUrl);

  await Storage.set(Storage.keys.ActiveSessionConfig, {
    ...activeSession,
    usedExemptions: usedExemptions + 1,
  });

  sendResponse(ResponseBuilder.taskComplete());
}

const handleKnownMessage = async (
  message: Message,
  sendResponse: (message?: any) => void
) => {
  switch (message.type) {
    case MessageType.sessionStarted:
      await handleSessionStarted();
      return;
    case MessageType.landingViewed:
      await handleLandingViewed();
      return;
    case MessageType.endSession:
      await handleEndSessionEarly(sendResponse);
      return;
    case MessageType.testBlocklist:
      await handleTestBlocklist(message, sendResponse);
      return;
    case MessageType.openExtensionView:
      await handleOpenExtensionView(message);
      return;
    case MessageType.addExemption:
      await handleAddExemption(message, sendResponse);
      return;
    default:
      console.warn("Unknown message type", message);
  }
};
