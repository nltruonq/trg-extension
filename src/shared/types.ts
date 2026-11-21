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
  /** Domain bị chặn ở mọi trang: không mở tab mới, không điều hướng tới được.
   *  Khớp cả subdomain. Toàn cục, không theo từng site. */
  blockedDomains: string[];
}

export type SelectorKind = "selectors" | "blurSelectors";

/** Ba danh sách mà popup hiển thị bằng cùng một component. */
export type ListKind = SelectorKind | "blockedDomains";

/** Những cờ bật/tắt theo domain mà popup có thể bấm. */
export type DomainFlagKey = "enabledDomains" | "blurMap" | "popupGuardMap";
