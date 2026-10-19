# Southwest Art — Taos design prototype

An original, responsive design prototype for **Dave Paul and Felix Kay**. The purpose is to help artists sell work so they can continue living in Taos, with collector confidence, excellent presentation and a welcoming visit experience.

**Prototype address:** https://suede0619.github.io/sw-arts-website/

**Source:** https://github.com/Suede0619/sw-arts-website

Project day one: **November 1, 2026**. Year one: November 1, 2026–October 31, 2027. This early prototype is preparation for review, not the start of live selling or partner billing. Audo Copenhagen #11 from the supplied Atomic Atlas is the provisional visual reference; the implementation uses original components, Georgia/system typography and clay/juniper/ivory colors.

## What works

- Taos gateway and responsive navigation.
- Six clearly labeled illustrative demo works; medium, budget, palette, maximum-width and text filters; sorting and honest empty results.
- Whole-image work details, zoom, two-work comparison and demo price/size information.
- Ten real artist research profiles, each with six sourced work records. No unauthorized artist images or live offers.
- Twelve gallery candidates, ten experiences, eight restaurant and eight lodging candidates.
- Experience type/time/cost filters, Taos Plaza/Arroyo Seco origin, clearly estimated travel bands and a regional schematic.
- Source-linked venue details, lodging room examples and date validation without invented live rates.
- Saved selections, reordering/removal, local persistence, a shareable shortlist and text download.
- A contextual **simulated concierge**, visible filter application and undo.
- Demonstration viewing request and checkout, including delivery selection and a no-charge/no-order confirmation.

## Deliberate prototype limits

No real model API, Stripe, card entry, seller onboarding, appointment email, booking inventory or affiliate tracking is connected. A typed viewing request is not sent or saved. The only persistent visitor data is an array of selected public work/place IDs in browser local storage. No analytics/third-party scripts are included.

Artwork, dimensions and prices in the design collection are illustrative. The six studies are not attributed to living artists and are not for sale. Artist and venue candidates are research records, not agreed participants; October 19, 2026 source observations need refreshing. Generated scene images are labeled illustrations, not actual gallery/venue photographs. See [ASSETS.md](ASSETS.md).

The direct-artist production proposal takes zero platform commission, with a separately funded processing policy. Gallery/estate/resale arrangements differ. Working brand Southwest Art is not affiliated with Southwest Art Magazine; public-name clearance remains a production decision. The preview requests no search indexing.

## Run locally

Runtime has no external dependencies or build step:

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. Files served are exactly those in `dist/`.

For validation:

```sh
npm ci
npm run check
npm test
```

Browser tests use local Google Chrome on macOS when available. Else install Playwright's Chromium with `npx playwright install chromium`. The tests start/stop their own local server and cover core discovery, comparison, persistence, concierge undo, simulation boundaries, phone layouts and lodging/plan validation. They do not certify production WCAG conformance, real payments, live AI or provider inventory.

## Sources and deployment

The specification and alignment live in the separate [taosarts document repository](https://github.com/Suede0619/taosarts), particularly `PROJECT-BASELINE.md` and `website-spec/`. Source data is copied intentionally; update it from reconciled records rather than scraping directly into publishable offers.

Dave selected **GitHub Pages**, with source and publishing configuration in this repository. `.github/workflows/pages.yml` validates and deploys only `dist/` on pushes to `main`; the public preview requires no account. Assets and hash routes support the `/sw-arts-website/` project path. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment, rollback and the later production transition. The unused Sites registration was never published and is not a deployment destination.

Review this prototype before authorizing a production build or real seller/customer operations.
