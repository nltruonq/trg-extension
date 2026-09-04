# Trg

Chrome extension (MV3) chặn và làm mờ nội dung trên trang web, cấu hình riêng theo từng domain.

## Tính năng

- **Chặn**: gỡ hẳn phần tử khỏi DOM theo CSS selector.
- **Làm mờ**: che nội dung, rê chuột vào để xem — mặc định áp cho khung chat Facebook/Messenger.
- **Context menu**: click phải vào phần tử bất kỳ để thêm nhanh vào danh sách chặn hoặc làm mờ.
- Bật/tắt độc lập theo domain, lưu trong `chrome.storage.local`.

## Cấu trúc

```
src/
  shared/        Dùng chung giữa popup, content script và background
    types.ts       Kiểu dữ liệu của settings
    constants.ts   Attribute, id style, message type, id context menu
    storage.ts     Đọc/ghi chrome.storage.local + theo dõi thay đổi
    site-rules.ts  Selector mặc định theo site (global, Facebook/Messenger)
  content/       Chạy trong trang web
    index.ts       Bootstrap: cache settings, MutationObserver, điều phối
    blur.ts        Gắn/gỡ attribute làm mờ + inject CSS
    blocker.ts     Gỡ phần tử theo selector
    context-menu.ts Cầu nối click phải ↔ background
    dom.ts         querySelectorAll không ném lỗi
  background/    Service worker: đăng ký context menu
  popup/         UI React
    useSettings.ts Hook đồng bộ settings với storage
    PopupApp.tsx   Màn hình chính
    SelectorList.tsx
  components/ui/ shadcn/ui
```

## Storage

```ts
{
  enabledDomains: Record<string, boolean>  // thiếu key = bật
  blurMap:        Record<string, boolean>  // thiếu key = bật
  selectors:      Record<string, string[]> // selector bị chặn
  blurSelectors:  Record<string, string[]> // selector bị làm mờ
}
```

## Phát triển

```bash
npm install
npm run dev     # HMR, load thư mục dist bằng "Load unpacked"
npm run build   # build production vào dist/
npm run lint
```

Vào `chrome://extensions` → bật Developer mode → **Load unpacked** → chọn thư mục `dist`.
