# Southwest Art prototype

This is the separate prototype repository `Suede0619/sw-arts-website`, inside the ignored `ART/sw-arts-website/` folder. The surrounding ART repository is documentation, with its own Git history. Never stage parent files, private source archives or credentials here.

The user is **Dave Paul**, also David Paul. Project day one is **November 1, 2026**; year one ends October 31, 2027. October research/prototype preparation is not a claim of a live trading launch. The user authorized this prototype and its deployment; production is a separate review gate.

Purpose: help artists sell art so they can remain in Taos. Preserve a beautiful, welcoming experience, collector confidence, free core artist discovery and zero Southwest Art commission on direct-artist website sales. Processing subsidy and actual seller responsibilities need funding/agreements before production claims.

Read README.md, ASSETS.md and the ART PROJECT-BASELINE/website-spec documents when available. Audo Copenhagen #11 is the provisional reference, adapted originally; final design approval is pending prototype review.

Implementation is buildless HTML/CSS/JavaScript in `dist/`. `data.json` separates six fictional demo studies from ten real artist research candidates/sixty sourced work leads and thirty-eight venue/experience candidates. No real artists/venues are agreed partners merely by appearing. Do not enable real checkout or booking or invent current availability. Keep assistant, request and checkout simulations explicitly labeled.

All imagery is original generated illustration or original SVG; no uncleared artist images or venue photography are published. Generated gallery imagery does not depict HOUSE of FIRE or any real venue. Room photography and real art images require permission and exact attribution before replacement. The source PNG masters are local in ignored `source-assets/`; web assets and prompts are committed.

Run `npm run check` and meaningful browser tests after functional changes. `npm test` uses a local Chrome if installed, otherwise Playwright Chromium. Test images/results are ignored. Avoid unrelated test expansion. Keep phone layouts, keyboard/focus handling, no-result recovery, image containment, source-versus-demo labels and no unauthorized external actions intact.

Dave explicitly requires **GitHub source and GitHub Pages hosting** for both this prototype and the later production frontend. Use `https://github.com/Suede0619/sw-arts-website` and `https://suede0619.github.io/sw-arts-website/`. Do not create or publish a Sites deployment. The abandoned, unpublished Sites registration is not the host; there is no Sites manifest in this repository.

`.github/workflows/pages.yml` checks and publishes `dist/` after a push to `main`. Browser tests run under `/sw-arts-website/` to catch project-path regressions. Keep asset/data URLs relative and hash navigation intact. Check the Actions result and the actual public page before claiming deployment succeeded. Tag the prototype source before replacing it with an approved production build; keep the same repository and Pages address. Production AI, commerce and privileged data need a secure backend outside static Pages; no credentials or private records may enter browser code or Git.
