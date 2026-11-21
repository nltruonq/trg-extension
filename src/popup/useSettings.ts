import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  isDomainEnabled,
  isDomainOptedIn,
  onSettingsChanged,
  readSettings,
  setDomainFlag,
  setSelectors,
  setTheme,
} from "../shared/storage";
import { DEFAULT_THEME_ID } from "../shared/themes";
import type { DomainFlagKey, SelectorKind, Settings } from "../shared/types";

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

  const addSelector = useCallback(
    (kind: SelectorKind, selector: string) => {
      const value = selector.trim();
      if (!value || !host) return;
      const current = settings[kind][host] ?? [];
      if (current.includes(value)) return;
      void setSelectors(kind, host, [...current, value]);
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

  const removeSelector = useCallback(
    (kind: SelectorKind, selector: string) => {
      if (!host) return;
      const current = settings[kind][host] ?? [];
      void setSelectors(kind, host, current.filter((item) => item !== selector));
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
    themeId: settings.themeMap[host] ?? DEFAULT_THEME_ID,
    toggleFlag,
    chooseTheme,
    addSelector,
    removeSelector,
  };
}
