/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: T-Mobile site-wide cleanup.
 *
 * Removes non-authorable T-Mobile chrome so the import contains only the
 * deals page body that maps to our blocks (the #APPLE-DEALS-MOD-* /
 * .cmp-experiencefragment--prospect-apple-deals-mod-* experience-fragment
 * module containers inside <main id="content-main">).
 *
 * ALL selectors below were verified against
 * migration-work/apple-iphone-deals/cleaned.html — none are guessed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / hidden dialogs that would otherwise confuse block parsing.
    WebImporter.DOMUtils.remove(element, [
      // Hidden "Get full terms" disclosure dialogs and the MoEngage opt-in
      // dialog. Found in cleaned.html as <div ... class="phx-modal ..."
      // role="dialog" aria-hidden="true"> (incl. #moengage-optin-id which
      // also carries the phx-modal class). These duplicate the visible
      // legal copy in hidden overlays and are not authored page content.
      '.phx-modal',
      // Cookie / consent banner. Found: <div id="onetrust-consent-sdk"> and
      // <div id="onetrust-pc-sdk"> near the end of <body>.
      '#onetrust-consent-sdk',
      // Branch.io app-download journey banner slot. Found: first child of
      // <header>: <div class="branch-journeys-top">.
      '.branch-journeys-top',
      // Toast/snackbar widget. Found after </footer>: <div class="xpr-snackbar">.
      '.xpr-snackbar',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome and tracking/analytics noise.
    WebImporter.DOMUtils.remove(element, [
      // Global site header / universal nav. Found: <header id="content-header"
      // class="xpr-layoutHeader"> containing .unav-header and <nav> elements.
      'header',
      // Global site footer. Found: <footer id="content-footer"
      // class="xpr-layoutFooter"> containing .unav-footer and <nav> elements.
      'footer',
      // Any remaining navigation landmarks (all sit inside header/footer in
      // this DOM; listed defensively). Found: <nav class="unav-header__nav">,
      // <nav class="unav-header__universal">, <nav class="unav-footer__nav">,
      // <nav class="unav-footerUniversal__nav">.
      'nav',
      // MoEngage config container. Found after </footer>: <div class="moEngage">
      // with an empty <div id="moe-config">.
      '.moEngage',
      // Empty script-injection placeholders. Found as repeated
      // <div class="scriptInjector"></div> after </footer>.
      '.scriptInjector',
      // Tracking pixels rendered as images. Found: <img class="mediatag" ...>
      // (amazon-adsystem, ispot.tv, ojrq beacons).
      '.mediatag',
      // Microsoft Bing UET tracking beacons. Found: <div id="batBeacon548100467328">
      // and <img id="batBeacon...">.
      '[id^="batBeacon"]',
      // Tracking / advertising iframes (TTD universal pixel, DoubleClick
      // activity, Twitter/OneTrust resize). Found: 7 <iframe> elements.
      'iframe',
      // Client-library stylesheet <link> tags injected by AEM components.
      // Found: 5 <link href="/etc.clientlibs/..."> elements.
      'link',
      // Defensive: no-JS fallbacks (none present in this capture, harmless).
      'noscript',
    ]);

    // Strip event-handler / analytics / Alpine.js noise attributes that add
    // nothing to authored content. Attribute cleanup runs after block parsing
    // so it cannot affect parser matching. Only attributes actually present in
    // cleaned.html are targeted.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('x-data');
      el.removeAttribute('x-show');
      el.removeAttribute('x-cloak');
      el.removeAttribute('x-if');
      el.removeAttribute('data-moengage-id');
      el.removeAttribute('data-analytics-component-title');
    });
  }
}
