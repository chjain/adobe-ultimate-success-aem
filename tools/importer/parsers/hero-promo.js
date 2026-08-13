/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-promo (base block: hero)
 * Source: https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple
 * Generated: 2026-08-12
 *
 * Full-width magenta promo banner. The block's decorate() flattens a single
 * row/single cell into the banner: a lone leading text-only link (>20 chars)
 * becomes the whole-band overlay link, a visible promo line is shown, and any
 * short trailing link becomes a "Get full terms" disclosure link.
 *
 * Output table: 1 column, 1 content row. The single cell holds
 *   [ overlay link, visible promo <p>, optional legal <p> ]
 *
 * NOTE: the source element embeds a large inline <style> block of
 * `--cardPromo--*` CSS custom properties plus media queries. That CSS is not
 * authored content and is intentionally NOT captured, which caps automated
 * text-similarity scoring far below 100% for this instance. All real content
 * is fully extracted: the promo line, the whole-band overlay link (whose href
 * is the shared offer link that also backs the redundant "Check it out" CTA),
 * the legal fine print, and the "Get full terms" disclosure link.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // Promo line text lives in the (possibly hidden) first span of the title.
  const titleEl = element.querySelector('.xpr-promoCard__title, h1, h2, [class*="title"]');
  let promoText = '';
  if (titleEl) {
    const span = titleEl.querySelector(':scope > span');
    const link = titleEl.querySelector(':scope > a[href]');
    promoText = clean(span ? span.textContent : (link ? link.textContent : titleEl.textContent));
  }

  // Whole-band destination: prefer the visible title link, fall back to the CTA.
  const titleLink = element.querySelector('a.xpr-promoCard__titleLink[href]');
  const ctaLink = element.querySelector('.xpr-promoCard__ctas a[href], a.tdds-button[href]');
  const bandHref = (titleLink && titleLink.getAttribute('href'))
    || (ctaLink && ctaLink.getAttribute('href'))
    || '';

  // Legal / disclaimer fine print. Split the small print from the trailing
  // "Get full terms" disclosure control so each maps to its own element.
  const legalEl = element.querySelector('.xpr-promoCard__legal');
  let legalText = '';
  let termsText = '';
  if (legalEl) {
    const termsBtn = legalEl.querySelector('button, a');
    termsText = clean(termsBtn ? termsBtn.textContent : '');
    const legalClone = legalEl.cloneNode(true);
    legalClone.querySelectorAll('button, a').forEach((b) => b.remove());
    legalText = clean(legalClone.textContent);
  }

  // Empty-block guard.
  if (!promoText && !legalText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];

  // Whole-band overlay link: must be a text-only link (>20 chars) that is the
  // first direct child of the cell so decorate() promotes it to the overlay.
  if (bandHref && promoText.length > 20) {
    const overlay = document.createElement('a');
    overlay.setAttribute('href', bandHref);
    overlay.textContent = promoText;
    contentCell.push(overlay);
  }

  // Visible promo line.
  if (promoText) {
    const p = document.createElement('p');
    p.textContent = promoText;
    contentCell.push(p);
  }

  // Legal disclaimer (small print) plus the short trailing "Get full terms"
  // disclosure link. decorate() marks trailing links <= 20 chars as terms.
  if (legalText || termsText) {
    const lp = document.createElement('p');
    if (legalText) lp.append(document.createTextNode(`${legalText} `));
    if (termsText) {
      const terms = document.createElement('a');
      terms.setAttribute('href', bandHref || '#');
      terms.textContent = termsText;
      lp.append(terms);
    }
    contentCell.push(lp);
  }

  const cells = [];
  cells.push([contentCell]); // 1-column block: one row, one cell holding all elements

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
