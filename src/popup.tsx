import { ShieldCheck, ShieldX, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";

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
    setEnabledDomains(prev => ({ ...prev, [hostname]: newState }));
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
    <div className="w-[357px] h-[580px]">
      <div className="flex py-4 justify-center bg-primary text-primary-foreground">
        <p className="font-semibold">{hostname}</p>
      </div>

      <div className="flex items-center justify-center gap-2 p-4 pb-2">
        {enabled ?
          (<ShieldCheck strokeWidth={2.5} size={80} className="cursor-pointer hover:opacity-60" onClick={toggle} />) :
          (<ShieldX strokeWidth={2.5} size={80} className="cursor-pointer hover:opacity-60" onClick={toggle} />)}
      </div>

      <div className="p-4">
        <Input
          name="selector"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Query selector..."
        />
        <div className="flex items-center justify-center mt-2">
          <Button onClick={addSelector} size="lg" className="font-semibold cursor-pointer">Thêm</Button>
        </div>
      </div>

      <Card className="mx-4 p-2">
        <h3 className="text-sm font-medium text-muted-foreground">Selector đã thêm</h3>
        <ScrollArea className="h-[200px] p-2">
          <ul className="flex flex-col gap-2">
            {selectors.map((sel) => (
              <li
                key={sel}
                className="flex items-start gap-2 bg-muted/40 rounded-md px-3 py-2"
              >
                <p className="text-sm break-words whitespace-pre-wrap w-0 flex-grow text-muted-foreground">
                  {sel}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeSelector(sel)}
                  className="text-red-500 hover:text-red-600 h-6 w-6 shrink-0"
                >
                  <X size={14} />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </Card>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
