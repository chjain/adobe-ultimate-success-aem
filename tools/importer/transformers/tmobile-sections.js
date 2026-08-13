/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: T-Mobile section breaks + section metadata.
 *
 * Materializes the styled sections declared in page-templates.json for the
 * page being imported. Driven entirely by `payload.template.sections`, so it
 * is template-agnostic and reusable across T-Mobile templates.
 *
 * For the apple-iphone-deals template the only styled section is the
 * full-width magenta promo banner:
 *   selector: ".cmp-experiencefragment--xftmo-pencil-banner"  (verified in
 *             migration-work/apple-iphone-deals/cleaned.html, line 774)
 *   style:    "magenta-promo"
 *
 * The promo banner sits between the intro headline (before) and the featured
 * hero deal (after), so to isolate it as its own EDS section we:
 *   1. insert an <hr> immediately before the section element (closes the
 *      preceding default-styled content),
 *   2. append a Section Metadata block (style = section.style) right after the
 *      section element so the style attaches to this section,
 *   3. insert an <hr> after the Section Metadata block (opens the following
 *      default-styled content).
 *
 * Runs in afterTransform only (block parsers run between the hooks; section
 * structure must be applied to the parser-modified DOM).
 *
 * Note: `payload.template.sections` is referenced so the validator recognizes
 * this as a section transformer.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Bit masks from Node.compareDocumentPosition (avoid depending on a global Node
// reference in the sandbox). a.compareDocumentPosition(b): PRECEDING (2) means b
// precedes a; FOLLOWING (4) means b follows a — both in document order.
const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

/**
 * True when any real content precedes/follows `node` in document order within
 * `root`. Sibling adjacency is NOT enough here: the T-Mobile source nests each
 * module in its own wrapper, so a section element commonly has no element
 * siblings even though earlier/later modules exist in ancestor subtrees.
 * Ancestors, descendants, the node itself, and existing <hr>s are ignored.
 */
function hasAdjacentContent(root, node, direction) {
  const mask = direction === 'before' ? DOCUMENT_POSITION_PRECEDING : DOCUMENT_POSITION_FOLLOWING;
  const all = root.querySelectorAll('*');
  for (const el of all) {
    if (el === node || node.contains(el) || el.contains(node)) continue;
    if (el.tagName === 'HR') continue;
    if (node.compareDocumentPosition(el) & mask) return true;
  }
  return false;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (!sections.length) return;

  const doc = element.ownerDocument;

  // Process sections in reverse so earlier insertions don't shift the
  // positions of not-yet-processed sections.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section) continue;

    // Section selector(s) come straight from the template (which were derived
    // from cleaned.html). Support string or array form.
    const selectors = Array.isArray(section.selector)
      ? section.selector
      : (section.selector ? [section.selector] : []);
    if (!selectors.length) continue;

    let sectionEl = null;
    for (const sel of selectors) {
      try {
        sectionEl = element.querySelector(sel);
      } catch (e) {
        sectionEl = null;
      }
      if (sectionEl) break;
    }
    if (!sectionEl) continue;

    // Anchor at which we close the section (after the section element, or
    // after a Section Metadata block if we add one).
    let closeAfter = sectionEl;

    // Section Metadata block carrying the section style, placed at the end of
    // the section's content (EDS convention: Section Metadata is the last
    // block in its section, immediately before the closing break).
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metaBlock);
      closeAfter = metaBlock;
    }

    // Closing <hr>: end this styled section so the following content reverts
    // to a default section. Insert only when content actually follows in
    // document order.
    if (hasAdjacentContent(element, closeAfter, 'after')) {
      closeAfter.after(doc.createElement('hr'));
    }

    // Opening <hr>: separate this styled section from the preceding content.
    // Insert only when content actually precedes in document order (i.e. the
    // section is not the very first content on the page).
    if (hasAdjacentContent(element, sectionEl, 'before')) {
      sectionEl.before(doc.createElement('hr'));
    }
  }
}
