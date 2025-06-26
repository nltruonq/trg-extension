import unique from 'unique-selector';
const options = {
  selectorTypes: ['ID', 'Class', 'Tag', 'NthChild']
}

const originalWindowOpen = window.open;

const defaultSelectors = [
  '[id*="sponsor"]',
  'iframe[src*="ads"]'
];

function removeElements(selectors: string[]) {
  for (const selector of selectors) {
    try {
      document.querySelectorAll(selector).forEach(el => el.remove());
    } catch (err) {
      console.warn("Invalid selector:", selector);
    }
  }
}

let lastRightClickElement: HTMLElement | null = null;

document.addEventListener("contextmenu", (e) => {
  lastRightClickElement = e.target as HTMLElement;
});

function overrideWindowOpen() {
  window.open = () => {
    console.warn("Blocked popup");
    return null;
  };

  document.querySelectorAll('a[target="_blank"], a[target="_self"]').forEach((a) => {
    a.removeAttribute("target");
    a.setAttribute("rel", "noopener noreferrer");
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;

        node.querySelectorAll?.('a[target="_blank"], a[target="_self"]').forEach((a) => {
          a.removeAttribute("target");
          a.setAttribute("rel", "noopener noreferrer");
        });

        if (
          node.tagName === "A" &&
          (node.getAttribute("target") === "_blank" || node.getAttribute("target") === "_self")
        ) {
          node.removeAttribute("target");
          node.setAttribute("rel", "noopener noreferrer");
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a") as HTMLAnchorElement | null;
    if (!anchor) return;

    const isBlockTarget =
      anchor.getAttribute("target") === "_self" ||
      anchor.getAttribute("target") === "_blank";

    if (isBlockTarget || anchor.href) {
      e.preventDefault();
      e.stopPropagation();
      console.warn("Navigation blocked:", anchor.href);
    }
  }, true);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "BLOCK_POPUPS_ENABLE") {
    overrideWindowOpen();
  }

  if (msg.type === "BLOCK_POPUPS_DISABLE") {
    window.open = originalWindowOpen;
    console.warn("Popup blocking disabled.");
  }
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

function runBlocker(userSelectors: string[], isBlockPopups: boolean) {
  const allSelectors = [...defaultSelectors, ...userSelectors];

  const executeAll = () => {
    removeElements(allSelectors);
    fakeVisibility();
    isBlockPopups && overrideWindowOpen();
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

  chrome.storage.local.get(["enabledDomains", "selectors", "popupBlockMap"], (res) => {
    const enabledMap = res.enabledDomains ?? {};
    const popupMap = res.popupBlockMap ?? {};
    const isEnabled = enabledMap[hostname] !== false;
    if (!isEnabled) return;

    const userSelectors = res.selectors?.[hostname] ?? [];
    runBlocker(userSelectors, popupMap[hostname]);
  });
}

runIfEnabledPerDomain();


//fakeVisibility
function fakeVisibility() {
  Object.defineProperty(document, 'hidden', {
    get: () => false,
    configurable: true
  });

  Object.defineProperty(document, 'visibilityState', {
    get: () => 'visible',
    configurable: true
  });

  document.addEventListener('visibilitychange', (e) => {
    e.stopImmediatePropagation();
  }, true);

  window.onblur = null;
  window.onfocus = null;

  window.addEventListener('blur', (e) => {
    e.stopImmediatePropagation();
  }, true);
}