# Modern look for the status page — short design

**Date:** 2026-11-23
**Size:** small change (static dashboard only; `watcher.js` and `config.js` untouched)

## Intent

bPulse is a general, self-hosted status page. The typical visitor is a customer of
some SaaS who suspects a problem and opens the page in a browser to answer
"is it them or me?". The page should answer that at a glance and look modern
enough to sit next to the operator's own product.

## Goals

- A clear verdict at the top of the page.
- A modern, calm look: cards, system font, rounded bars, softer colours.
- Automatic dark mode (follows the visitor's OS setting).
- Uptime % per endpoint, time labels under the bars, "Updated X ago".

## Non-goals / anti-goals

- No new dependencies, no build step, no framework (README promises "No dependencies").
- No changes to `status.json` format, `watcher.js` or `config.js`.
- Must not look like a generic framework template.

## Approaches

- **A — stylesheet only.** Smallest change, but no verdict for the worried customer.
- **B — stylesheet + small `client.js` additions.** *Chosen by Herr Winkler* after
  comparing mockups. Gives the verdict banner while staying dependency-free.
- **C — CSS framework (Pico/Tailwind).** Rejected: external dependency, generic look.

## Design (approved direction: mockup B)

**Files:** `static/style.css` (rewritten), `static/index.html` (small markup changes),
`static/client.js` (additions).

1. **Look** — design tokens as CSS custom properties on `:root`, redefined under
   `@media (prefers-color-scheme: dark)`. System font stack; drop the unused
   Fira Sans Condensed font (keep Material Symbols for icons). Each endpoint in a
   rounded card; site name as a small uppercase label. Bars with 3px radius and a
   new palette: healthy `#22c55e`, degraded `#f59e0b`, highly degraded `#f97316`,
   outage `#ef4444`, no data neutral grey. Tooltips restyled to match (dark-mode aware).
2. **Status banner** — computed from each endpoint's most recent data point:
   - any outage → red, "*Name* is down" (or "Major outage" if several);
   - else any (highly) degraded → amber, "*Name* is experiencing slow responses";
   - else → green, "All systems operational";
   - watcher stale (same check `client.js` already uses for `lastPulse`) → grey,
     "Status unknown".
   Sub-line: "Updated X min ago" based on `lastPulse`.
3. **Uptime %** — share of displayed data points without `err`, ignoring points
   with no data; shown right-aligned on each endpoint card and on the combined bar.
4. **Time axis** — under each bar, "*N* h/d ago" (from `nDataPoints × interval`) and "now".
5. **Layout** — header (logo + title) left-aligned in a max ~760px column; footer muted.

## My calls (left to the builder unless Herr Winkler objects)

- Exact wording of banner messages (English, as the page is today).
- Mobile: bars keep 90 segments but shrink; layout single column with 16px gutters.
- The existing `setError("…", error)` misuse is fixed in passing (only the first
  argument is shown today).
