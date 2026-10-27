# SIDHI GYM Tracker — Project File Map

This guide groups the current repository by responsibility so files are easier to find without changing live file paths.

## Application entry points
- `index.html` — repository/Vercel entry page
- `public/index.html` — main gym tracker interface
- `server.js` — active API/server entry point
- `package.json` — root runtime dependencies and scripts
- `vercel.json` — Vercel routing/deployment configuration
- `premium-config.js` — premium plan configuration

## Backend
- `admin-routes.js` — admin API routes
- `otp-routes.js` — OTP/authentication routes
- `server.js` — API endpoints, database models and server setup
- `run.js`, `run-ui.js` — running feature/server-side and UI support files at the root
- `scripts/` — maintenance and migration scripts

## Frontend — `public/`
- `app.js`, `index.html` — main frontend app and interface
- `run.js`, `run-ui.js` — running feature
- `account-ui.js`, `admin-ui.js`, `membership-ui.js`, `premium-ui.js`, `backup-ui.js` — account, admin, membership, premium and backup UI
- `hist-ui.js`, `charts-plus.js`, `stats-pack.js`, `daily-plus.js` — history, charts and stats
- `ex-guide.js`, `ex-split.js`, `split-zone.js` — exercise guidance and workout splits
- `graph-foot.js`, `timing-fix.js`, `tabs-fix.js`, `glitch-lock.js`, `greet-fix.js`, `boot-fix.js` — startup, navigation and UI-fix scripts
- `sw.js`, `manifest.json` (if present) — PWA/service-worker assets
- `fonts.css`, `fonts/` — font styling and font assets
- `icon.svg`, `icon-192.png`, `icon-512.png` — app icons
- `terms.html`, `privacy.html`, `refund.html`, `contact.html` — public policy/contact pages
- `robots.txt`, `sitemap.xml`, Google verification HTML — search/indexing files

## Other folders
- `fullstack/` — separate full-stack starter/reference implementation; do not confuse with the active root `server.js` without checking deployment settings
- `.github/` — GitHub repository configuration and ownership rules
- `scripts/` — database migration and maintenance utilities

## Safe organization rule
The app currently references many frontend files by their existing paths, and Vercel expects the root server/config files at their current locations. Do not move or rename active files until every HTML script/style reference, dynamic loader, service-worker cache entry, and deployment route has been updated and checked. This map is a safe first step; future physical moves should be done in small batches with path updates and a deployment check.
