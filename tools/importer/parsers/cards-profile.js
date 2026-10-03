/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile. Base: cards (variant "profile" -> class "cards profile").
 * Source: https://publish-p133255-e1921317.adobeaemcloud.com/content/wknd/us/en/about-us.html
 *
 * Source structure: each person is a sibling
 *   section.experiencefragment.cmp-experience-fragment--contributor
 * directly inside the main grid, in consecutive runs (contributors, then guides).
 *
 * The parser is invoked once per matched element. For the FIRST element of a
 * consecutive run it collects that element plus every immediately-following
 * sibling contributor, builds ONE block (one row per person), replaces the first
 * element with the block and removes the rest of the run. Non-first / already
 * consumed elements are removed (they are normally gone already).
 *
 * Row per person: [portrait img, (h3 name, p role, ul social links)].
 * Portrait alt falls back to the person's name when the source alt is empty.
 */

const PERSON_SELECTOR = '.cmp-experience-fragment--contributor';
const CONSUMED_ATTR = 'data-cards-profile-consumed';

function isPerson(el) {
  return !!el && el.nodeType === 1 && el.matches(PERSON_SELECTOR);
}

function cleanText(text) {
  return (text || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildRow(person, document) {
  const nameEl = person.querySelector('.cmp-title h3, h3.cmp-title__text, h3, .cmp-title h2, h2, h4');
  const name = cleanText(nameEl ? nameEl.textContent : '');

  // Role line: the small heading after the name (h5 in source), or any other title
  const roleEl = person.querySelector('.cmp-title--black .cmp-title__text, h5, h6')
    || Array.from(person.querySelectorAll('.cmp-title__text')).find((h) => h !== nameEl);
  const role = cleanText(roleEl ? roleEl.textContent : '');

  // Portrait
  const srcImg = person.querySelector('.cmp-image img, img.cmp-image__image, img');
  let img = null;
  if (srcImg) {
    const src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
    if (src) {
      img = document.createElement('img');
      img.setAttribute('src', src);
      img.setAttribute('alt', cleanText(srcImg.getAttribute('alt')) || name);
    }
  }

  // Text cell
  const content = [];
  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name;
    content.push(h3);
  }
  if (role) {
    const p = document.createElement('p');
    p.textContent = role;
    content.push(p);
  }
  const links = Array.from(person.querySelectorAll('a.cmp-button, .cmp-buildingblock--btn-list a, a[href]'))
    .filter((a, i, arr) => arr.indexOf(a) === i);
  if (links.length) {
    const ul = document.createElement('ul');
    links.forEach((a) => {
      const textEl = a.querySelector('.cmp-button__text');
      const label = cleanText(textEl ? textEl.textContent : a.textContent)
        || cleanText(a.getAttribute('aria-label') || a.getAttribute('title'));
      if (!label) return;
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.setAttribute('href', a.getAttribute('href') || '#');
      // social network icon (EDS icon, authored as :facebook: etc.) followed by the label
      const iconEl = a.querySelector('[class*="cmp-button__icon--"]');
      const iconClass = iconEl ? [...iconEl.classList].find((c) => c.startsWith('cmp-button__icon--')) : '';
      const network = iconClass ? iconClass.replace('cmp-button__icon--', '')
        : ['facebook', 'twitter', 'instagram'].find((n) => label.toLowerCase().includes(n));
      if (network) link.append(`:${network}: `);
      link.append(label);
      li.append(link);
      ul.append(li);
    });
    if (ul.children.length) content.push(ul);
  }

  if (!img && !content.length) return null;
  return [img || '', content];
}

export default function parse(element, { document }) {
  // Already handled as part of an earlier run, or detached by a previous call
  if (!element.parentElement || element.hasAttribute(CONSUMED_ATTR)) {
    if (element.parentElement) element.remove();
    return;
  }

  // Not the first of its run: the first element's call builds the block
  if (isPerson(element.previousElementSibling)) {
    return;
  }

  // Collect the consecutive run starting at this element
  const run = [element];
  let next = element.nextElementSibling;
  while (isPerson(next)) {
    run.push(next);
    next = next.nextElementSibling;
  }

  const cells = run.map((person) => buildRow(person, document)).filter(Boolean);
  run.forEach((el) => el.setAttribute(CONSUMED_ATTR, 'true'));

  if (!cells.length) {
    run.slice(1).forEach((el) => el.remove());
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (profile)', cells });
  run.slice(1).forEach((el) => el.remove());
  element.replaceWith(block);
}
