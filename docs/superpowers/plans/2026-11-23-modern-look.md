# Modern Look Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the bPulse status page (mockup B) with a verdict banner, uptime %, time axis, "updated" time and automatic dark mode.

**Architecture:** Pure status logic moves into a new classic browser script `static/summary.js` (no `import`/`export`; attaches `globalThis.bPulse`) so it can be unit-tested with `node --test` and loaded by `index.html` before `client.js`. `client.js` keeps rendering the DOM but uses those functions and emits the new card/banner markup. `style.css` is rewritten around CSS custom properties with a `prefers-color-scheme: dark` override.

**Tech Stack:** Vanilla HTML/CSS/JS, Node's built-in `node:test` (no npm dependencies).

**Spec:** `docs/superpowers/specs/2026-11-23-modern-look-design.md`

## Global Constraints

- No npm dependencies, no build step, no CSS framework.
- Do not change `watcher.js`, `config.js` or the `status.json` format.
- Status colours: healthy `#22c55e`, degraded `#f59e0b`, highly degraded `#f97316`, outage `#ef4444`, no data neutral grey.
- Banner copy (English): `"All systems operational"`, `"<Name> is down"`, `"Major outage"` (2+ endpoints down), `"<Name> is experiencing slow responses"`, `"Status unknown"`; sub-line `"Updated X ago"`.
- Remove Fira Sans Condensed from `index.html`; keep Material Symbols Outlined.
- Bars keep `nDataPoints` segments on all widths; layout single column, max ~760px, 16px gutters on phones.

## Review Focus

1. **Endpoint without its own `responseTimeGood`/`responseTimeWarning`** (watcher only copies per-endpoint values) → must fall back to `config.responseTimeGood/Warning`, not silently show healthy. Test in Task 1 (`pointStatus` with undefined thresholds is called with fallbacks by caller) and Task 2 (caller passes fallback).
2. **Empty `status.json` (`{}`)** — the repo ships one → page shows "Status unknown" banner, no JS exception. Test in Task 1 (`overallStatus([])`) and manual check in Task 2.
3. **Endpoint with no logs at all** → uptime shows `—`, not `NaN%`. Test in Task 1.
4. **Watcher stopped (stale `lastPulse`)** → grey "Status unknown" even if last points were healthy. Test in Task 1.
5. **Long endpoint/site names and many endpoints on a 375px phone** → no horizontal scroll. Manual check in Task 3.

---

### Task 1: Status logic module with tests

**Files:**
- Create: `static/summary.js`
- Create: `test/summary.test.js`
- Modify: `package.json` (`"test": "node --test"`)

**Interfaces:**
- Produces, on `globalThis.bPulse`:
  - `pointStatus(point, good, warn) -> 'outage'|'highly-degraded'|'degraded'|'healthy'|'none'` — `none` when `point` is falsy; `outage` when `point.err`; then `ttfb > warn`, `ttfb > good`.
  - `uptimePercent(points) -> number|null` — ignores falsy points; `null` if none left; else `100 * nonErr / total`.
  - `formatUptime(pct) -> string` — `null` → `"—"`; `100` → `"100%"`; else two decimals, e.g. `"99.71%"`.
  - `overallStatus(items, {stale}) -> {level: 'ok'|'degraded'|'outage'|'unknown', title: string}` — `items` is `[{name, status}]` where `status` is the endpoint's latest `pointStatus`. Rules from Global Constraints; `stale` or empty `items` or all `none` → `unknown`.
  - `formatAgo(ms) -> string` — `<60s` → `"just now"`, `<60min` → `"N min ago"`, `<48h` → `"N h ago"`, else `"N d ago"`.

- [ ] **Step 1: Write failing tests** in `test/summary.test.js` (`import '../static/summary.js'; const b = globalThis.bPulse;`), using `node:test` + `node:assert/strict`:
  - `pointStatus(undefined,300,600)==='none'`; `({err:'x',ttfb:10})==='outage'`; `({ttfb:700})==='highly-degraded'`; `({ttfb:400})==='degraded'`; `({ttfb:100})==='healthy'`.
  - `uptimePercent([{t:1},{t:2,err:'x'},undefined,{t:3},{t:4}])===75`; `uptimePercent([undefined])===null`.
  - `formatUptime(null)==='—'`, `formatUptime(100)==='100%'`, `formatUptime(99.714)==='99.71%'`.
  - `overallStatus([{name:'API',status:'healthy'}],{stale:false})` → `{level:'ok',title:'All systems operational'}`.
  - one `outage` → `{level:'outage',title:'API is down'}`; two → `title:'Major outage'`.
  - `degraded` or `highly-degraded` (no outage) → `{level:'degraded',title:'Web app is experiencing slow responses'}`.
  - `stale:true` with healthy items → `{level:'unknown',title:'Status unknown'}`; `overallStatus([],{stale:false}).level==='unknown'`; all `none` → `unknown`.
  - `formatAgo(30_000)==='just now'`, `formatAgo(3*60_000)==='3 min ago'`, `formatAgo(5*3600_000)==='5 h ago'`, `formatAgo(3*86400_000)==='3 d ago'`.
