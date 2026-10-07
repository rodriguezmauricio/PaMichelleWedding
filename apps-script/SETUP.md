# RSVP backend setup (Google Sheet + Apps Script)

Replies are stored as rows in a Google Sheet. No database, no paid service.
Takes about 10 minutes, once.

## 1. Create the sheet

1. Signed in to the Google account that should own the replies (ideally Michelle's or Pa's), open <https://sheets.new>.
2. Name it `Michelle & Pa — RSVPs`.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete everything in `Code.gs` and paste the contents of [`Code.gs`](Code.gs) from this folder.
3. Click **Save** (disk icon).

## 3. Set the password and notification email

1. In Apps Script, left sidebar: **Project Settings** (gear icon).
2. Scroll to **Script properties → Add script property**, and add:

| Property | Value |
|---|---|
| `ADMIN_KEY` | A password for the `/guests` page. Pick something long, e.g. `nerja-bougainvillea-0905`. |
| `NOTIFY_EMAIL` | Who gets an email on every reply, e.g. `michelle@example.com,pa@example.com`. Leave out to disable emails. |

3. Click **Save script properties**.

## 4. Deploy as a web app

1. Top right: **Deploy → New deployment**.
2. Gear icon next to "Select type" → **Web app**.
3. Set:
   - Description: `RSVP v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** → **Authorize access** → choose the account → "Google hasn't verified this app" → **Advanced → Go to (project name) (unsafe)** → **Allow**.
   (This warning is normal for your own scripts. It only grants access to this sheet and to send email as you.)
5. Copy the **Web app URL** (ends in `/exec`).

## 5. Connect the website

Paste the URL into [`../config.js`](../config.js):

```js
window.MP_CONFIG = {
  rsvpEndpoint: 'https://script.google.com/macros/s/XXXXXXXX/exec',
};
```

Commit and push. Vercel redeploys automatically.

## 6. Test

1. Open the site, send a test RSVP.
2. A row should appear in the **RSVPs** tab of the sheet, and an email should arrive.
3. Open `https://<your-domain>/guests`, enter the `ADMIN_KEY` password, and check that the reply shows.
4. Delete the test row from the sheet.

## Changing the script later

Editing `Code.gs` does not change the live version. After editing:
**Deploy → Manage deployments → pencil icon → Version: New version → Deploy.**
The URL stays the same.
