/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.type === "TOGGLE_ENABLED") {
    chrome.storage.local.set({ enabled: msg.payload });
    // Có thể gửi message đến các tab để reload content script nếu muốn
  }
});


//Context
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trg-block-element",
    title: "Thêm vào bộ lọc...",
    contexts: ["all"],
    documentUrlPatterns: ["<all_urls>"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "trg-block-element" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "CONTEXT_BLOCK_REQUEST" });
  }
});