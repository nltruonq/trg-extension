import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  isDomainEnabled,
  onSettingsChanged,
  readSettings,
  setDomainFlag,
  setSelectors,
} from "../shared/storage";
import type { SelectorKind, Settings } from "../shared/types";

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
    (key: "enabledDomains" | "blurMap") => {
      if (!host) return;
      void setDomainFlag(key, host, !isDomainEnabled(settings[key], host));
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
    blockSelectors: settings.selectors[host] ?? [],
    blurSelectors: settings.blurSelectors[host] ?? [],
    toggleFlag,
    addSelector,
    removeSelector,
  };
}
