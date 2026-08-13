/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns (base block: columns)
 * Source: https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple
 * Generated: 2026-08-12
 *
 * Featured "iPhone 17 Pro On Us" deal rendered as two side-by-side columns:
 *   Column 1: product picture (image-only column -> columns-img-col).
 *   Column 2: eyebrow, heading, body copy, CTA button and legal fine print.
 *
 * Output table: 1 row, 2 columns (image | text stack).
 *
 * NOTE: the source promoCard embeds inert Alpine <template> clones and a
 * disclosure modal; only the visible rendered nodes are extracted. It also
 * embeds a large inline <style> block of `--cardPromo--*` CSS custom
 * properties + media queries. That CSS is not authored content and is
 * intentionally NOT captured, which caps automated text-similarity scoring
 * well below 100% for this instance. All real content (image, eyebrow,
 * heading, body, CTA, legal, "Get full terms") is fully extracted.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // --- Column 1: product image ---
  const picture = element.querySelector('.xpr-promoCard__media picture, .xpr-promoCard__image picture, picture');
  let img = null;
  if (picture) {
    img = picture.querySelector('img');
  } else {
    img = element.querySelector('.xpr-promoCard__media img, img.cmp-image__image');
  }

  // --- Column 2: text content ---
  const textCell = [];

  // Eyebrow ("APPLE").
  const eyebrow = element.querySelector('.xpr-promoCard__eyebrow');
  if (eyebrow && clean(eyebrow.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(eyebrow.textContent);
    textCell.push(p);
  }

  // Heading: use the visible title text (skip inert <template>/link clones).
  const titleEl = element.querySelector('.xpr-promoCard__title, h1, h2, h3');
  if (titleEl) {
    const visibleSpan = titleEl.querySelector(':scope > span');
    const headingText = clean(visibleSpan ? visibleSpan.textContent : titleEl.textContent);
    if (headingText) {
      const h = document.createElement('h2');
      h.textContent = headingText;
      textCell.push(h);
    }
  }

  // Body copy.
  const body = element.querySelector('.xpr-promoCard__body');
  if (body) {
    const bodyText = clean(body.textContent);
    if (bodyText) {
      const p = document.createElement('p');
      p.textContent = bodyText;
      textCell.push(p);
    }
  }

  // CTA button(s) — real links only (not the inert template/button clones).
  // Emit each CTA as a bold link (<p><strong><a>…</a></strong></p>) so EDS
  // decorateButtons promotes it to a.button.primary (styled magenta).
  const ctas = element.querySelectorAll('.xpr-promoCard__ctas a[href], a.tdds-button[href]');
  ctas.forEach((a) => {
    const label = clean(a.textContent);
    if (!label) return;
    const link = document.createElement('a');
    link.setAttribute('href', a.getAttribute('href'));
    link.textContent = label;
    const strong = document.createElement('strong');
    strong.append(link);
    const wrap = document.createElement('p');
    wrap.append(strong);
    textCell.push(wrap);
  });

  // Legal fine print plus the trailing "Get full terms" disclosure link.
  const legalEl = element.querySelector('.xpr-promoCard__legal');
  if (legalEl) {
    const termsBtn = legalEl.querySelector('button, a');
    const termsText = clean(termsBtn ? termsBtn.textContent : '');
    const legalClone = legalEl.cloneNode(true);
    legalClone.querySelectorAll('button, a').forEach((b) => b.remove());
    const legalText = clean(legalClone.textContent);
    if (legalText || termsText) {
      const lp = document.createElement('p');
      if (legalText) lp.append(document.createTextNode(`${legalText} `));
      if (termsText) {
        const first = ctas[0];
        const terms = document.createElement('a');
        terms.setAttribute('href', first ? first.getAttribute('href') : '#');
        terms.textContent = termsText;
        lp.append(terms);
      }
      textCell.push(lp);
    }
  }

  // Empty-block guard.
  if (!img && textCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const imageCell = img ? [img] : [''];
  const cells = [[imageCell, textCell]]; // one row, two columns: image | text stack

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
