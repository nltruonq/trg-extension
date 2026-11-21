export type DomainFlags = Record<string, boolean>;
export type DomainSelectors = Record<string, string[]>;

export interface Settings {
  /** Bật/tắt toàn bộ extension theo domain. Thiếu key = bật. */
  enabledDomains: DomainFlags;
  /** Bật/tắt riêng tính năng làm mờ theo domain. Thiếu key = bật. */
  blurMap: DomainFlags;
  /** Selector bị gỡ khỏi DOM, theo domain. */
  selectors: DomainSelectors;
  /** Selector bị làm mờ, theo domain. */
  blurSelectors: DomainSelectors;
  /** Id bộ trang trí khung chat, theo domain. */
  themeMap: Record<string, string>;
  /** Chặn liên kết mở tab mới khi click, theo domain. Thiếu key = TẮT. */
  popupGuardMap: DomainFlags;
}

export type SelectorKind = "selectors" | "blurSelectors";

/** Những cờ bật/tắt theo domain mà popup có thể bấm. */
export type DomainFlagKey = "enabledDomains" | "blurMap" | "popupGuardMap";
