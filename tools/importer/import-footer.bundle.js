/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-footer.js
  var import_footer_exports = {};
  __export(import_footer_exports, {
    default: () => import_footer_default
  });
  var IMAGES_FOLDER = "images/";
  var MIGRATED_PATHS = {
    "/us/en/faqs.html": "/content/wknd/us/en/faqs",
    "/us/en/about-us.html": "/content/wknd/us/en/about-us",
    "/content/wknd/us/en/faqs.html": "/content/wknd/us/en/faqs",
    "/content/wknd/us/en/about-us.html": "/content/wknd/us/en/about-us"
  };
  var SOCIAL_NAMES = ["facebook", "twitter", "instagram", "youtube", "linkedin", "pinterest"];
  function normalizeHref(href, origin) {
    if (!href || href.startsWith("#")) return href || "#";
    let url;
    try {
      url = new URL(href, origin);
    } catch (e) {
      return href;
    }
    if (url.origin !== new URL(origin).origin) return url.href;
    return MIGRATED_PATHS[url.pathname] || `${url.pathname}${url.search}${url.hash}`;
  }
  function text(el) {
    return (el ? el.textContent : "").replace(/\s+/g, " ").trim();
  }
  function link(document, label, href) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    return a;
  }
  function para(document, child) {
    const p = document.createElement("p");
    if (typeof child === "string") p.textContent = child;
    else if (child) p.append(child);
    return p;
  }
  function buildBrand(document, footer, origin) {
    const img = footer.querySelector(".cmp-image--logo img, .image img");
    if (!img) return [];
    const logoLink = img.closest("a");
    const src = img.currentSrc || img.getAttribute("src") || "";
    const fileName = decodeURIComponent(new URL(src, origin).pathname.split("/").pop()).toLowerCase();
    const image = document.createElement("img");
    image.src = `${IMAGES_FOLDER}${fileName}`;
    image.alt = img.getAttribute("alt") || "";
    const a = document.createElement("a");
    a.href = normalizeHref(logoLink ? logoLink.getAttribute("href") : "/", origin);
    a.append(image);
    return [para(document, a)];
  }
  function buildLinks(document, footer, origin) {
    const list = document.createElement("ul");
    footer.querySelectorAll(".cmp-navigation__item--level-0 > a, .cmp-navigation__item--level-1 > a").forEach((a) => {
      const li = document.createElement("li");
      li.append(link(document, text(a), normalizeHref(a.getAttribute("href"), origin)));
      list.append(li);
    });
    return list.children.length ? [list] : [];
  }
  function buildSocial(document, footer) {
    const items = [];
    const title = footer.querySelector(".title h1, .title h2, .title h3, .title h4, .title h5, .cmp-title__text");
    if (title) {
      const strong = document.createElement("strong");
      strong.textContent = text(title);
      items.push(para(document, strong));
    }
    const list = document.createElement("ul");
    footer.querySelectorAll(".cmp-button--icononly a, a.cmp-button").forEach((a) => {
      const icon = a.querySelector('[class*="cmp-button__icon--"]');
      const iconClass = icon ? [...icon.classList].find((c) => c.startsWith("cmp-button__icon--")) : "";
      const name = iconClass ? iconClass.replace("cmp-button__icon--", "") : SOCIAL_NAMES.find((n) => (a.getAttribute("aria-label") || "").toLowerCase().includes(n));
      if (!name) return;
      const img = document.createElement("img");
      img.src = `${IMAGES_FOLDER}social-${name}.svg`;
      img.alt = a.getAttribute("aria-label") || name;
      const anchor = document.createElement("a");
      anchor.href = a.getAttribute("href") || "#";
      anchor.append(img);
      const li = document.createElement("li");
      li.append(anchor);
      list.append(li);
    });
    if (list.children.length) items.push(list);
    return items;
  }
  function buildLegal(document, footer, origin) {
    const items = [];
    footer.querySelectorAll(".text p, .cmp-text p").forEach((p) => {
      const out = document.createElement("p");
      p.childNodes.forEach((node) => {
        if (node.nodeType === 3) out.append(node.textContent.replace(/\s+/g, " "));
        else if (node.tagName === "A") out.append(link(document, text(node), normalizeHref(node.getAttribute("href"), origin)));
        else if (node.tagName !== "BR") out.append(text(node));
      });
      if (out.textContent.trim()) {
        out.innerHTML = out.innerHTML.replace(/\s{2,}/g, " ").trim();
        items.push(out);
      }
    });
    return items;
  }
  var import_footer_default = {
    transform: (payload) => {
      const { document, params } = payload;
      const origin = new URL(params.originalURL).origin;
      const footer = document.querySelector("footer.experiencefragment, .cmp-experiencefragment--footer");
      const main = document.createElement("div");
      if (footer) {
        const sections = [
          buildBrand(document, footer, origin),
          buildLinks(document, footer, origin),
          buildSocial(document, footer),
          buildLegal(document, footer, origin)
        ].filter((items) => items.length);
        sections.forEach((items, i) => {
          if (i > 0) main.append(document.createElement("hr"));
          items.forEach((item) => main.append(item));
        });
      }
      return [{
        element: main,
        path: "/footer",
        report: {
          title: "footer",
          sections: main.querySelectorAll("hr").length + 1,
          links: main.querySelectorAll("a").length,
          images: main.querySelectorAll("img").length
        }
      }];
    }
  };
  return __toCommonJS(import_footer_exports);
})();
