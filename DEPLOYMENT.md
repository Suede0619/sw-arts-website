# GitHub Pages deployment

GitHub is the selected source and prototype-hosting platform. Hosting baseline: October 19, 2026.

| Item | Value |
|---|---|
| Repository | https://github.com/Suede0619/sw-arts-website |
| Website | https://suede0619.github.io/sw-arts-website/ |
| Source branch | `main` |
| Published artifact | `dist/`; buildless HTML/CSS/JavaScript |
| Workflow | [.github/workflows/pages.yml](.github/workflows/pages.yml) |
| Run history and results | https://github.com/Suede0619/sw-arts-website/actions |
| Visitor access | Public; no sign-in; prototype requests no search indexing |

## Publish and verify

GitHub Pages is configured for GitHub Actions. Push intended source changes to `main`. The workflow installs locked development dependencies, runs syntax/data checks and browser tests, and publishes only the static `dist/` artifact after they pass. Actions are pinned to source commits. Do not include source masters, private records, environment files or credentials in the artifact.

Browser checks use the actual `/sw-arts-website/` path on a local server. This catches broken relative images, data loading, links and shared plans before publication. After a successful Pages workflow, verify the public HTML, catalog/assets and the key browser flows at the website address. Workflow success and the public page are the evidence of publication; this document alone is not.

To rerun the current commit, use the workflow's **Run workflow** control. To roll back, revert the intended change on `main`, commit and push; the workflow republishes that source. Avoid force-pushing repository history. Record actual published commit and verification in the separate [ART session handoff](https://github.com/Suede0619/taosarts/blob/main/SESSION_STATE.md).

## Prototype and final website

The prototype and later approved production build belong in this **same repository**. GitHub hosting is the requested direction for both. **GitHub Pages prohibits using its hosting to run an ecommerce business or a site primarily facilitating commercial transactions.** This design demonstration has no real offers, payment processing or bookings; do not turn the Pages deployment into the live selling service. Choose a compatible commercial host that deploys from this GitHub repository before production. A separate API does not resolve the Pages ecommerce restriction. [Official GitHub Pages usage rules](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

Preserve the prototype with the `prototype-v0.1.0` Git tag before replacing it. The full production build still follows prototype review; publication of a demo does not authorize real commerce. The production hosting choice and public domain remain open; no hosting purchase or extra deployment is authorized by this document.

GitHub Pages serves static files and cannot run our privileged server operations. Live AI, payment creation/webhooks, inventory holds, private customer information and seller operations require secured backend services; keep all secret keys there. Reconcile the final hosting choice with the earlier proposed Next.js/server stack before implementing production. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Prototype boundaries and prior hosting attempt

The concierge, viewing request and checkout are clearly labeled simulations. No real payment, booking, email or model call is connected. Original generated illustrations stand apart from named artist/venue research; no rights-cleared selling inventory is implied. See [ASSETS.md](ASSETS.md).

The earlier Sites registration `appgprj_6ad65ca64d54819198c8b45f3a72e475` has no saved version or deployed URL (verified October 19, 2026). No source was pushed there. That host is excluded; the local Sites manifest was removed. No deletion operation was available, so the unused registration remains unpublished. Do not deploy it or recreate it.
