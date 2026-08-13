/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-explore (base block: cards)
 * Source: https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple
 * Generated: 2026-08-12
 *
 * A compact row of icon links ("Explore T-Mobile"). Each source promoCard
 * becomes one table row (= one tile). decorate() treats a picture-only cell as
 * the tile icon and the remaining cell as the tile label; a single link inside
 * the tile makes the whole tile clickable.
 *
 * Output table: 2 columns, one row per tile:
 *   Column 1: line-art icon image.
 *   Column 2: a single label link (uppercase label text -> destination URL).
 *
 * NOTE: each promoCard embeds inert Alpine <template> clones, a disclosure
 * modal and a large inline <style> block of `--cardPromo--*` CSS custom
 * properties. Templates/modals/CSS are not authored content and are not
 * captured; only the visible icon + label link are extracted. This caps
 * automated text-similarity scoring well below 100% for this instance.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const tiles = element.querySelectorAll('.xpr-promoCard__card');
  const cells = [];

  tiles.forEach((card) => {
    // Icon.
    const picture = card.querySelector('.xpr-promoCard__media picture, .xpr-promoCard__image picture, picture');
    const img = picture ? picture.querySelector('img') : card.querySelector('.xpr-promoCard__media img, img.cmp-image__image');

    // Label + destination. Prefer the real CTA button (has readable label text
    // like "Home Internet"); fall back to the visible title link.
    const cta = card.querySelector('.xpr-promoCard__ctas a[href], a.tdds-button[href]');
    const titleLink = card.querySelector('a.xpr-promoCard__titleLink[href]');
    const href = (cta && cta.getAttribute('href')) || (titleLink && titleLink.getAttribute('href')) || '';

    // Label text: CTA text is the human-readable label; otherwise the title.
    let label = clean(cta ? cta.textContent : '');
    if (!label) {
      const titleEl = card.querySelector('.xpr-promoCard__title, h2, h3');
      const span = titleEl && titleEl.querySelector(':scope > span');
      label = clean(span ? span.textContent : (titleEl ? titleEl.textContent : ''));
    }

    if (!img && !label) return;

    const iconCell = img ? [img] : [''];

    // Single label link makes the whole tile clickable (decorate() requirement).
    let labelCell;
    if (href && label) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = label;
      labelCell = [link];
    } else if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      labelCell = [p];
    } else {
      labelCell = [''];
    }

    cells.push([iconCell, labelCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-explore', cells });

  // The "Explore T-Mobile." section headline sits above the tiles inside the
  // matched module. cards-explore has no headline row, so emit it as an
  // adjacent section heading instead of losing it on replace.
  const headlineEl = element.querySelector('.xpr-headline__title, h2.xpr-headline__title, h1');
  const headlineText = clean(headlineEl ? headlineEl.textContent : '');
  if (headlineText) {
    const h = document.createElement('h2');
    h.textContent = headlineText;
    element.replaceWith(h, block);
  } else {
    element.replaceWith(block);
  }
}
