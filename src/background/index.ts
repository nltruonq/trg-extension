/// <reference types="chrome"/>

import {
  CONTEXT_MENU,
  DNR_BLOCK_RULE_ID,
  MESSAGES,
  POPUP_TICKET_TTL,
  RESTORE_COOLDOWN,
} from "../shared/constants";
import { hostOf, matchesDomainList } from "../shared/domains";
import { isDomainEnabled, isDomainOptedIn, readSettings } from "../shared/storage";
import type { Settings } from "../shared/types";

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

async function hostOfTab(tabId: number): Promise<string> {
  try {
    const tab = await chrome.tabs.get(tabId);
    return hostOf(tab.url ?? "");
  } catch {
    return "";
  }
}

function isGuardedHost(settings: Settings, host: string): boolean {
  if (!host) return false;
  return (
    isDomainEnabled(settings.enabledDomains, host) && isDomainOptedIn(settings.popupGuardMap, host)
  );
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

chrome.webNavigation.onCreatedNavigationTarget.addListener(({ sourceTabId, tabId, url }) => {
  // Đọc vé ngay, trước mọi await: handler bất đồng bộ có thể chạy sau khi vé
  // đã bị một tab khác tiêu thụ.
  const ticket = tickets.get(sourceTabId);
  void handleNewTarget({ sourceTabId, tabId, url, ticket });
});

async function handleNewTarget(target: {
  sourceTabId: number;
  tabId: number;
  url: string;
  ticket: number | undefined;
}): Promise<void> {
  const { sourceTabId, tabId, url, ticket } = target;
  const settings = await readSettings();

  // Domain bị chặn thì đóng, kể cả khi người dùng tự Ctrl+click: danh sách là
  // ý muốn tường minh, không phụ thuộc cờ bật/tắt theo site.
  const host = hostOf(url);
  if (host && matchesDomainList(settings.blockedDomains, host)) {
    bumpBadge(sourceTabId);
    await chrome.tabs.remove(tabId).catch(() => undefined);
    return;
  }

  if (ticket !== undefined && Date.now() - ticket < POPUP_TICKET_TTL) {
    // Một vé mở được một tab: loạt popup bắn liền sau đó không còn vé nữa.
    tickets.delete(sourceTabId);
    return;
  }

  if (!isGuardedHost(settings, await hostOfTab(sourceTabId))) return;
  bumpBadge(sourceTabId);
  await chrome.tabs.remove(tabId).catch(() => undefined);
}

/** Điều hướng trang mới thì đếm lại từ đầu, và ghi lại trang "lành" gần nhất
 *  để khôi phục nếu lát sau tab bị cướp sang domain bị chặn. */
chrome.webNavigation.onCommitted.addListener(({ tabId, frameId, url }) => {
  if (frameId !== 0) return;
  tickets.delete(tabId);
  blocked.delete(tabId);
  void chrome.action.setBadgeText({ tabId, text: "" }).catch(() => undefined);

  if (hostOf(url)) lastGoodUrl.set(tabId, url);
});

// ---------------------------------------------------------------------------
// Nạp shield vào MAIN world. Phải đăng ký từ đây chứ không khai trong manifest:
// loader của crxjs dùng `chrome.runtime.getURL()`, thứ MAIN world không có.
// Chrome tự tiêm script đã đăng ký ở document_start nên nó vẫn vá được các API
// trước khi script của trang chạy.

const SHIELD_SCRIPT_ID = "trg-main-shield";

async function registerShield(): Promise<void> {
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts({
      ids: [SHIELD_SCRIPT_ID],
    });
    if (existing.length > 0) return;

    const script: chrome.scripting.RegisteredContentScript = {
      id: SHIELD_SCRIPT_ID,
      js: ["shield.js"],
      matches: ["<all_urls>"],
      runAt: "document_start",
      // Quảng cáo hay cướp tab từ trong iframe của nó.
      allFrames: true,
      world: "MAIN",
      persistAcrossSessions: true,
    };

    try {
      // Iframe `about:blank`/`srcdoc` do trang tự tạo không khớp `matches` nào,
      // nên trang có thể gọi `iframe.contentWindow.open()` để vượt shield.
      // Cờ này tiêm theo origin của frame cha. Chỉ có từ Chrome 119.
      await chrome.scripting.registerContentScripts([
        { ...script, matchOriginAsFallback: true },
      ]);
    } catch {
      await chrome.scripting.registerContentScripts([script]);
      console.warn("[trg] Shield không phủ được iframe about:blank (Chrome quá cũ).");
    }
  } catch (error) {
    console.error("[trg] Không đăng ký được shield:", error);
  }
}

