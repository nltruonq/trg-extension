/** querySelectorAll không ném lỗi khi selector do người dùng nhập bị sai cú pháp. */
export function safeQueryAll(selector: string): HTMLElement[] {
  try {
    return Array.from(document.querySelectorAll<HTMLElement>(selector));
  } catch {
    console.warn("[trg] Selector không hợp lệ:", selector);
    return [];
  }
}
