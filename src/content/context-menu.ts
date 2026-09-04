import unique from "unique-selector";
import { MESSAGES } from "../shared/constants";
import { addSelector } from "../shared/storage";

const UNIQUE_OPTIONS = { selectorTypes: ["ID", "Class", "Tag", "NthChild"] };

/** Ghi nhận phần tử được click phải để context menu của background biết thao tác lên đâu. */
export function registerContextMenuBridge(host: string): void {
  let lastTarget: HTMLElement | null = null;

  document.addEventListener(
    "contextmenu",
    (event) => {
      lastTarget = event.target as HTMLElement | null;
    },
    true,
  );

  chrome.runtime.onMessage.addListener((msg: { type?: string }) => {
    if (!lastTarget) return;

    if (msg.type === MESSAGES.ADD_BLOCK_SELECTOR) {
      const target = lastTarget;
      void addSelector("selectors", host, unique(target, UNIQUE_OPTIONS)).then(() => {
        target.remove();
      });
    } else if (msg.type === MESSAGES.ADD_BLUR_SELECTOR) {
      void addSelector("blurSelectors", host, unique(lastTarget, UNIQUE_OPTIONS));
    }
  });
}
