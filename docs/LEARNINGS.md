# Learnings

- [2026-10-07] [claude] Claude Design `.dc.html` exports depend on `support.js`, which loads React + Babel from unpkg and compiles the page in the visitor's browser — port to static HTML/CSS/JS before shipping; never deploy the `.dc.html` as-is.
- [2026-10-07] [claude] Images downloaded from the Claude Design file pane can be tiny thumbnails (72x48 px); pull the original `src` URLs from the `.dc.html` instead and check dimensions before using them.
- [2026-10-07] [claude] Google Apps Script web apps reject CORS preflight — POST with `fetch(url, {method:'POST', body: JSON.stringify(data)})` and NO custom headers (sent as text/plain, a "simple" request) and the JSON response is readable; adding `Content-Type: application/json` breaks it.
- [2026-10-07] [claude] Apps Script `appendRow` treats strings starting with `= + - @` as formulas — prefix guest input with `'` to avoid spreadsheet formula injection.
- [2026-10-07] [claude] (Superseded — switched to Vercel + Apps Script) Netlify Forms only detects forms present in the static HTML at deploy time — a JS-rendered multi-step form needs a hidden twin `<form name="rsvp" data-netlify="true">` with the same field names, then POST urlencoded with `form-name` to `/`.
- [2026-10-07] [claude] Calendar links: serve real `.ics` files as `text/calendar` without a `download` attribute — iOS Safari then shows "Add to Calendar"; `data:` URIs with `download` save to Files instead.
