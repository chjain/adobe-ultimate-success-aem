import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Rewrite fragment-relative image sources to absolute /content/images/ paths so
 * they resolve regardless of the page the footer is rendered on. Mirrors the
 * approach used by the header block for nav images.
 * @param {Element} scope container to search for images
 */
function absolutizeImages(scope) {
  scope.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/') && !src.startsWith('data:')) {
      img.setAttribute('src', `/content/${src.replace(/^\.\//, '')}`);
    }
  });
}

/**
 * Load the footer fragment, preferring the local content path and falling back
 * to the metadata-configured path. Returns the fragment root or null.
 * @returns {Promise<Element|null>}
 */
async function loadFooterFragment() {
  const fragment = await loadFragment('/content/footer');
  if (fragment) return fragment;
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  return loadFragment(footerPath);
}

/**
 * Attach expand/collapse behavior to a group heading. On desktop the group is
 * always shown; on mobile the heading toggles its associated list.
 * @param {Element} heading the group heading element
 */
function wireGroupToggle(heading) {
  heading.setAttribute('role', 'button');
  heading.setAttribute('tabindex', '0');
  heading.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
  const toggle = () => {
    if (isDesktop.matches) return;
    const open = heading.getAttribute('aria-expanded') === 'true';
    heading.setAttribute('aria-expanded', open ? 'false' : 'true');
  };
  heading.addEventListener('click', toggle);
  heading.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      toggle();
    }
  });
}

/**
 * Build the multi-column sitemap from the region that contains the headed
 * link groups (headings followed by lists). Groups each heading with its
 * following list so columns can wrap independently.
 * @param {Element} region the sitemap region element
 */
function decorateSitemap(region) {
  region.classList.add('footer-sitemap');
  const groups = [];
  let current = null;
  [...region.children].forEach((child) => {
    const tag = child.tagName.toLowerCase();
    if (tag === 'h2' || tag === 'h3') {
      current = document.createElement('div');
      current.className = 'footer-sitemap-group';
      region.insertBefore(current, child);
      current.append(child);
      groups.push(current);
    } else if (current) {
      current.append(child);
    }
  });
  groups.forEach((group) => {
    const heading = group.querySelector('h2, h3');
    if (heading) wireGroupToggle(heading);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await loadFooterFragment();
  if (!fragment) return;

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  absolutizeImages(footer);

  // EDS wraps each authored section in a `.default-content-wrapper`; unwrap so
  // the authored headings/lists/paragraphs become direct region children.
  footer.querySelectorAll(':scope > div').forEach((section) => {
    section.querySelectorAll(':scope > .default-content-wrapper').forEach((wrapper) => {
      while (wrapper.firstChild) section.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    });
  });

  // Tag each top-level region by the content it carries so CSS can lay it out.
  const regions = [...footer.children];
  regions.forEach((region) => {
    const hasImageLink = !!region.querySelector('p a img');
    const headingCount = region.querySelectorAll(':scope > h2, :scope > h3').length;
    const listCount = region.querySelectorAll(':scope > ul').length;
    const firstHeading = region.querySelector(':scope > h2, :scope > h3');
    const headingText = firstHeading ? firstHeading.textContent.trim().toLowerCase() : '';

    region.classList.add('footer-region');
    if (headingCount >= 3 && listCount >= 3) {
      region.classList.add('footer-region-sitemap');
      decorateSitemap(region);
    } else if (headingText.includes('follow') || (hasImageLink && listCount === 0)) {
      region.classList.add('footer-region-social');
    } else if (headingText.includes('language') || /^\s*(english|español)\s*$/im.test(region.textContent)) {
      region.classList.add('footer-region-locale');
    } else if (hasImageLink && listCount >= 1) {
      region.classList.add('footer-region-corporate');
    } else if (listCount >= 1) {
      region.classList.add('footer-region-legal');
    } else {
      region.classList.add('footer-region-legalese');
    }
  });

  // Keep group headings in sync when crossing the desktop breakpoint.
  isDesktop.addEventListener('change', () => {
    footer.querySelectorAll('.footer-sitemap-group > h2, .footer-sitemap-group > h3').forEach((heading) => {
      heading.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
    });
  });

  block.append(footer);
}
