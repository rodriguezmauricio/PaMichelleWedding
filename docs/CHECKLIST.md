# Wedding site checklist

Live site: <https://pamichellewedding.vercel.app>
Review link (for the couple): <https://pamichellewedding.vercel.app/?review>
Repo: <https://github.com/rodriguezmauricio/PaMichelleWedding>

Work top to bottom. Each phase can wait — nothing below breaks the live site.

---

## Phase 1 — Couple approval (now)

- [ ] Send Michelle & Pa the **review link** (`/?review`), not the plain one.
  - Orange = design changes. Red = things we need from them.
  - Tap **List** (bottom-left on desktop, top-right on phone) for every item; tap one to jump to it.
  - The RSVP can be tried end to end in review mode. **Nothing is saved yet.**
- [ ] Get their approval on the overall design.
- [ ] Collect answers to the red items:
  - [ ] Hero illustration: final, or replace it?
  - [ ] Return bus times from La Viñuela after the reception
  - [ ] Full address of B bou Hotel La Viñuela & Spa
  - [ ] Phone number or link for Manolo / Nexotransfer
  - [ ] Phone or email guests should use to contact Michelle or Pa (footer + Q&A)
  - [ ] Headcount: add a "How many guests in this reply?" field? (yes / no)
  - [ ] Who should get an email on every RSVP (one or both of them)?
  - [ ] Whose Google account should own the RSVP spreadsheet?
- [ ] Send Claude their answers → Claude updates the site and pushes (Vercel redeploys automatically).

## Phase 2 — Connect RSVPs (~10 min, in the couple's Google account)

- [ ] Follow [apps-script/SETUP.md](../apps-script/SETUP.md), steps 1–4.
- [ ] Choose the `/guests` password (`ADMIN_KEY`) and share it with the couple privately.
- [ ] Send Claude the **Web app URL** (ends in `/exec`) → Claude puts it in `config.js` and pushes.
- [ ] Test: send one RSVP on the **plain** site (no `?review`).
  - [ ] A row appears in the sheet
  - [ ] The notification email arrives
  - [ ] It shows on `/guests` after entering the password
  - [ ] Delete the test row from the sheet

## Phase 3 — Custom domain

- [ ] Tell Claude the domain name and where it's registered (GoDaddy, Namecheap, Cloudflare, …).
- [ ] Vercel → project **PaMichelleWedding** → **Settings → Domains** → add the domain (and `www.` version).
- [ ] At the registrar, add the DNS records Vercel shows on that screen. Typically:
  - `A` record, host `@`, value `76.76.21.21`
  - `CNAME` record, host `www`, value `cname.vercel-dns.com`
  - (Use Vercel's exact values if they differ.)
- [ ] Wait until Vercel shows **Valid Configuration** (minutes, sometimes a few hours).
- [ ] Tell Claude the domain is live → Claude sets the WhatsApp/iMessage preview image to the full URL.
- [ ] Test the preview: paste the link into a WhatsApp chat with yourself — image + title should appear.

## Phase 4 — Pre-launch checks (on a real phone)

- [ ] Map in "Where to Stay" loads
- [ ] "Calendar +" adds the event on iPhone and Android
- [ ] "Call" buttons in the Local Guide open the dialler
- [ ] RSVP works on the plain site (no `?review`)
- [ ] Intro curtain, menu and bottom quick-links bar behave

## Phase 5 — Launch

- [ ] Share the plain link (no `?review`) with guests.
- [ ] Optional: remove review mode (delete `review.js` and its `<script>` tag in `index.html`). Guests never see it either way.

## Later (closer to May 2027)

- [ ] Re-check the ALSA Málaga → Nerja bus times
- [ ] After 9 Feb 2027: download the CSV from `/guests` for the final numbers
