import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function Popup() {
  const [enabledDomains, setEnabledDomains] = useState<Record<string, boolean>>({});
  const [enabled, setEnabled] = useState(true);
  const [hostname, setHostname] = useState<string>("");
  const [input, setInput] = useState("");
  const [selectors, setSelectors] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get(["enabledDomains", "selectors"], (res) => {
      const ed = res.enabledDomains ?? {};
      setEnabledDomains(ed);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url ?? "";
        try {
          const host = new URL(url).hostname;
          setHostname(host);
          setEnabled(ed[host] !== false);

          const list = res.selectors?.[host] ?? [];
          setSelectors(list);
        } catch { }
      });
    });
  });

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);

    const updated = { ...enabledDomains, [hostname]: newState };
    setEnabledDomains(updated);
    chrome.storage.local.set({ enabledDomains: updated });

    chrome.runtime.sendMessage({
      type: "TOGGLE_ENABLED",
      hostname,
      payload: newState
    });
  };

  const addSelector = () => {
    if (!input.trim() || !hostname) return;

    const newList = Array.from(new Set([...selectors, input.trim()]));
    setSelectors(newList);
    setInput("");

    chrome.storage.local.get(["selectors"], (res) => {
      const updated = res.selectors ?? {};
      updated[hostname] = newList;
      chrome.storage.local.set({ selectors: updated });
    });
  };

  const removeSelector = (sel: string) => {
    const newList = selectors.filter(s => s !== sel);
    setSelectors(newList);

    chrome.storage.local.get(["selectors"], (res) => {
      const updated = res.selectors ?? {};
      updated[hostname] = newList;
      chrome.storage.local.set({ selectors: updated });
    });
  };

  return (
    <div style={{ padding: 12, width: 300, fontFamily: "sans-serif" }}>
      <h2>Trg Blocker</h2>
      <div>
        <strong>Trang hiện tại:</strong><br />
        <span style={{ fontSize: 14 }}>{hostname}</span>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <input type="checkbox" checked={enabled} onChange={toggle} />
        <span>{enabled ? "Đang bật" : "Đã tắt"}</span>
      </label>

      <div style={{ marginTop: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập CSS selector..."
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button onClick={addSelector} style={{ width: "100%" }}>Thêm</button>
      </div>

      <ul style={{ fontSize: 13, marginTop: 10, paddingLeft: 20 }}>
        {selectors.map(sel => (
          <li key={sel}>
            {sel}
            <button onClick={() => removeSelector(sel)} style={{ marginLeft: 8 }}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
