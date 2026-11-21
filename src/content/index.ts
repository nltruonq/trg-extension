import {
  blockSelectorsFor,
  blurExcludeSelectorFor,
  blurSelectorsFor,
  decorTargetsFor,
  popupRulesFor,
} from "../shared/site-rules";
import { getTheme } from "../shared/themes";
import {
  DEFAULT_SETTINGS,
  isDomainEnabled,
  isDomainOptedIn,
  onSettingsChanged,
  readSettings,
} from "../shared/storage";
import type { Settings } from "../shared/types";
import { applyBlur, clearBlur } from "./blur";
import { applyDecor, clearDecor } from "./decorate";
import { removeElements } from "./blocker";
import { installPopupGuard, setPopupGuardConfig } from "./popup-guard";
import { registerContextMenuBridge } from "./context-menu";

const host = location.hostname;
const siteBlockSelectors = blockSelectorsFor(host);
const siteBlurSelectors = blurSelectorsFor(host);
const siteBlurExclude = blurExcludeSelectorFor(host);
const decorTargets = decorTargetsFor(host);
const popupRules = popupRulesFor(host);

/** Cache trong bộ nhớ: DOM của Facebook thay đổi liên tục, đọc storage mỗi lần
 *  sẽ tạo hàng nghìn callback bất đồng bộ chạy đè lên nhau. */
let settings: Settings = DEFAULT_SETTINGS;
let syncScheduled = false;

function sync(): void {
  const domainOn = isDomainEnabled(settings.enabledDomains, host);
  // Chặn click là can thiệp mạnh nên phải bật tường minh theo domain.
  setPopupGuardConfig(
    domainOn && isDomainOptedIn(settings.popupGuardMap, host) ? popupRules : null,
  );

  if (!domainOn) {
    clearBlur();
    clearDecor();
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

  const theme = getTheme(settings.themeMap[host]);
  if (decorTargets && theme) applyDecor(decorTargets, theme);
  else clearDecor();
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
  // Listener, không phải thao tác DOM: gắn một lần, `sync()` chỉ đổi cấu hình.
  installPopupGuard();

  settings = await readSettings();
  sync();

  new MutationObserver(scheduleSync).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  onSettingsChanged((next) => {
    settings = next;
    // Xoá sạch trước khi áp lại để bỏ mờ những selector vừa bị gỡ khỏi danh sách,
    // và để nhận lại đúng màu nền gốc khi đổi bộ trang trí.
    clearBlur();
    clearDecor();
    sync();
  });
}

void start();
