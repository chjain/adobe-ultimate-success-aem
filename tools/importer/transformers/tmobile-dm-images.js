/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: T-Mobile Dynamic Media / Scene7 image handling.
 *
 * The T-Mobile source serves product imagery from Scene7 IS/Image URLs
 * (t-mobile.scene7.com/is/image/Tmusprod/...). Confirmed present in
 * migration-work/apple-iphone-deals/metadata.json `.images.mapping`
 * (37 /is/image/ URLs). Scene7 IS/Image URLs carry rendition query
 * parameters (fmt, wid, qlt, resMode, op_usm, etc.); if left as raw
 * <img src> they would not round-trip through the docx -> markdown import.
 *
 * This transformer rewrites every Scene7/DM <img> into an anchor that
 * survives markdown:
 *   - unlinked img  -> <a href="DM-URL">alt</a>
 *   - linked  img   -> <a href="/page" title="DM-URL">alt</a> (nav href kept,
 *                       DM URL stashed in title via [text](url "title"))
 * The companion client-side auto-block in scripts/scripts.js (installed by
 * the site-migration orchestrator) rebuilds these anchors into responsive
 * <picture> elements at render time, preserving all Scene7 parameters.
 *
 * Runs in afterTransform ONLY: block parsers run between the two hooks and
 * extract <img> references into block cells (cards / carousel image cells).
 * Rewriting imgs to anchors in beforeTransform would leave parsers with no
 * img to extract, producing empty image cells.
 *
 * The helpers below are copied BYTE-IDENTICALLY from the canonical
 * dm-scene7-helpers.js (detectDynamicMediaUrl, findLinkedDmCarrier + its
 * constants, EMPTY_ALT_SENTINEL, altToLinkText). Do not re-derive the
 * detection regex or any shared logic — the client-side auto-block inlines
 * the same helpers and both sides must agree on what counts as a DM URL.
 */

// ---- Begin canonical helpers (copied from dm-scene7-helpers.js) ----

function detectDynamicMediaUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  // Reject relative URLs. The Scene7 rule is path-only (`/is/image/`) and
  // collides with same-named local paths on customer sites — without this
  // guard, a relative `/is/image/foo` would be classified as scene7 and
  // rewritten by the transformer/auto-block, breaking local rendering.
  // Absolute (`https://…`) and protocol-relative (`//host/…`) inputs are
  // accepted; the synthetic base below only resolves the protocol-relative
  // case to a parseable URL.
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try {
    u = new URL(urlStr, 'https://x/');
  } catch {
    return false;
  }
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

const LINKED_DM_INLINE_WRAPPER_TAGS = new Set(['PICTURE']);
// Element children allowed alongside the DM img inside an inline wrapper.
// Currently only <source> — the standard responsive-picture sibling that
// `<picture>` accepts. Anything else means the wrapper carries unrelated
// content and we should not treat it as transparent.
const LINKED_DM_WRAPPER_SIBLING_TAGS = new Set(['SOURCE']);

function findLinkedDmCarrier(img) {
  if (!img || !img.parentElement) return null;

  // Walk up through allow-listed inline wrappers, tracking the topmost
  // wrapped node. Each wrapper must contain `node` and may contain only
  // allow-listed siblings (e.g. `<source>` for `<picture>`). The anchor
  // we end up at must then have that wrapper (or the bare img) as its
  // sole element child with no other meaningful text.
  let node = img;
  let parent = img.parentElement;
  while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
    let foundNode = false;
    for (const child of parent.children) {
      if (child === node) {
        foundNode = true;
      } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
        return null;
      }
    }
    if (!foundNode) return null;
    node = parent;
    parent = parent.parentElement;
  }

  if (!parent || parent.tagName !== 'A') return null;
  if (parent.children.length !== 1 || parent.children[0] !== node) return null;
  if (parent.textContent.trim() !== '') return null;

  return parent;
}

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function altToLinkText(alt) {
  return alt || EMPTY_ALT_SENTINEL;
}

// ---- End canonical helpers ----

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const doc = element.ownerDocument;

  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!detectDynamicMediaUrl(src)) return;

    // Preserve alt verbatim, including empty string for decorative images.
    // The auto-block uses the URL pattern (not the text) to find these
    // anchors, so the link text is purely a Document-view UX cue. When alt
    // is empty we substitute EMPTY_ALT_SENTINEL ('Image without alt text')
    // so authors editing the doc see a visible cell at the image's
    // position; the auto-block translates the sentinel back to alt="" via
    // linkTextToAlt() so screen readers correctly skip decorative images.
    const alt = img.getAttribute('alt') || '';

    // Linked image (incl. parser-wrapped `<a><picture><img></picture></a>`).
    // Stash DM URL in title, keep outer href; setting textContent replaces
    // any wrapper descendants with the link text.
    const linkedAnchor = findLinkedDmCarrier(img);
    if (linkedAnchor) {
      linkedAnchor.setAttribute('title', src);
      linkedAnchor.textContent = altToLinkText(alt);
      return;
    }

    // Inside an anchor but not a sole-meaningful-child shape — mixed
    // content. No clean single-anchor markdown representation; skip.
    const parent = img.parentElement;
    if (parent && parent.tagName === 'A') {
      // eslint-disable-next-line no-console
      console.warn('DM image inside mixed-content anchor, skipped:', src);
      return;
    }

    // Unlinked image: create an anchor whose href is the DM URL.
    const a = doc.createElement('a');
    a.href = src;
    a.textContent = altToLinkText(alt);
    img.replaceWith(a);
  });
}
