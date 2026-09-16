# Handoff for Claude Code

This folder is a git repo (one commit on `main`). Publish it:

1. `gh repo create cove-sim --public --source=. --remote=origin --push` (or create the repo on GitHub and `git remote add origin ... && git push -u origin main`).
2. Verify: `node check.mjs && node check-sheet.mjs && node check-full.mjs && node check-node.mjs` all print PASS.
3. Optional: enable GitHub Pages from `main` so the four `*-simulation.html` pages are viewable in a browser.
4. Paste the repo URL into the Founders Inc Blueprint II application ("Drop your most impressive link").

What is here: four energy-balanced screening models (`model.mjs`, `sheet.mjs`, `full-model.mjs`, `node-model.mjs`), their test scripts, `build.mjs` (assembles offline HTML pages), `run.mjs` (writes `RESULTS.md`), `MODEL.md` (equations and limits). Do not edit the built `*-simulation.html` directly; edit the templates or models and run `node build.mjs`.
