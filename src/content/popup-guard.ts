import { MESSAGES, POPUP_BLOCKED_ATTR, POPUP_TOAST_TTL } from "../shared/constants";

export interface PopupGuardConfig {
  /** Selector gộp: click vào đây thì chặn. */
  deny: string;
  /** Selector gộp: click vào đây thì luôn cho qua. */
  allow: string;
}

/** `null` = tắt. Listener vẫn nằm đó nhưng không làm gì. */
let config: PopupGuardConfig | null = null;
let installed = false;

/** Phần tử người dùng chủ động bấm. Chỉ click vào đây mới được phát vé mở tab —
 *  popunder hẹn giờ hoặc bắn từ vùng trống sẽ không có vé. */
const INTERACTIVE =
  'a, button, input, select, textarea, summary, label, [role="button"], [role="link"], [onclick]';

/** Một <a> phủ quá tỉ lệ này của viewport thì coi là lớp trong suốt bẫy click. */
const TRAP_AREA_RATIO = 0.6;

/** <a> rỗng nhỏ hơn mức này (px²) chỉ là icon, không phải bẫy click. */
const MIN_TRAP_AREA = 2000;

/** Hậu tố công cộng hai cấp hay gặp: để `cdn.vnexpress.net` và `vnexpress.net`
 *  là cùng site, còn `a.com.vn` và `b.com.vn` thì không. Không phải PSL đầy đủ,
 *  nhưng đủ cho việc phân biệt "link nội bộ" và "link ra ngoài". */
const TWO_LEVEL_SUFFIXES = new Set([
  "com", "net", "org", "edu", "gov", "co", "ac", "or", "ne", "go", "info", "biz",
]);

function baseDomain(host: string): string {
  const parts = host.toLowerCase().split(".");
  if (parts.length <= 2) return parts.join(".");
  const take = TWO_LEVEL_SUFFIXES.has(parts[parts.length - 2]) ? 3 : 2;
  return parts.slice(-take).join(".");
}

/** `closest` không ném lỗi khi selector do người dùng nhập bị sai cú pháp. */
function closestSafe(el: Element, selector: string): Element | null {
  if (!selector) return null;
  try {
    return el.closest(selector);
  } catch {
    return null;
  }
}

/** Người dùng tự đòi mở tab mới: Ctrl/Cmd/Shift+click hoặc click giữa. */
function isIntentional(event: MouseEvent): boolean {
  return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0;
}

/** `target` trống hoặc trỏ về chính frame thì không sinh tab mới. */
function opensNewTab(a: HTMLAnchorElement): boolean {
  const target = a.target.trim().toLowerCase();
  return target !== "" && target !== "_self" && target !== "_top" && target !== "_parent";
}

/** Lớp phủ bẫy click: to bằng cả màn hình, hoặc trong suốt, hoặc rỗng ruột. */
function isTrap(a: HTMLAnchorElement): boolean {
  const { width, height } = a.getBoundingClientRect();
  const area = width * height;
  if (area === 0) return false;

  const viewport = window.innerWidth * window.innerHeight;
  if (viewport > 0 && area / viewport >= TRAP_AREA_RATIO) return true;

  const style = getComputedStyle(a);
  if (Number(style.opacity) < 0.1) return true;

  const hasContent =
    (a.textContent ?? "").trim() !== "" ||
    a.querySelector("img, svg, video, picture, canvas") !== null ||
    style.backgroundImage !== "none";
  return !hasContent && area >= MIN_TRAP_AREA;
}

/**
 * Lý do chặn, hoặc `null` nếu cho qua.
 *
 * Nguyên tắc: chỉ xét những click *sinh tab mới hoặc dẫn ra ngoài*. Điều hướng
 * nội bộ trong cùng tab không bao giờ bị can thiệp, kể cả khi nằm trong một
 * thẻ <a> rất lớn.
 */
