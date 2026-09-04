import { Eye, EyeOff, ShieldCheck, ShieldX } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import type { SelectorKind } from "../shared/types";
import { SelectorList } from "./SelectorList";
import { useSettings } from "./useSettings";

const TABS: { kind: SelectorKind; label: string; empty: string }[] = [
  { kind: "selectors", label: "Chặn", empty: "Chưa có selector bị chặn." },
  { kind: "blurSelectors", label: "Làm mờ", empty: "Chưa có selector bị làm mờ." },
];

export function PopupApp() {
  const {
    host,
    loading,
    enabled,
    blurEnabled,
    blockSelectors,
    blurSelectors,
    toggleFlag,
    addSelector,
    removeSelector,
  } = useSettings();

  const [tab, setTab] = useState<SelectorKind>("selectors");
  const [input, setInput] = useState("");

  const activeTab = TABS.find((item) => item.kind === tab) ?? TABS[0];
  const items = tab === "selectors" ? blockSelectors : blurSelectors;
  const ShieldIcon = enabled ? ShieldCheck : ShieldX;

  const submit = () => {
    addSelector(tab, input);
    setInput("");
  };

  return (
    <div className="flex h-[580px] w-[357px] flex-col">
      <header className="bg-primary py-4 text-center text-primary-foreground">
        <p className="font-semibold">{loading ? "Đang tải..." : host || "Trang không hỗ trợ"}</p>
      </header>

      <div className="flex flex-col items-center gap-3 p-4 pb-2">
        <button
          type="button"
          aria-label={enabled ? "Tắt trên trang này" : "Bật trên trang này"}
          aria-pressed={enabled}
          disabled={!host}
          onClick={() => toggleFlag("enabledDomains")}
          className="cursor-pointer transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShieldIcon strokeWidth={2.5} size={80} />
        </button>

        <Button
          onClick={() => toggleFlag("blurMap")}
          variant={blurEnabled ? "default" : "secondary"}
          disabled={!host || !enabled}
          className="w-full cursor-pointer"
        >
          {blurEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
          {blurEnabled ? "Blur chat: Bật" : "Blur chat: Tắt"}
        </Button>
      </div>

      <div className="flex gap-2 px-4 pb-2">
        <Input
          name="selector"
          value={input}
          disabled={!host}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          placeholder="Query selector..."
        />
        <Button onClick={submit} disabled={!host || !input.trim()} className="cursor-pointer font-semibold">
          Thêm
        </Button>
      </div>

      <Card className="mx-4 mb-4 gap-2 p-2">
        <div className="flex gap-1 rounded-md bg-muted p-1">
          {TABS.map((item) => (
            <button
              key={item.kind}
              type="button"
              onClick={() => setTab(item.kind)}
              className={cn(
                "flex-1 cursor-pointer rounded-sm px-2 py-1 text-sm font-medium transition-colors",
                tab === item.kind
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              <span className="ml-1 text-xs opacity-60">
                {item.kind === "selectors" ? blockSelectors.length : blurSelectors.length}
              </span>
            </button>
          ))}
        </div>

        <SelectorList
          items={items}
          emptyLabel={activeTab.empty}
          onRemove={(selector) => removeSelector(tab, selector)}
        />
      </Card>
    </div>
  );
}
