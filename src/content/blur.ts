import {
  AVATAR_MAX_SIZE,
  BLUR_ATTR,
  BLUR_SCOPE_ATTR,
  BLUR_SCOPE_SELECTOR,
  BLUR_STYLE_ID,
} from "../shared/constants";
import { safeQueryAll } from "./dom";

const CSS = `
  [${BLUR_ATTR}] {
    filter: blur(0.32rem) contrast(1.04) saturate(0.9);
    transition: filter 140ms ease;
  }

  /* :has(:hover) để phần tử cha bỏ mờ khi rê chuột vào con đã bị mờ —
     filter của cha vẫn phủ lên con nếu chỉ bỏ mờ mỗi con. */
  [${BLUR_ATTR}]:hover,
  [${BLUR_ATTR}]:focus-within,
  [${BLUR_ATTR}]:has(:hover) {
    filter: none;
  }

  /* Rê chuột vào bất kỳ đâu trong dòng là bỏ mờ cả dòng — không phải trúng
     đúng đoạn chữ mới hiện. */
  [${BLUR_SCOPE_ATTR}]:hover [${BLUR_ATTR}] {
    filter: none;
  }
`;

let styleEl: HTMLStyleElement | null = null;

/** Style bị gỡ khi SPA thay <head>, nên kiểm tra isConnected chứ không chỉ tạo một lần. */
function ensureStyle(): void {
  if (styleEl?.isConnected) return;

  styleEl = document.createElement("style");
  styleEl.id = BLUR_STYLE_ID;
  styleEl.textContent = CSS;
  // Chạy ở document_start nên <head> có thể chưa tồn tại.
  (document.head ?? document.documentElement).append(styleEl);
}

function isAvatarLike(el: HTMLElement): boolean {
  if (!(el instanceof HTMLImageElement)) return false;
  const { width, height } = el.getBoundingClientRect();
  const w = width || el.naturalWidth;
  const h = height || el.naturalHeight;
  // Ảnh chưa tải xong (0x0) thì chưa kết luận, cứ làm mờ cho an toàn.
  if (!w || !h) return false;
  return w <= AVATAR_MAX_SIZE && h <= AVATAR_MAX_SIZE;
}

function isExcluded(el: HTMLElement, excludeSelector: string): boolean {
  if (!excludeSelector) return false;
  try {
    return el.closest(excludeSelector) !== null;
  } catch {
    return false;
  }
}

/** Chỉ gắn attribute cho phần tử mới — không xoá rồi gắn lại toàn trang (gây nháy). */
export function applyBlur(selectors: string[], excludeSelector = ""): void {
  if (selectors.length === 0) return;
  ensureStyle();

  for (const selector of selectors) {
    for (const el of safeQueryAll(selector)) {
      if (el.hasAttribute(BLUR_ATTR) || isAvatarLike(el)) continue;
      if (isExcluded(el, excludeSelector)) continue;
      el.setAttribute(BLUR_ATTR, "");
      el.closest<HTMLElement>(BLUR_SCOPE_SELECTOR)?.setAttribute(BLUR_SCOPE_ATTR, "");
    }
  }
}

export function clearBlur(): void {
  for (const el of safeQueryAll(`[${BLUR_ATTR}]`)) el.removeAttribute(BLUR_ATTR);
  for (const el of safeQueryAll(`[${BLUR_SCOPE_ATTR}]`)) el.removeAttribute(BLUR_SCOPE_ATTR);
  styleEl?.remove();
  styleEl = null;
}
