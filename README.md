# Horizon

An intentional browsing tool

## Notes

Quick Reference: Redirect Detection for Focus Extension
Goal: Detect when allowed sites redirect to blocked URLs, store for user review
Key APIs:

chrome.webNavigation.onCommitted - detect redirects via transitionQualifiers array

Look for: 'server_redirect' or 'client_redirect'

chrome.declarativeNetRequest - your existing blocking mechanism
chrome.storage.local - store redirect events and session configs

Flow:

Track navigation chain per tab (Map: tabId → previousUrl)
On redirect from allowed → blocked URL, store the pair
Show summary UI (badge/popup) for user to review and add to allowlist
Save approved redirects to session configuration for future reuse

Data structure:
```
javascript{
  "session-name": {
    allowlist: ["maps.google.com"],
    learned_redirects: ["google.com/maps"]
  }
}
```