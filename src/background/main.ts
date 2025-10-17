import { AlarmType } from "@/shared/messages";
import { messageRoutingHandler } from "./messageHandlers";
import { clearAllBlockingRules } from "@/shared/lib/rules";

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/landing.html") });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/landing.html") });
});

chrome.runtime.onMessage.addListener(messageRoutingHandler);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === AlarmType.sessionFinished) {
    clearAllBlockingRules();
    console.info("Rules reset");
  }
});
