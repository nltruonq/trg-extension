import {
  blockSelectorsFor,
  blurExcludeSelectorFor,
  blurSelectorsFor,
} from "../shared/site-rules";
import { DEFAULT_SETTINGS, isDomainEnabled, onSettingsChanged, readSettings } from "../shared/storage";
import type { Settings } from "../shared/types";
import { applyBlur, clearBlur } from "./blur";
import { removeElements } from "./blocker";
import { registerContextMenuBridge } from "./context-menu";

const host = location.hostname;
const siteBlockSelectors = blockSelectorsFor(host);
const siteBlurSelectors = blurSelectorsFor(host);
const siteBlurExclude = blurExcludeSelectorFor(host);

/** Cache trong bộ nhớ: DOM của Facebook thay đổi liên tục, đọc storage mỗi lần
 *  sẽ tạo hàng nghìn callback bất đồng bộ chạy đè lên nhau. */
let settings: Settings = DEFAULT_SETTINGS;
let syncScheduled = false;

function sync(): void {
  if (!isDomainEnabled(settings.enabledDomains, host)) {
    clearBlur();
    return;
  }

  removeElements([...siteBlockSelectors, ...(settings.selectors[host] ?? [])]);

  if (isDomainEnabled(settings.blurMap, host)) {
    applyBlur(
      [...siteBlurSelectors, ...(settings.blurSelectors[host] ?? [])],
      siteBlurExclude,
    );
  } else {
    clearBlur();
  }
}

/** Gộp mọi mutation trong cùng một frame thành một lần chạy. */
function scheduleSync(): void {
  if (syncScheduled) return;
  syncScheduled = true;
  requestAnimationFrame(() => {
    syncScheduled = false;
    sync();
  });
}

async function start(): Promise<void> {
  registerContextMenuBridge(host);

  settings = await readSettings();
  sync();

  new MutationObserver(scheduleSync).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  onSettingsChanged((next) => {
    settings = next;
    // Xoá sạch trước khi áp lại để bỏ mờ những selector vừa bị gỡ khỏi danh sách.
    clearBlur();
    sync();
  });
}

void start();
