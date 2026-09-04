import { safeQueryAll } from "./dom";

export function removeElements(selectors: string[]): void {
  for (const selector of selectors) {
    for (const el of safeQueryAll(selector)) el.remove();
  }
}
