/// <reference types="chrome"/>

import { CONTEXT_MENU, MESSAGES, POPUP_TICKET_TTL } from "../shared/constants";
import { isDomainEnabled, isDomainOptedIn, readSettings } from "../shared/storage";

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

// ---------------------------------------------------------------------------
// Lưới chặn thứ hai: tab mới nào sinh ra mà không có "vé" từ một click hợp lệ
// thì đóng. Bắt được cả popunder mà content script không thấy (form target,
// a.click() tự tạo, window.open hẹn giờ).

/** Thời điểm click hợp lệ gần nhất, theo tab nguồn.
 *  Service worker có thể ngủ giữa click và lúc tab mới xuất hiện, nhưng khoảng
 *  đó dưới một giây và chính message vé vừa đánh thức worker, nên mất vé là
 *  trường hợp hiếm — và hậu quả chỉ là một popup chính đáng bị đóng. */
const tickets = new Map<number, number>();

/** Số liên kết đã chặn, theo tab — hiện lên badge của icon extension. */
const blocked = new Map<number, number>();

function bumpBadge(tabId: number): void {
  const next = (blocked.get(tabId) ?? 0) + 1;
  blocked.set(tabId, next);
  void chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
  void chrome.action.setBadgeText({ tabId, text: String(next) });
}

async function isGuarded(tabId: number): Promise<boolean> {
  try {
    const tab = await chrome.tabs.get(tabId);
    const host = new URL(tab.url ?? "").hostname;
    const settings = await readSettings();
    return (
      isDomainEnabled(settings.enabledDomains, host) &&
      isDomainOptedIn(settings.popupGuardMap, host)
    );
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((message: { type?: string }, sender) => {
  const tabId = sender.tab?.id;
  if (tabId === undefined) return;

  if (message.type === MESSAGES.POPUP_ALLOW_OPEN) {
    tickets.set(tabId, Date.now());
  } else if (message.type === MESSAGES.POPUP_BLOCKED) {
    // Click đã bị chặn: mọi tab mới sinh ra sau đó đều không chính đáng.
    tickets.delete(tabId);
    bumpBadge(tabId);
  }
});

chrome.webNavigation.onCreatedNavigationTarget.addListener(({ sourceTabId, tabId }) => {
  const at = tickets.get(sourceTabId);
  if (at !== undefined && Date.now() - at < POPUP_TICKET_TTL) {
    // Một vé mở được một tab: loạt popup bắn liền sau đó không còn vé nữa.
    tickets.delete(sourceTabId);
    return;
  }

  void isGuarded(sourceTabId).then((guarded) => {
    if (!guarded) return;
    bumpBadge(sourceTabId);
    void chrome.tabs.remove(tabId).catch(() => undefined);
  });
});

/** Điều hướng trang mới thì đếm lại từ đầu. */
chrome.webNavigation.onCommitted.addListener(({ tabId, frameId }) => {
  if (frameId !== 0) return;
  tickets.delete(tabId);
  blocked.delete(tabId);
  void chrome.action.setBadgeText({ tabId, text: "" }).catch(() => undefined);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tickets.delete(tabId);
  blocked.delete(tabId);
});
