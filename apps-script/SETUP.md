# RSVP backend setup (Google Sheet + Apps Script)

Replies are stored as rows in a Google Sheet. No database, no paid service.
Takes about 10 minutes, once.

A click-through version of these steps, with the script ready to copy: [docs/setup-guide.html](../docs/setup-guide.html).

## 1. Create the sheet

1. Open a private/incognito window and sign in **only** as the couple's account (**michelleandpa2027@gmail.com**, which will own the replies). With several Google accounts signed in, the script can end up in the wrong one.
2. Open <https://sheets.new> and name it `Michelle & Pa — RSVPs`.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete everything in `Code.gs` and paste the contents of [`Code.gs`](Code.gs) from this folder.
3. Click **Save** (disk icon).
4. Click **Untitled project** (top left) and rename it `RSVP backend`. That name is what the permission screen shows later.

## 3. Set the password and notification email

1. In Apps Script, left sidebar: **Project Settings** (gear icon).
2. Scroll to **Script properties → Add script property**, and add:

| Property | Value |
|---|---|
| `ADMIN_KEY` | A password for the `/guests` page. Pick something long, e.g. `nerja-bougainvillea-0905`. |
| `NOTIFY_EMAIL` | Who gets an email on every reply: `michelleandpa2027@gmail.com` (add more addresses separated by commas). Leave out to disable emails. |

3. Click **Save script properties**.

## 4. Deploy as a web app

1. Top right: **Deploy → New deployment**.
2. The dialog opens on **API Executable**. That is the wrong type: click the **gear icon** next to "Select type" and choose **Web app**.
3. Set:
   - Description: `RSVP v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** → **Authorize access** → choose the account → "Google hasn't verified this app" → **Advanced → Go to RSVP backend (unsafe)** → tick **Select all** (Sheets + send email) → **Continue**.
   (This warning is normal for your own scripts. Both permissions are needed: one writes the sheet, the other sends the notification email.)
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
2. A row should appear in the **RSVPs** tab of the sheet (columns: Received, Name, Attending, Guests, Events, Dietary, Email, Note), and an email should arrive.
3. Open `https://www.michelleandpa.com/guests`, enter the `ADMIN_KEY` password, and check that the reply shows.
4. Delete the test row from the sheet.

A guest who replies again with the same name (for example after "Edit reply") replaces their earlier row; the email subject then starts with "RSVP updated".

## Changing the script later

Editing `Code.gs` does not change the live version. After editing:
**Deploy → Manage deployments → pencil icon → Version: New version → Deploy.**
The URL stays the same.
