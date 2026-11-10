/* =========================================================
   RTLume — Content Script (نسخه اصلاح شده برای DeepSeek & Claude)
   توسعه‌دهنده: Hossein Ahmadi (Ahmadi.pro)
   ========================================================= */
(() => {
  'use strict';

  const CLASS    = 'rtlfx';
  const FA_CLASS = 'rtlfx-fa';
  const DONE     = 'rtlfxDone';

  const SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','INPUT','SELECT',
                             'OPTION','BUTTON','IFRAME','CANVAS','SVG','MATH']);
  const SKIP_SEL  = 'script,style,noscript,input,select,option,button,iframe,canvas,svg,math';

  const BLOCK_TAGS = new Set(['P','LI','H1','H2','H3','H4','H5','H6','DIV','TD','TH',
                              'BLOCKQUOTE','SECTION','ARTICLE','MAIN','UL','OL',
                              'DD','DT','FIGCAPTION','SUMMARY','LABEL','CAPTION']);

  const host = location.hostname.replace(/^www\./, '');
  let config = { globalEnabled: true, sites: {} };
  let observer = null;
  const pending = new Set();
  let scheduled = false;

  function isEnabled() {
    return config.globalEnabled !== false && !!config.sites && config.sites[host] === true;
  }

  function firstStrongDir(text) {
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if ((cp >= 0x0600 && cp <= 0x06FF) ||
          (cp >= 0x0750 && cp <= 0x077F) ||
          (cp >= 0x08A0 && cp <= 0x08FF) ||
          (cp >= 0xFB50 && cp <= 0xFDFF) ||
          (cp >= 0xFE70 && cp <= 0xFEFF) ||
          (cp >= 0x1EE00 && cp <= 0x1EEFF) ||
          (cp >= 0x0590 && cp <= 0x05FF)) return 'rtl';
      if ((cp >= 0x0041 && cp <= 0x007A) ||
          (cp >= 0x00C0 && cp <= 0x024F)) return 'ltr';
    }
    return null;
  }

  function hasPersian(text) {
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if ((cp >= 0x0600 && cp <= 0x06FF) ||
          (cp >= 0x0750 && cp <= 0x077F) ||
          (cp >= 0x08A0 && cp <= 0x08FF)) return true;
    }
    return false;
  }

  function injectCSS() {
    if (document.getElementById('rtlfx-style')) return;
    const style = document.createElement('style');
    style.id = 'rtlfx-style';
    
    // استفاده از فونت محلی
    const fontUrlRegular = browser.runtime.getURL('fonts/Vazirmatn-Regular.woff2');
    const fontUrlBold = browser.runtime.getURL('fonts/Vazirmatn-Bold.woff2');

    style.textContent = `
      @font-face {
        font-family: 'Vazirmatn';
        font-style: normal;
        font-weight: 400;
        src: url('${fontUrlRegular}') format('woff2');
      }
      @font-face {
        font-family: 'Vazirmatn';
        font-style: normal;
        font-weight: 700;
        src: url('${fontUrlBold}') format('woff2');
      }
      
      .${CLASS} { text-align: start !important; }
      .${FA_CLASS} { font-family: 'Vazirmatn', Tahoma, "Segoe UI", sans-serif !important; }

      /* سلکتورهای عمومی و کلود */
      textarea, [contenteditable="true"], .ProseMirror, #prompt-textarea,
      [data-testid="chat-input"], [data-testid="chat-input"] textarea {
          direction: rtl !important;
          text-align: right !important;
          font-family: 'Vazirmatn', Tahoma, sans-serif !important;
      }

      /* سلکتورهای اختصاصی دیپ‌سیک */
      #chat-input, textarea#chat-input, .ds-markdown {
          direction: rtl !important;
          text-align: right !important;
          font-family: 'Vazirmatn', Tahoma, sans-serif !important;
      }

      p, li, h1, h2, h3, h4, h5, h6, blockquote {
          font-family: 'Vazirmatn', Tahoma, sans-serif !important;
      }

      pre, code {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: isolate !important;
          font-family: monospace !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function blockTarget(el) {
    let cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      if (BLOCK_TAGS.has(cur.tagName)) return cur;
      const d = getComputedStyle(cur).display;
      if (d === 'block' || d === 'flex' || d === 'grid' || d === 'table-cell' ||
          d === 'table-caption' || d.startsWith('inline-') === false && d !== 'inline') {
        return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  // تقویت شده برای پیدا کردن کادر تایپ در سایت‌های مختلف
  function processInputs(root) {
      if (!root) return;
      try {
          if (root.querySelectorAll) {
              // لیست سلکتورها آپدیت شد (شامل #chat-input دیپ‌سیک)
              const inputs = root.querySelectorAll('textarea, [contenteditable="true"], .ProseMirror, #prompt-textarea, #chat-input, [data-testid="chat-input"] textarea');
              inputs.forEach(el => {
                  if (el.getAttribute('dir') !== 'rtl') {
                      el.setAttribute('dir', 'rtl');
                  }
              });
          }
          if (root.querySelectorAll('*')) {
              root.querySelectorAll('*').forEach(el => {
                  if (el.shadowRoot) processInputs(el.shadowRoot);
              });
          }
      } catch (e) { }
  }

  function processRoot(root) {
    if (!root) return;
    const startNode = root.nodeType === Node.DOCUMENT_NODE ? root.documentElement
                    : root.nodeType === Node.TEXT_NODE ? root.parentElement : root;
    if (!startNode) return;

    processInputs(startNode);

    const walker = document.createTreeWalker(
      startNode,
      NodeFilter.SHOW_TEXT,
      { acceptNode(node) {
          const p = node.parentElement;
          if (!p || SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
          if (p.closest(SKIP_SEL)) return NodeFilter.FILTER_REJECT;
          const t = node.nodeValue;
          if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        } }
    );

    const targets = new Map();
    let node;
    while ((node = walker.nextNode())) {
      const blk = blockTarget(node.parentElement);
      if (!blk) continue;
      if (blk.dataset[DONE] === '1') continue;
      targets.set(blk, (targets.get(blk) || '') + node.nodeValue);
    }

    for (const [blk, text] of targets) {
      const existing = blk.getAttribute('dir');
      if (existing && existing !== 'rtl' && existing !== 'ltr') {
        blk.dataset[DONE] = '1';
        continue;
      }
      const dir = firstStrongDir(text.trim());
      if (dir) {
        blk.setAttribute('dir', dir);
        blk.classList.add(CLASS);
      }
      if (hasPersian(text)) blk.classList.add(FA_CLASS);
      blk.dataset[DONE] = '1';
    }
  }

  function flush() {
    scheduled = false;
    if (!isEnabled()) return;
    for (const el of pending) {
      if (el.isConnected) {
        delete el.dataset[DONE];
        processRoot(el);
      }
    }
    pending.clear();
  }

  function schedule(el) {
    pending.add(el);
    if (!scheduled) { scheduled = true; setTimeout(flush, 120); }
  }

  function activate() {
    injectCSS();
    // اجرای اولیه با کمی تأخیر برای اطمینان از لود شدن DOM
    setTimeout(() => {
        if (document.body) processRoot(document.body);
    }, 500);

    if (observer) observer.disconnect();
    observer = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'characterData') {
          if (m.target.parentElement) schedule(m.target.parentElement);
        } else {
          for (const n of m.addedNodes) {
            if (n.nodeType === Node.ELEMENT_NODE) schedule(n);
            else if (n.nodeType === Node.TEXT_NODE && n.parentElement) schedule(n.parentElement);
          }
        }
      }
    });
    
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
    }
  }

  function deactivate() {
    if (observer) { observer.disconnect(); observer = null; }
    pending.clear();
    document.querySelectorAll('.' + CLASS + ', .' + FA_CLASS).forEach((el) => {
      el.classList.remove(CLASS, FA_CLASS);
      if (el.getAttribute('dir') === 'rtl' || el.getAttribute('dir') === 'ltr') el.removeAttribute('dir');
      delete el.dataset[DONE];
    });
    document.querySelectorAll('textarea, [contenteditable="true"], .ProseMirror, #prompt-textarea, #chat-input').forEach(el => {
        if (el.getAttribute('dir') === 'rtl') el.removeAttribute('dir');
    });
    const s = document.getElementById('rtlfx-style');
    if (s) s.remove();
  }

  async function refresh() {
    try {
      config = await browser.storage.local.get({ globalEnabled: true, sites: {} });
    } catch (e) { return; }
    if (isEnabled()) activate(); else deactivate();
  }

  browser.storage.onChanged.addListener(refresh);
  refresh();
})();