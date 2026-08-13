import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-icon
 * A row of reassurance / feature tiles. Each tile has a small icon or badge
 * graphic, a short heading and a supporting line that may contain an inline
 * link.
 *
 * Authored structure: one row per tile. The picture-only cell becomes the
 * icon; the remaining cell(s) become the tile body.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-icon-tile';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-icon-tile-icon';
      } else {
        div.className = 'cards-icon-tile-body';
      }
    });

    ul.append(li);
  });

  // Icons are small; render at a modest width.
  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }])));

  block.replaceChildren(ul);
}
