# Michelle & Pa — Nerja, 8–10 May 2027

Wedding website. Plain HTML/CSS/JS, no build step, hosted on Vercel.

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The website |
| `guests.html` | Private guest list at `/guests` (password = `ADMIN_KEY` in Apps Script) |
| `config.js` | RSVP endpoint (Google Apps Script web app URL) |
| `apps-script/` | RSVP backend code + [setup steps](apps-script/SETUP.md) |
| `review.js` | Review mode: open the site with `?review` to see design changes (orange) and open items (red) |
| `cal/` | Calendar files for each event |
| `assets/` | Images and link-preview image |

## Run locally

```sh
python -m http.server 8000
# open http://localhost:8000
```

## Deploy

Every push to `main` deploys automatically through Vercel's GitHub integration.
