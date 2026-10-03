/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks + Section Metadata (templates: faqs, about-us).
 *
 * Uses payload.template.sections[].selector (array, tried in order, first match wins).
 * - faqs: sections are separate grid columns
 *     section 2 = `main .container.responsivegrid.aem-GridColumn--default--3` (style: aside)
 * - about-us: sections are flat siblings in one grid; each selector targets the FIRST element
 *     of its section (section 2 = second `.title.cmp-title--underline`, "WKND Guides").
 *
 * An <hr> is inserted BEFORE the matched element of every section after the first
 * (beforeTransform, while all section elements still exist). Section Metadata is emitted only
 * for sections with a non-null style, in afterTransform, anchored to a marker <hr>.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