// ---------------------------------------------------------------------------
// Chặn domain. declarativeNetRequest huỷ thẳng request `main_frame`/`sub_frame`,
// nên bắt được MỌI đường điều hướng — kể cả `location.href = ...` và
// `location.replace()`, hai thứ không thể vá bằng JS.

async function syncBlockRules(domains: string[]): Promise<void> {
  const addRules: chrome.declarativeNetRequest.Rule[] =
    domains.length === 0
      ? []
      : [
          {
            id: DNR_BLOCK_RULE_ID,
            priority: 1,
            action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
            condition: {
              // `requestDomains` khớp cả subdomain, và một luật nhận cả danh sách.
              requestDomains: domains,
              resourceTypes: [
                "main_frame",
                "sub_frame",
              ] as chrome.declarativeNetRequest.ResourceType[],
            },
          },
        ];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [DNR_BLOCK_RULE_ID],
    addRules,
  });
}

let appliedDomains = "";

async function refreshBlockRules(): Promise<void> {
  const { blockedDomains } = await readSettings();
  const signature = blockedDomains.join(",");
  if (signature === appliedDomains) return;

  try {
    await syncBlockRules(blockedDomains);
    // Chỉ ghi nhận sau khi áp thành công, nếu không một lần lỗi sẽ khoá luôn
    // mọi lần cập nhật sau.
    appliedDomains = signature;
  } catch (error) {
    console.error("[trg] Không áp được luật chặn domain:", error);
  }
}

// Luật dynamic sống qua lần khởi động sau, nhưng vẫn áp lại để tự chữa khi
// storage và luật lệch nhau (gỡ/cài lại, sửa storage bằng tay).
chrome.runtime.onInstalled.addListener(() => {
  void refreshBlockRules();
  void registerShield();
});
chrome.runtime.onStartup.addListener(() => {
  void refreshBlockRules();
  void registerShield();
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "blockedDomains" in changes) void refreshBlockRules();
});

/** URL hợp lệ gần nhất của từng tab. */
const lastGoodUrl = new Map<number, string>();

/** Lần khôi phục gần nhất của từng tab — chặn vòng lặp reload. */
const lastRestore = new Map<number, number>();

/**
 * Tab bị cướp sang domain bị chặn: DNR đã huỷ request, Chrome đang hiện trang
 * lỗi. Đưa người dùng về đúng trang họ đang đọc.
 *
 * Lưu ý: nếu người dùng tự gõ một domain trong danh sách vào thanh địa chỉ thì
 * cũng bị đưa về trang cũ — đúng tinh thần "không bao giờ muốn tới đó", và
 * badge cho biết vì sao.
 */
chrome.webNavigation.onErrorOccurred.addListener(({ tabId, frameId, url, error }) => {
  if (frameId !== 0 || !error.includes("BLOCKED_BY_CLIENT")) return;

  const host = hostOf(url);
  const previous = lastGoodUrl.get(tabId);
  if (!host || !previous || previous === url) return;

  void readSettings().then((settings) => {
    if (!matchesDomainList(settings.blockedDomains, host)) return;
    bumpBadge(tabId);

    const at = lastRestore.get(tabId) ?? 0;
    if (Date.now() - at < RESTORE_COOLDOWN) return;
    lastRestore.set(tabId, Date.now());
    void chrome.tabs.update(tabId, { url: previous }).catch(() => undefined);
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tickets.delete(tabId);
  blocked.delete(tabId);
  lastGoodUrl.delete(tabId);
  lastRestore.delete(tabId);
});
