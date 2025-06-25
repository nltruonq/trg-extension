import unique from 'unique-selector';
const options = {
  selectorTypes: ['ID', 'Class', 'Tag', 'NthChild']
}

const defaultSelectors = [
  '[id*="sponsor"]',
  'iframe[src*="ads"]'
];

function removeElements(selectors: string[]) {
  for (const selector of selectors) {
    try {
      document.querySelectorAll(selector).forEach(el => el.remove());
    } catch (err) {
      console.warn("[TrgBlocker] Invalid selector:", selector);
    }
  }
}

let lastRightClickElement: HTMLElement | null = null;

document.addEventListener("contextmenu", (e) => {
  lastRightClickElement = e.target as HTMLElement;
});

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.type === "CONTEXT_BLOCK_REQUEST" && lastRightClickElement) {
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
          [hostname]: hostSelectors
        }
      });

      lastRightClickElement?.remove();
    });
  }
});

function runBlocker(userSelectors: string[]) {
  const allSelectors = [...defaultSelectors, ...userSelectors];

  const executeAll = () => {
    removeElements(allSelectors);
  };

  executeAll();

  const root = document.documentElement;
  if (root) {
    new MutationObserver(executeAll).observe(root, {
      childList: true,
      subtree: true
    });
  }
}

function runIfEnabledPerDomain() {
  const hostname = location.hostname;

  chrome.storage.local.get(["enabledDomains", "selectors"], (res) => {
    const enabledMap = res.enabledDomains ?? {};
    const isEnabled = enabledMap[hostname] !== false;
    if (!isEnabled) return;

    const userSelectors = res.selectors?.[hostname] ?? [];
    runBlocker(userSelectors);
  });
}

runIfEnabledPerDomain();