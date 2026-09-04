/** Luật mặc định theo site. Người dùng vẫn có thể bổ sung selector riêng từ popup. */
export interface SiteRule {
  matches: (host: string) => boolean;
  /** Selector bị gỡ khỏi DOM. */
  block?: string[];
  /** Selector bị làm mờ. */
  blur?: string[];
  /** Phần tử khớp (hoặc nằm trong phần tử khớp) thì không làm mờ. */
  blurExclude?: string[];
}

/** Áp dụng cho mọi site. */
const GLOBAL_RULE: SiteRule = {
  matches: () => true,
  block: ['[id*="sponsor"]', 'iframe[src*="ads"]'],
};

/**
 * Gốc để dò tin nhắn Messenger, xếp theo độ ổn định giảm dần.
 *
 * `data-message-id` là mốc tốt nhất: có trên từng tin nhắn, không phụ thuộc
 * ngôn ngữ giao diện và không đổi khi Facebook thay class hay `role`.
 * Hai selector sau chỉ là lưới an toàn — Facebook đã từng đổi khung hội thoại
 * từ `role="grid"` sang `role="log"`, nên không bám cứng vào một role nào.
 */
const FB_MESSAGE_ROOTS = [
  "[data-message-id]",
  '[aria-roledescription="tin nhắn"]',
  '[role="log"][aria-label]',
  '[role="grid"][aria-label*="cuộc trò chuyện" i]',
  '[role="grid"][aria-label*="conversation" i]',
];

/** Phần tử mang nội dung bên trong một tin nhắn. */
const FB_BLUR_TARGETS = [
  'div[dir="auto"]',
  'span[dir="auto"]',
  "img",
  "video",
  "canvas",
  // Sticker/emoji lớn được vẽ bằng background-image trên div role="img".
  '[role="img"]',
];

/** Không phải nội dung tin nhắn — mờ chúng chỉ gây khó dùng. */
const FB_BLUR_EXCLUDE = [
  // Mốc thời gian giữa các cụm tin nhắn.
  '[data-scope="date_break"]',
  // Thanh nút thả cảm xúc / trả lời hiện khi rê chuột.
  '[role="toolbar"]',
];

const FACEBOOK_RULE: SiteRule = {
  matches: (host) => /(^|\.)(facebook|messenger)\.com$/.test(host),
  blur: FB_MESSAGE_ROOTS.flatMap((root) =>
    FB_BLUR_TARGETS.map((target) => `${root} ${target}`),
  ),
  blurExclude: FB_BLUR_EXCLUDE,
};

const RULES: SiteRule[] = [GLOBAL_RULE, FACEBOOK_RULE];

export function blockSelectorsFor(host: string): string[] {
  return RULES.filter((rule) => rule.matches(host)).flatMap((rule) => rule.block ?? []);
}

export function blurSelectorsFor(host: string): string[] {
  return RULES.filter((rule) => rule.matches(host)).flatMap((rule) => rule.blur ?? []);
}

/** Gộp thành một selector để chỉ cần một lần `closest()` cho mỗi phần tử. */
export function blurExcludeSelectorFor(host: string): string {
  return RULES.filter((rule) => rule.matches(host))
    .flatMap((rule) => rule.blurExclude ?? [])
    .join(", ");
}
