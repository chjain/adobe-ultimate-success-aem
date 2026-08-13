/**
 * carousel-deal
 * A horizontally scrolling carousel of promotional deal cards. Each authored
 * row becomes one slide. A slide may contain an optional availability tag /
 * badge, an eyebrow ("APPLE"), a product image, a heading, body copy, one or
 * more CTAs and legal fine print.
 *
 * Prev/next controls scroll the track by roughly one slide. On touch devices
 * the track is natively swipeable.
 *
 * @param {Element} block The block element
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

function scrollByCard(track, direction) {
  const first = track.querySelector('.carousel-deal-slide');
  const step = first ? first.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
  track.scrollBy({ left: step * direction, behavior: 'smooth' });
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-deal-track';

  [...block.children].forEach((row) => {
    const slide = document.createElement('li');
    slide.className = 'carousel-deal-slide';
    while (row.firstElementChild) slide.append(row.firstElementChild);

    [...slide.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'carousel-deal-slide-image';
      } else {
        div.className = 'carousel-deal-slide-body';
      }
    });

    track.append(slide);
  });

  track.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Navigation controls
  const nav = document.createElement('div');
  nav.className = 'carousel-deal-nav';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-deal-btn carousel-deal-btn-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '&#8592;';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-deal-btn carousel-deal-btn-next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '&#8594;';

  prev.addEventListener('click', () => scrollByCard(track, -1));
  next.addEventListener('click', () => scrollByCard(track, 1));

  nav.append(prev, next);

  block.replaceChildren(track, nav);
}
