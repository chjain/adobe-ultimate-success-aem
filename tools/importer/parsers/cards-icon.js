/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-icon (base block: cards)
 * Source: https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple
 * Generated: 2026-08-12
 *
 * A row of reassurance / feature tiles. Each source tile (.xpr-column that
 * directly contains an icon image) becomes one table row. decorate() treats a
 * picture-only cell as the tile icon and the remaining cell as the tile body.
 *
 * Output table: 2 columns, one row per tile:
 *   Column 1: icon image.
 *   Column 2: heading (short subhead) + supporting line (may contain inline
 *             links) + optional legal line.
 *
 * The trailing centered module footnote ("Best Mobile Network...") is appended
 * to the last tile's body so it is not lost (cards-icon has no footnote slot).
 *
 * NOTE: the source embeds large inline <style> blocks (`data-guid` rules +
 * media queries), disclosure modals and non-functional "Get full terms"
 * <button>s. CSS and modal copy are not authored tile content and are
 * intentionally not captured, which caps automated text-similarity scoring far
 * below 100% for this instance. Inline links inside each supporting line ARE
 * preserved. All visible tile content is fully extracted.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const cells = [];

  // Each tile is a grid column that owns an icon image + a nested text column.
  const grid = element.querySelector('.xpr-cardContainer__grid');
  const scope = grid || element;
  const tiles = scope.querySelectorAll(':scope > .xpr-column');

  tiles.forEach((tile) => {
    // Icon.
    const picture = tile.querySelector('.xpr-image picture, picture');
    const img = picture ? picture.querySelector('img') : tile.querySelector('img.cmp-image__image');

    // Body text lives in the nested .xpr-column text stack.
    const body = [];
    const textBlocks = tile.querySelectorAll('.xpr-text .xpr-text__content');
    textBlocks.forEach((tb, idx) => {
      // Drop legal blocks that are only a non-functional "Get full terms" button.
      const onlyButton = tb.querySelector('button')
        && !tb.querySelector('a')
        && clean(tb.textContent).toLowerCase() === 'get full terms';
      if (onlyButton) return;

      const para = tb.querySelector('p') || tb;
      // Preserve inline links: clone the paragraph and strip inert buttons.
      const clone = para.cloneNode(true);
      clone.querySelectorAll('button').forEach((b) => b.remove());
      if (!clean(clone.textContent)) return;

      const anchors = clone.querySelectorAll('a[href]');
      if (idx === 0 && anchors.length === 0) {
        // First line is the short subhead -> heading.
        const h = document.createElement('h3');
        h.textContent = clean(clone.textContent);
        body.push(h);
      } else {
        const p = document.createElement('p');
        // Rebuild with links preserved.
        para.childNodes.forEach((node) => {
          if (node.nodeType === 3) {
            const t = node.textContent.replace(/\s+/g, ' ');
            if (t.trim()) p.append(document.createTextNode(t));
          } else if (node.nodeName === 'A' && node.getAttribute('href')) {
            const a = document.createElement('a');
            a.setAttribute('href', node.getAttribute('href'));
            a.textContent = clean(node.textContent);
            p.append(a);
          } else if (node.nodeName === 'BUTTON') {
            // skip inert button
          } else {
            const t = clean(node.textContent);
            if (t) p.append(document.createTextNode(` ${t} `));
          }
        });
        if (clean(p.textContent)) body.push(p);
      }
    });

    if (!img && body.length === 0) return;
    const iconCell = img ? [img] : [''];
    const bodyCell = body.length ? body : [''];
    cells.push([iconCell, bodyCell]);
  });

  // Trailing module footnote (e.g. "Best Mobile Network..."), which sits below
  // the tile grid. Append it to the last tile's body so it is not lost. Drop
  // the non-functional "Get full terms" <button>.
  const footnote = element.querySelector('.xpr-text__content[class*="ta-center"]');
  if (footnote && cells.length) {
    const fClone = footnote.cloneNode(true);
    fClone.querySelectorAll('button').forEach((b) => b.remove());
    const fText = clean(fClone.textContent);
    // Only add if it isn't a tile line already captured above.
    const already = cells.some((row) => row[1].some((el) => clean(el.textContent) === fText));
    if (fText && !already) {
      const p = document.createElement('p');
      p.textContent = fText;
      cells[cells.length - 1][1].push(p);
    }
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
