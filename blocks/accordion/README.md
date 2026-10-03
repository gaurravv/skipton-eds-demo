# accordion

Custom **accordion** block. Purpose: faq.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Content structure

One row per item:

| Accordion | |
| --- | --- |
| Question text | Answer (rich text: paragraphs, bold, links, lists) |
| Question text | Answer |

- Cell 1 is the question. Plain text is rendered inside an `h3`; if the cell holds a single heading, that heading level is reused.
- Cell 2 (and any further cells) form the answer panel. Empty paragraphs/headings are dropped.
- Rows with an empty question cell are ignored.

## Behaviour and accessibility

- Every question is a native `<button>` inside a heading, with `aria-expanded` and `aria-controls` pointing at its panel.
- Each panel is `role="region"` with `aria-labelledby` pointing back at its button.
- All items start collapsed. More than one can be open at the same time.
- Enter/Space toggle an item. ArrowUp/ArrowDown move focus between questions (wrapping around), and Home/End jump to the first/last question.
- The '+' indicator becomes '-' when an item is expanded. Its transition is turned off under `prefers-reduced-motion: reduce`.
