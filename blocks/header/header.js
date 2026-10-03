// media query match that indicates desktop width (main nav visible, no hamburger)
const isDesktop = window.matchMedia('(width >= 1200px)');

// nav document sections, in authored order
const SECTION_NAMES = ['utility', 'brand', 'sections', 'tools', 'sign-in'];

/**
 * Fetches the nav document: local content folder first, then the site root (DA/EDS).
 * Relative image paths are resolved against the nav document URL.
 * @returns {Promise<Element|null>} container holding the nav sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  // image paths in the nav document are relative to the document, not the current page
  container.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return container;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  node.append(...children);
  return node;
}

function normalizePath(path) {
  return path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

function isCurrentPage(link) {
  try {
    const url = new URL(link.href, window.location.href);
    const target = normalizePath(url.pathname);
    const current = normalizePath(window.location.pathname);
    return url.origin === window.location.origin
      && target !== '/'
      && (current === target || current.endsWith(target));
  } catch (e) {
    return false;
  }
}

/**
 * Wires a toggle button/link to a panel: aria-expanded, hidden, Escape and outside click.
 * @param {Element} trigger element that toggles the panel
 * @param {Element} panel element shown/hidden
 * @param {Function} [onOpen] called after the panel opens
 * @returns {Function} close function
 */
function bindToggle(trigger, panel, onOpen) {
  const setOpen = (open) => {
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    if (open && onOpen) onOpen();
  };
  const close = () => setOpen(false);

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    // the panel's visibility is the source of truth for the toggle state
    setOpen(panel.hidden);
  });
  panel.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      close();
      trigger.focus();
    }
  });
  trigger.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') close();
    // links acting as buttons also toggle on Space
    if (e.code === 'Space' && trigger.tagName === 'A') {
      e.preventDefault();
      trigger.click();
    }
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !trigger.contains(e.target)) close();
  });
  return close;
}

/**
 * Builds the utility bar: sign-in trigger and locale selector.
 * @param {Element} section utility section of the nav document
 */
function buildUtility(section) {
  const bar = el('div', { class: 'nav-utility-inner' });
  const label = [...section.querySelectorAll(':scope > p')].find((p) => !p.querySelector('a'));
  const countries = section.querySelector(':scope > ul');
  const signInLink = section.querySelector(':scope > p > a[href^="#"]');
  if (signInLink) {
    signInLink.className = 'nav-sign-in';
    signInLink.setAttribute('role', 'button');
    signInLink.setAttribute('aria-haspopup', 'dialog');
    signInLink.setAttribute('aria-expanded', 'false');
    signInLink.setAttribute('aria-controls', 'nav-sign-in-panel');
    bar.append(el('div', { class: 'nav-sign-in-wrapper' }, signInLink));
  }

  if (label && countries) {
    const toggle = el('a', {
      href: '#nav-locale-panel',
      role: 'button',
      class: 'nav-locale-toggle',
      'aria-expanded': 'false',
      'aria-controls': 'nav-locale-panel',
      'aria-label': `Toggle language, current: ${label.textContent.trim()}`,
    }, label.textContent.trim());
    countries.classList.add('nav-locale-list');
    countries.querySelectorAll(':scope > li').forEach((country) => {
      const name = country.querySelector(':scope > p');
      if (name) name.replaceWith(el('span', { class: 'nav-locale-country' }, name.textContent.trim()));
      else if (country.firstChild && country.firstChild.nodeType === Node.TEXT_NODE) {
        country.firstChild.replaceWith(el('span', { class: 'nav-locale-country' }, country.firstChild.textContent.trim()));
      }
    });
    countries.querySelectorAll('strong > a').forEach((a) => {
      a.setAttribute('aria-current', 'true');
      a.parentElement.replaceWith(a);
    });
    const panel = el('div', { class: 'nav-locale-panel', id: 'nav-locale-panel' }, countries);
    panel.hidden = true;
    const locale = el('div', { class: 'nav-locale' }, toggle, panel);
    bindToggle(toggle, panel);
    bar.append(locale);
  }
  section.replaceChildren(bar);
}

/**
 * Builds the main navigation list and marks the current page.
 * @param {Element} section sections section of the nav document
 * @param {string} [brandHref] href of the logo link
 */
function buildSections(section, brandHref) {
  section.id = 'nav-sections';
  section.querySelectorAll('a').forEach((a) => {
    if (isCurrentPage(a)) a.setAttribute('aria-current', 'page');
    // a link to the same page as the logo is only listed in the mobile menu
    if (brandHref && a.href === brandHref) a.closest('li').classList.add('nav-home');
  });
}

/**
 * Builds the search form from the authored placeholder text.
 * @param {Element} section tools section of the nav document
 */
