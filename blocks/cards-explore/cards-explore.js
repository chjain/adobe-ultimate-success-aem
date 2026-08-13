import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-explore
 * A compact row of icon links. Each tile is a line-art icon above an uppercase
 * label, and the whole tile links to another area of the site.
 *
 * Authored structure: one row per tile, each containing an image (icon) and a
 * link (label). If a link is present, the entire tile becomes clickable.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-explore-tile';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-explore-tile-icon';
      } else {
        div.className = 'cards-explore-tile-label';
      }
    });

    // Make the whole tile clickable when it contains a single link.
    const link = li.querySelector('a');
    if (link) {
      link.classList.add('cards-explore-tile-link');
      link.setAttribute('aria-label', link.textContent.trim());
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '120' }])));

  block.replaceChildren(ul);
}