- [ ] **Step 2:** `npm test` → FAIL (`Cannot find module .../static/summary.js`).
- [ ] **Step 3:** Implement `static/summary.js` as a classic script (no `import`/`export`, works in browser and as Node ESM side-effect import), assigning `globalThis.bPulse = {pointStatus, uptimePercent, formatUptime, overallStatus, formatAgo}`.
- [ ] **Step 4:** `npm test` → all pass.
- [ ] **Step 5:** Commit `feat: add testable status summary logic`.

### Task 2: Render banner, cards, uptime and time axis in `client.js`

**Files:**
- Modify: `static/client.js`
- Modify: `static/index.html` (load `summary.js` before `client.js`; add `<status-banner></status-banner>` between `<header>` and `<error-notice>`; remove Fira Sans Condensed from the Google Fonts URL)
- Create: `test/fixtures/status.sample.json` (2 sites; one with API healthy + one outage point in history, Web app with recent degraded points and no per-endpoint thresholds; one endpoint with `logs: []`; `lastPulse` set close to "now" is not possible statically — the preview step rewrites it)

**Interfaces:**
- Consumes: `globalThis.bPulse.*` from Task 1.
- Produces markup used by Task 3's CSS:
  - `<status-banner data-level="ok|degraded|outage|unknown"><span class="dot"></span><div><strong>title</strong><small>Updated X ago</small></div></status-banner>`
  - per site: `<section class="site"><h2 class="site-name">…</h2>[combined <div class="card">…</div>] <div class="card endpoint">…</div>…</section>`
  - per card: `<div class="card-head"><h3>name [link icon] [info]</h3><span class="uptime">99.98% uptime</span></div><status-bar>…</status-bar><div class="axis"><span>{span} ago</span><span>now</span></div>`
  - `status-bar-entry[data-status]` unchanged.

- [ ] **Step 1:** In `StatusBar.setLogs`, replace the inline threshold logic with `bPulse.pointStatus(point, endpoint.responseTimeGood ?? config.responseTimeGood, endpoint.responseTimeWarning ?? config.responseTimeWarning)`. Remove the `console.log(endpoint)` debug line.
- [ ] **Step 2:** Compute `stale` once per refresh (same rule as today: `lastPulse < Date.now() - config.interval*60_000 - 20_000`, or no `lastPulse`). Collect `{name, status: pointStatus(last point)}` for every endpoint and render `<status-banner>` from `overallStatus`, with sub-line `"Updated " + formatAgo(Date.now()-lastPulse)` (omit sub-line when no `lastPulse`).
- [ ] **Step 3:** Emit the site/card markup above; uptime from `uptimePercent(points)` + `formatUptime`, rendered as `"<x> uptime"`; the combined bar card uses the site name-less head with uptime only. Axis left label = `formatAgo(config.nDataPoints*config.interval*60_000)` (e.g. `"22 h ago"`).
- [ ] **Step 4:** Guard empty status: if `status.ui` missing, render banner "Status unknown" and return without throwing. Fix `setError("Error loading server status:", error)` → `setError("Error loading server status: " + error.message)`.
- [ ] **Step 5: Verify in browser.** Copy `static/` to a scratch dir, copy the fixture over `status.json` with `lastPulse` and log `t` values shifted so the latest is ~2 min ago, serve with `python3 -m http.server`, open it. Expected: amber banner "Web app is experiencing slow responses", uptime values shown, `—` for the empty endpoint, no console errors. Then set `lastPulse` 2 h back → grey "Status unknown". Then use the repo's empty `{}` → "Status unknown", no exception.
- [ ] **Step 6:** `npm test` still passes. Commit `feat: status banner, uptime and time axis`.

### Task 3: Rewrite `style.css` (mockup B, light + dark)

**Files:**
- Modify: `static/style.css` (full rewrite)

**Interfaces:**
- Consumes: markup from Task 2.

- [ ] **Step 1:** Tokens on `:root` (`--bg #f6f7f9`, `--surface #fff`, `--border #e5e7eb`, `--text #0f172a`, `--muted #64748b`, the five status colours, banner tints per level) and a `@media (prefers-color-scheme: dark)` block (`--bg #0b0f17`, `--surface #121826`, `--border #1f2937`, `--text #e5e7eb`, `--muted #94a3b8`, darker banner tints, no-data grey `#334155`). `body` uses `system-ui, -apple-system, "Segoe UI", Inter, sans-serif` and explicit `background: var(--bg)`.
- [ ] **Step 2:** Layout and components per mockup B: header left-aligned in a `max-width: 760px` column; `status-banner` rounded 12px with glowing dot coloured by `data-level`; `.site-name` small uppercase muted label; `.card` 12px radius, 1px border, subtle shadow (none in dark); `.card-head` flex space-between with `.uptime` muted and `tabular-nums`; bars 26px tall, 2px gap, 3px radius; `.axis` 11px muted; tooltips use `--surface`/`--border` with a shadow; `error-notice` keeps red but rounded; footer muted. Keep focus ring visible on `status-bar-entry:focus-visible`. Remove the unused `#github-button` rules.
- [ ] **Step 3: Verify in browser** with the Task 2 preview: light and dark (toggle macOS appearance or DevTools "prefers-color-scheme"), and at 375px width — no horizontal scroll, long names wrap, uptime stays on the right. Compare against mockup B.
- [ ] **Step 4:** Commit `style: modern card layout with dark mode`.
