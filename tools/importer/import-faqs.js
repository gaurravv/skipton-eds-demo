/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "faqs",
  "description": "WKND FAQs page: title, hero image, intro text, FAQ accordion, contact sidebar",
  "urls": [
    "https://publish-p133255-e1921317.adobeaemcloud.com/content/wknd/us/en/faqs.html"
  ],
  "blocks": [
    {
      "name": "accordion",
      "instances": [
        "div.accordion.panelcontainer .cmp-accordion",
        ".cmp-accordion"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "FAQ main content",
      "selector": [
        "main .container.responsivegrid.aem-GridColumn--default--8"
      ],
      "style": null,
      "blocks": [
        "accordion"
      ],
      "defaultContent": [
        "main .container.responsivegrid.aem-GridColumn--default--8 .title",
        "main .container.responsivegrid.aem-GridColumn--default--8 .image",
        "main .container.responsivegrid.aem-GridColumn--default--8 > .cmp-container > .aem-Grid > .text"
      ]
    },
    {
      "id": "2",
      "name": "Need more help aside",
      "selector": [
        "main .container.responsivegrid.aem-GridColumn--default--3"
      ],
      "style": "aside",
      "blocks": [],
      "defaultContent": [
        "main .container.responsivegrid.aem-GridColumn--default--3 .title",
        "main .container.responsivegrid.aem-GridColumn--default--3 .text"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

// Site-root folder that holds the migrated image assets (DA: /images/)
const IMAGES_FOLDER = '/images/';

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
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
        if (seen.has(element)) return;
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

/**
 * Point every image at its local copy in the site-root images folder,
 * keeping the original file name (e.g. /images/stacey-roswells.jpeg).
 * Returns the source URL -> local path mapping for the import report.
 * @param {Element} main - The transformed content root
 * @param {string} baseUrl - The source page URL (to absolutize relative src)
 * @returns {Object} mapping of original image URL to local path
 */
function localizeImages(main, baseUrl) {
  const mapping = {};
  main.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || src.startsWith('data:') || src.startsWith(IMAGES_FOLDER)) return;
    let absolute;
    try {
      absolute = new URL(src, baseUrl).href;
    } catch (e) {
      return;
    }
    const fileName = decodeURIComponent(new URL(absolute).pathname.split('/').pop() || '')
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-');
    if (!fileName) return;
    const localPath = `${IMAGES_FOLDER}${fileName}`;
    mapping[absolute] = localPath;
    img.setAttribute('src', localPath);
    img.removeAttribute('srcset');
  });
  return mapping;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already consumed by an earlier parser)
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

    // 4. Final cleanup + section breaks / section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // WKND theme: scopes the WKND page styling (body.wknd) to the migrated pages
    const metaTable = [...main.querySelectorAll('table')]
      .find((t) => ((t.querySelector('th, td') || {}).textContent || '').trim().toLowerCase() === 'metadata');
    if (metaTable) {
      const row = document.createElement('tr');
      ['theme', 'wknd'].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      (metaTable.querySelector('tbody') || metaTable).append(row);
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Use local site-root image assets
    const images = localizeImages(main, params.originalURL || url);

    // 7. Document path preserves the source URL path (only .html stripped)
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
        images: JSON.stringify(images),
      },
    }];
  },
};
