# T-Mobile iPhone Deals Page Migration Plan

## Status: Ready to Execute

The plan is finalized. **Execution (scraping, generating import infrastructure, running the import, editing blocks/CSS, instrumenting nav/footer, and any git push) requires switching from Plan mode to Execute mode.** Once switched, work proceeds top-to-bottom through the checklist below.

## Objective

Migrate the T-Mobile Apple iPhone deals page — `https://www.t-mobile.com/offers/apple-iphone-deals?INTNAV=tNav%3ADeals%3AApple` — into this AEM Edge Delivery Services project. Scope: **page body + header/navigation + footer**, all rebuilt to match the source site and rendered correctly in the local preview.

## Source & Target Context

- **Repo:** `chjain/adobe-ultimate-success-aem` (branch `main`)
- **Target content path:** `/content/offers/apple-iphone-deals` (served locally at `http://localhost:3000/content/offers/apple-iphone-deals.html`)
- **Existing blocks:** `cards`, `columns`, `hero`, `header`, `footer`, `fragment` — reuse/extend first; add new block variants only where the source design requires them.
- **Content generation rule:** HTML content is produced only via the bundled import script + `run-bulk-import.js` — never hand-written into the content directory.

## Approach

Follow the standard EDS migration pipeline: scrape → analyze structure → map blocks → build import infrastructure → run import → instrument nav & footer → validate visually → prepare for deploy. Because T-Mobile pages are JavaScript-heavy and marketing-dense, expect several new block variants and careful section modeling.

## Checklist

### Phase 1 — Discovery & Scrape
- [ ] Confirm project type (doc / da / xwalk) and resolve the correct Block Library endpoint for available blocks
- [ ] Start the local dev server (`aem up`) in the background for preview verification
- [ ] Scrape the source URL: capture cleaned HTML, metadata, screenshots (desktop + mobile), and download all page images
- [ ] Record page metadata (title, description, INTNAV context) for the target page

### Phase 2 — Page Structure Analysis
- [ ] Identify section boundaries and content sequences (hero/offer banner, device deal cards, promo tiles, comparison/legal disclaimer sections)
- [ ] Decide per sequence: default content vs. block, and which existing block vs. new variant
- [ ] Survey the block palette; flag any patterns needing a NEW block variant (e.g. deal/offer cards, tabbed carousels)
- [ ] Produce analysis artifacts (`page-templates.json`, `metadata.json`, cleaned DOM, block-variant notes)

### Phase 3 — Block Mapping & Variant Design
- [ ] Add DOM selectors / block mappings for each identified block variant
- [ ] Create any new block variants (JS + CSS, mobile-first, scoped selectors) not already covered by existing blocks
- [ ] Extract exact computed styles from the source and author EDS-ready CSS for each block
- [ ] Lint new/changed blocks (`npm run lint`)

### Phase 4 — Import Infrastructure
- [ ] Generate block parsers for each variant (`tools/importer/parsers/`)
- [ ] Generate transformers (cleanup, sections, Dynamic Media/Scene7 if present) (`tools/importer/transformers/`)
- [ ] Assemble the import script combining the page template + parsers + transformers
- [ ] Bundle the import script for execution

### Phase 5 — Content Import
- [ ] Run the bulk import for the single URL to generate page content under `/content/offers/apple-iphone-deals`
- [ ] Verify imported HTML renders in preview; compare against the source screenshots
- [ ] Iterate on parsers/transformers/CSS to fix content or layout gaps

### Phase 6 — Navigation / Header
- [ ] Instrument the T-Mobile header/nav (desktop + mobile + megamenu) from source screenshots — no assumed structure
- [ ] Build/extend the `header` block and `nav` content to match
- [ ] Verify nav interactions and appearance in preview at all breakpoints

### Phase 7 — Footer
- [ ] Detect footer sections and per-element behavior from the source
- [ ] Build/extend the `footer` block and `footer` content to match
- [ ] Verify footer appearance and links in preview

### Phase 8 — Validation & QA
- [ ] Full-page visual critique vs. original (desktop + mobile); fix divergences
- [ ] Confirm accessibility: heading hierarchy, alt text, ARIA, WCAG 2.1 AA
- [ ] Verify all images are optimized and reasonably sized
- [ ] Run `npm run lint` and resolve all issues

### Phase 9 — Deploy Prep
- [ ] Confirm changes render cleanly on the running preview
- [ ] Summarize new/changed blocks, content path, and any follow-ups
- [ ] Provide the preview path for the migrated page and outline push/PR steps (requires user authorization to push)

## Open Considerations
- T-Mobile pages are dynamic and may include content behind interaction or personalization; some marketing modules may need simplification or a static representation.
- Legal/disclaimer fine print and offer terms should be preserved as authored content.
- New block variants add code-review surface — kept minimal and reuse-first.
- **Optional:** an `excat-commerce` plugin is available for product/listing (PDP/PLP) detection and routing. This is an offers/marketing landing page rather than a strict PDP/PLP, so the standard migration path above is the default. If you'd like commerce-specific routing enabled, say so and I'll enable the plugin before starting.

---
**Next step:** Switch to Execute mode to begin Phase 1. I will not modify any files while Plan mode is active.
