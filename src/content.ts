import unique from "unique-selector";

const options = {
  selectorTypes: ["ID", "Class", "Tag", "NthChild"],
};

const defaultSelectors = [
  '[id*="sponsor"]',
  'iframe[src*="ads"]',
];

const defaultBlurSelectors = [
  'div[role="grid"][aria-label^="Tin nhắn trong cuộc trò chuyện với"] div[dir="auto"]',
  'div[role="grid"][aria-label^="Tin nhắn trong cuộc trò chuyện với"] span[dir="auto"]',
  'div[role="grid"][aria-label^="Tin nhắn trong cuộc trò chuyện với"] img',
  'div[role="grid"][aria-label^="Tin nhắn trong cuộc trò chuyện với"] video',
  'div[role="grid"][aria-label^="Tin nhắn trong cuộc trò chuyện với"] canvas',
];

const blurClassName = "trg-chat-blur";
const blurStyleId = "trg-chat-blur-style";

let lastRightClickElement: HTMLElement | null = null;

document.addEventListener("contextmenu", (event) => {
  lastRightClickElement = event.target as HTMLElement;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "CONTEXT_BLOCK_REQUEST" || !lastRightClickElement) return;

  const selector = unique(lastRightClickElement, options);
  const hostname = location.hostname;

  chrome.storage.local.get(["selectors"], (res) => {
    const current = res.selectors ?? {};
    const hostSelectors = current[hostname] ?? [];
    if (!hostSelectors.includes(selector)) {
      hostSelectors.push(selector);
    }

    chrome.storage.local.set({
      selectors: {
        ...current,
        [hostname]: hostSelectors,
      },
    });

    lastRightClickElement?.remove();
  });
});

function removeElements(selectors: string[]) {
  for (const selector of selectors) {
    try {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    } catch {
      console.warn("Invalid selector:", selector);
    }
  }
}

function applyBlurBySelectors(selectors: string[]) {
  ensureBlurStyle();
  clearBlur();

  for (const selector of selectors) {
    try {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (el instanceof HTMLImageElement && isAvatarImage(el)) return;
        el.classList.add(blurClassName);
      });
    } catch {
      console.warn("Invalid blur selector:", selector);
    }
  }
}

function isAvatarImage(el: HTMLImageElement) {
  const width = el.getBoundingClientRect().width || el.naturalWidth || Number(el.getAttribute("width") ?? 0);
  const height = el.getBoundingClientRect().height || el.naturalHeight || Number(el.getAttribute("height") ?? 0);
  return width === 28 || height === 28;
}

function clearBlur() {
  document.querySelectorAll<HTMLElement>(`.${blurClassName}`).forEach((el) => {
    el.classList.remove(blurClassName);
  });
}

function ensureBlurStyle() {
  if (document.getElementById(blurStyleId)) return;

  const style = document.createElement("style");
  style.id = blurStyleId;
  style.textContent = `
    .${blurClassName} {
      filter: blur(0.32rem) contrast(1.04) saturate(0.9);
      transition: filter 140ms ease;
    }

    .${blurClassName}:hover,
    .${blurClassName}:focus-within {
      filter: none;
    }
  `;
  document.head.append(style);
}

function runIfEnabledPerDomain() {
  const hostname = location.hostname;

  chrome.storage.local.get(["enabledDomains", "selectors", "blurMap"], (res) => {
    const enabledMap = res.enabledDomains ?? {};
    const isEnabled = enabledMap[hostname] !== false;
    const blurMap = res.blurMap ?? {};
    const blurEnabled = blurMap[hostname] !== false;

    if (!isEnabled || !blurEnabled) {
      clearBlur();
      return;
    }

    const userSelectors = res.selectors?.[hostname] ?? [];
    removeElements([...defaultSelectors, ...userSelectors]);
    applyBlurBySelectors([...defaultBlurSelectors, ...userSelectors]);
  });
}

runIfEnabledPerDomain();

const root = document.documentElement;
if (root) {
  new MutationObserver(runIfEnabledPerDomain).observe(root, {
    childList: true,
    subtree: true,
  });
}
