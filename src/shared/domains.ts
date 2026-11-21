/** Hậu tố công cộng hai cấp hay gặp: để `cdn.vnexpress.net` và `vnexpress.net`
 *  là cùng site, còn `a.com.vn` và `b.com.vn` thì không. Không phải PSL đầy đủ,
 *  nhưng đủ để phân biệt "link nội bộ" với "link ra ngoài". */
const TWO_LEVEL_SUFFIXES = new Set([
  "com", "net", "org", "edu", "gov", "co", "ac", "or", "ne", "go", "info", "biz",
]);

export function baseDomain(host: string): string {
  const parts = host.toLowerCase().split(".");
  if (parts.length <= 2) return parts.join(".");
  const take = TWO_LEVEL_SUFFIXES.has(parts[parts.length - 2]) ? 3 : 2;
  return parts.slice(-take).join(".");
}

/**
 * Đưa thứ người dùng gõ về một hostname trần.
 *
 * Nhận cả `https://Ads.Example.com:8080/x?y`, `*.example.com`, `.example.com`
 * và trả về `example.com`. Trả `""` nếu không phải domain hợp lệ — chuỗi rỗng
 * là tín hiệu để UI từ chối, không bao giờ được đưa vào danh sách chặn.
 */
export function normalizeDomain(input: string): string {
  let value = input.trim().toLowerCase();
  if (!value) return "";

  // Có scheme thì để URL tự bóc host; không có thì tự cắt path/port.
  if (value.includes("://")) {
    try {
      value = new URL(value).hostname;
    } catch {
      return "";
    }
  } else {
    value = value.split("/")[0].split("?")[0].split("#")[0].split("@").pop() ?? "";
    value = value.replace(/:\d+$/, "");
  }

  value = value.replace(/^\*\./, "").replace(/^\.+/, "").replace(/\.+$/, "");
  if (!value) return "";

  // Hostname: các nhãn chữ-số-gạch ngang, ít nhất hai nhãn. IP cũng khớp dạng này.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value)) return "";
  if (value.split(".").some((label) => label.startsWith("-") || label.endsWith("-"))) return "";
  return value;
}

/** Khớp cả subdomain: `example.com` chặn luôn `ads.example.com`. */
export function matchesDomainList(list: string[], host: string): boolean {
  const target = host.toLowerCase();
  return list.some((domain) => target === domain || target.endsWith(`.${domain}`));
}

/** Host của một URL, hoặc `""` nếu URL không dùng được (javascript:, about:, rác). */
export function hostOf(url: string, base = ""): string {
  try {
    const parsed = base ? new URL(url, base) : new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.hostname.toLowerCase();
  } catch {
    return "";
  }
}