function buildTools(section) {
  const placeholder = section.textContent.trim() || 'Search';
  const input = el('input', {
    type: 'search',
    id: 'nav-search-input',
    name: 'q',
    placeholder,
    autocomplete: 'off',
  });
  const form = el(
    'form',
    { class: 'nav-search', role: 'search' },
    el('label', { class: 'nav-search-label', for: 'nav-search-input' }, placeholder),
    el('span', { class: 'nav-search-icon', 'aria-hidden': 'true' }),
    input,
  );
  // no search results page exists on the site yet
  form.addEventListener('submit', (e) => e.preventDefault());
  section.replaceChildren(form);
}

/**
 * Builds the sign-in dialog from the authored copy.
 * Title and subtitle are the leading paragraphs, field labels are list items,
 * links are kept, the bold paragraph is the submit label.
 * @param {Element} section sign-in section of the nav document
 * @returns {Element} dialog element
 */
function buildSignIn(section) {
  const paragraphs = [...section.querySelectorAll(':scope > p')];
  const plain = paragraphs.filter((p) => !p.querySelector('a, strong'));
  const [titleText, subtitleText] = plain.map((p) => p.textContent.trim());
  const fields = [...section.querySelectorAll(':scope > ul > li')].map((li) => li.textContent.trim());
  const links = paragraphs.filter((p) => p.querySelector('a'));
  const submit = paragraphs.find((p) => p.querySelector('strong'));

  const form = el('form', { class: 'nav-sign-in-form' });
  fields.forEach((field, i) => {
    const id = `nav-sign-in-field-${i}`;
    form.append(
      el('label', { class: 'nav-sign-in-label', for: id }, field),
      el('input', {
        id,
        type: /password/i.test(field) ? 'password' : 'text',
        placeholder: field,
        autocomplete: /password/i.test(field) ? 'current-password' : 'username',
      }),
    );
  });
  links.forEach((p) => form.append(p));
  if (submit) form.append(el('button', { type: 'submit' }, submit.textContent.trim()));
  // sign-in is not connected to an identity provider on this site
  form.addEventListener('submit', (e) => e.preventDefault());

  const dialog = el(
    'div',
    {
      class: 'nav-sign-in-panel',
      id: 'nav-sign-in-panel',
      role: 'dialog',
      'aria-labelledby': 'nav-sign-in-title',
    },
    el('h2', { id: 'nav-sign-in-title' }, titleText || 'Sign In'),
  );
  if (subtitleText) dialog.append(el('h3', {}, subtitleText));
  dialog.append(form, el('hr'));
  dialog.hidden = true;
  return dialog;
}

/**
 * Opens/closes the mobile menu
 * @param {Element} nav The nav element
 * @param {Boolean} [forceExpanded] force a state instead of toggling
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? forceExpanded : nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  if (button) {
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  }
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;

  block.textContent = '';
  const nav = el('nav', { id: 'nav', 'aria-label': 'Main', 'aria-expanded': 'false' });
  const sections = {};
  [...fragment.querySelectorAll(':scope > div')].forEach((section, i) => {
    const name = SECTION_NAMES[i];
    if (!name) return;
    section.classList.add(`nav-${name}`);
    sections[name] = section;
  });

  if (sections.utility) buildUtility(sections.utility);
  const brandLink = sections.brand && sections.brand.querySelector('a');
  if (sections.sections) buildSections(sections.sections, brandLink && brandLink.href);
  if (sections.tools) buildTools(sections.tools);

  const main = el('div', { class: 'nav-main' });
  const mainInner = el('div', { class: 'nav-main-inner' });
  const hamburger = el(
    'div',
    { class: 'nav-hamburger' },
    el(
      'button',
      {
        type: 'button',
        'aria-controls': 'nav-sections',
        'aria-expanded': 'false',
        'aria-label': 'Open navigation',
      },
      el('span', { class: 'nav-hamburger-icon' }),
    ),
  );
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  mainInner.append(hamburger);
  ['brand', 'sections', 'tools'].forEach((name) => {
    if (sections[name]) mainInner.append(sections[name]);
  });
  main.append(mainInner);

  if (sections.utility) nav.append(sections.utility);
  nav.append(main);

  nav.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });

  const trigger = nav.querySelector('.nav-sign-in');
  if (sections['sign-in'] && trigger) {
    // the dialog follows its trigger (disclosure pattern); it is positioned fixed
    const dialog = buildSignIn(sections['sign-in']);
    trigger.after(dialog);
    bindToggle(trigger, dialog, () => {
      const firstInput = dialog.querySelector('input');
      if (firstInput) firstInput.focus();
    });
  }

  const navWrapper = el('div', { class: 'nav-wrapper' }, nav);
  block.append(navWrapper);

  // reset mobile menu state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  // compact header once the page is scrolled
  const onScroll = () => navWrapper.classList.toggle('nav-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
