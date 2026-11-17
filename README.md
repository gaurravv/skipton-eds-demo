# Skipton EDS + DA Demo

A working demo of Adobe Edge Delivery Services (EDS) with Document Authoring (DA), built to show one section of an existing AEM site — **Help and Support** — rebuilt as EDS blocks and authored in da.live, coexisting alongside the rest of the site on AEM Sites with Core Components.

See **[DEMO.md](DEMO.md)** for the full walkthrough: the coexistence model (including real routing options against the sandbox), the developer-flow script, and the author-flow script — this is the doc to use when running the actual demo.

## Status

- ✅ Live and published — content authored in DA, previewed, and published
- ✅ AEM Code Sync installed
- ⬜ Coexistence routing against the real AEMaaCS sandbox — pending which CDN fronts Publish (see DEMO.md)

## Environments

- Preview: https://main--skipton-eds-demo--gaurravv.aem.page/help-and-support
- Live: https://main--skipton-eds-demo--gaurravv.aem.live/help-and-support
- Local: `http://localhost:3000/help-and-support` (see below)

## Content and branding

Structure and copy are taken from the public `skipton.co.uk/help-and-support` page to make the demo recognizable. Photography is replaced with neutral placeholder graphics — no Skipton stock photos or logo assets are included — and the footer carries an explicit "demo, not affiliated with Skipton" disclaimer. This repo is private.

## Repo layout

- `blocks/` — EDS blocks (`hero`, `cards` incl. the `promo` image variant, `accordion`, `quote`, `widget`, `header`, `footer`, `columns`, `fragment`)
- `scripts/` — `aem.js` (EDS library), `scripts.js` (page decoration and loading), `delayed.js` (third-party code)
- `styles/` — global styles for default content, sections and buttons
- `drafts/` — local-dev content matching the real published pages (used with `--html-folder drafts`); also the reference structure for what's authored in DA
- `da-paste/` — standalone HTML pages with real `<table>` markup, meant to be opened in a browser and copy-pasted into da.live as a fast way to (re)create the DA documents
- `fstab.yaml` — content source config, points at `content.da.live`
- `DEMO.md` — the demo script
- `DA-CONTENT.md` — the DA authoring content spec (block/table structure) in plain text form

## How the code flows

1. **Authoring:** authors write documents in da.live. `fstab.yaml` mounts
   `content.da.live/gaurravv/skipton-eds-demo/`. Preview or Publish makes EDS
   fetch the document and convert it to semantic HTML on `.aem.page` / `.aem.live`.
2. **Page structure:** `---` separates sections, and ordinary text, headings and
   images are default content. A table whose first row is a name (for example
   `Quote`) becomes a block: `<div class="quote">`. There are no component JSON
   files; the table header is the block name.
3. **Browser:** `head.html` loads `scripts/aem.js`, `scripts/scripts.js` and
   `styles/styles.css`. `loadPage()` in `scripts.js` runs three phases:
   - **`loadEager`:** runs `decorateMain`, which turns icon tokens and icons into
     images, builds auto-blocks (`/fragments/` links and `/widgets/` links), wraps
     sections, applies Section Metadata `Style` values as section classes, marks
     blocks and decorates buttons. Only the first section is then loaded, to keep
     Largest Contentful Paint fast.
   - **`loadLazy`:** loads the header, the remaining sections, the footer,
     `lazy-styles.css` and fonts.
   - **`loadDelayed`:** imports `delayed.js` after 3 seconds.
4. **Blocks:** for each block, `aem.js` loads `blocks/<name>/<name>.css` and
   `<name>.js` and calls its default `decorate(block)` export.

The block code and runtime are the same as in the Universal Editor site
(`skipton-ue-eds-site`); only the authoring source differs.

## Local development

```sh
npm install
npx -y @adobe/aem-cli up --html-folder drafts --html-mount / --no-open
```

Then open `http://localhost:3000/help-and-support`.

## Linting

```sh
npm run lint
```

## Documentation

Adobe's Edge Delivery Services docs, if you need background beyond DEMO.md:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)
