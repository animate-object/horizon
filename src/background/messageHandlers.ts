import { blockAllSites, clearAllBlockingRules } from "@/shared/lib/rules";
import {
  DataLoader,
  PastSession,
  PastSessionFactory,
} from "@/shared/lib/datastore";
import { AlarmType, Message, MessageType } from "@/shared/messages";
import {
  computeSessionEndEpoch,
  computeSessionState,
  SessionConfiguration,
} from "@/shared/session";
import { Storage } from "@/shared/storage";

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

const handleSessionStarted = async () => {
  console.log("handling session start");
  const dataLoader = new DataLoader();

  const config = await Storage.get<SessionConfiguration | undefined>(
    Storage.keys.ActiveSessionConfig,
    undefined
  );
  if (config == null) {
    console.warn("Failed to start session, config was null");
    return;
  }

  await blockAllSites({ except: config.allowedToolUrls });

  chrome.alarms.create(AlarmType.sessionFinished, {
    delayInMinutes: config.durationMinutes,
  });

  const toolDefinitions = await dataLoader.upsertToolDefinitions(
    config.allowedToolUrls.map((url) => ({ url }))
  );

  const pastSession: PastSession = PastSessionFactory.create({
    startedAt: config.startedAt,
    durationMinutes: config.durationMinutes,
    toolIds: toolDefinitions.map((td) => td.id),
    taskDescription: config.taskDescription,
  });

  dataLoader.upsert(pastSession);
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

const handleKnownMessage = async (
  message: Message,
  _sendResponse: (message?: any) => void
) => {
  switch (message.type) {
    case MessageType.sessionStarted:
      await handleSessionStarted();
      return;
    case MessageType.landingViewed:
      await handleLandingViewed();
      return;
    default:
      console.warn("Unknown message type", message);
  }
};
