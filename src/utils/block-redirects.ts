let lastUserActionTime = 0;

/**
 * Ghi nhận hành vi người dùng thật (click, contextmenu, keydown, v.v.)
 */
function trackUserInteractions() {
  ["click", "contextmenu", "keydown", "mousedown"].forEach(event =>
    window.addEventListener(event, () => {
      lastUserActionTime = Date.now();
    }, true)
  );
}

export function blockAllAnchorClicks() {
  trackUserInteractions();

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a") as HTMLAnchorElement | null;
    if (!anchor || !anchor.href) return;

    const now = Date.now();

    const isAllowed =
      e.ctrlKey || e.metaKey || e.button === 1 || // middle click, Ctrl/Cmd click
      now - lastUserActionTime < 500; // Chuột phải rồi click (menu context)

    if (!isAllowed) {
      e.preventDefault();
      e.stopPropagation();
      console.warn("Blocked anchor click:", anchor.href);
    }
  }, true); // Capture phase để chặn sớm nhất
}

/**
 * Chặn `window.open(...)` popup
 */
function blockPopups() {
  window.open = function (...args) {
    console.warn("Blocked popup:", args[0]);
    return null;
  };
}

/**
 * Chặn redirect JS qua location.assign/replace hoặc set href
 */
function blockUnsafeRedirects() {
  const _assign = window.location.assign;
  const _replace = window.location.replace;

  window.location.assign = function (url: string) {
    if (Date.now() - lastUserActionTime < 1000) {
      _assign.call(window.location, url);
    } else {
      console.warn("Blocked location.assign:", url);
    }
  };

  window.location.replace = function (url: string) {
    if (Date.now() - lastUserActionTime < 1000) {
      _replace.call(window.location, url);
    } else {
      console.warn("Blocked location.replace:", url);
    }
  };

  Object.defineProperty(window, "location", {
    configurable: false,
    enumerable: true,
    get() {
      return window.location;
    },
    set(val) {
      if (Date.now() - lastUserActionTime < 1000) {
        location.href = val as string;
      } else {
        console.warn("Blocked setting window.location:", val);
      }
    }
  });
}

/**
 * Gỡ các thuộc tính redirect HTML như `onclick`, `onmousedown`
 */
function blockRedirectAttributes() {
  const attrs = ['onclick', 'onmousedown'];
  for (const attr of attrs) {
    document.querySelectorAll(`[${attr}]`).forEach(el => {
      el.removeAttribute(attr);
    });
  }
}

/**
 * Gỡ bỏ thẻ meta refresh
 */
function removeMetaRefresh() {
  document.querySelectorAll("meta[http-equiv='refresh']").forEach(el => el.remove());
}

/**
 * Gỡ script chèn động đáng nghi
 */
function observeAndRemoveRedirectScripts() {
  const blockScript = (script: HTMLScriptElement) => {
    const content = script.src || script.textContent || "";
    if (/redirect|click|track|ads|utm/i.test(content)) {
      console.warn("Blocked dynamic script:", content.slice(0, 100));
      script.remove();
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.nodeName === "SCRIPT") {
          blockScript(node as HTMLScriptElement);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/**
 * Chặn redirect qua click vào <a> nghi ngờ
 */
function interceptSuspiciousAnchorClicks() {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const aTag = target?.closest("a") as HTMLAnchorElement;
    if (!aTag || !aTag.href) return;

    // Bỏ qua nếu người dùng thực sự muốn (Ctrl/cmd/middle-click)
    const allowedByUser =
      e.ctrlKey || e.metaKey || e.button === 1 || Date.now() - lastUserActionTime < 1000;
    if (allowedByUser) return;

    const href = aTag.href;
    const suspiciousPatterns = [
      "redirect", "utm_", "track", "click", "adid", "aff", "doubleclick", "landing"
    ];
    const isSuspicious = suspiciousPatterns.some(p => href.includes(p));

    if (isSuspicious) {
      console.warn("Blocked suspicious link click:", href);
      e.preventDefault();
      e.stopPropagation();
    }
  }, true); // capture phase
}

/**
 * Bật toàn bộ chặn redirect, popup, ads event gắn tay
 */
export function enableStealthRedirectProtection() {
  trackUserInteractions();
  blockPopups();
  blockUnsafeRedirects();
  removeMetaRefresh();
  blockRedirectAttributes();
  interceptSuspiciousAnchorClicks();
  observeAndRemoveRedirectScripts();
}
