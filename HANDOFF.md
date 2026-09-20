# Handoff for Claude Code

This folder is a git repo (one commit on `main`). Publish it:

1. `gh repo create cove-sim --public --source=. --remote=origin --push` (or create the repo on GitHub and `git remote add origin ... && git push -u origin main`).
2. Verify: `node strip/check.mjs && node sheet/check-sheet.mjs && node product/check-full.mjs && node node/check-node.mjs && node tube/check-tube.mjs` all print PASS.
3. Optional: enable GitHub Pages from `main` so the five `*-simulation.html` pages are viewable in a browser.
4. Paste the repo URL into the Founders Inc Blueprint II application ("Drop your most impressive link").

What is here: five energy-balanced screening models, one per folder (`strip/model.mjs`, `sheet/sheet.mjs`, `product/full-model.mjs`, `tube/tube-model.mjs`, `node/node-model.mjs`) alongside their test scripts and their own `MODEL.md` (equations and limits, indexed from the root `MODEL.md`), plus `build.mjs` (assembles offline HTML pages) and `run.mjs` (writes `RESULTS.md`). Do not edit the built `*-simulation.html` directly; edit the templates or models and run `node build.mjs`.
