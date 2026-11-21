import type { DomainFlagKey, DomainFlags, SelectorKind, Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  enabledDomains: {},
  blurMap: {},
  selectors: {},
  blurSelectors: {},
  themeMap: {},
  popupGuardMap: {},
};

const KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

export async function readSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(KEYS);
  return { ...DEFAULT_SETTINGS, ...stored } as Settings;
}

/** Thiếu key nghĩa là bật — người dùng phải tắt tường minh. */
export function isDomainEnabled(flags: DomainFlags, host: string): boolean {
  return flags[host] !== false;
}

/** Ngược lại với `isDomainEnabled`: thiếu key nghĩa là TẮT. Dùng cho những
 *  tính năng can thiệp mạnh (chặn click) — bật bừa trên mọi trang sẽ phá web. */
export function isDomainOptedIn(flags: DomainFlags, host: string): boolean {
  return flags[host] === true;
}

export async function setDomainFlag(
  key: DomainFlagKey,
  host: string,
  value: boolean,
): Promise<void> {
  const settings = await readSettings();
  await chrome.storage.local.set({ [key]: { ...settings[key], [host]: value } });
}

export async function setTheme(host: string, themeId: string): Promise<void> {
  const settings = await readSettings();
  await chrome.storage.local.set({ themeMap: { ...settings.themeMap, [host]: themeId } });
}

export async function setSelectors(
  kind: SelectorKind,
  host: string,
  list: string[],
): Promise<void> {
  const settings = await readSettings();
  await chrome.storage.local.set({ [kind]: { ...settings[kind], [host]: list } });
}

export async function addSelector(
  kind: SelectorKind,
  host: string,
  selector: string,
): Promise<void> {
  const settings = await readSettings();
  const current = settings[kind][host] ?? [];
  if (current.includes(selector)) return;
  await setSelectors(kind, host, [...current, selector]);
}

/** Theo dõi thay đổi của storage.local; trả về hàm huỷ đăng ký. */
export function onSettingsChanged(listener: (settings: Settings) => void): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area !== "local") return;
    if (!KEYS.some((key) => key in changes)) return;
    void readSettings().then(listener);
  };

  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
