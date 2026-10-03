/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the global navigation document (/nav).
 *
 * Source: the WKND site header (utility bar, logo, main navigation, search,
 * sign-in modal). Produces a flat, DA-friendly nav document:
 *   1. utility  - Sign In link + locale label + country/locale list
 *   2. brand    - logo linking home
 *   3. sections - main navigation links
 *   4. tools    - search label
 *   5. sign-in  - sign-in panel copy: title, subtitle, field labels (list), links,
 *                 submit label (bold). Form controls are built by header.js
 *
 * No analytics, data layer, ContextHub or client-side AEM libraries are carried over.
 */

// Site-root folder that holds the migrated image assets
const IMAGES_FOLDER = 'images/';

// Source pages already migrated to EDS: point nav links at their EDS paths
const MIGRATED_PATHS = {
  '/us/en/faqs.html': '/content/wknd/us/en/faqs',
  '/us/en/about-us.html': '/content/wknd/us/en/about-us',
  '/content/wknd/us/en/faqs.html': '/content/wknd/us/en/faqs',
  '/content/wknd/us/en/about-us.html': '/content/wknd/us/en/about-us',
};

/**
 * Normalize a source href: keep hash links, map migrated pages to EDS paths,
 * keep other same-site links as root-relative paths.
 */
function normalizeHref(href, origin) {
  if (!href || href.startsWith('#')) return href || '#';
  let url;
  try {
    url = new URL(href, origin);
  } catch (e) {
    return href;
  }
  if (url.origin !== new URL(origin).origin) return url.href;
  return MIGRATED_PATHS[url.pathname] || `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Locale switcher links on the source point at the current page in each locale.
 * In a site-wide nav they point at the locale home instead (e.g. /ca/en.html).
 */
function localeHomeHref(href, origin) {
  let url;
  try {
    url = new URL(href, origin);
  } catch (e) {
    return href;
  }
  if (url.origin !== new URL(origin).origin) return url.href;
  const segments = url.pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  if (segments[0] === 'content') segments.splice(0, 2);
  return segments.length >= 2 ? `/${segments[0]}/${segments[1]}.html` : url.pathname;
}

function text(el) {
  return (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
}

function link(document, label, href) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  return a;
}

function para(document, child) {
  const p = document.createElement('p');
  if (typeof child === 'string') p.textContent = child;
  else if (child) p.append(child);
  return p;
}

/**
 * Fetch the sign-in experience fragment (loaded on demand by the source site).
 */
function fetchFragment(document, path, origin) {
  if (!path) return null;
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', new URL(path, origin).href, false);
    xhr.send();
    if (xhr.status !== 200) return null;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = xhr.responseText;
    wrapper.querySelectorAll('script, style, link, noscript').forEach((el) => el.remove());
    return wrapper;
  } catch (e) {
    console.warn('Could not load sign-in fragment', e);
    return null;
  }
}

function buildUtility(document, header, origin) {
  const items = [];
  const signIn = header.querySelector('.wknd-sign-in-buttons__button--sign-in');
  if (signIn) items.push(para(document, link(document, text(signIn), '#sign-in')));

  const langNav = header.querySelector('nav.cmp-languagenavigation');
  const toggle = header.querySelector('[href="#langNavToggle"]');
  if (toggle) items.push(para(document, text(toggle)));
  if (langNav) {
    const list = document.createElement('ul');
    langNav.querySelectorAll(':scope > ul > li').forEach((country) => {
      const li = document.createElement('li');
      li.append(text(country.querySelector(':scope > .cmp-languagenavigation__item-title')));
      const locales = document.createElement('ul');
      country.querySelectorAll(':scope > ul > li').forEach((locale) => {
        const a = locale.querySelector('a');
        if (!a) return;
        const item = document.createElement('li');
        const localeLink = link(document, text(a), localeHomeHref(a.getAttribute('href'), origin));
        if (locale.classList.contains('cmp-languagenavigation__item--active')) {
          const strong = document.createElement('strong');
          strong.append(localeLink);
          item.append(strong);
        } else {
          item.append(localeLink);
        }
        locales.append(item);
      });
      li.append(locales);
      list.append(li);
    });
    items.push(list);
  }
  return items;
}

function buildBrand(document, header, origin) {
  const logoLink = header.querySelector('.cmp-image--logo a, .image a');
  const img = header.querySelector('.cmp-image--logo img, .image img');
  if (!img) return [];
  const src = img.currentSrc || img.getAttribute('src') || '';
  const fileName = decodeURIComponent(new URL(src, origin).pathname.split('/').pop()).toLowerCase();
  const image = document.createElement('img');
  image.src = `${IMAGES_FOLDER}${fileName}`;
  image.alt = img.getAttribute('alt') || '';
  const a = document.createElement('a');
  a.href = normalizeHref(logoLink ? logoLink.getAttribute('href') : '/', origin);
  a.append(image);
  return [para(document, a)];
}

function buildSections(document, header, origin) {
  // level-0 "Home" is hidden on desktop but listed first in the mobile menu
  const list = document.createElement('ul');
  header.querySelectorAll('.cmp-navigation__item--level-0 > a, .cmp-navigation__item--level-1 > a').forEach((a) => {
    const li = document.createElement('li');
    li.append(link(document, text(a), normalizeHref(a.getAttribute('href'), origin)));
    list.append(li);
  });
  return list.children.length ? [list] : [];
}

function buildTools(document, header) {
  const input = header.querySelector('.cmp-search__input');
  if (!input) return [];
  return [para(document, input.getAttribute('placeholder') || 'Search')];
}

function buildSignIn(document, header, origin) {
  const signIn = header.querySelector('.wknd-sign-in-buttons__button--sign-in');
  const fragment = fetchFragment(document, signIn && signIn.dataset.modalUrl, origin);
  if (!fragment) return [];
  // Flat structure (no headings/ids): title + subtitle paragraphs, field labels as a list.
  // header.js turns these into the dialog heading, subtitle and form controls.
  const items = [];
  const title = fragment.querySelector('h1, h2');
  if (title) items.push(para(document, text(title)));
  const subtitle = fragment.querySelector('h3');
  if (subtitle) items.push(para(document, text(subtitle)));
  const fields = document.createElement('ul');
  fragment.querySelectorAll('input:not([type="hidden"])').forEach((field) => {
    const li = document.createElement('li');
    li.textContent = field.getAttribute('placeholder') || field.getAttribute('aria-label') || '';
    fields.append(li);
  });
  if (fields.children.length) items.push(fields);
  fragment.querySelectorAll('form a').forEach((a) => {
    items.push(para(document, link(document, text(a), normalizeHref(a.getAttribute('href'), origin))));
  });
  const button = fragment.querySelector('button');
  if (button) {
    const strong = document.createElement('strong');
    strong.textContent = text(button);
    items.push(para(document, strong));
  }
  return items;
}

export default {
  transform: (payload) => {
    const { document, params } = payload;
    const origin = new URL(params.originalURL).origin;
    const header = document.querySelector('header.experiencefragment, .cmp-experiencefragment--header');

    const main = document.createElement('div');
    if (header) {
      const sections = [
        buildUtility(document, header, origin),
        buildBrand(document, header, origin),
        buildSections(document, header, origin),
        buildTools(document, header),
        buildSignIn(document, header, origin),
      ].filter((items) => items.length);

      sections.forEach((items, i) => {
        if (i > 0) main.append(document.createElement('hr'));
        items.forEach((item) => main.append(item));
      });
    }

    return [{
      element: main,
      path: '/nav',
      report: {
        title: 'nav',
        sections: main.querySelectorAll('hr').length + 1,
        links: main.querySelectorAll('a').length,
        images: main.querySelectorAll('img').length,
      },
    }];
  },
};
