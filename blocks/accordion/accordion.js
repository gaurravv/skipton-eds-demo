/*
 * Accordion Block
 * One row per item: cell 1 = question, cell 2 = rich-text answer.
 * Implements the WAI-ARIA accordion pattern (heading > button, region panel).
 */

let accordionCount = 0;

/**
 * Builds the heading + button trigger for an accordion item.
 * Reuses an authored heading level when the question cell holds a single heading.
 * @param {Element} cell The question cell
 * @param {string} buttonId Id for the trigger button
 * @param {string} panelId Id of the controlled panel
 * @returns {Element} heading element containing the button
 */
function buildTrigger(cell, buttonId, panelId) {
  const authoredHeading = cell.children.length === 1
    && /^H[1-6]$/.test(cell.firstElementChild.tagName)
    ? cell.firstElementChild
    : null;
  // a lone paragraph is unwrapped: buttons only take phrasing content
  const wrapper = authoredHeading
    || (cell.children.length === 1 && cell.firstElementChild.tagName === 'P' ? cell.firstElementChild : cell);

  const heading = document.createElement(authoredHeading ? authoredHeading.tagName : 'h3');
  heading.className = 'accordion-item-heading';

  const button = document.createElement('button');
  button.type = 'button';
  button.id = buttonId;
  button.className = 'accordion-item-button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panelId);

  const label = document.createElement('span');
  label.className = 'accordion-item-label';
  label.append(...wrapper.childNodes);

  const icon = document.createElement('span');
  icon.className = 'accordion-item-icon';
  icon.setAttribute('aria-hidden', 'true');

  button.append(label, icon);
  heading.append(button);
  return heading;
}

/**
 * Expands or collapses an accordion item.
 * @param {Element} button The trigger button
 * @param {boolean} expand Whether to expand
 */
function setExpanded(button, expand) {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  button.setAttribute('aria-expanded', String(expand));
  button.closest('.accordion-item').classList.toggle('is-open', expand);
  if (panel) panel.hidden = !expand;
}

/**
 * Handles ArrowUp/ArrowDown/Home/End focus movement between triggers.
 * @param {KeyboardEvent} event The keydown event
 * @param {Element[]} buttons All trigger buttons in this block
 */
function handleKeydown(event, buttons) {
  const index = buttons.indexOf(event.target);
  if (index < 0) return;
  let next;
  switch (event.key) {
    case 'ArrowDown':
      next = buttons[(index + 1) % buttons.length];
      break;
    case 'ArrowUp':
      next = buttons[(index - 1 + buttons.length) % buttons.length];
      break;
    case 'Home':
      [next] = buttons;
      break;
    case 'End':
      next = buttons[buttons.length - 1];
      break;
    default:
      return;
  }
  event.preventDefault();
  next.focus();
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  accordionCount += 1;
  const prefix = `accordion-${accordionCount}`;
  const buttons = [];

  [...block.children].forEach((row, i) => {
    const [questionCell, ...answerCells] = [...row.children];
    // skip rows with no question text
    if (!questionCell || !questionCell.textContent.trim()) {
      row.remove();
      return;
    }

    const buttonId = `${prefix}-button-${i + 1}`;
    const panelId = `${prefix}-panel-${i + 1}`;

    const item = document.createElement('div');
    item.className = 'accordion-item';

    const heading = buildTrigger(questionCell, buttonId, panelId);

    const panel = document.createElement('div');
    panel.className = 'accordion-item-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);
    panel.hidden = true;

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    answerCells.forEach((cell) => body.append(...cell.childNodes));
    // drop empty paragraphs/headings left over from authored content
    body.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, picture, a')) el.remove();
    });
    panel.append(body);

    item.append(heading, panel);
    row.replaceWith(item);

    const button = heading.querySelector('button');
    button.addEventListener('click', () => {
      setExpanded(button, button.getAttribute('aria-expanded') !== 'true');
    });
    buttons.push(button);
  });

  block.addEventListener('keydown', (event) => handleKeydown(event, buttons));
}
