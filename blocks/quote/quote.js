export default function decorate(block) {
  const [quoteRow, authorRow] = [...block.children];

  const figure = document.createElement('figure');
  figure.className = 'quote-figure';

  const quoteCell = quoteRow?.firstElementChild;
  if (quoteCell) {
    const blockquote = document.createElement('blockquote');
    quoteCell.classList.add('quote-text');
    blockquote.append(quoteCell);
    figure.append(blockquote);
  }

  const authorCell = authorRow?.firstElementChild;
  if (authorCell && authorCell.textContent.trim()) {
    const caption = document.createElement('figcaption');
    authorCell.classList.add('quote-author');
    caption.append(authorCell);
    figure.append(caption);
  }

  block.replaceChildren(figure);
}