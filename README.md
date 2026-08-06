# W. Proposal Template

This repository is an independent, reusable version of the supplied W.Sutherland presentation. It retains the original visual theme, responsive layouts, page transitions, document preview modal, carousels, fonts and image quality, but it does not depend on the W.Sutherland repository or its Git history.

The current proposal passcode is **`2481`**.

## Preview locally

From the repository root:

```bash
python3 -m http.server 4173 --directory site
```

Open `http://localhost:4173/` and enter `2481`. The site is entirely static; there is no build or package-install step.

## Start a new proposal

Edit [`site/data/template-config.js`](site/data/template-config.js). This is the normal per-proposal configuration file:

- `state`: `VIC`, `NSW` or `QLD`.
- `proposal`: browser title, address, recipients, indicative cost and duration.
- `supportingDocuments`: optional cost-plan workbooks shown on the Opinion of Probable Cost page.
- `passcode`: currently fixed at `2481` as requested.

The current proposal has no supporting cost-plan workbook configured. Add one only when a project-specific workbook should be available to the recipient.

The page order is:

1. The Submission
2. Opinion of Probable Cost
3. Case Studies
4. The Technology Stack
5. W. Portfolio
6. Detailed Proposal Example
7. The Project Team
8. Our Process
9. Business Details
10. Closing / Let's Meet

Case Studies is populated from portfolio project IDs in `site/data/template-config.js`. The current proposal features Canterbury, Terralsole and Mermaid in that order.

### Cost-page workbook example

Place the workbook under `site/assets/documents/cost/`, then add it to `supportingDocuments`:

```js
supportingDocuments: [
  {
    name: "Project · Cost Plan",
    file: "assets/documents/cost/Project - Cost Plan.xlsx"
  }
],
```

The visible cost table remains in `site/index.html` so figures, rates, exclusions and duration can be edited without a framework or build step.

## State-specific business details and insurance

Business details and insurance are indexed in [`site/data/document-index.js`](site/data/document-index.js). Setting one state automatically combines:

- that state's supplied business details;
- that state's licences, eligibility and WorkCover documents; and
- the canonical national contract-works, public-liability and professional-indemnity certificates.

The state can also be previewed without editing the config:

- `http://localhost:4173/?state=VIC`
- `http://localhost:4173/?state=NSW`
- `http://localhost:4173/?state=QLD`

The URL parameter overrides the configured default for that browser view. The supplied RTF source files are retained beside each state's PDFs. National certificates were byte-identical in all three supplied folders, so one canonical copy is stored and referenced by every state.

When replacing an insurance document, keep the existing state folder convention and update only its registry entry. Do not reuse another state's eligibility, licence or WorkCover document.

## Reusable document library

All supplied files are kept in stable, descriptive locations:

```text
site/assets/
├── documents/
│   ├── business/
│   │   ├── national/
│   │   ├── VIC/
│   │   ├── NSW/
│   │   └── QLD/
│   └── proposal/
│       ├── methodology/
│       ├── measurements-and-boq/
│       └── trade-recommendations/
└── source/
    └── Projects in order.xlsx
```

The Detailed Proposal Example page is populated entirely from the proposal document index. A supplied PDF can therefore be reused, replaced or removed by changing one registry entry, without changing the page layout.

## Portfolio order

[`site/data/portfolio-index.js`](site/data/portfolio-index.js) mirrors the supplied `Projects in order.xlsx` workbook exactly. The browser reorders the existing portfolio cards from that index at startup, preserving the original card and carousel components.

When the workbook order changes, update the index to match it and retain each card's `data-project` identifier in `site/index.html`.

## Brand and theme

The supplied W.FARNHAM artwork is stored as `site/w-farnham.png` and is the active proposal mark. Source fonts, imagery, colors, spacing, responsive rules and interaction patterns are kept local in `site/`; nothing is fetched from the source repository at runtime.

## Validate before publishing

Run:

```bash
node scripts/validate-template.mjs
```

The validator checks the required page order, passcode, empty case-studies section, portfolio index, all state profiles and every indexed document path.

Netlify is configured to publish `site/` directly. The client-side passcode is a presentation gate, not server-side authentication; use protected hosting if access control must be security-grade.
