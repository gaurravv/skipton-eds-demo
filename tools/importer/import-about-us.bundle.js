/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
  });

  // tools/importer/parsers/cards-profile.js
  var PERSON_SELECTOR = ".cmp-experience-fragment--contributor";
  var CONSUMED_ATTR = "data-cards-profile-consumed";
  function isPerson(el) {
    return !!el && el.nodeType === 1 && el.matches(PERSON_SELECTOR);
  }
  function cleanText(text) {
    return (text || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }
  function buildRow(person, document2) {
    const nameEl = person.querySelector(".cmp-title h3, h3.cmp-title__text, h3, .cmp-title h2, h2, h4");
    const name = cleanText(nameEl ? nameEl.textContent : "");
    const roleEl = person.querySelector(".cmp-title--black .cmp-title__text, h5, h6") || Array.from(person.querySelectorAll(".cmp-title__text")).find((h) => h !== nameEl);
    const role = cleanText(roleEl ? roleEl.textContent : "");
    const srcImg = person.querySelector(".cmp-image img, img.cmp-image__image, img");
    let img = null;
    if (srcImg) {
      const src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
      if (src) {
        img = document2.createElement("img");
        img.setAttribute("src", src);
        img.setAttribute("alt", cleanText(srcImg.getAttribute("alt")) || name);
      }
    }
    const content = [];
    if (name) {
      const h3 = document2.createElement("h3");
      h3.textContent = name;
      content.push(h3);
    }
    if (role) {
      const p = document2.createElement("p");
      p.textContent = role;
      content.push(p);
    }
    const links = Array.from(person.querySelectorAll("a.cmp-button, .cmp-buildingblock--btn-list a, a[href]")).filter((a, i, arr) => arr.indexOf(a) === i);
    if (links.length) {
      const ul = document2.createElement("ul");
      links.forEach((a) => {
        const textEl = a.querySelector(".cmp-button__text");
        const label = cleanText(textEl ? textEl.textContent : a.textContent) || cleanText(a.getAttribute("aria-label") || a.getAttribute("title"));
        if (!label) return;
        const li = document2.createElement("li");
        const link = document2.createElement("a");
        link.setAttribute("href", a.getAttribute("href") || "#");
        const iconEl = a.querySelector('[class*="cmp-button__icon--"]');
        const iconClass = iconEl ? [...iconEl.classList].find((c) => c.startsWith("cmp-button__icon--")) : "";
        const network = iconClass ? iconClass.replace("cmp-button__icon--", "") : ["facebook", "twitter", "instagram"].find((n) => label.toLowerCase().includes(n));
        if (network) link.append(`:${network}: `);
        link.append(label);
        li.append(link);
        ul.append(li);
      });
      if (ul.children.length) content.push(ul);
    }
    if (!img && !content.length) return null;
    return [img || "", content];
  }
  function parse(element, { document: document2 }) {
    if (!element.parentElement || element.hasAttribute(CONSUMED_ATTR)) {
      if (element.parentElement) element.remove();
      return;
    }
    if (isPerson(element.previousElementSibling)) {
      return;
    }
    const run = [element];
    let next = element.nextElementSibling;
    while (isPerson(next)) {
      run.push(next);
      next = next.nextElementSibling;
    }
    const cells = run.map((person) => buildRow(person, document2)).filter(Boolean);
    run.forEach((el) => el.setAttribute(CONSUMED_ATTR, "true"));
    if (!cells.length) {
      run.slice(1).forEach((el) => el.remove());
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (profile)", cells });
    run.slice(1).forEach((el) => el.remove());
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var MEDIA_SELECTOR = "img, picture, svg, video, iframe, object, embed";
  function removeEmptyTextElements(root) {
    root.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
      const text = (el.textContent || "").replace(/ /g, " ").trim();
      if (!text && !el.querySelector(MEDIA_SELECTOR)) el.remove();
    });
  }
  function removeDataLayerAttributes(root) {
    const nodes = [root, ...root.querySelectorAll("*")];
    nodes.forEach((el) => {
      if (!el.attributes) return;
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith("data-cmp-data-layer")) el.removeAttribute(attr.name);
      });
    });
  }
  function removeComments(root) {
    const doc = root.ownerDocument || document;
    const walker = doc.createTreeWalker(
      root,
      128
      /* NodeFilter.SHOW_COMMENT */
    );
    const comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach((c) => c.remove());
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["script", "noscript", "iframe", "link", "style"]);
      WebImporter.DOMUtils.remove(element, [".cmp-separator--hidden", ".separator"]);
      removeEmptyTextElements(element);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        ".cmp-experiencefragment--header",
        "footer.experiencefragment",
        ".cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav"
      ]);
      WebImporter.DOMUtils.remove(element, ["script", "noscript", "iframe", "link", "style"]);
      removeEmptyTextElements(element);
      removeDataLayerAttributes(element);
      removeComments(element);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-about-us.js
  var parsers = {
    "cards-profile": parse
  };
  var PAGE_TEMPLATE = {
    "name": "about-us",
    "description": "WKND About Us page: page title, contributor and guide profile grids",
    "urls": [
      "https://publish-p133255-e1921317.adobeaemcloud.com/content/wknd/us/en/about-us.html"
    ],
    "blocks": [
      {
        "name": "cards-profile",
        "instances": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .experiencefragment.cmp-experience-fragment--contributor",
          ".cmp-experience-fragment--contributor"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Page title and Our Contributors",
        "selector": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .title:first-child"
        ],
        "style": null,
        "blocks": [
          "cards-profile"
        ],
        "defaultContent": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .title:first-child",
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .title.cmp-title--underline:nth-child(2)",
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .text:nth-child(3)"
        ]
      },
      {
        "id": "2",
        "name": "WKND Guides",
        "selector": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .title.cmp-title--underline ~ .title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [
          "cards-profile"
        ],
        "defaultContent": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .title.cmp-title--underline ~ .title.cmp-title--underline",
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .title.cmp-title--underline ~ .title.cmp-title--underline + .text"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  var IMAGES_FOLDER = "/images/";
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function localizeImages(main, baseUrl) {
    const mapping = {};
    main.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:") || src.startsWith(IMAGES_FOLDER)) return;
      let absolute;
      try {
        absolute = new URL(src, baseUrl).href;
      } catch (e) {
        return;
      }
      const fileName = decodeURIComponent(new URL(absolute).pathname.split("/").pop() || "").toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
      if (!fileName) return;
      const localPath = `${IMAGES_FOLDER}${fileName}`;
      mapping[absolute] = localPath;
      img.setAttribute("src", localPath);
      img.removeAttribute("srcset");
    });
    return mapping;
  }
  var import_about_us_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      const metaTable = [...main.querySelectorAll("table")].find((t) => ((t.querySelector("th, td") || {}).textContent || "").trim().toLowerCase() === "metadata");
      if (metaTable) {
        const row = document2.createElement("tr");
        ["theme", "wknd"].forEach((value) => {
          const cell = document2.createElement("td");
          cell.textContent = value;
          row.append(cell);
        });
        (metaTable.querySelector("tbody") || metaTable).append(row);
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const images = localizeImages(main, params.originalURL || url);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
          images: JSON.stringify(images)
        }
      }];
    }
  };
  return __toCommonJS(import_about_us_exports);
})();
