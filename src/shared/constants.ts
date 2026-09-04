/** Attribute (không phải class) được gắn lên phần tử bị làm mờ.
 *  Dùng attribute vì React của Facebook ghi đè `className` mỗi lần re-render,
 *  làm class tự thêm bị mất và blur "tự nhiên hết tác dụng". */
export const BLUR_ATTR = "data-trg-blur";

/** Vùng rê chuột để bỏ mờ (thường là cả dòng tin nhắn, không chỉ riêng đoạn chữ). */
export const BLUR_SCOPE_ATTR = "data-trg-blur-scope";

/** Tổ tiên gần nhất được coi là một "dòng" nội dung.
 *  `[data-message-id]` là bọc ngoài của một tin nhắn Messenger. */
export const BLUR_SCOPE_SELECTOR =
  '[data-message-id], [role="article"], [role="row"], [role="listitem"], li';

export const BLUR_STYLE_ID = "trg-blur-style";

export const MESSAGES = {
  ADD_BLOCK_SELECTOR: "TRG_ADD_BLOCK_SELECTOR",
  ADD_BLUR_SELECTOR: "TRG_ADD_BLUR_SELECTOR",
} as const;

export const CONTEXT_MENU = {
  BLOCK: "trg-block-element",
  BLUR: "trg-blur-element",
} as const;

/** Ảnh nhỏ hơn ngưỡng này coi như avatar/icon, không làm mờ. */
export const AVATAR_MAX_SIZE = 40;
