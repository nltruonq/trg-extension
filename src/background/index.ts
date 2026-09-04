/// <reference types="chrome"/>

import { CONTEXT_MENU, MESSAGES } from "../shared/constants";

const MENU_ITEMS = [
  { id: CONTEXT_MENU.BLOCK, title: "Thêm vào bộ lọc..." },
  { id: CONTEXT_MENU.BLUR, title: "Làm mờ phần tử này" },
];

const MESSAGE_BY_MENU_ID: Record<string, string> = {
  [CONTEXT_MENU.BLOCK]: MESSAGES.ADD_BLOCK_SELECTOR,
  [CONTEXT_MENU.BLUR]: MESSAGES.ADD_BLUR_SELECTOR,
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    for (const item of MENU_ITEMS) {
      chrome.contextMenus.create({
        ...item,
        contexts: ["all"],
        documentUrlPatterns: ["<all_urls>"],
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const type = MESSAGE_BY_MENU_ID[String(info.menuItemId)];
  if (!type || !tab?.id) return;
  void chrome.tabs.sendMessage(tab.id, { type });
});
