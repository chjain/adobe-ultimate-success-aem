import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-deal
 * A row of distinct, repeatable promotional deal cards. Each card may contain
 * an optional badge (e.g. "Back-to-School Deal"), an eyebrow ("APPLE"), a
 * product image, a heading, body copy, one or more CTAs and legal fine print.
 * The card with a full-bleed graphic (image only, no separate body) renders as
 * a graphic tile.
 *
 * Authored structure: one row per card. Each row's cells become the card body,
 * with any picture-only cell treated as the card image.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-deal-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-deal-card-image';
      } else {
        div.className = 'cards-deal-card-body';
      }
    });

    // A card that is only an image is a full-bleed graphic tile.
    if (li.children.length === 1 && li.querySelector('.cards-deal-card-image')) {
      li.classList.add('cards-deal-card-graphic');
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  block.replaceChildren(ul);
}