function anchorVerdict(a: HTMLAnchorElement, deny: string): string | null {
  if (closestSafe(a, deny)) return "luật của trang";

  const raw = a.getAttribute("href") ?? "";
  if (/^\s*(javascript|data):/i.test(raw)) {
    return opensNewTab(a) ? "javascript: mở tab mới" : null;
  }

  let url: URL;
  try {
    url = new URL(a.href, location.href);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const external = baseDomain(url.hostname) !== baseDomain(location.hostname);
  const newTab = opensNewTab(a);
  // Ở lại trong tab và trong cùng site: không phải việc của guard.
  if (!external && !newTab) return null;
  if (isTrap(a)) return "lớp phủ bẫy click";
  if (external && newTab) return "liên kết lạ mở tab mới";
  return null;
}

function verdictFor(target: EventTarget | null): string | null {
  if (!config || !(target instanceof Element)) return null;
  if (closestSafe(target, config.allow)) return null;

  const anchor = closestSafe(target, "a[href]") as HTMLAnchorElement | null;
  if (anchor) return anchorVerdict(anchor, config.deny);
  return closestSafe(target, config.deny) ? "luật của trang" : null;
}

/** Service worker có thể đang ngủ hoặc extension vừa reload — im lặng bỏ qua. */
function notify(type: string): void {
  try {
    void chrome.runtime.sendMessage({ type })?.catch?.(() => undefined);
  } catch {
    /* context đã bị thu hồi */
  }
}

function ticket(target: EventTarget | null): void {
  if (!(target instanceof Element) || !closestSafe(target, INTERACTIVE)) return;
  notify(MESSAGES.POPUP_ALLOW_OPEN);
}

function onClick(event: MouseEvent): void {
  if (!config) return;

  if (isIntentional(event)) {
    ticket(event.target);
    return;
  }

  const reason = verdictFor(event.target);
  if (!reason) {
    ticket(event.target);
    return;
  }

  event.preventDefault();
  // Chặn cả handler của trang, không chỉ hành vi mặc định của <a>.
  event.stopImmediatePropagation();
  if (event.target instanceof Element) {
    event.target.setAttribute(POPUP_BLOCKED_ATTR, reason);
  }
  notify(MESSAGES.POPUP_BLOCKED);
  showToast(reason);
}

/**
 * Popunder thường gọi `window.open` ngay ở `mousedown`/`pointerdown`, trước khi
 * `click` kịp xảy ra. Chỉ cắt propagation, **không** `preventDefault` — giữ lại
 * focus và khả năng bôi chọn chữ.
 */
function onPress(event: Event): void {
  if (!config) return;
  if (event instanceof MouseEvent && isIntentional(event)) return;
  if (!verdictFor(event.target)) return;
  event.stopImmediatePropagation();
}

// ---------------------------------------------------------------------------
// Thông báo đã chặn. Dùng shadow DOM đóng để CSS của trang không với tới được.

let toastHost: HTMLElement | null = null;
let toastBox: HTMLElement | null = null;
let toastTimer = 0;
let blockedCount = 0;

const TOAST_CSS = `
  .box {
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 2147483647;
    max-width: 320px;
    padding: 10px 14px;
    border-radius: 10px;
    background: #111827;
    color: #f9fafb;
    font: 500 13px/1.45 system-ui, sans-serif;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 160ms ease, transform 160ms ease;
    pointer-events: none;
  }

  .box[data-show] {
    opacity: 1;
    transform: none;
  }
`;

function ensureToast(): HTMLElement {
  // Trang SPA có thể thay cả <body>, nên kiểm tra isConnected mỗi lần.
  if (toastBox?.isConnected) return toastBox;

  toastHost = document.createElement("div");
  // Bản thân host không được chiếm chỗ trong layout của trang.
  toastHost.style.cssText = "all: initial; position: fixed; inset: 0 auto auto 0;";
  const shadow = toastHost.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = TOAST_CSS;
  toastBox = document.createElement("div");
  toastBox.className = "box";
  shadow.append(style, toastBox);
  document.documentElement.append(toastHost);

  return toastBox;
}

function showToast(reason: string): void {
  blockedCount += 1;
  const box = ensureToast();
  box.textContent = `Trg đã chặn ${blockedCount} liên kết (${reason}). Ctrl+click để mở.`;
  box.setAttribute("data-show", "");

  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => box.removeAttribute("data-show"), POPUP_TOAST_TTL);
}

// ---------------------------------------------------------------------------

/** Gắn listener một lần duy nhất, ở capture phase để chạy trước handler của trang.
 *  Nhờ bắt trên `document` nên node sinh ra sau cũng tự động được bao phủ —
 *  phần này không cần tới MutationObserver như blur/decorate. */
export function installPopupGuard(): void {
  if (installed) return;
  installed = true;

  document.addEventListener("click", onClick, true);
  document.addEventListener("mousedown", onPress, true);
  document.addEventListener("pointerdown", onPress, true);
  // Click giữa là chủ ý của người dùng: cho qua, nhưng vẫn phát vé để
  // background không đóng mất tab vừa mở.
  document.addEventListener("auxclick", (event) => {
    if (config) ticket(event.target);
  }, true);
}

export function setPopupGuardConfig(next: PopupGuardConfig | null): void {
  config = next;
  if (!next) {
    clearTimeout(toastTimer);
    toastHost?.remove();
    toastHost = null;
    toastBox = null;
    blockedCount = 0;
  }
}
