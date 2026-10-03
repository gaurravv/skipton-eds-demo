# cards

Custom **cards** block. Purpose: content grid; promo callouts; team/profile.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

| Variation | Option class |
| --- | --- |
| Promo | `promo` |
| Profile | `profile` |

## Universal Editor fields

N/A (Document Authoring project)

## Content structure

One row per card: cell 1 holds the image, cell 2 holds the body.

| Cards (option) | |
| --- | --- |
| image | body |

- **Default** (`Cards`): bordered tiles with a 4:3 image. If the `h3` contains a link, the whole card becomes clickable and lifts on hover.
- **Promo** (`Cards (promo)`): borderless, image-forward tiles with a 16:9 image for marketing callouts.
- **Profile** (`Cards (profile)`): centered person cards for team or contributor grids. Body = `h3` name, one paragraph role line (e.g. "Artist | Photographer | Traveler"), then a bulleted list of social links (Facebook, Twitter, Instagram). The portrait is cropped to a circle (1:1). There is no border, hover lift or full-card link overlay, so each social link stays clickable. Grid: 1 column on mobile, 2 at 600px, 3 at 900px, 4 at 1200px.
