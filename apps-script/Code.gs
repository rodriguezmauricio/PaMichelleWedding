/**
 * Michelle & Pa — RSVP backend (Google Apps Script bound to a Google Sheet).
 *
 * doPost: the website sends each RSVP here; it is appended to the "RSVPs" tab
 *         and (optionally) emailed to NOTIFY_EMAIL.
 * doGet:  the /guests page reads all replies, only with the correct ADMIN_KEY.
 *
 * Script properties (Project Settings → Script properties):
 *   ADMIN_KEY     password for the /guests page (required to read replies)
 *   NOTIFY_EMAIL  comma-separated addresses to email on every reply (optional)
 *
 * Setup steps: see apps-script/SETUP.md
 */

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Received', 'Name', 'Attending', 'Guests', 'Events', 'Dietary', 'Email', 'Note'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Trim, cap length, and stop guest input being read as a spreadsheet formula.
function clean_(value, max) {
  const s = String(value == null ? '' : value).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json_({ ok: true }); // honeypot field filled → bot, drop silently

    const name = clean_(d.name, 200);
    const attending = d.attending === 'Yes' ? 'Yes' : d.attending === 'No' ? 'No' : '';
    if (!name || !attending) return json_({ ok: false, error: 'missing name or attendance' });

    const guests = attending === 'Yes' ? Math.min(12, Math.max(1, parseInt(d.guests, 10) || 1)) : 0;
    const row = [new Date(), name, attending, guests, clean_(d.events, 200), clean_(d.diet, 300), clean_(d.email, 200), clean_(d.note, 2000)];
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try { sheet_().appendRow(row); } finally { lock.releaseLock(); }

    const to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    if (to) {
      const lines = [
        'Name: ' + row[1],
        'Attending: ' + row[2],
        attending === 'Yes' ? 'Guests: ' + row[3] : '',
        attending === 'Yes' ? 'Events: ' + row[4] : '',
        row[5] ? 'Dietary: ' + row[5] : '',
        row[6] ? 'Email: ' + row[6] : '',
        row[7] ? 'Note: ' + row[7] : '',
      ].filter(Boolean);
      const mail = {
        to: to,
        subject: 'RSVP — ' + row[1] + (attending === 'Yes' ? ' (' + row[3] + ') is coming' : ' can’t make it'),
        body: lines.join('\n') + '\n\nAll replies: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      };
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[6])) mail.replyTo = row[6];
      MailApp.sendEmail(mail);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  const given = (e && e.parameter && e.parameter.key) || '';
  if (!key || given !== key) return json_({ ok: false, error: 'unauthorized' });

  const values = sheet_().getDataRange().getValues().slice(1);
  const rows = values.map(r => ({
    received: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
    name: String(r[1]), attending: String(r[2]), guests: Number(r[3]) || 0, events: String(r[4]),
    diet: String(r[5]), email: String(r[6]), note: String(r[7]),
  }));
  return json_({ ok: true, rows: rows });
}
