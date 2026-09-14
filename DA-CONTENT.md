# DA authoring cheat-sheet

Open `https://da.live/#/gaurravv/skipton-eds-demo`, create these three documents, then Preview + Publish each from the Sidekick.

Table convention: first row / first cell = block name (this tells EDS which block to render). Everything else is normal document content (headings, paragraphs, links) outside of tables.

---

## Document: `nav`

Plain content, no tables — three separate blocks of content, each separated by a horizontal rule / section break:

**Block 1:**
> Skipton EDS Demo *(as a link to `/`)*

**Block 2 (bulleted list):**
- Savings → `/savings`
- Mortgages → `/mortgages`
- Financial Advice → `/financial-advice`
- Insurance → `/insurance`
- Membership → `/membership`
- Life and Money → `/life-and-money`
- Help and Support → `/help-and-support`

**Block 3:**
- Branch finder → `/help-and-support/branch-finder`
- Search → `/search`
- **Login** (bold) → `/login`

---

## Document: `footer`

**Table 1** — first cell of first row: `Columns`

| Our Products | Our Society | Help & Support | Legal |
|---|---|---|---|
| **Our Products**<br>Savings → /savings<br>Mortgages → /mortgages<br>Financial Advice → /financial-advice<br>Insurance → /insurance | **Our Society**<br>About us → /about-us<br>Careers → /careers<br>Press Office → /press-office<br>Investor Relations → /investor-relations | **Help & Support**<br>Help and Support → /help-and-support<br>Contact us → /help-and-support/contact-us<br>Branch finder → /help-and-support/branch-finder<br>Fraud and Security → /help-and-support/fraud-and-security | **Legal**<br>Legal notice → /legal-notice<br>Data privacy notice → /data-privacy-notice<br>Cookies → /cookies |

*(4 columns in one row — each cell has a bold heading line then a link list, matching drafts/footer.html)*

**Below the table (separate section):**
> This is a demo site built with Adobe Edge Delivery Services and Document Authoring. Not affiliated with or published by Skipton Building Society.

---

## Document: `help-and-support`

**Section 1 — Table, first cell: `Hero`**

| Hero |
|---|
| [image placeholder] |
| # Help and support<br>Want some information quickly? Let's get the answers you need to help you manage your savings, mortgages, and more. |

**Section 2 — Heading + Table, first cell: `Cards`**

> ## What do you need help with?

| Cards |
|---|
| ### [Help with my savings](/help-and-support/savings-help)<br>From how to pay in, withdraw, and transfer your money to what you should do if you can't find your documents. |
| ### [Help with my mortgage](/help-and-support/mortgage-help)<br>We want to make understanding mortgages easier. If there's something you're not sure about, head to our mortgage help and support pages. |
| ### [Help with my insurance](/help-and-support/insurance-existing-customers)<br>View your policy documents, learn how to make a claim, discover ways to change your existing policy, and more. |
| ### [Support with Bereavement and Legacy](/help-and-support/extra-support/bereavement)<br>Straightforward guidance to support you at this difficult time, including how to register as a Power of Attorney. |
| ### [Help with Fraud and Security](/help-and-support/fraud-and-security)<br>Tips to stay safe from scammers, including how to protect yourself, and what to look out for. |
| ### [App and Online support](/help-and-support/our-app-and-skipton-online)<br>Manage your savings and mortgage anytime you like, with our simple step-by-step guides. |

**Section 3 — Heading + Table, first cell: `Cards (promo)`**

> ## Other ways we can help

| Cards (promo) |
|---|
| [image placeholder] / ### [Extra support](/help-and-support/extra-support)<br>Need further help? Here's how you can get in touch with us, and ways we can better support you with any accessibility needs. |
| [image placeholder] / ### [Base Rate change](/help-and-support/base-rate-change)<br>Find out how your mortgage or savings account may be affected by the change in the Bank of England Base Rate. |

**Section 4 — Heading + Table, first cell: `Cards`**

> ## Get in touch

| Cards |
|---|
| ### [Contact us](/help-and-support/contact-us)<br>For further support, one of our friendly members of staff would be more than happy to assist you. |
| ### [Branch finder](/help-and-support/branch-finder)<br>Find your closest branch, along with the opening times, contact information and accessibility information. |

**Section 5 — Heading + Table, first cell: `Cards`**

> ## Help for conveyancers

| Cards |
|---|
| ### [Information for conveyancers](/help-and-support/information-for-conveyancers)<br>Documents and information for licensed conveyancers who have a client with, or applying for, a mortgage. |

---

Reference source for exact structure: [drafts/nav.html](drafts/nav.html), [drafts/footer.html](drafts/footer.html), [drafts/help-and-support.html](drafts/help-and-support.html) in this repo — those are what the tables above should produce once EDS decorates them.
