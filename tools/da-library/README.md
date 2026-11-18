# DA block library

Example documents that power **Library → Blocks** in da.live:

- Custom blocks: Hero, Cards (+ promo), Columns, Accordion, Fragment, Section Metadata, Metadata.
- Adobe OOTB blocks (code copied from `adobe/aem-block-collection`, examples from
  `aemsites/da-block-collection`): Carousel, Embed, Search, Table, Tabs, Video.

Not included: Quote (removed on purpose), Form (needs a submission backend),
Modal (link-driven, not an insertable block).

## Why not point at Adobe's `da-block-collection`?
DA rewrites every library URL (including `*.aem.page`) to `admin.da.live/source/<org>/<site>/...`
and fetches it with **your** login. You are not a member of the `aemsites` org, so you get 401,
no variants load, and clicking a block inserts nothing. The examples must live in your own site.

## Install (one time)
1. Get a DA token: open https://da.live, sign in, open DevTools → Network, click any
   `admin.da.live` request and copy the value after `Authorization: Bearer `.
2. Run from the repo root:
   ```bash
   DA_TOKEN='<token>' ./tools/da-library/upload.sh gaurravv skipton-eds-demo
   ```
   This uploads `docs/library/blocks/*` and overwrites the `docs/library/blocks` sheet.
3. In the site config (`https://da.live/config#/gaurravv/skipton-eds-demo/`), tab `library`:

   | title  | path |
   |--------|------|
   | Blocks | https://content.da.live/gaurravv/skipton-eds-demo/docs/library/blocks.json |

4. Hard-refresh the document, click into an empty paragraph, open **Library → Blocks**,
   expand a block and click a variant — the table is inserted at the cursor.

To add a block: add `blocks/<name>.html` here (block `div` followed by a `library-metadata`
description) and re-run the script.
