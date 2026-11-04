/**
 * Michelle & Pa — RSVP backend (Google Apps Script bound to a Google Sheet).
 *
 * doPost: the website sends each reply here. One row per PERSON is written to
 *         the "RSVPs" tab (name, which events they join, dietary). A repeat reply
 *         from the same party replaces that party's rows. Optionally emails NOTIFY_EMAIL.
 * doGet:  the /guests page reads all rows, only with the correct ADMIN_KEY.
 *
 * Script properties (Project Settings → Script properties):
 *   ADMIN_KEY     password for the /guests page (required to read replies)
 *   NOTIFY_EMAIL  comma-separated addresses to email on every reply (optional)
 *
 * Setup steps: see apps-script/SETUP.md. After editing this file, deploy a
 * new version (Deploy → Manage deployments → pencil → New version).
 */

const SHEET_NAME = 'RSVPs';
const EVENTS = ['Welcome Drinks', 'Ceremony & Reception', 'The Cure'];
const HEADERS = ['Received', 'Party', 'Name', 'Attending'].concat(EVENTS, ['Dietary', 'Email', 'Note']);

function writeHeader_(sh) {
  sh.appendRow(HEADERS);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); writeHeader_(sh); return sh; }
  const head = sh.getLastRow() ? sh.getRange(1, 1, 1, HEADERS.length).getValues()[0] : [];
  if (head.join('|') !== HEADERS.join('|')) {
    if (sh.getLastRow() > 1) throw new Error('The "' + SHEET_NAME + '" tab has old columns. Rename that tab (e.g. "RSVPs old"); a fresh one is created automatically.');
    sh.clear(); writeHeader_(sh);
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
function name_(value) { return clean_(value, 200).replace(/\s+/g, ' '); }

// Key used to recognise the same party replying again (e.g. after "Edit reply").
function nameKey_(value) {
  return String(value == null ? '' : value).replace(/^'/, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Remove this party's earlier rows (if any) and append the new ones. Returns true if rows were replaced.
function upsert_(sh, partyName, rows) {
  const key = nameKey_(partyName);
  const last = sh.getLastRow();
  let replaced = false;
  if (last > 1) {
    const parties = sh.getRange(2, 2, last - 1, 1).getValues();
    for (let i = parties.length - 1; i >= 0; i--) {
      if (nameKey_(parties[i][0]) === key) { sh.deleteRow(i + 2); replaced = true; }
    }
  }
  rows.forEach(r => sh.appendRow(r));
  return replaced;
}

function splitList_(value) {
  return String(value == null ? '' : value).split(',').map(s => s.trim()).filter(Boolean);
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json_({ ok: true }); // honeypot field filled → bot, drop silently

    const partyName = name_(d.name);
    const attending = d.attending === 'Yes' ? 'Yes' : d.attending === 'No' ? 'No' : '';
    if (!partyName || !attending) return json_({ ok: false, error: 'missing name or attendance' });
    const email = clean_(d.email, 200), note = clean_(d.note, 2000);

    let people = [];
    if (attending === 'Yes') {
      const list = Array.isArray(d.party) ? d.party.slice(0, 12) : [];
      people = list.map(p => ({ name: name_(p && p.name), events: splitList_(p && p.events), diet: clean_(p && p.diet, 300) })).filter(p => p.name);
      // Older website version: one summary entry.
      if (!people.length) people = [{ name: partyName, events: splitList_(d.events), diet: clean_(d.diet, 300) }];
    } else {
      people = [{ name: partyName, events: [], diet: '' }];
    }

    const now = new Date();
    const rows = people.map(p => [now, partyName, p.name, attending]
      .concat(EVENTS.map(ev => attending === 'Yes' && p.events.indexOf(ev) >= 0 ? 'Yes' : ''))
      .concat([p.diet, email, note]));

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let replaced = false;
    try { replaced = upsert_(sheet_(), partyName, rows); } finally { lock.releaseLock(); }

    const to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    if (to) {
      const lines = ['Reply from: ' + partyName, 'Attending: ' + attending];
      if (attending === 'Yes') {
        lines.push('', 'Party (' + people.length + '):');
        people.forEach(p => {
          const evs = EVENTS.filter(ev => p.events.indexOf(ev) >= 0);
          lines.push('- ' + p.name + ' — ' + (evs.length ? evs.join(', ') : 'no events') + (p.diet ? ' — Dietary: ' + p.diet : ''));
        });
      }
      if (email) lines.push('', 'Email: ' + email);
      if (note) lines.push('Note: ' + note);
      if (replaced) lines.push('', 'This replaces an earlier reply from the same name.');
      const mail = {
        to: to,
        subject: (replaced ? 'RSVP updated — ' : 'RSVP — ') + partyName + (attending === 'Yes' ? ' (' + people.length + ') is coming' : ' can’t make it'),
        body: lines.join('\n') + '\n\nAll replies: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      };
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) mail.replyTo = email;
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
    party: String(r[1]), name: String(r[2]), attending: String(r[3]),
    events: EVENTS.filter((ev, i) => String(r[4 + i]) === 'Yes'),
    diet: String(r[7]), email: String(r[8]), note: String(r[9]),
  }));
  return json_({ ok: true, rows: rows });
}
