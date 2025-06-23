const defaultSelectors = [
  '.ads',
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

function blockRedirectEvents() {
  const attrs = ['onclick', 'onmousedown'];
  for (const attr of attrs) {
    document.querySelectorAll(`[${attr}]`).forEach(el => {
      el.removeAttribute(attr);
    });
  }
}

function runBlocker(userSelectors: string[]) {
  const allSelectors = [...defaultSelectors, ...userSelectors];

  const executeAll = () => {
    removeElements(allSelectors);
    blockRedirectEvents();
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