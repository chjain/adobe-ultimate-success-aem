/**
 * hero-promo
 * Full-width magenta promo banner: a single centered promo line with an
 * optional small disclosure link. The whole band is clickable when a link
 * is present.
 *
 * Expected authored structure (one row):
 *   | Get a new phone. Pay nothing upfront. [Get full terms](#) |
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Flatten the single-row/single-cell structure into the banner content.
  const cell = block.querySelector(':scope > div > div') || block.firstElementChild;
  if (!cell) return;

  cell.classList.add('hero-promo-content');

  // Promote a lone leading link that wraps the whole banner to a full-bleed
  // overlay link; keep any trailing (disclosure) link inline.
  const links = [...cell.querySelectorAll('a')];
  const wrappingLink = links.find((a) => a.textContent.trim() && a.previousElementSibling === null
    && a.parentElement === cell && a.querySelector('*') === null
    && a.textContent.trim().length > 20);

  if (wrappingLink) {
    wrappingLink.classList.add('hero-promo-overlay-link');
    wrappingLink.setAttribute('aria-label', wrappingLink.textContent.trim());
  }

  // Mark short trailing links (e.g. "Get full terms") as disclosure links.
  links
    .filter((a) => a !== wrappingLink && a.textContent.trim().length <= 20)
    .forEach((a) => a.classList.add('hero-promo-terms'));

  block.replaceChildren(cell);
}
