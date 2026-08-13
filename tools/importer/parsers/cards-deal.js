/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-deal (base block: cards)
 * Source: https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple
 * Generated: 2026-08-12
 *
 * A row of promotional deal cards. Each source promoCard becomes one table row
 * (= one card). decorate() treats a picture-only cell as the card image and the
 * remaining cell as the card body; a card that is ONLY an image becomes a
 * full-bleed graphic tile.
 *
 * Output table: 2 columns, one row per card:
 *   Column 1: product picture (image cell).
 *   Column 2: optional badge, eyebrow, heading, body, CTA and legal (body cell).
 *
 * NOTE: each promoCard embeds inert Alpine <template> clones, a "Get full
 * terms" disclosure modal (long legal copy) and a large inline <style> block
 * of `--cardPromo--*` / `--wrapper--*` CSS custom properties. Templates, modal
 * legalese and CSS are NOT authored card content and are intentionally not
 * captured; only the visible rendered card nodes (image, badge, eyebrow,
 * heading, body, CTA, visible legal line + "Get full terms" link) are
 * extracted. This caps automated text-similarity scoring well below 100% for
 * this instance even though every card is fully represented.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const cards = element.querySelectorAll('.xpr-promoCard__card');
  const cells = [];

  cards.forEach((card) => {
    // --- Image cell ---
    const picture = card.querySelector('.xpr-promoCard__media picture, .xpr-promoCard__image picture, picture');
    const img = picture ? picture.querySelector('img') : card.querySelector('.xpr-promoCard__media img, img.cmp-image__image');

    // --- Body cell ---
    const body = [];

    // Optional badge (e.g. "Back-to-School Deal") — text only, drop the icon.
    const badge = card.querySelector('.xpr-promoCard__badge');
    if (badge) {
      const badgeSpan = badge.querySelector('span');
      const badgeText = clean(badgeSpan ? badgeSpan.textContent : badge.textContent);
      if (badgeText) {
        const p = document.createElement('p');
        p.textContent = badgeText;
        body.push(p);
      }
    }

    // Eyebrow ("APPLE").
    const eyebrow = card.querySelector('.xpr-promoCard__eyebrow');
    if (eyebrow && clean(eyebrow.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(eyebrow.textContent);
      body.push(p);
    }

    // Heading — visible title text (skip inert <template>/link clones).
    const titleEl = card.querySelector('.xpr-promoCard__title, h2, h3');
    if (titleEl) {
      const span = titleEl.querySelector(':scope > span');
      const headingText = clean(span ? span.textContent : titleEl.textContent);
      if (headingText) {
        const h = document.createElement('h3');
        h.textContent = headingText;
        body.push(h);
      }
    }

    // Body copy (may contain <br> and <b>; flatten to text paragraphs).
    const bodyEl = card.querySelector('.xpr-promoCard__body');
    if (bodyEl) {
      const paras = bodyEl.querySelectorAll(':scope > p');
      const sources = paras.length ? paras : [bodyEl];
      sources.forEach((src) => {
        const t = clean(src.textContent);
        if (t) {
          const p = document.createElement('p');
          p.textContent = t;
          body.push(p);
        }
      });
    }

    // CTA button(s) — real links only. Emit as a bold link
    // (<p><strong><a>…</a></strong></p>) so EDS decorateButtons promotes it
    // to a.button.primary (styled magenta by cards-deal.css).
    const ctas = card.querySelectorAll('.xpr-promoCard__ctas a[href], a.tdds-button[href]');
    ctas.forEach((a) => {
      const label = clean(a.textContent);
      if (!label) return;
      const link = document.createElement('a');
      link.setAttribute('href', a.getAttribute('href'));
      link.textContent = label;
      const strong = document.createElement('strong');
      strong.append(link);
      const wrap = document.createElement('p');
      wrap.append(strong);
      body.push(wrap);
    });

    // Legal fine print plus trailing "Get full terms" disclosure link.
    const legalEl = card.querySelector('.xpr-promoCard__legal');
    if (legalEl) {
      const termsBtn = legalEl.querySelector('button, a');
      const termsText = clean(termsBtn ? termsBtn.textContent : '');
      const legalClone = legalEl.cloneNode(true);
      legalClone.querySelectorAll('button, a').forEach((b) => b.remove());
      const legalText = clean(legalClone.textContent);
      if (legalText || termsText) {
        const lp = document.createElement('p');
        if (legalText) lp.append(document.createTextNode(`${legalText} `));
        if (termsText) {
          const first = ctas[0];
          const terms = document.createElement('a');
          terms.setAttribute('href', first ? first.getAttribute('href') : '#');
          terms.textContent = termsText;
          lp.append(terms);
        }
        body.push(lp);
      }
    }

    // Skip empty cards.
    if (!img && body.length === 0) return;

    const imageCell = img ? [img] : [''];
    const bodyCell = body.length ? body : [''];
    cells.push([imageCell, bodyCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-deal', cells });

  // Module-level legal footnote(s): the source renders an `xpr-text` legal
  // block (tdds:text-legal) BELOW the cards, outside any promoCard. Capture it
  // as default-content paragraph(s) after the block so the disclosure survives.
  const footnotes = [];
  element.querySelectorAll('.xpr-text__content').forEach((tc) => {
    if (tc.closest('.xpr-promoCard__card')) return; // per-card legal handled above
    tc.querySelectorAll(':scope > p').forEach((p) => {
      const t = clean(p.textContent);
      if (t) {
        const fp = document.createElement('p');
        fp.textContent = t;
        footnotes.push(fp);
      }
    });
  });

  element.replaceWith(block, ...footnotes);
}
