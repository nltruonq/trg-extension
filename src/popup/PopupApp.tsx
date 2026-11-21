import { Eye, EyeOff, MousePointerClick, MousePointerBan, ShieldCheck, ShieldX } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import type { ListKind } from "../shared/types";
import { SelectorList } from "./SelectorList";
import { ThemePicker } from "./ThemePicker";
import { useSettings } from "./useSettings";

interface TabSpec {
  kind: ListKind;
  label: string;
  empty: string;
  placeholder: string;
  /** Danh sách domain là toàn cục nên dùng được cả khi tab hiện tại không hỗ trợ. */
  global?: boolean;
}

const TABS: TabSpec[] = [
  {
    kind: "selectors",
    label: "Chặn",
    empty: "Chưa có selector bị chặn.",
    placeholder: "Query selector...",
  },
  {
    kind: "blurSelectors",
    label: "Làm mờ",
    empty: "Chưa có selector bị làm mờ.",
    placeholder: "Query selector...",
  },
  {
    kind: "blockedDomains",
    label: "Domain",
    empty: "Chưa chặn domain nào.",
    placeholder: "ads.example.com",
    global: true,
  },
];

export function PopupApp() {
  const {
    host,
    loading,
    enabled,
    blurEnabled,
    popupGuardEnabled,
    blockSelectors,
    blurSelectors,
    blockedDomains,
    themeId,
    toggleFlag,
    chooseTheme,
    addItem,
    removeItem,
  } = useSettings();

  const [tab, setTab] = useState<ListKind>("selectors");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const activeTab = TABS.find((item) => item.kind === tab) ?? TABS[0];
  const ITEMS: Record<ListKind, string[]> = {
    selectors: blockSelectors,
    blurSelectors: blurSelectors,
    blockedDomains,
  };
  const items = ITEMS[tab];
  const ShieldIcon = enabled ? ShieldCheck : ShieldX;
  const inputDisabled = !host && !activeTab.global;

  const submit = () => {
    if (addItem(tab, input)) {
      setInput("");
      setError("");
      return;
    }
    setError(
      tab === "blockedDomains"
        ? "Domain không hợp lệ hoặc đã có trong danh sách."
        : "Selector trống hoặc đã có trong danh sách.",
    );
  };

  return (
    <div className="flex h-[580px] w-[357px] flex-col">
      <header className="bg-primary py-4 text-center text-primary-foreground">
        <p className="font-semibold">{loading ? "Đang tải..." : host || "Trang không hỗ trợ"}</p>
      </header>

      <div className="flex flex-col items-center gap-3 p-4 pb-3">
        <button
          type="button"
          aria-label={enabled ? "Tắt trên trang này" : "Bật trên trang này"}
          aria-pressed={enabled}
          disabled={!host}
          onClick={() => toggleFlag("enabledDomains")}
          className="cursor-pointer transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShieldIcon strokeWidth={2.5} size={64} />
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

        <Button
          onClick={() => toggleFlag("popupGuardMap")}
          variant={popupGuardEnabled ? "default" : "secondary"}
          disabled={!host || !enabled}
          title="Chặn link mở tab mới khi click. Ctrl+click để mở link bị chặn."
          className="w-full cursor-pointer"
        >
          {popupGuardEnabled ? <MousePointerBan size={16} /> : <MousePointerClick size={16} />}
          {popupGuardEnabled ? "Chặn popup: Bật" : "Chặn popup: Tắt"}
        </Button>
      </div>

      <div className="px-4 pb-3">
        <ThemePicker value={themeId} disabled={!host || !enabled} onChange={chooseTheme} />
      </div>

      <div className="flex gap-2 px-4 pb-2">
        <Input
          name="selector"
          value={input}
          disabled={inputDisabled}
          onChange={(event) => {
            setInput(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          placeholder={activeTab.placeholder}
        />
        <Button
          onClick={submit}
          disabled={inputDisabled || !input.trim()}
          className="cursor-pointer font-semibold"
        >
          Thêm
        </Button>
      </div>

      {error && <p className="px-4 pb-2 text-xs text-red-500">{error}</p>}

      <Card className="mx-4 mb-4 gap-2 p-2">
        <div className="flex gap-1 rounded-md bg-muted p-1">
          {TABS.map((item) => (
            <button
              key={item.kind}
              type="button"
              onClick={() => {
                setTab(item.kind);
                setError("");
              }}
              className={cn(
                "flex-1 cursor-pointer rounded-sm px-2 py-1 text-sm font-medium transition-colors",
                tab === item.kind
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              <span className="ml-1 text-xs opacity-60">{ITEMS[item.kind].length}</span>
            </button>
          ))}
        </div>

        <SelectorList
          items={items}
          emptyLabel={activeTab.empty}
          onRemove={(value) => removeItem(tab, value)}
        />
      </Card>
    </div>
  );
}
