import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/horizon.png",
  },
  action: {
    default_popup: "src/pages/popup.html",
    default_icon: {
      48: "public/horizon.png",
    },
  },
  permissions: ["declarativeNetRequest", "storage", "alarms", "webNavigation"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "src/background/main.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/scripts/blocklistWatcher.tsx"],
    },
  ],
});
