# ArtSouthwest website

## Taos and Santa Fe catalog

**Live catalog:** [artsouthwest.com](https://artsouthwest.com/)

The production build carries forward the approved prototype’s typography, palette, split hero and catalog grid. It reads artists and available work from the artist intake service’s approved catalog endpoint. The place catalog includes ten galleries, ten experiences, ten food listings and ten stays per city. Each record links to its own source. The catalog can be reviewed while the team clears artist profiles and artwork.

1. Run `npm run build:production` in this repository.
2. Set `CATALOG_DIR` to its `production-dist/` directory and use `npm run start:domains` from the [artist intake service](https://github.com/Suede0619/asw_artist_webform). The apex serves the catalog, published feed, approved previews and Taos itinerary endpoint. The two subdomains serve intake and staff review.
3. Review for correct city, artist, work, image and price. Use the staff review desk to approve a fictional application on a test branch and confirm it appears. Pull it down and confirm the catalog updates.

Use `production/content/places.json` for the editorial place catalog. Copy and photos come from the individual venues or their official visitor pages. Publish a photo only after checking the subject, photographer, usage permission and credit. Cleared venue images can live under `production/assets/` with the associated listing’s `image` metadata. Pending image material stays in the private ART source archive.

GitHub Pages publishes the prototype from `dist/`. Hosting for the catalog needs to serve the production build and its server endpoints together.

## Taos design prototype

ArtSouthwest is a responsive design prototype for Taos artist research, demo art browsing and visit planning. Its purpose is to help artists sell work and remain in Taos.

**Prototype address:** https://suede0619.github.io/sw-arts-website/

**Source:** https://github.com/Suede0619/sw-arts-website

Project day one: **November 1, 2026**. Year one: November 1, 2026–October 31, 2027. The prototype supports design review. It accepts no real sales or partner billing. Audo Copenhagen #11 from the supplied Atomic Atlas is the provisional visual reference. The implementation uses original components, Georgia/system typography and clay/juniper/ivory colors.

## Implemented flows

- Taos gateway and responsive navigation.
- Six fictional demo works with medium, budget, palette, width and text filters, sorting and empty-result recovery.
- Whole-image work details, zoom, two-work comparison and demo price/size information.
- Ten real artist research profiles, each with six sourced work records. No unauthorized artist images or live offers.
- Twelve gallery candidates, ten experiences, eight restaurant and eight lodging candidates.
- Experience type/time/cost filters, Taos Plaza/Arroyo Seco origin, clearly estimated travel bands and a regional schematic.
- Source-linked venue details, lodging room examples and date validation without invented live rates.
- Saved selections, reordering/removal, local persistence, a shareable shortlist and text download.
- A contextual **simulated concierge**, visible filter application and undo.
- Demonstration viewing request and checkout, including delivery selection and a no-charge/no-order confirmation.

## Prototype boundaries

The prototype connects no model API, Stripe, card entry, seller enrollment, email, booking inventory or affiliate tracking. It sends and saves no viewing requests. Browser storage holds only selected public work and place IDs. The site includes no analytics or third-party scripts.

The six demo studies use generated images and fictional sizes and prices. They offer no physical work for sale and carry no attribution to living artists. Real artist and venue records remain candidates without participation agreements. Their October 19, 2026 source observations need refreshing. See [ASSETS.md](ASSETS.md) for image provenance.

The direct-artist production proposal takes zero platform commission, with a separately funded processing policy. Gallery/estate/resale arrangements differ. The preview requests no search indexing.

## Local preview

Runtime has no external dependencies or build step:

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. The server serves `dist/`.

For validation:

```sh
npm ci
npm run check
npm test
```

Browser tests use local Google Chrome on macOS when available. Else install Playwright's Chromium with `npx playwright install chromium`. The tests start/stop their own local server and cover core discovery, comparison, persistence, concierge undo, simulation boundaries, phone layouts and lodging/plan validation. They do not certify production WCAG conformance, real payments, live AI or provider inventory.

## Sources and deployment

The [taosarts document repository](https://github.com/Suede0619/taosarts) holds the specification. In the local workspace, see `ART/ArtSouthwest/PROJECT-BASELINE.md` and `ART/ArtSouthwest/website-spec/README.md`. Update source data from reconciled research records. Confirm stock and rights before offering work.

The local checkout lives at `ART/ArtSouthwest/ArtSouthwest-website/`. The ART document repository ignores the independent checkout.

The prototype uses **GitHub Pages**, with source and publishing configuration in this repository. `.github/workflows/pages.yml` validates and deploys only `dist/` on pushes to `main`. The public preview requires no account. Assets and hash routes support the `/sw-arts-website/` project path. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment, rollback and the later production transition. The unused Sites registration has no publication. Keep deployment on GitHub Pages.

Review this prototype before authorizing a production build or real seller/customer operations.

## Writing review, October 24, 2026

The editorial revision covers page headings, notices, concierge responses, research summaries and documentation. Follow the [ART writing guide](https://github.com/Suede0619/taosarts/blob/main/WRITING-GUIDE.md). Original image prompts remain verbatim records.
