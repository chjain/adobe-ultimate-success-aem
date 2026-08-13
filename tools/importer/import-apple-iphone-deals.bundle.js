/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-apple-iphone-deals.js
  var import_apple_iphone_deals_exports = {};
  __export(import_apple_iphone_deals_exports, {
    default: () => import_apple_iphone_deals_default
  });

  // tools/importer/parsers/hero-promo.js
  function parse(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const titleEl = element.querySelector('.xpr-promoCard__title, h1, h2, [class*="title"]');
    let promoText = "";
    if (titleEl) {
      const span = titleEl.querySelector(":scope > span");
      const link = titleEl.querySelector(":scope > a[href]");
      promoText = clean(span ? span.textContent : link ? link.textContent : titleEl.textContent);
    }
    const titleLink = element.querySelector("a.xpr-promoCard__titleLink[href]");
    const ctaLink = element.querySelector(".xpr-promoCard__ctas a[href], a.tdds-button[href]");
    const bandHref = titleLink && titleLink.getAttribute("href") || ctaLink && ctaLink.getAttribute("href") || "";
    const legalEl = element.querySelector(".xpr-promoCard__legal");
    let legalText = "";
    let termsText = "";
    if (legalEl) {
      const termsBtn = legalEl.querySelector("button, a");
      termsText = clean(termsBtn ? termsBtn.textContent : "");
      const legalClone = legalEl.cloneNode(true);
      legalClone.querySelectorAll("button, a").forEach((b) => b.remove());
      legalText = clean(legalClone.textContent);
    }
    if (!promoText && !legalText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (bandHref && promoText.length > 20) {
      const overlay = document.createElement("a");
      overlay.setAttribute("href", bandHref);
      overlay.textContent = promoText;
      contentCell.push(overlay);
    }
    if (promoText) {
      const p = document.createElement("p");
      p.textContent = promoText;
      contentCell.push(p);
    }
    if (legalText || termsText) {
      const lp = document.createElement("p");
      if (legalText) lp.append(document.createTextNode(`${legalText} `));
      if (termsText) {
        const terms = document.createElement("a");
        terms.setAttribute("href", bandHref || "#");
        terms.textContent = termsText;
        lp.append(terms);
      }
      contentCell.push(lp);
    }
    const cells = [];
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const picture = element.querySelector(".xpr-promoCard__media picture, .xpr-promoCard__image picture, picture");
    let img = null;
    if (picture) {
      img = picture.querySelector("img");
    } else {
      img = element.querySelector(".xpr-promoCard__media img, img.cmp-image__image");
    }
    const textCell = [];
    const eyebrow = element.querySelector(".xpr-promoCard__eyebrow");
    if (eyebrow && clean(eyebrow.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean(eyebrow.textContent);
      textCell.push(p);
    }
    const titleEl = element.querySelector(".xpr-promoCard__title, h1, h2, h3");
    if (titleEl) {
      const visibleSpan = titleEl.querySelector(":scope > span");
      const headingText = clean(visibleSpan ? visibleSpan.textContent : titleEl.textContent);
      if (headingText) {
        const h = document.createElement("h2");
        h.textContent = headingText;
        textCell.push(h);
      }
    }
    const body = element.querySelector(".xpr-promoCard__body");
    if (body) {
      const bodyText = clean(body.textContent);
      if (bodyText) {
        const p = document.createElement("p");
        p.textContent = bodyText;
        textCell.push(p);
      }
    }
    const ctas = element.querySelectorAll(".xpr-promoCard__ctas a[href], a.tdds-button[href]");
    ctas.forEach((a) => {
      const label = clean(a.textContent);
      if (!label) return;
      const link = document.createElement("a");
      link.setAttribute("href", a.getAttribute("href"));
      link.textContent = label;
      const strong = document.createElement("strong");
      strong.append(link);
      const wrap = document.createElement("p");
      wrap.append(strong);
      textCell.push(wrap);
    });
    const legalEl = element.querySelector(".xpr-promoCard__legal");
    if (legalEl) {
      const termsBtn = legalEl.querySelector("button, a");
      const termsText = clean(termsBtn ? termsBtn.textContent : "");
      const legalClone = legalEl.cloneNode(true);
      legalClone.querySelectorAll("button, a").forEach((b) => b.remove());
      const legalText = clean(legalClone.textContent);
      if (legalText || termsText) {
        const lp = document.createElement("p");
        if (legalText) lp.append(document.createTextNode(`${legalText} `));
        if (termsText) {
          const first = ctas[0];
          const terms = document.createElement("a");
          terms.setAttribute("href", first ? first.getAttribute("href") : "#");
          terms.textContent = termsText;
          lp.append(terms);
        }
        textCell.push(lp);
      }
    }
    if (!img && textCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageCell = img ? [img] : [""];
    const cells = [[imageCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-deal.js
  function parse3(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const cards = element.querySelectorAll(".xpr-promoCard__card");
    const cells = [];
    cards.forEach((card) => {
      const picture = card.querySelector(".xpr-promoCard__media picture, .xpr-promoCard__image picture, picture");
      const img = picture ? picture.querySelector("img") : card.querySelector(".xpr-promoCard__media img, img.cmp-image__image");
      const body = [];
      const badge = card.querySelector(".xpr-promoCard__badge");
      if (badge) {
        const badgeSpan = badge.querySelector("span");
        const badgeText = clean(badgeSpan ? badgeSpan.textContent : badge.textContent);
        if (badgeText) {
          const p = document.createElement("p");
          p.textContent = badgeText;
          body.push(p);
        }
      }
      const eyebrow = card.querySelector(".xpr-promoCard__eyebrow");
      if (eyebrow && clean(eyebrow.textContent)) {
        const p = document.createElement("p");
        p.textContent = clean(eyebrow.textContent);
        body.push(p);
      }
      const titleEl = card.querySelector(".xpr-promoCard__title, h2, h3");
      if (titleEl) {
        const span = titleEl.querySelector(":scope > span");
        const headingText = clean(span ? span.textContent : titleEl.textContent);
        if (headingText) {
          const h = document.createElement("h3");
          h.textContent = headingText;
          body.push(h);
        }
      }
      const bodyEl = card.querySelector(".xpr-promoCard__body");
      if (bodyEl) {
        const paras = bodyEl.querySelectorAll(":scope > p");
        const sources = paras.length ? paras : [bodyEl];
        sources.forEach((src) => {
          const t = clean(src.textContent);
          if (t) {
            const p = document.createElement("p");
            p.textContent = t;
            body.push(p);
          }
        });
      }
      const ctas = card.querySelectorAll(".xpr-promoCard__ctas a[href], a.tdds-button[href]");
      ctas.forEach((a) => {
        const label = clean(a.textContent);
        if (!label) return;
        const link = document.createElement("a");
        link.setAttribute("href", a.getAttribute("href"));
        link.textContent = label;
        const strong = document.createElement("strong");
        strong.append(link);
        const wrap = document.createElement("p");
        wrap.append(strong);
        body.push(wrap);
      });
      const legalEl = card.querySelector(".xpr-promoCard__legal");
      if (legalEl) {
        const termsBtn = legalEl.querySelector("button, a");
        const termsText = clean(termsBtn ? termsBtn.textContent : "");
        const legalClone = legalEl.cloneNode(true);
        legalClone.querySelectorAll("button, a").forEach((b) => b.remove());
        const legalText = clean(legalClone.textContent);
        if (legalText || termsText) {
          const lp = document.createElement("p");
          if (legalText) lp.append(document.createTextNode(`${legalText} `));
          if (termsText) {
            const first = ctas[0];
            const terms = document.createElement("a");
            terms.setAttribute("href", first ? first.getAttribute("href") : "#");
            terms.textContent = termsText;
            lp.append(terms);
          }
          body.push(lp);
        }
      }
      if (!img && body.length === 0) return;
      const imageCell = img ? [img] : [""];
      const bodyCell = body.length ? body : [""];
      cells.push([imageCell, bodyCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-deal", cells });
    const footnotes = [];
    element.querySelectorAll(".xpr-text__content").forEach((tc) => {
      if (tc.closest(".xpr-promoCard__card")) return;
      tc.querySelectorAll(":scope > p").forEach((p) => {
        const t = clean(p.textContent);
        if (t) {
          const fp = document.createElement("p");
          fp.textContent = t;
          footnotes.push(fp);
        }
      });
    });
    element.replaceWith(block, ...footnotes);
  }

  // tools/importer/parsers/cards-icon.js
  function parse4(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const cells = [];
    const grid = element.querySelector(".xpr-cardContainer__grid");
    const scope = grid || element;
    const tiles = scope.querySelectorAll(":scope > .xpr-column");
    tiles.forEach((tile) => {
      const picture = tile.querySelector(".xpr-image picture, picture");
      const img = picture ? picture.querySelector("img") : tile.querySelector("img.cmp-image__image");
      const body = [];
      const textBlocks = tile.querySelectorAll(".xpr-text .xpr-text__content");
      textBlocks.forEach((tb, idx) => {
        const onlyButton = tb.querySelector("button") && !tb.querySelector("a") && clean(tb.textContent).toLowerCase() === "get full terms";
        if (onlyButton) return;
        const para = tb.querySelector("p") || tb;
        const clone = para.cloneNode(true);
        clone.querySelectorAll("button").forEach((b) => b.remove());
        if (!clean(clone.textContent)) return;
        const anchors = clone.querySelectorAll("a[href]");
        if (idx === 0 && anchors.length === 0) {
          const h = document.createElement("h3");
          h.textContent = clean(clone.textContent);
          body.push(h);
        } else {
          const p = document.createElement("p");
          para.childNodes.forEach((node) => {
            if (node.nodeType === 3) {
              const t = node.textContent.replace(/\s+/g, " ");
              if (t.trim()) p.append(document.createTextNode(t));
            } else if (node.nodeName === "A" && node.getAttribute("href")) {
              const a = document.createElement("a");
              a.setAttribute("href", node.getAttribute("href"));
              a.textContent = clean(node.textContent);
              p.append(a);
            } else if (node.nodeName === "BUTTON") {
            } else {
              const t = clean(node.textContent);
              if (t) p.append(document.createTextNode(` ${t} `));
            }
          });
          if (clean(p.textContent)) body.push(p);
        }
      });
      if (!img && body.length === 0) return;
      const iconCell = img ? [img] : [""];
      const bodyCell = body.length ? body : [""];
      cells.push([iconCell, bodyCell]);
    });
    const footnote = element.querySelector('.xpr-text__content[class*="ta-center"]');
    if (footnote && cells.length) {
      const fClone = footnote.cloneNode(true);
      fClone.querySelectorAll("button").forEach((b) => b.remove());
      const fText = clean(fClone.textContent);
      const already = cells.some((row) => row[1].some((el) => clean(el.textContent) === fText));
      if (fText && !already) {
        const p = document.createElement("p");
        p.textContent = fText;
        cells[cells.length - 1][1].push(p);
      }
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-deal.js
  function parse5(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const slides = element.querySelectorAll(".xpr-promoCard__card");
    const cells = [];
    slides.forEach((card) => {
      const picture = card.querySelector(".xpr-promoCard__media picture, .xpr-promoCard__image picture, picture");
      const img = picture ? picture.querySelector("img") : card.querySelector(".xpr-promoCard__media img, img.cmp-image__image");
      const body = [];
      const badge = card.querySelector(".xpr-promoCard__badge, .xpr-promoCard__tag");
      if (badge) {
        const badgeSpan = badge.querySelector("span");
        const badgeText = clean(badgeSpan ? badgeSpan.textContent : badge.textContent);
        if (badgeText) {
          const p = document.createElement("p");
          p.textContent = badgeText;
          body.push(p);
        }
      }
      const eyebrow = card.querySelector(".xpr-promoCard__eyebrow");
      if (eyebrow && clean(eyebrow.textContent)) {
        const p = document.createElement("p");
        p.textContent = clean(eyebrow.textContent);
        body.push(p);
      }
      const titleEl = card.querySelector(".xpr-promoCard__title, h2, h3");
      if (titleEl) {
        const span = titleEl.querySelector(":scope > span");
        const headingText = clean(span ? span.textContent : titleEl.textContent);
        if (headingText) {
          const h = document.createElement("h3");
          h.textContent = headingText;
          body.push(h);
        }
      }
      const bodyEl = card.querySelector(".xpr-promoCard__body");
      if (bodyEl) {
        const paras = bodyEl.querySelectorAll(":scope > p");
        const sources = paras.length ? paras : [bodyEl];
        sources.forEach((src) => {
          const t = clean(src.textContent);
          if (t) {
            const p = document.createElement("p");
            p.textContent = t;
            body.push(p);
          }
        });
      }
      const ctas = card.querySelectorAll(".xpr-promoCard__ctas a[href], a.tdds-button[href]");
      ctas.forEach((a) => {
        const label = clean(a.textContent);
        if (!label) return;
        const link = document.createElement("a");
        link.setAttribute("href", a.getAttribute("href"));
        link.textContent = label;
        const strong = document.createElement("strong");
        strong.append(link);
        const wrap = document.createElement("p");
        wrap.append(strong);
        body.push(wrap);
      });
      const legalEl = card.querySelector(".xpr-promoCard__legal");
      if (legalEl) {
        const termsBtn = legalEl.querySelector("button, a");
        const termsText = clean(termsBtn ? termsBtn.textContent : "");
        const legalClone = legalEl.cloneNode(true);
        legalClone.querySelectorAll("button, a").forEach((b) => b.remove());
        const legalText = clean(legalClone.textContent);
        if (legalText || termsText) {
          const lp = document.createElement("p");
          if (legalText) lp.append(document.createTextNode(`${legalText} `));
          if (termsText) {
            const first = ctas[0];
            const terms = document.createElement("a");
            terms.setAttribute("href", first ? first.getAttribute("href") : "#");
            terms.textContent = termsText;
            lp.append(terms);
          }
          body.push(lp);
        }
      }
      if (!img && body.length === 0) return;
      const imageCell = img ? [img] : [""];
      const bodyCell = body.length ? body : [""];
      cells.push([imageCell, bodyCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-deal", cells });
    const headlineEl = element.querySelector(".xpr-cardContainer__headline .xpr-headline__title, .xpr-headline__title, h1");
    const headlineText = clean(headlineEl ? headlineEl.textContent : "");
    const before = [];
    if (headlineText) {
      const h = document.createElement("h2");
      h.textContent = headlineText;
      before.push(h);
    }
    const footnotes = [];
    element.querySelectorAll(".xpr-text__content").forEach((tc) => {
      if (tc.closest(".xpr-promoCard__card")) return;
      tc.querySelectorAll(":scope > p").forEach((p) => {
        const t = clean(p.textContent);
        if (t) {
          const fp = document.createElement("p");
          fp.textContent = t;
          footnotes.push(fp);
        }
      });
    });
    element.replaceWith(...before, block, ...footnotes);
  }

  // tools/importer/parsers/cards-explore.js
  function parse6(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const tiles = element.querySelectorAll(".xpr-promoCard__card");
    const cells = [];
    tiles.forEach((card) => {
      const picture = card.querySelector(".xpr-promoCard__media picture, .xpr-promoCard__image picture, picture");
      const img = picture ? picture.querySelector("img") : card.querySelector(".xpr-promoCard__media img, img.cmp-image__image");
      const cta = card.querySelector(".xpr-promoCard__ctas a[href], a.tdds-button[href]");
      const titleLink = card.querySelector("a.xpr-promoCard__titleLink[href]");
      const href = cta && cta.getAttribute("href") || titleLink && titleLink.getAttribute("href") || "";
      let label = clean(cta ? cta.textContent : "");
      if (!label) {
        const titleEl = card.querySelector(".xpr-promoCard__title, h2, h3");
        const span = titleEl && titleEl.querySelector(":scope > span");
        label = clean(span ? span.textContent : titleEl ? titleEl.textContent : "");
      }
      if (!img && !label) return;
      const iconCell = img ? [img] : [""];
      let labelCell;
      if (href && label) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = label;
        labelCell = [link];
      } else if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        labelCell = [p];
      } else {
        labelCell = [""];
      }
      cells.push([iconCell, labelCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-explore", cells });
    const headlineEl = element.querySelector(".xpr-headline__title, h2.xpr-headline__title, h1");
    const headlineText = clean(headlineEl ? headlineEl.textContent : "");
    if (headlineText) {
      const h = document.createElement("h2");
      h.textContent = headlineText;
      element.replaceWith(h, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/tmobile-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Hidden "Get full terms" disclosure dialogs and the MoEngage opt-in
        // dialog. Found in cleaned.html as <div ... class="phx-modal ..."
        // role="dialog" aria-hidden="true"> (incl. #moengage-optin-id which
        // also carries the phx-modal class). These duplicate the visible
        // legal copy in hidden overlays and are not authored page content.
        ".phx-modal",
        // Cookie / consent banner. Found: <div id="onetrust-consent-sdk"> and
        // <div id="onetrust-pc-sdk"> near the end of <body>.
        "#onetrust-consent-sdk",
        // Branch.io app-download journey banner slot. Found: first child of
        // <header>: <div class="branch-journeys-top">.
        ".branch-journeys-top",
        // Toast/snackbar widget. Found after </footer>: <div class="xpr-snackbar">.
        ".xpr-snackbar"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Global site header / universal nav. Found: <header id="content-header"
        // class="xpr-layoutHeader"> containing .unav-header and <nav> elements.
        "header",
        // Global site footer. Found: <footer id="content-footer"
        // class="xpr-layoutFooter"> containing .unav-footer and <nav> elements.
        "footer",
        // Any remaining navigation landmarks (all sit inside header/footer in
        // this DOM; listed defensively). Found: <nav class="unav-header__nav">,
        // <nav class="unav-header__universal">, <nav class="unav-footer__nav">,
        // <nav class="unav-footerUniversal__nav">.
        "nav",
        // MoEngage config container. Found after </footer>: <div class="moEngage">
        // with an empty <div id="moe-config">.
        ".moEngage",
        // Empty script-injection placeholders. Found as repeated
        // <div class="scriptInjector"></div> after </footer>.
        ".scriptInjector",
        // Tracking pixels rendered as images. Found: <img class="mediatag" ...>
        // (amazon-adsystem, ispot.tv, ojrq beacons).
        ".mediatag",
        // Microsoft Bing UET tracking beacons. Found: <div id="batBeacon548100467328">
        // and <img id="batBeacon...">.
        '[id^="batBeacon"]',
        // Tracking / advertising iframes (TTD universal pixel, DoubleClick
        // activity, Twitter/OneTrust resize). Found: 7 <iframe> elements.
        "iframe",
        // Client-library stylesheet <link> tags injected by AEM components.
        // Found: 5 <link href="/etc.clientlibs/..."> elements.
        "link",
        // Defensive: no-JS fallbacks (none present in this capture, harmless).
        "noscript"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("x-data");
        el.removeAttribute("x-show");
        el.removeAttribute("x-cloak");
        el.removeAttribute("x-if");
        el.removeAttribute("data-moengage-id");
        el.removeAttribute("data-analytics-component-title");
      });
    }
  }

  // tools/importer/transformers/tmobile-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var DOCUMENT_POSITION_PRECEDING = 2;
  var DOCUMENT_POSITION_FOLLOWING = 4;
  function hasAdjacentContent(root, node, direction) {
    const mask = direction === "before" ? DOCUMENT_POSITION_PRECEDING : DOCUMENT_POSITION_FOLLOWING;
    const all = root.querySelectorAll("*");
    for (const el of all) {
      if (el === node || node.contains(el) || el.contains(node)) continue;
      if (el.tagName === "HR") continue;
      if (node.compareDocumentPosition(el) & mask) return true;
    }
    return false;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (!sections.length) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section) continue;
      const selectors = Array.isArray(section.selector) ? section.selector : section.selector ? [section.selector] : [];
      if (!selectors.length) continue;
      let sectionEl = null;
      for (const sel of selectors) {
        try {
          sectionEl = element.querySelector(sel);
        } catch (e) {
          sectionEl = null;
        }
        if (sectionEl) break;
      }
      if (!sectionEl) continue;
      let closeAfter = sectionEl;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metaBlock);
        closeAfter = metaBlock;
      }
      if (hasAdjacentContent(element, closeAfter, "after")) {
        closeAfter.after(doc.createElement("hr"));
      }
      if (hasAdjacentContent(element, sectionEl, "before")) {
        sectionEl.before(doc.createElement("hr"));
      }
    }
  }

  // tools/importer/transformers/tmobile-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    if (typeof urlStr !== "string") return false;
    if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-apple-iphone-deals.js
  var PAGE_TEMPLATE = {
    name: "apple-iphone-deals",
    description: "T-Mobile Apple iPhone deals landing page: an offers/deals page featuring a promo banner, a featured hero deal, deal-card rows, icon feature tiles, three horizontally scrolling deal carousels (iPhone / Apple Watch + iPad / accessories), and an 'Explore T-Mobile' icon-link row.",
    urls: [
      "https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple"
    ],
    blocks: [
      {
        name: "hero-promo",
        instances: ["#APPLE-DEALS-MOD-0-Prospect", ".cmp-experiencefragment--xftmo-pencil-banner"]
      },
      {
        name: "columns",
        instances: ["#APPLE-DEALS-MOD-1-Prospect"]
      },
      {
        name: "cards-deal",
        instances: [".cmp-experiencefragment--prospect-apple-deals-mod-2"]
      },
      {
        name: "cards-icon",
        instances: [".cmp-experiencefragment--prospect-apple-deals-mod-3"]
      },
      {
        name: "carousel-deal",
        instances: [
          ".cmp-experiencefragment--prospect-apple-deals-mod-4",
          ".cmp-experiencefragment--prospect-apple-deals-mod-5",
          ".cmp-experiencefragment--prospect-apple-deals-mod-6"
        ]
      },
      {
        name: "cards-explore",
        instances: [".cmp-experiencefragment--prospect-apple-deals-mod-8"]
      }
    ],
    sections: [
      {
        id: "section-promo-banner",
        name: "Full-width magenta promo banner",
        selector: [".cmp-experiencefragment--xftmo-pencil-banner"],
        style: "magenta-promo",
        blocks: ["hero-promo"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero-promo": parse,
    columns: parse2,
    "cards-deal": parse3,
    "cards-icon": parse4,
    "carousel-deal": parse5,
    "cards-explore": parse6
  };
  var transformers = [
    transform,
    transform3,
    // Section transformer materializes styled-section breaks + metadata.
    // Included whenever the template declares at least one styled section
    // (this template isolates the magenta promo banner as its own section).
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 0 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_apple_iphone_deals_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_apple_iphone_deals_exports);
})();
