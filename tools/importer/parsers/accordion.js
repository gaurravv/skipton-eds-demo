/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base: accordion.
 * Source: https://publish-p133255-e1921317.adobeaemcloud.com/content/wknd/us/en/faqs.html
 * Source structure: .cmp-accordion > .cmp-accordion__item
 *   (h3.cmp-accordion__header > button > span.cmp-accordion__title,
 *    .cmp-accordion__panel .cmp-text > p / h3 / b)
 * Target: blocks/accordion — one row per item: [question text, answer rich text].
 * Empty / &nbsp;-only headings and paragraphs are dropped; b -> strong.
 */

const NBSP_RE = /\u00a0/g;

function isBlank(text) {
  return !text || text.replace(NBSP_RE, ' ').trim() === '';
}

/** Normalise &nbsp; to spaces, collapse whitespace runs, trim leading/trailing. */
function cleanText(text) {
  return (text || '').replace(NBSP_RE, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Rebuild inline content of a source node into a target node, keeping only
 * text, <strong> (from strong/b), <em> (from em/i), <a> and <br>.
 */
function copyInline(source, target, document) {
  source.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      const t = node.textContent.replace(NBSP_RE, ' ').replace(/\s+/g, ' ');
      if (t) target.append(document.createTextNode(t));
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') {
      target.append(document.createElement('br'));
      return;
    }
    let wrapper = null;
    if (tag === 'strong' || tag === 'b') wrapper = document.createElement('strong');
    else if (tag === 'em' || tag === 'i') wrapper = document.createElement('em');
    else if (tag === 'a') {
      wrapper = document.createElement('a');
      const href = node.getAttribute('href');
      if (href) wrapper.setAttribute('href', href);
    }
    if (!wrapper) {
      copyInline(node, target, document);
      return;
    }
    copyInline(node, wrapper, document);
    // Move leading/trailing whitespace outside inline formatting so markdown stays valid.
    const raw = wrapper.textContent;
    if (isBlank(raw)) {
      if (raw) target.append(document.createTextNode(' '));
      return;
    }
    const lead = /^\s/.test(raw);
    const trail = /\s$/.test(raw);
    const first = wrapper.firstChild;
    const last = wrapper.lastChild;
    if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, '');
    if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, '');
    if (lead) target.append(document.createTextNode(' '));
    target.append(wrapper);
    if (trail) target.append(document.createTextNode(' '));
  });
}

/** Trim leading/trailing whitespace text of a block-level element and collapse doubles. */
function trimBlock(el) {
  el.normalize();
  const first = el.firstChild;
  const last = el.lastChild;
  if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, '');
  if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, '');
  el.childNodes.forEach((n) => {
    if (n.nodeType === 3) n.textContent = n.textContent.replace(/ {2,}/g, ' ');
  });
}

function buildAnswer(panel, document) {
  const out = [];
  if (!panel) return out;
  const textRoots = panel.querySelectorAll('.cmp-text');
  const roots = textRoots.length ? Array.from(textRoots) : [panel];
  roots.forEach((root) => {
    root.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol').forEach((src) => {
      // lists are copied whole; skip block elements nested inside a list
      if (src.parentElement && src.parentElement.closest('ul, ol')) return;
      if (isBlank(src.textContent)) return;
      const tag = src.tagName.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        const list = document.createElement(tag);
        src.querySelectorAll(':scope > li').forEach((li) => {
          if (isBlank(li.textContent)) return;
          const newLi = document.createElement('li');
          copyInline(li, newLi, document);
          trimBlock(newLi);
          list.append(newLi);
        });
        if (list.children.length) out.push(list);
        return;
      }
      const el = document.createElement(tag);
      copyInline(src, el, document);
      trimBlock(el);
      if (!isBlank(el.textContent)) out.push(el);
    });
  });
  // Fallback: panel had text but no recognised block elements
  if (!out.length && !isBlank(panel.textContent)) {
    const p = document.createElement('p');
    p.textContent = cleanText(panel.textContent);
    out.push(p);
  }
  return out;
}

export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'))
    .filter((item) => item.closest('.cmp-accordion') === element || !element.matches('.cmp-accordion'));

  const cells = [];
  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title')
      || item.querySelector('.cmp-accordion__button')
      || item.querySelector('.cmp-accordion__header');
    const question = cleanText(titleEl ? titleEl.textContent : '');
    const panel = item.querySelector('.cmp-accordion__panel');
    const answer = buildAnswer(panel, document);
    if (!question && !answer.length) return;
    cells.push([question, answer]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Accordion', cells });
  element.replaceWith(block);
}
