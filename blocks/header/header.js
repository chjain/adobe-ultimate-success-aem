import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapse every open dropdown in the given container.
 * @param {Element} container element holding the .nav-drop items
 */
function closeAllDropdowns(container) {
  if (!container) return;
  container.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    drop.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Collapse the mobile menu and reset the hamburger to its closed state.
 * @param {Element} nav the nav element
 */
function closeMobileMenu(nav) {
  nav.setAttribute('aria-expanded', 'false');
  document.body.style.overflowY = '';
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', 'Open navigation');
}

/**
 * Toggle the whole mobile menu open/closed.
 * @param {Element} nav the nav element
 */
function toggleMobileMenu(nav) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = expanded ? '' : 'hidden';
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (expanded) closeAllDropdowns(nav);
}

/**
 * Wire dropdown behavior on a list of top-level nav items that contain a nested <ul>.
 * Desktop: hover opens/closes. Mobile: tap the chevron toggles the accordion; the
 * label link still navigates.
 * @param {Element} scope container whose direct <li> children may be dropdowns
 * @param {Element} nav the nav element (for closing siblings)
 */
function decorateDropdowns(scope, nav) {
  if (!scope) return;
  scope.querySelectorAll(':scope > ul > li').forEach((li) => {
    const subMenu = li.querySelector(':scope > ul');
    if (!subMenu) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');

    // A chevron toggle button (built in JS, not authored in the fragment).
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drop-toggle';
    toggle.setAttribute('aria-label', 'Toggle submenu');
    const label = li.querySelector(':scope > a');
    if (label) label.after(toggle);

    // Desktop hover open/close.
    li.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      closeAllDropdowns(nav);
      li.setAttribute('aria-expanded', 'true');
    });
    li.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      li.setAttribute('aria-expanded', 'false');
    });

    // Chevron toggles the panel (both breakpoints); label navigates normally.
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = li.getAttribute('aria-expanded') === 'true';
      if (!open) closeAllDropdowns(nav);
      li.setAttribute('aria-expanded', open ? 'false' : 'true');
    });

    // Keyboard: Enter/Space on the toggle already fires click; also close on Escape.
    li.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') li.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment (dual-fetch: local content path first, then DA/EDS path)
  const navMeta = getMetadata('nav');
  let fragment;
  if (navMeta) {
    fragment = await loadFragment(new URL(navMeta, window.location).pathname);
  } else {
    fragment = await loadFragment('/content/nav');
    if (!fragment) fragment = await loadFragment('/nav');
  }
  if (!fragment) return;

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Map the four authored sections: brand, main nav, tools, utility bar.
  const sectionClasses = ['brand', 'sections', 'tools', 'utility'];
  sectionClasses.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // EDS wraps section content in a `.default-content-wrapper` div; unwrap it so
  // the authored <ul>/<p> become direct children (matches selectors below + CSS).
  nav.querySelectorAll(':scope > .section > .default-content-wrapper').forEach((wrapper) => {
    const parent = wrapper.parentElement;
    while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
    wrapper.remove();
  });

  // Brand: strip the redundant text link, keep the logo image link.
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const links = [...navBrand.querySelectorAll('a')];
    // remove the text-only "T-Mobile" link, keep the one wrapping the logo image
    links.forEach((a) => {
      if (!a.querySelector('img') && a.textContent.trim()) a.closest('p')?.remove();
    });
    // Nav images are authored with paths relative to the nav doc (/content/);
    // rewrite them to absolute so they resolve regardless of the current page.
    navBrand.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
        img.setAttribute('src', `/content/${src.replace(/^\.\//, '')}`);
      }
    });
    // ensure the logo image sits inside a link to home
    const logo = navBrand.querySelector('img');
    if (logo && !logo.closest('a')) {
      const home = document.createElement('a');
      home.href = '/';
      home.setAttribute('aria-label', 'T-Mobile home');
      logo.replaceWith(home);
      home.append(logo);
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  const navTools = nav.querySelector('.nav-tools');
  decorateDropdowns(navSections, nav);
  decorateDropdowns(navTools, nav);

  // Build the Search control in JS (not authored in the fragment).
  if (navTools) {
    const toolsList = navTools.querySelector(':scope > ul');
    if (toolsList) {
      const searchLi = document.createElement('li');
      searchLi.className = 'nav-search';
      const searchBtn = document.createElement('button');
      searchBtn.type = 'button';
      searchBtn.className = 'nav-search-toggle';
      searchBtn.setAttribute('aria-label', 'Search');
      searchBtn.setAttribute('aria-expanded', 'false');
      searchBtn.textContent = 'Search';

      const form = document.createElement('form');
      form.className = 'nav-search-form';
      form.setAttribute('role', 'search');
      form.action = 'https://www.t-mobile.com/search';
      const input = document.createElement('input');
      input.type = 'search';
      input.name = 'q';
      input.placeholder = 'Search';
      input.setAttribute('aria-label', 'Search T-Mobile');
      form.append(input);

      searchBtn.addEventListener('click', () => {
        const open = searchBtn.getAttribute('aria-expanded') === 'true';
        searchBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (!open) input.focus();
      });

      searchLi.append(searchBtn, form);
      // insert Search before the last item (My account) when present
      const items = [...toolsList.children];
      const myAccount = items.find((li) => /my account/i.test(li.textContent));
      if (myAccount) toolsList.insertBefore(searchLi, myAccount);
      else toolsList.append(searchLi);

      // flag the My account CTA for styling
      if (myAccount) myAccount.classList.add('nav-cta');
    }
  }

  // Hamburger for mobile.
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMobileMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Close menus / reset state when crossing the desktop breakpoint.
  isDesktop.addEventListener('change', () => {
    closeAllDropdowns(nav);
    if (isDesktop.matches) closeMobileMenu(nav);
  });

  // Close open desktop dropdowns when clicking outside the nav.
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAllDropdowns(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
