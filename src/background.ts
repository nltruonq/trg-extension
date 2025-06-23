/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "TOGGLE_ENABLED") {
    chrome.storage.local.set({ enabled: msg.payload });
    // Có thể gửi message đến các tab để reload content script nếu muốn
  }
});