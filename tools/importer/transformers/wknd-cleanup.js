/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup (templates: faqs, about-us).
 *
 * All selectors verified in migration-work/faqs/cleaned.html and
 * migration-work/about-us/cleaned.html:
 * - <header class="experiencefragment cmp-experiencefragment--header ...">  (line 5, both pages)
 * - <footer class="experiencefragment cmp-experiencefragment--footer ...">  (faqs l.360, about-us l.578)
 * - <div id="toggleNav">, <div id="mobileNav" class="cmp-navigation--mobile"> (after footer, both pages)
 * - <div class="separator cmp-separator--hidden cmp-separator--space-small"> (faqs aside l.337, footer)
 * - <h3>&nbsp;</h3> inside FAQ accordion panel (faqs l.223)
 * - body[data-cmp-data-layer-enabled][data-cmp-data-layer-name="adobeDataLayer"] (Adobe Client Data Layer)
 *
 * NOTE: contributor fragments on about-us use `section.experiencefragment.cmp-experience-fragment--contributor`
 * and are authorable content (cards-profile) - never target bare `.experiencefragment`.
 *
 * Adobe Launch / Target / ContextHub / analytics / data-layer code on the live site is delivered
 * via <script>, <link> and <style> (e.g. Target's #at-body-style), which are all removed here.
 * No tracking is added.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const MEDIA_SELECTOR = 'img, picture, svg, video, iframe, object, embed';

function removeEmptyTextElements(root) {
  root.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
    const text = (el.textContent || '').replace(/ /g, ' ').trim();
    if (!text && !el.querySelector(MEDIA_SELECTOR)) el.remove();
  });
}

function removeDataLayerAttributes(root) {
  const nodes = [root, ...root.querySelectorAll('*')];
  nodes.forEach((el) => {
    if (!el.attributes) return;
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith('data-cmp-data-layer')) el.removeAttribute(attr.name);
    });
  });
}

function removeComments(root) {
  const doc = root.ownerDocument || document;
  const walker = doc.createTreeWalker(root, 128 /* NodeFilter.SHOW_COMMENT */);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.remove());
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-content code: scripts, styles, embeds (covers Launch, Target, ContextHub, data layer, analytics)
    WebImporter.DOMUtils.remove(element, ['script', 'noscript', 'iframe', 'link', 'style']);

    // Hidden spacer separators (inside the faqs aside and the footer)
    WebImporter.DOMUtils.remove(element, ['.cmp-separator--hidden', '.separator']);

    // Empty / &nbsp;-only headings and paragraphs (e.g. <h3>&nbsp;</h3> in FAQ panel)
    removeEmptyTextElements(element);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome: header XF, footer XF, mobile navigation
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      '.cmp-experiencefragment--header',
      'footer.experiencefragment',
      '.cmp-experiencefragment--footer',
      '#toggleNav',
      '#mobileNav',
    ]);

    // Leftover non-content elements
    WebImporter.DOMUtils.remove(element, ['script', 'noscript', 'iframe', 'link', 'style']);

    removeEmptyTextElements(element);
    removeDataLayerAttributes(element);
    removeComments(element);
  }
}
