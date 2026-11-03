# Client review kit (reusable for any website)

A no-backend way to get a client's approval and answers on a finished site. Built for this wedding site; works on any static or framework site.

## What the client gets
- Open `https://site.com/?review` → welcome card → one item at a time, scrolled into view and highlighted.
- Orange = a change we made (Looks good / I'd change it). Red = a question for them (Yes, fine / No, I'll explain). Comment box on each.
- Finish screen → pick who is answering → **Send** opens the phone's share menu with a link that holds all answers.
- Answers autosave on their device; they can stop and continue. Guests/visitors never see it (needs `?review`).

## What you get
- Open the link they send → `/review-answers` shows their answers: "change" items first, with comments and who answered.
- No server, database, password or account. Answers live inside the link (`#d=...`), so keep the link if you want a record.

## Reuse on a new project (10 minutes)
1. Copy `review.js` and `review-answers.html` into the new site.
2. Add `<script src="review.js" defer></script>` before `</body>`.
3. Edit the `ITEMS` list at the top of `review.js`. One entry per thing the client must look at:
   `{ id, t: 'design' | 'missing', sel: 'CSS selector to highlight (or null)', label: 'tag shown on the page', title, note, prep?: () => open a tab/section first, href?: 'link to open' }`
4. In `review.js` change the welcome text, colors (`COLORS`) and the share text if needed.
5. Block search engines for the answers page (`X-Robots-Tag: noindex` header, as in `vercel.json`).
6. Send the client `/?review`. When they send the link back, open it.

## Limits to know
- Answers are not stored on a server; if the client never sends the link, you see nothing.
- Anyone with an answers link can read it. Fine for design feedback, don't collect private data.
- Tested in Chromium (phone viewport). Check the share sheet on a real phone.

## When approved
Delete `review.js`, its `<script>` tag and `review-answers.html`.
