// footer document sections, in authored order
const SECTION_NAMES = ['brand', 'links', 'social', 'legal'];

/**
 * Fetches the footer document: local content folder first, then the site root (DA/EDS).
 * Relative image paths are resolved against the footer document URL.
 * @returns {Promise<Element|null>} container holding the footer sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  // image paths in the footer document are relative to the document, not the current page
  container.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  container.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), resp.url).href;
  });
  return container;
}

function normalizePath(path) {
  return path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

function isCurrentPage(link) {
  const url = new URL(link.href, window.location.href);
  const target = normalizePath(url.pathname);
  const current = normalizePath(window.location.pathname);
  return url.origin === window.location.origin
    && target !== '/'
    && (current === target || current.endsWith(target));
}

/**
 * Marks the current page and the link duplicating the logo link (hidden in the footer).
 * @param {Element} section links section
 * @param {string} [brandHref] href of the logo link
 */
function decorateLinks(section, brandHref) {
  section.querySelectorAll('a').forEach((a) => {
    if (isCurrentPage(a)) a.setAttribute('aria-current', 'page');
    if (brandHref && a.href === brandHref) a.closest('li').classList.add('footer-home');
  });
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Footer navigation');
  nav.append(...section.childNodes);
  section.append(nav);
}

/**
 * Turns the bold label into the social heading and labels icon-only links.
 * @param {Element} section social section
 */
function decorateSocial(section) {
  const label = section.querySelector(':scope > p > strong');
  if (label) {
    const heading = document.createElement('h2');
    heading.className = 'footer-social-title';
    heading.textContent = label.textContent.trim();
    label.parentElement.replaceWith(heading);
  }
  section.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (img && !a.textContent.trim()) a.setAttribute('aria-label', img.alt);
    if (img) img.alt = '';
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;

  block.textContent = '';
  const sections = {};
  [...fragment.querySelectorAll(':scope > div')].forEach((section, i) => {
    const name = SECTION_NAMES[i];
    if (!name) return;
    section.classList.add(`footer-${name}`);
    sections[name] = section;
  });

  const brandLink = sections.brand && sections.brand.querySelector('a');
  if (sections.links) decorateLinks(sections.links, brandLink && brandLink.href);
  if (sections.social) decorateSocial(sections.social);

  const top = document.createElement('div');
  top.className = 'footer-top';
  ['brand', 'links', 'social'].forEach((name) => {
    if (sections[name]) top.append(sections[name]);
  });

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  inner.append(top);
  if (sections.legal) inner.append(sections.legal);
  block.append(inner);
}
