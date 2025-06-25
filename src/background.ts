/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trg-block-element",
    title: "Thêm vào bộ lọc...",
    contexts: ["all"],
    documentUrlPatterns: ["<all_urls>"]
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "trg-block-element" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "CONTEXT_BLOCK_REQUEST" });
  }
});