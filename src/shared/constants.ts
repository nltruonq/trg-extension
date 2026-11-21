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

/** Bong bóng tin nhắn đã trang trí; giá trị là "in" (của người khác) hoặc "out" (của bạn). */
export const BUBBLE_ATTR = "data-trg-bubble";

/** Bọc ngoài một tin nhắn đã trang trí. */
export const MSG_ATTR = "data-trg-msg";

/** Tin nhắn cuối trong một cụm cùng phía — chỗ duy nhất vẽ nhân vật. */
export const GROUP_END_ATTR = "data-trg-group-end";

export const DECOR_STYLE_ID = "trg-decor-style";

export const MESSAGES = {
  ADD_BLOCK_SELECTOR: "TRG_ADD_BLOCK_SELECTOR",
  ADD_BLUR_SELECTOR: "TRG_ADD_BLUR_SELECTOR",
  /** Content script vừa cho một click đi qua — tab mới sinh ra sau đó là chính đáng. */
  POPUP_ALLOW_OPEN: "TRG_POPUP_ALLOW_OPEN",
  /** Content script vừa chặn một click — không có vé cho tab mới nào. */
  POPUP_BLOCKED: "TRG_POPUP_BLOCKED",
} as const;

export const CONTEXT_MENU = {
  BLOCK: "trg-block-element",
  BLUR: "trg-blur-element",
} as const;

/** Ảnh nhỏ hơn ngưỡng này coi như avatar/icon, không làm mờ. */
export const AVATAR_MAX_SIZE = 40;

/** Gắn lên phần tử vừa bị chặn click, để soi bằng devtools khi cần. */
export const POPUP_BLOCKED_ATTR = "data-trg-popup-blocked";

/** Vé "vừa có click hợp lệ" chỉ còn giá trị trong khoảng này (ms).
 *  Quảng cáo mở tab ngay trong handler click nên khoảng này rất ngắn. */
export const POPUP_TICKET_TTL = 1200;

/** Thời gian hiện thông báo đã chặn (ms). */
export const POPUP_TOAST_TTL = 3000;
