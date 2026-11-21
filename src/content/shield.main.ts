/**
 * Shield chạy trong MAIN world — cùng realm với script của trang, nên vá được
 * những API mà isolated world không với tới.
 *
 * KHÔNG dùng được `chrome.*` ở đây (MAIN world không có), nên:
 *  - danh sách domain tới qua `postMessage` từ isolated world;
 *  - báo cáo cũng đi ngược lại bằng `postMessage`.
 *
 * Giới hạn cần biết: `location.href = ...`, `location.assign/replace` KHÔNG
 * vá được. `Location` là interface [LegacyUnforgeable] của WHATWG — các thuộc
 * tính đó là own-property non-configurable, `defineProperty` lên chúng ném
 * TypeError. Chặn điều hướng kiểu đó là việc của declarativeNetRequest ở
 * background. Shield này chỉ cắt sớm những đường mà JS vá được, để người dùng
 * không phải thấy trang lỗi.
 *
 * Trang web có thể tự bắn `postMessage` giả để làm rỗng danh sách — tầng
 * declarativeNetRequest vẫn chặn, nên hậu quả chỉ là mất phần cắt sớm này.
 */
import { MESSAGES, POPUP_TICKET_TTL } from "../shared/constants";
import { hostOf, matchesDomainList } from "../shared/domains";

// Giữ tham chiếu gốc trước khi script của trang chạy (document_start).
const nativeOpen = window.open;
const nativeClick = HTMLElement.prototype.click;
const nativeSubmit = HTMLFormElement.prototype.submit;
const nativeRequestSubmit = HTMLFormElement.prototype.requestSubmit;
const nativeDispatch = EventTarget.prototype.dispatchEvent;
const nativePostMessage = window.postMessage.bind(window);

let blockedDomains: string[] = [];
let guardEnabled = false;
let lastTrustedClick = 0;

function isBlockedUrl(url: unknown): boolean {
  if (typeof url !== "string" || url === "") return false;
  const host = hostOf(url, location.href);
  return host !== "" && matchesDomainList(blockedDomains, host);
}

function isBlockedAnchor(el: EventTarget | null): boolean {
  return el instanceof HTMLAnchorElement && isBlockedUrl(el.href);
}

/** Người dùng vừa thật sự bấm chuột? `isActive` đúng ngay trong handler click,
 *  mốc thời gian lo phần window.open bị hoãn sang microtask/timeout ngắn. */
function hasUserActivation(): boolean {
  if (navigator.userActivation?.isActive) return true;
  return Date.now() - lastTrustedClick < POPUP_TICKET_TTL;
}

function report(reason: string): void {
  try {
    nativePostMessage({ type: MESSAGES.POPUP_BLOCKED, reason }, "*");
  } catch {
    /* trang đã bị tháo */
  }
}

// --- Nhận cấu hình từ isolated world -------------------------------------

window.addEventListener(
  "message",
  (event: MessageEvent) => {
    // Chỉ nhận message phát ra từ chính frame này.
    if (event.source !== window) return;
    const data = event.data as { type?: string; domains?: unknown; guard?: unknown } | null;
    if (!data || data.type !== MESSAGES.BLOCKLIST_PUSH) return;

    blockedDomains = Array.isArray(data.domains) ? (data.domains as string[]) : [];
    guardEnabled = data.guard === true;
  },
  true,
);

// Isolated world phải đọc storage (bất đồng bộ) nên chắc chắn trả lời sau —
// cứ xin một lần rồi chờ.
nativePostMessage({ type: MESSAGES.BLOCKLIST_REQUEST }, "*");

document.addEventListener(
  "click",
  (event) => {
    if (event.isTrusted) lastTrustedClick = Date.now();
  },
  true,
);

// --- Các bản vá ------------------------------------------------------------

/** Thay một method trên prototype, giữ nguyên tên và số tham số để code của
 *  trang dò `fn.length` hay `fn.name` không thấy khác biệt. */
function patch<T extends object>(target: T, key: keyof T & string, impl: unknown): void {
  const original = target[key] as unknown as (...args: unknown[]) => unknown;
  Object.defineProperties(impl as object, {
    name: { value: original.name, configurable: true },
    length: { value: original.length, configurable: true },
  });
  Object.defineProperty(target, key, {
    value: impl,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

patch(window, "open", function (this: Window, ...args: unknown[]) {
  const [url] = args;
  if (isBlockedUrl(url)) {
    report("domain bị chặn");
    return null;
  }
  // Không có tương tác nào của người dùng: đây là popunder hẹn giờ.
  if (guardEnabled && !hasUserActivation()) {
    report("window.open không do người dùng bấm");
    return null;
  }
  return (nativeOpen as (...a: unknown[]) => Window | null).apply(this, args);
});

// Quảng cáo hay tạo <a target="_blank"> rồi gọi .click() thay vì window.open.
// `click` nằm trên HTMLElement.prototype, không phải HTMLAnchorElement.
patch(HTMLElement.prototype, "click", function (this: HTMLElement) {
  if (isBlockedAnchor(this)) {
    report("domain bị chặn");
    return;
  }
  nativeClick.call(this);
});

// Cả `dispatchEvent(new MouseEvent("click"))` lên một <a> cũng điều hướng thật.
patch(EventTarget.prototype, "dispatchEvent", function (this: EventTarget, event: Event) {
  if (event?.type === "click" && isBlockedAnchor(this)) {
    report("domain bị chặn");
    return false;
  }
  return nativeDispatch.call(this, event);
});

patch(HTMLFormElement.prototype, "submit", function (this: HTMLFormElement) {
  if (isBlockedUrl(this.action)) {
    report("domain bị chặn");
    return;
  }
  nativeSubmit.call(this);
});

patch(
  HTMLFormElement.prototype,
  "requestSubmit",
  function (this: HTMLFormElement, submitter?: HTMLElement | null) {
    if (isBlockedUrl(this.action)) {
      report("domain bị chặn");
      return;
    }
    nativeRequestSubmit.call(this, submitter as HTMLElement);
  },
);
