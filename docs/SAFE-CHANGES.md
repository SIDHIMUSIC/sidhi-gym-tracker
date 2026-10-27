# Safe Change Checklist

Use this checklist before changing or reorganizing SIDHI GYM Tracker.

## Before editing
1. Identify whether the file is used by the deployed app, a dynamic loader, a service worker, or Vercel routing.
2. Read all references to a file before moving or renaming it.
3. Keep a small, focused change per commit so a regression can be traced and reverted.
4. Never commit credentials, real `.env` files, database URIs, or payment secrets.

## UI glitch / navigation fixes
- Treat `public/glitch-lock.js`, `public/tabs-fix.js`, `public/timing-fix.js`, and `public/graph-foot.js` as regression-sensitive files.
- Read the existing behavior before editing; do not overwrite a fix just to simplify code.
- After a change, inspect the relevant tabs (Home, Workout, Progress, Run), refresh the page, and verify that a selected tab does not unexpectedly jump back to Home.
- Check script load order and cache-busting query strings in `public/index.html` and dynamic script loading in `public/graph-foot.js`.

## Folder reorganization
- First document the intended structure; then move only a small group of files at a time.
- Update every HTML `script`/`link` reference, dynamic `fetch`/script loader, service-worker cache list, and deployment rewrite affected by a move.
- Do not move the root `server.js`, `package.json`, `vercel.json`, or `index.html` without first validating deployment behavior.
- Prefer folders by responsibility (for example, frontend scripts, styles, backend routes, and documentation), but only after reference checks.
- Test JavaScript syntax and run a deployment preview when possible before considering the reorganization complete.

## Release check
- Confirm login, workout save, run tracking, history, progress, and membership flows still work.
- Confirm the service worker refreshes the expected files.
- Confirm the production deployment completed; a Git commit alone does not prove the live site is healthy.
