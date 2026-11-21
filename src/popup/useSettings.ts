import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  isDomainEnabled,
  isDomainOptedIn,
  onSettingsChanged,
  readSettings,
  setBlockedDomains,
  setDomainFlag,
  setSelectors,
  setTheme,
} from "../shared/storage";
import { normalizeDomain } from "../shared/domains";
import { DEFAULT_THEME_ID } from "../shared/themes";
import type { DomainFlagKey, ListKind, Settings } from "../shared/types";

async function readActiveHost(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    return new URL(tab?.url ?? "").hostname;
  } catch {
    return "";
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [host, setHost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [nextSettings, nextHost] = await Promise.all([readSettings(), readActiveHost()]);
      setSettings(nextSettings);
      setHost(nextHost);
      setLoading(false);
    })();

    return onSettingsChanged(setSettings);
  }, []);

  const toggleFlag = useCallback(
    (key: DomainFlagKey) => {
      if (!host) return;
      // popupGuardMap theo chiều ngược: thiếu key = tắt.
      const current =
        key === "popupGuardMap"
          ? isDomainOptedIn(settings[key], host)
          : isDomainEnabled(settings[key], host);
      void setDomainFlag(key, host, !current);
    },
    [host, settings],
  );

  /** Trả về false nếu giá trị không hợp lệ hoặc đã có — để UI báo lỗi. */
  const addItem = useCallback(
    (kind: ListKind, raw: string): boolean => {
      const value = raw.trim();
      if (!value) return false;

      if (kind === "blockedDomains") {
        const domain = normalizeDomain(value);
        if (!domain || settings.blockedDomains.includes(domain)) return false;
        void setBlockedDomains([...settings.blockedDomains, domain]);
        return true;
      }

      if (!host) return false;
      const current = settings[kind][host] ?? [];
      if (current.includes(value)) return false;
      void setSelectors(kind, host, [...current, value]);
      return true;
    },
    [host, settings],
  );

  const chooseTheme = useCallback(
    (themeId: string) => {
      if (!host) return;
      void setTheme(host, themeId);
    },
    [host],
  );

  const removeItem = useCallback(
    (kind: ListKind, value: string) => {
      if (kind === "blockedDomains") {
        void setBlockedDomains(settings.blockedDomains.filter((item) => item !== value));
        return;
      }
      if (!host) return;
      const current = settings[kind][host] ?? [];
      void setSelectors(kind, host, current.filter((item) => item !== value));
    },
    [host, settings],
  );

  return {
    host,
    loading,
    enabled: isDomainEnabled(settings.enabledDomains, host),
    blurEnabled: isDomainEnabled(settings.blurMap, host),
    popupGuardEnabled: isDomainOptedIn(settings.popupGuardMap, host),
    blockSelectors: settings.selectors[host] ?? [],
    blurSelectors: settings.blurSelectors[host] ?? [],
    blockedDomains: settings.blockedDomains,
    themeId: settings.themeMap[host] ?? DEFAULT_THEME_ID,
    toggleFlag,
    chooseTheme,
    addItem,
    removeItem,
  };
}
