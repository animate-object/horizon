import { clearAllBlockingRules } from "@/shared/lib/rules";
import {
  AlarmType,
  Message,
  MessageBuilder,
  MessageType,
} from "@/shared/messages";
import { computeSessionEndEpoch, SessionConfiguration } from "@/shared/session";
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

const handleSessionStarted = async () => {
  console.log("handling session start");

  const config = await Storage.get<SessionConfiguration | undefined>(
    Storage.keys.ActiveSessionConfig,
    undefined
  );
  if (config) {
    const sessionRules: chrome.declarativeNetRequest.Rule[] =
      config.allowedToolUrls.map((toolDef, idx) => {
        return {
          id: idx + 2,
          priority: 10,
          action: { type: "allow" },
          condition: {
            urlFilter: `||${toolDef}`,
            resourceTypes: ["main_frame"],
          },
        };
      });

    const rules = [UNIVERSAL_BLOCK_RULE, ...sessionRules];

    console.log("Setting network request rules!", rules);
    clearAllBlockingRules();

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
    });

    chrome.alarms.create(AlarmType.sessionFinished, {
      delayInMinutes: config.durationMinutes,
    });
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
    default:
      console.warn("Unknown message type", message);
  }
};
