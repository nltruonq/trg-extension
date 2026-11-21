import {
  BUBBLE_ATTR,
  DECOR_STYLE_ID,
  GROUP_END_ATTR,
  MSG_ATTR,
} from "../shared/constants";
import type { DecorTargets } from "../shared/site-rules";
import { toCssUrl, type BubbleTheme } from "../shared/themes";
import { safeQueryAll } from "./dom";

type Side = "in" | "out";

let styleEl: HTMLStyleElement | null = null;
let styleThemeId = "";

function buildCss(theme: BubbleTheme): string {
  const side = (name: Side) => {
    const s = theme[name];
    return `
  [${BUBBLE_ATTR}="${name}"] {
    --trg-frame: ${s.frame};
    --trg-bg: ${s.background};
    --trg-text: ${s.text};
  }

  [${GROUP_END_ATTR}] [${BUBBLE_ATTR}="${name}"] {
    padding-${name === "in" ? "right" : "left"}: 44px !important;
  }

  [${GROUP_END_ATTR}] [${BUBBLE_ATTR}="${name}"]::after {
    ${name === "in" ? "right" : "left"}: 3px;
    background-image: ${toCssUrl(s.character)};
  }`;
  };

  return `
  [${BUBBLE_ATTR}] {
    position: relative;
    border: 2.5px solid var(--trg-frame) !important;
    border-radius: 16px !important;
    background: var(--trg-bg) !important;
    color: var(--trg-text) !important;
    box-shadow: 0 2px 0 var(--trg-frame);
  }

  /* Facebook đặt màu chữ ở thẻ con nên phải ép thừa kế xuống. */
  [${BUBBLE_ATTR}] span,
  [${BUBBLE_ATTR}] div {
    color: inherit !important;
  }

  /* Nhân vật ngồi HẲN TRONG lòng bong bóng. Cho nó ló ra ngoài thì phải ép
     overflow:visible lên các lớp bọc của Facebook, mà một trong số đó dùng
     overflow để cắt lớp nền bong bóng theo bo góc — mở ra là nền tràn thành
     vệt ngang hết màn hình. */
  [${GROUP_END_ATTR}] [${BUBBLE_ATTR}] {
    min-height: 42px !important;
  }

  [${GROUP_END_ATTR}] [${BUBBLE_ATTR}]::after {
    content: "";
    position: absolute;
    bottom: 2px;
    width: 38px;
    height: 38px;
    background-repeat: no-repeat;
    background-size: contain;
    pointer-events: none;
  }
${side("in")}
${side("out")}
`;
}

function ensureStyle(theme: BubbleTheme): void {
  if (styleEl?.isConnected && styleThemeId === theme.id) return;

  styleEl?.remove();
  styleEl = document.createElement("style");
  styleEl.id = DECOR_STYLE_ID;
  styleEl.textContent = buildCss(theme);
  (document.head ?? document.documentElement).append(styleEl);
  styleThemeId = theme.id;
}

/**
 * Tin của bạn căn phải, tin người khác căn trái — mốc bền nhất.
 * Không dùng màu nền: khi người dùng đổi theme chat, Facebook vẽ nền ở một lớp
 * khác chứ không phải trên chính bong bóng, nên phép so màu trả về sai phía.
 */
function detectSide(bubble: HTMLElement, message: HTMLElement): Side | null {
  const row = message.getBoundingClientRect();
  const box = bubble.getBoundingClientRect();
  // Chưa dựng xong thì chưa kết luận, để lần quét sau tính lại.
  if (row.width === 0 || box.width === 0) return null;
  // So khoảng cách tới hai mép chứ không so tâm: bong bóng dài làm tâm lệch
  // về giữa, còn mép thì luôn dính sát bên nó thuộc về.
  return row.right - box.right < box.left - row.left ? "out" : "in";
}

function setAttr(el: Element, name: string, on: boolean): void {
  if (on === el.hasAttribute(name)) return;
  if (on) el.setAttribute(name, "");
  else el.removeAttribute(name);
}

function sideOf(message: HTMLElement): Side | null {
  const bubble = message.querySelector<HTMLElement>(`[${BUBBLE_ATTR}]`);
  return (bubble?.getAttribute(BUBBLE_ATTR) as Side | null) ?? null;
}

/** Nhân vật chỉ xuất hiện ở tin cuối mỗi cụm cùng phía, như TikTok. */
function markGroupEnds(targets: DecorTargets): void {
  const messages = safeQueryAll(targets.message);

  for (let i = 0; i < messages.length; i += 1) {
    const side = sideOf(messages[i]);
    const nextSide = i + 1 < messages.length ? sideOf(messages[i + 1]) : null;
    setAttr(messages[i], GROUP_END_ATTR, side !== null && side !== nextSide);
  }
}

export function applyDecor(targets: DecorTargets, theme: BubbleTheme): void {
  ensureStyle(theme);

  for (const bubble of safeQueryAll(targets.bubble)) {
    const message = bubble.closest<HTMLElement>(targets.message);
    if (!message) continue;

    if (!bubble.hasAttribute(BUBBLE_ATTR)) {
      const side = detectSide(bubble, message);
      if (!side) continue;
      bubble.setAttribute(BUBBLE_ATTR, side);
    }

    message.setAttribute(MSG_ATTR, "");
  }

  markGroupEnds(targets);
}

export function clearDecor(): void {
  for (const attr of [BUBBLE_ATTR, MSG_ATTR, GROUP_END_ATTR]) {
    for (const el of safeQueryAll(`[${attr}]`)) el.removeAttribute(attr);
  }

  styleEl?.remove();
  styleEl = null;
  styleThemeId = "";
}
