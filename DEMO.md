# Skipton EDS + DA Demo

Built to satisfy the four objectives agreed for the Skipton follow-up demo:

1. Authoring model: **Document Authoring (DA / da.live)**
2. Coexistence model: **AEM Pages with Core Components** (your real sandbox) alongside **Pages with EDS Blocks authored in DA** (this repo)
3. Developer flow
4. Author flow

This repo rebuilds Skipton's public **Help and Support** page (structure and copy only — see "Content and branding" below) as a real, working Edge Delivery Services site, so the demo is an actual live page rather than slides.

## What's live right now

- Repo: `https://github.com/gauravkumar_adobe/skipton-eds-demo` (private)
- Local preview: `npm install && npx -y @adobe/aem-cli up --html-folder drafts --html-mount / --no-open`, then open `http://localhost:3000/help-and-support`
- Once code is synced (see "Remaining setup" below): `https://main--skipton-eds-demo--gauravkumar_adobe.aem.page/help-and-support`

Pages:
- `/help-and-support` — the rebuilt page: hero, "What do you need help with?" cards, "Other ways we can help" (image cards), "Get in touch", "Help for conveyancers" — same structure/copy as the live Skipton page.
- `/` — a short explainer for whoever opens the repo, describing the coexistence split.
- `/nav`, `/footer` — the global header/footer content, shared across pages.

## 1. Coexistence model

**AEM Pages with Core Components** = your existing AEMaaCS sandbox, unchanged. Nothing in this repo touches it.

**Pages with EDS Blocks + DA** = this repo, currently just `/help-and-support`.

The two are wired together at the CDN/routing layer, not in code — this matches "Model B: Page-Type Separation" from the Success Accelerator deck:
- Requests for `/help-and-support*` route to this EDS site (`*.aem.live`)
- Every other path keeps routing to your AEM Publish tier as it does today
- Shared header/footer (already built here from the same nav structure as skipton.co.uk) keep the transition invisible to a visitor

**What I need from you to wire this for real:** your sandbox's author/publish host names, so I can draft the literal CDN/reverse-proxy rule (Fastly/Akamai/CloudFront, whichever you use) for `/help-and-support` → EDS, everything else → AEM. Until then, the two sides can be demoed side by side (two browser tabs) rather than one seamless domain.

## 2. Developer flow (script for the call)

1. `npm install && npx -y @adobe/aem-cli up --html-folder drafts --html-mount /` — local dev server, live reload, no build step.
2. `curl http://localhost:3000/help-and-support` vs `curl http://localhost:3000/help-and-support.plain.html` — show the raw block markup a developer works against.
3. Open [blocks/cards/cards.js](blocks/cards/cards.js) and [blocks/cards/cards.css](blocks/cards/cards.css) — walk through the block contract: a block is just a `decorate(block)` function plus scoped CSS, no build step, no bundler. This is the direct equivalent of a Core Component, but plain JS/CSS.
4. Show the "promo" variant (`class="cards promo"`) in the same block file — this is how a developer adds a second look for authors to choose from without writing a new block.
5. Push to a branch → AEM Code Sync auto-syncs → preview at `https://<branch>--skipton-eds-demo--gauravkumar_adobe.aem.page/` → PageSpeed Insights check (target: 100) → PR → merge → live. (Exact flow in [AGENTS.md](AGENTS.md#publishing-process).)

## 3. Author flow (script for the call)

Document Authoring (da.live) is the content source (see `fstab.yaml`). Authors never touch GitHub or code.

1. Open `https://da.live/#/gauravkumar_adobe/skipton-eds-demo` (requires AEM Code Sync installed first — see below).
2. Open `help-and-support` — content is a normal rich-text document. Blocks are tables: the first cell of the first row is the block name (e.g. `Cards`, or `Cards (promo)` for the variant), each following row is one card.
3. Edit a card's text live, or add a new row to the `Cards` table for a new help topic — no dev involved.
4. Use the Sidekick (browser extension) **Preview** then **Publish** — show the change go live in seconds.
5. This is the same authoring motion as their current AEM Core Components pages (edit → preview → publish), which is the point: EDS/DA doesn't replace how Skipton's authors already think about publishing, it just removes the AEM author tier for this content.

The exact tables to (re)create in DA for each page mirror the block markup already in [drafts/help-and-support.html](drafts/help-and-support.html), [drafts/nav.html](drafts/nav.html), and [drafts/footer.html](drafts/footer.html) — those files are the reference for what to type into DA.

## Content and branding

Structure and copy are taken from the public `skipton.co.uk/help-and-support` page to make the demo recognizable. Photography is replaced with neutral placeholder graphics (no Skipton stock photos or logo assets are included), and the footer carries an explicit "demo, not affiliated with Skipton" disclaimer. This repo is private.

## Remaining setup (needs your action, not mine)

1. **Install AEM Code Sync** on this repo — I can't do this via API, it needs your GitHub click-through:
   `https://github.com/apps/aem-code-sync/installations/new` → select `gauravkumar_adobe` → **Only select repositories** → `skipton-eds-demo` → Save.
2. **Populate DA** with the nav/footer/help-and-support content (step 1-2 under "Author flow" above) — needs your Adobe IMS login, I can't do this for you.
3. **Send me your AEMaaCS sandbox host** (author + publish) if you want the literal coexistence routing config drafted rather than just described.
