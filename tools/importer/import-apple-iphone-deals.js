/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPromoParser from './parsers/hero-promo.js';
import columnsParser from './parsers/columns.js';
import cardsDealParser from './parsers/cards-deal.js';
import cardsIconParser from './parsers/cards-icon.js';
import carouselDealParser from './parsers/carousel-deal.js';
import cardsExploreParser from './parsers/cards-explore.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/tmobile-cleanup.js';
import sectionsTransformer from './transformers/tmobile-sections.js';
import dmImagesTransformer from './transformers/tmobile-dm-images.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'apple-iphone-deals',
  description: "T-Mobile Apple iPhone deals landing page: an offers/deals page featuring a promo banner, a featured hero deal, deal-card rows, icon feature tiles, three horizontally scrolling deal carousels (iPhone / Apple Watch + iPad / accessories), and an 'Explore T-Mobile' icon-link row.",
  urls: [
    'https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple',
  ],
  blocks: [
    {
      name: 'hero-promo',
      instances: ['#APPLE-DEALS-MOD-0-Prospect', '.cmp-experiencefragment--xftmo-pencil-banner'],
    },
    {
      name: 'columns',
      instances: ['#APPLE-DEALS-MOD-1-Prospect'],
    },
    {
      name: 'cards-deal',
      instances: ['.cmp-experiencefragment--prospect-apple-deals-mod-2'],
    },
    {
      name: 'cards-icon',
      instances: ['.cmp-experiencefragment--prospect-apple-deals-mod-3'],
    },
    {
      name: 'carousel-deal',
      instances: [
        '.cmp-experiencefragment--prospect-apple-deals-mod-4',
        '.cmp-experiencefragment--prospect-apple-deals-mod-5',
        '.cmp-experiencefragment--prospect-apple-deals-mod-6',
      ],
    },
    {
      name: 'cards-explore',
      instances: ['.cmp-experiencefragment--prospect-apple-deals-mod-8'],
    },
  ],
  sections: [
    {
      id: 'section-promo-banner',
      name: 'Full-width magenta promo banner',
      selector: ['.cmp-experiencefragment--xftmo-pencil-banner'],
      style: 'magenta-promo',
      blocks: ['hero-promo'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY - Map block names to parser functions
const parsers = {
  'hero-promo': heroPromoParser,
  columns: columnsParser,
  'cards-deal': cardsDealParser,
  'cards-icon': cardsIconParser,
  'carousel-deal': carouselDealParser,
  'cards-explore': cardsExploreParser,
};

// TRANSFORMER REGISTRY - runs in hook order (cleanup → DM images → sections)
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  // Section transformer materializes styled-section breaks + metadata.
  // Included whenever the template declares at least one styled section
  // (this template isolates the magenta promo banner as its own section).
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 0 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName 'beforeTransform' or 'afterTransform'
 * @param {Element} element DOM element to transform (typically document.body)
 * @param {Object} payload { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates elements matched by more than one selector (e.g. hero-promo's
 * ID + class fallback both resolving to the same node).
 * @param {Document} document
 * @param {Object} template embedded PAGE_TEMPLATE
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // already captured via another selector
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup: strip modals/consent/app banners)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    //    Skip elements already replaced by a prior parser (detached from DOM).
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (site chrome removal, DM image rewrite, section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index to avoid importer crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
