# Skipton EDS + DA Demo

Built to satisfy the four objectives agreed for the Skipton follow-up demo:

1. Authoring model: **Document Authoring (DA / da.live)**
2. Coexistence model: **AEM Pages with Core Components** (your real sandbox) alongside **Pages with EDS Blocks authored in DA** (this repo)
3. Developer flow
4. Author flow

This repo rebuilds Skipton's public **Help and Support** page (structure and copy only — see "Content and branding" below) as a real, working Edge Delivery Services site, so the demo is an actual live page rather than slides.

## What's live right now

- Repo: `https://github.com/gaurravv/skipton-eds-demo` (private)
- Local preview: `npm install && npx -y @adobe/aem-cli up --html-folder drafts --html-mount / --no-open`, then open `http://localhost:3000/help-and-support`
- Once code is synced (see "Remaining setup" below): `https://main--skipton-eds-demo--gaurravv.aem.page/help-and-support`

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

### Your sandbox

- Author: `https://author-p133255-e1921317.adobeaemcloud.com/`
- Publish (inferred from the standard AEMaaCS naming convention — confirm with your infra team): `https://publish-p133255-e1921317.adobeaemcloud.com/`

Both hosts responded when checked (author: 401, needs auth as expected; publish: 301) — this is a live environment, not a placeholder.

### Option A — native AEM path (recommended, no custom CDN rule needed)

Since this is AEM as a Cloud Service, Adobe's own Managed CDN already fronts your Publish tier, and AEM has a built-in Edge Delivery Services Configuration for exactly this coexistence pattern:

1. Sign in to the author instance above → **Tools → Cloud Services → Edge Delivery Services Configuration**.
2. Create/select the configuration for this project, set:
   - GitHub organization: `gaurravv`
   - Site name: `skipton-eds-demo`
3. This tells Adobe's Managed CDN to route matching paths to the EDS site instead of AEM Publish — no separate reverse-proxy rule to write or maintain.
4. Scope it to `/help-and-support` (or whichever paths you want to hand to EDS) per AEM's path-mapping settings for that configuration.

### Option B — manual CDN rule (if you're fronting AEM with your own Fastly/Akamai/CloudFront instead of Adobe's Managed CDN)

Path-based routing, evaluated before your default AEM origin rule:

```
if (req.url.path matches "^/help-and-support(/.*)?$") {
  set req.backend = eds_backend;  // main--skipton-eds-demo--gaurravv.aem.live
} else {
  set req.backend = aem_publish_backend;  // publish-p133255-e1921317.adobeaemcloud.com
}
```

The exact syntax depends on which CDN sits in front of your publish tier (VCL for Fastly, an Edge Function for Akamai, a Lambda@Edge/CloudFront Function for CloudFront) — tell me which one and I'll write the real config, not pseudocode.

Until either option is wired up, demo the two sides side by side (two browser tabs: your AEM author/preview vs. the EDS live URL) rather than one seamless domain.

## 2. Developer flow (script for the call)

1. `npm install && npx -y @adobe/aem-cli up --html-folder drafts --html-mount /` — local dev server, live reload, no build step.
2. `curl http://localhost:3000/help-and-support` vs `curl http://localhost:3000/help-and-support.plain.html` — show the raw block markup a developer works against.
3. Open [blocks/cards/cards.js](blocks/cards/cards.js) and [blocks/cards/cards.css](blocks/cards/cards.css) — walk through the block contract: a block is just a `decorate(block)` function plus scoped CSS, no build step, no bundler. This is the direct equivalent of a Core Component, but plain JS/CSS.
4. Show the "promo" variant (`class="cards promo"`) in the same block file — this is how a developer adds a second look for authors to choose from without writing a new block.
5. Push to a branch → AEM Code Sync auto-syncs → preview at `https://<branch>--skipton-eds-demo--gaurravv.aem.page/` → PageSpeed Insights check (target: 100) → PR → merge → live. (Exact flow in [AGENTS.md](AGENTS.md#publishing-process).)

## 3. Author flow (script for the call)

Document Authoring (da.live) is the content source (see `fstab.yaml`). Authors never touch GitHub or code.

1. Open `https://da.live/#/gaurravv/skipton-eds-demo` (requires AEM Code Sync installed first — see below).
2. Open `help-and-support` — content is a normal rich-text document. Blocks are tables: the first cell of the first row is the block name (e.g. `Cards`, or `Cards (promo)` for the variant), each following row is one card.
3. Edit a card's text live, or add a new row to the `Cards` table for a new help topic — no dev involved.
4. Use the Sidekick (browser extension) **Preview** then **Publish** — show the change go live in seconds.
5. This is the same authoring motion as their current AEM Core Components pages (edit → preview → publish), which is the point: EDS/DA doesn't replace how Skipton's authors already think about publishing, it just removes the AEM author tier for this content.

The exact tables to (re)create in DA for each page mirror the block markup already in [drafts/help-and-support.html](drafts/help-and-support.html), [drafts/nav.html](drafts/nav.html), and [drafts/footer.html](drafts/footer.html) — those files are the reference for what to type into DA.

## Content and branding

Structure and copy are taken from the public `skipton.co.uk/help-and-support` page to make the demo recognizable. Photography is replaced with neutral placeholder graphics (no Skipton stock photos or logo assets are included), and the footer carries an explicit "demo, not affiliated with Skipton" disclaimer. This repo is private.

## Status

- ✅ AEM Code Sync installed
- ✅ `nav`, `footer`, `help-and-support` authored in DA, previewed, and published — live at `https://main--skipton-eds-demo--gaurravv.aem.live/help-and-support`
- ✅ Sandbox host captured — see "Your sandbox" above
- ⬜ Wire up Option A (native AEM Edge Delivery Services Configuration) or Option B (manual CDN rule) above, whichever matches how your Publish tier is fronted — tell me which and I'll help drive it or write the exact config.
