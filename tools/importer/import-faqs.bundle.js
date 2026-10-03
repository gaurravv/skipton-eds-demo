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

  // tools/importer/import-faqs.js
  var import_faqs_exports = {};
  __export(import_faqs_exports, {
    default: () => import_faqs_default
  });

  // tools/importer/parsers/accordion.js
  var NBSP_RE = /\u00a0/g;
  function isBlank(text) {
    return !text || text.replace(NBSP_RE, " ").trim() === "";
  }
  function cleanText(text) {
    return (text || "").replace(NBSP_RE, " ").replace(/\s+/g, " ").trim();
  }
  function copyInline(source, target, document2) {
    source.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const t = node.textContent.replace(NBSP_RE, " ").replace(/\s+/g, " ");
        if (t) target.append(document2.createTextNode(t));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if (tag === "br") {
        target.append(document2.createElement("br"));
        return;
      }
      let wrapper = null;
      if (tag === "strong" || tag === "b") wrapper = document2.createElement("strong");
      else if (tag === "em" || tag === "i") wrapper = document2.createElement("em");
      else if (tag === "a") {
        wrapper = document2.createElement("a");
        const href = node.getAttribute("href");
        if (href) wrapper.setAttribute("href", href);
      }
      if (!wrapper) {
        copyInline(node, target, document2);
        return;
      }
      copyInline(node, wrapper, document2);
      const raw = wrapper.textContent;
      if (isBlank(raw)) {
        if (raw) target.append(document2.createTextNode(" "));
        return;
      }
      const lead = /^\s/.test(raw);
      const trail = /\s$/.test(raw);
      const first = wrapper.firstChild;
      const last = wrapper.lastChild;
      if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, "");
      if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, "");
      if (lead) target.append(document2.createTextNode(" "));
      target.append(wrapper);
      if (trail) target.append(document2.createTextNode(" "));
    });
  }
  function trimBlock(el) {
    el.normalize();
    const first = el.firstChild;
    const last = el.lastChild;
    if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, "");
    if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, "");
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent = n.textContent.replace(/ {2,}/g, " ");
    });
  }
  function buildAnswer(panel, document2) {
    const out = [];
    if (!panel) return out;
    const textRoots = panel.querySelectorAll(".cmp-text");
    const roots = textRoots.length ? Array.from(textRoots) : [panel];
    roots.forEach((root) => {
      root.querySelectorAll("p, h1, h2, h3, h4, h5, h6, ul, ol").forEach((src) => {
        if (src.parentElement && src.parentElement.closest("ul, ol")) return;
        if (isBlank(src.textContent)) return;
        const tag = src.tagName.toLowerCase();
        if (tag === "ul" || tag === "ol") {
          const list = document2.createElement(tag);
          src.querySelectorAll(":scope > li").forEach((li) => {
            if (isBlank(li.textContent)) return;
            const newLi = document2.createElement("li");
            copyInline(li, newLi, document2);
            trimBlock(newLi);
            list.append(newLi);
          });
          if (list.children.length) out.push(list);
          return;
        }
        const el = document2.createElement(tag);
        copyInline(src, el, document2);
        trimBlock(el);
        if (!isBlank(el.textContent)) out.push(el);
      });
    });
    if (!out.length && !isBlank(panel.textContent)) {
      const p = document2.createElement("p");
      p.textContent = cleanText(panel.textContent);
      out.push(p);
    }
    return out;
  }
  function parse(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-accordion__item")).filter((item) => item.closest(".cmp-accordion") === element || !element.matches(".cmp-accordion"));
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button") || item.querySelector(".cmp-accordion__header");
      const question = cleanText(titleEl ? titleEl.textContent : "");
      const panel = item.querySelector(".cmp-accordion__panel");
      const answer = buildAnswer(panel, document2);
      if (!question && !answer.length) return;
      cells.push([question, answer]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Accordion", cells });
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

  // tools/importer/import-faqs.js
  var parsers = {
    "accordion": parse
  };
  var PAGE_TEMPLATE = {
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
  var import_faqs_default = {
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
  return __toCommonJS(import_faqs_exports);
})();
