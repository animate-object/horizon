import { blockAllSites, clearAllBlockingRules } from "@/shared/lib/rules";
import {
  PastSession,
  PastSessionFactory,
  PastSessionLoader,
  ToolLoader,
} from "@/shared/lib/datastore";
import {
  AlarmType,
  Message,
  MessageType,
  ResponseBuilder,
} from "@/shared/lib/messages";
import {
  computeSessionState,
  SessionConfiguration,
} from "@/shared/lib/session";
import { Storage } from "@/shared/lib/storage";

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
  await Storage.clear(Storage.keys.ActiveSessionConfig);
  await chrome.alarms.clear(AlarmType.sessionFinished);
  await blockAllSites();
  sendResponse(ResponseBuilder.taskComplete());
};

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
    default:
      console.warn("Unknown message type", message);
  }
};
