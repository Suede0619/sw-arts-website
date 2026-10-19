# GitHub Pages deployment

Dave explicitly selected GitHub for source and hosting on October 19, 2026.

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

The prototype and later approved production frontend belong in this **same repository**, served through GitHub Pages at the same address (a custom domain is a later option). Preserve the prototype with the `prototype-v0.1.0` Git tag before replacing it. The full production build still follows Dave/Felix's prototype review; publication of a demo does not authorize real commerce.

GitHub Pages serves static frontend files. Live AI, payment creation/webhooks, inventory holds, private customer information and seller operations require separately secured APIs/services; keep all secret keys on that backend. A production framework must export a static frontend for Pages, or its server responsibilities must move behind those APIs. Reconcile this requirement with the earlier proposed Next.js/server stack before implementing production. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Prototype boundaries and prior hosting attempt

The concierge, viewing request and checkout are clearly labeled simulations. No real payment, booking, email or model call is connected. Original generated illustrations stand apart from named artist/venue research; no rights-cleared selling inventory is implied. See [ASSETS.md](ASSETS.md).

The earlier Sites registration `appgprj_6ad65ca64d54819198c8b45f3a72e475` has no saved version or deployed URL (verified October 19, 2026). No source was pushed there. Dave rejected that host; the local Sites manifest was removed. No deletion operation was available, so the unused registration remains unpublished. Do not deploy it or recreate it.
