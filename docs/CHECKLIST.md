# Wedding site checklist

Live site: <https://www.michelleandpa.com> (also pamichellewedding.vercel.app)
Review link (for the couple): <https://www.michelleandpa.com/?review>
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
  - [x] 2:30 = 2:30am: confirmed. Buses leave the hotel at 2:30am; taxis organised at the hotel (EUR 50-60)
  - [x] Reception address: Vereda de Vélez, SN, 29712, Málaga, Spain
  - [x] Contact details: Michelle 085 736 9303, Pa 085 108 3627 (shown as +353), michelleandpa2027@gmail.com. Matt removed from the footer
  - [x] Headcount field: yes, added ("How many in your party?")
  - [x] RSVP emails go to michelleandpa2027@gmail.com, which also owns the sheet
  - [ ] Manolo / Nexotransfer: the couple weren't sure. Find a phone/link, or remove him
  - [ ] Matt's email is still in the **Stay** section ("Need help choosing?"). Remove too, or swap for the couple's email?
  - [ ] Confirm the phone numbers are Irish (+353)
  - (The review panel now only lists items for the couple. Developer-only checks are in Phase 4 and "Later" below.)
- [ ] The couple tap **Send answers as a link** in the review panel; you open the link they send (it opens `/review-answers`). Temporary: delete `review-answers.html` when approved.
- [ ] Send Claude their answers → Claude updates the site and pushes (Vercel redeploys automatically).

## Phase 2 — Connect RSVPs (~10 min, in the couple's Google account)

Tested end to end on 24 Oct 2026 in Mauricio's own account (sheet "Michelle & Pa — RSVPs (TEST, Mauricio)"): row in the sheet, notification email, `/guests` all worked. The live site currently points at that test deployment. Repeat in the couple's account:

- [ ] Signed in as michelleandpa2027@gmail.com, follow [docs/setup-guide.html](setup-guide.html) (same steps as [apps-script/SETUP.md](../apps-script/SETUP.md)), steps 1–4 (Deploy type must be **Web app**, not API Executable; add both `ADMIN_KEY` and `NOTIFY_EMAIL`).
- [ ] Choose a new `/guests` password (`ADMIN_KEY`) and share it with the couple privately.
- [ ] Send Claude the new **Web app URL** (ends in `/exec`) → Claude puts it in `config.js` and pushes.
- [ ] Test: send one RSVP on the **plain** site (no `?review`).
  - [ ] A row appears in the sheet
  - [ ] The notification email arrives
  - [ ] It shows on `/guests` after entering the password
  - [ ] Delete the test row from the sheet
- [ ] Afterwards: delete the test sheet and its Apps Script deployment in Mauricio's account (Deploy → Manage deployments → Archive), so the old URL stops working.

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
