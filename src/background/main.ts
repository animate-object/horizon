import { AlarmType } from "@/shared/messages";
import { messageRoutingHandler } from "./messageHandlers";
import { blockAllSites } from "@/shared/lib/rules";

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/pages/landing.html") });
});

chrome.runtime.onStartup.addListener(async () => {
  {
    await blockAllSites();
    console.info("SessionStart: Everything is blocked");
    await chrome.tabs.create({
      url: chrome.runtime.getURL("src/pages/landing.html"),
    });
  }
});

chrome.runtime.onMessage.addListener(messageRoutingHandler);

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === AlarmType.sessionFinished) {
    await blockAllSites();
    console.info("SessionEnd: Everything is blocked");
  }
});
