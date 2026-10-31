/*
 * Review mode — client presentation overlay. Guests never see it.
 * Turn on with ?review in the URL (e.g. https://site.com/?review). Stays on for the browser tab.
 * Orange = design changes made while building from Claude Design v3.
 * Red    = missing content or things that need confirmation.
 * Edit ITEMS below as things get resolved; delete this file + its <script> tag before the final launch if you like.
 */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  let active = false;
  try {
    if (params.has('review')) sessionStorage.setItem('mp-review', '1');
    active = sessionStorage.getItem('mp-review') === '1';
  } catch (e) { active = params.has('review'); }
  if (!active) return;
  window.MP_REVIEW = true;

  const $ = (s, r = document) => r.querySelector(s);
  const click = sel => () => { const el = $(sel); if (el) el.click(); };
  const sunday = click('[data-day="sun"]'), taxi = click('[data-tab="taxi"]'), bus = click('[data-tab="bus"]');
  const backendMissing = !((window.MP_CONFIG || {}).rsvpEndpoint);

  // Only what the couple needs to look at. (Technical checks for the developer live in docs/CHECKLIST.md.)
  const ITEMS = [
    // ---- Orange: design changes ----
    { id: 'signature', t: 'design', sel: '.signature', label: 'Changed · fits one line on phones', title: 'Welcome signature',
      note: 'In v3 “Michelle & Pa” wrapped onto two lines on phones. It now scales down slightly and stays on one line.' },
    { id: 'photo', t: 'design', sel: '.welcome-photo', label: 'Changed · photo re-cropped', title: 'Couple photo',
      note: 'The original was a phone screenshot with black bars and the home-bar line. Cropped to the photo only, at full resolution.' },
    { id: 'calendar', t: 'design', sel: '[data-ev] .event-btns', label: 'Changed · real calendar files', title: '“Calendar +” buttons',
      note: 'Now open a real calendar file, so iPhones show “Add to Calendar” directly.' },
    { id: 'rsvp-checks', t: 'design', sel: '.rsvp-actions', label: 'Added · checks, sending & error states', title: 'RSVP checks',
      note: 'Guests can’t continue without a name, a yes/no, or at least one event. Email format is checked. Shows “Sending…”, and an honest error if a reply fails.' },
    { id: 'reception', t: 'design', sel: '[data-ev="reception"] .venue', prep: sunday, label: 'Updated · address, 2:30am, taxis', title: 'Reception details',
      note: 'Address Vereda de Vélez, SN, 29712, Málaga. Ends 2:30am, buses leave then; taxis can be organised at the hotel (about €50–€60).' },
    { id: 'party', t: 'design', sel: null, title: 'RSVP: “How many in your party?”',
      note: 'New + / − counter on the attending step. The guest list adds these up into a headcount (total guests, and guests per event).' },
    { id: 'rsvp-card', t: 'design', sel: '#rsvpForm', label: 'Changed · stands out more', title: 'RSVP card',
      note: 'The reply card now has a light fill and a stronger gold border so it does not disappear into the navy section.' },
    { id: 'font', t: 'design', sel: '.hero-name', label: 'Changed · Playfair Display', title: 'Headings font',
      note: 'Headings and italic text now use Playfair Display instead of Bodoni Moda, across the whole site and the guest list.' },
    { id: 'guests-page', t: 'design', sel: null, href: '/guests', title: 'New: guest list page (/guests)',
      note: 'Password-protected page showing every reply, totals per event, dietary notes, and a CSV download.' },

    // ---- Red: needs the couple's answer ----
    { id: 'hero', t: 'missing', sel: '.hero-art', label: 'Confirm · is this artwork final?', title: 'Hero illustration',
      note: 'Is this illustration final, or should it be replaced?' },
    { id: 'phones', t: 'missing', sel: '.footer-contact', label: 'Confirm · Irish numbers (+353)?', title: 'Footer contact',
      note: 'Matt’s details are removed. The footer shows Michelle’s and Pa’s numbers as +353 (Irish) and michelleandpa2027@gmail.com. Are the numbers Irish?' },
    { id: 'manolo', t: 'missing', sel: '.driver:not(.driver-solid)', prep: taxi, label: 'Confirm · is Manolo correct?', title: 'Driver: Manolo',
      note: 'Manolo / Nexotransfer has no phone number or link, so guests can’t book him. Send his details, or remove him?' },
    { id: 'matt-email', t: 'missing', sel: '.note-links', label: 'Confirm · remove Matt’s email here too?', title: 'Stay section still lists Matt',
      note: 'His email still appears here (“Need help choosing?”). Remove it, or replace it with the couple’s email?' },
  ].filter(i => !i.skip);

  const COLORS = { design: '#EE7D1A', missing: '#E0312B' };

  const css = document.createElement('style');
  css.textContent = `
    .rv-on [data-rv] { outline: 2px dashed var(--rv-c); outline-offset: 4px; position: relative; }
    .rv-on .dock[data-rv] { position: fixed; }
    .rv-on [data-rv="design"] { --rv-c: ${COLORS.design}; }
    .rv-on [data-rv="missing"] { --rv-c: ${COLORS.missing}; }
    .rv-on [data-rv]::before {
      content: attr(data-rv-label); position: absolute; z-index: 6; top: -15px; left: 8px; max-width: min(340px, calc(100% - 16px));
      background: var(--rv-c); color: #fff; font: 600 10px/1.35 Jost, system-ui, sans-serif; letter-spacing: .03em; font-style: normal;
      text-transform: none; text-align: left; white-space: normal; padding: 4px 8px; border-radius: 4px; pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,.18);
    }
    .rv-on [data-rv-pos="in"]::before { top: auto; bottom: 10px; }
    .rv-on .dock[data-rv]::before { top: -24px; }
    .rv-on [data-rv].rv-flash { animation: rv-flash 1.4s ease 1; }
    @keyframes rv-flash { 0%, 100% { outline-offset: 4px; } 30% { outline-offset: 12px; outline-width: 4px; } }

    .rv-ui { position: fixed; z-index: 130; right: 12px; top: calc(68px + env(safe-area-inset-top)); display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 8px; font-family: Jost, system-ui, sans-serif; }
    @media (min-width: 900px) { .rv-ui { right: auto; top: auto; left: 20px; bottom: 20px; flex-direction: column; align-items: flex-start; } }
    .rv-bar { display: flex; align-items: center; gap: 4px; padding: 4px; background: #1E2A3A; color: #FAF6EF; border-radius: 999px; box-shadow: 0 10px 30px rgba(20,32,52,.35); }
    .rv-bar button { height: 38px; border: none; background: transparent; color: inherit; font: 600 11px Jost, system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; padding: 0 12px; border-radius: 999px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .rv-bar button:hover { background: rgba(250,246,239,.12); }
    .rv-dots { display: flex; gap: 3px; }
    .rv-dots i { width: 9px; height: 9px; border-radius: 50%; }
    .rv-switch { width: 30px; height: 18px; border-radius: 999px; background: rgba(250,246,239,.25); position: relative; transition: background .2s; }
    .rv-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #FAF6EF; transition: left .2s; }
    .rv-bar [aria-pressed="true"] .rv-switch { background: ${COLORS.design}; }
    .rv-bar [aria-pressed="true"] .rv-switch::after { left: 14px; }
    .rv-panel { width: min(360px, calc(100vw - 24px)); max-height: min(70vh, 640px); overflow: auto; background: #FAF6EF; color: #1E2A3A; border-radius: 14px; box-shadow: 0 18px 50px rgba(20,32,52,.35); padding: 16px; display: flex; flex-direction: column; gap: 14px; }
    .rv-panel h4 { margin: 0; display: flex; align-items: center; gap: 8px; font: 600 10px Jost, system-ui, sans-serif; letter-spacing: .2em; text-transform: uppercase; }
    .rv-panel h4 i { width: 10px; height: 10px; border-radius: 50%; }
    .rv-panel ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .rv-panel li button, .rv-panel li a { width: 100%; display: flex; flex-direction: column; gap: 3px; text-align: left; background: #fff; border: 1px solid rgba(29,62,99,.12); border-left: 3px solid var(--c); border-radius: 6px; padding: 9px 11px; cursor: pointer; color: inherit; text-decoration: none; font: 400 13px/1.45 Jost, system-ui, sans-serif; }
    .rv-panel li button:hover, .rv-panel li a:hover { border-color: var(--c); }
    .rv-panel li b { font-weight: 600; font-size: 13px; }
    .rv-panel li span { color: #5E5850; font-size: 12.5px; }
    .rv-panel .rv-exit { align-self: flex-start; background: none; border: none; padding: 4px 0; color: #5E5850; font: 500 11px Jost, system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; text-decoration: underline; cursor: pointer; }
    .rv-panel li { --c: #999; background: #fff; border: 1px solid rgba(29,62,99,.12); border-left: 3px solid var(--c); border-radius: 6px; }
    .rv-panel li > button, .rv-panel li > a { border: none; border-radius: 6px 6px 0 0; background: transparent; }
    .rv-ans { display: flex; flex-direction: column; gap: 6px; padding: 0 11px 10px; }
    .rv-opts { display: flex; gap: 6px; }
    .rv-opts button { flex: 1; height: 32px; border-radius: 999px; border: 1px solid rgba(29,62,99,.3); background: #fff; color: #1E2A3A; font: 600 11px Jost, system-ui, sans-serif; cursor: pointer; }
    .rv-opts button[aria-pressed="true"][data-st="ok"] { background: #2E7D4F; border-color: #2E7D4F; color: #fff; }
    .rv-opts button[aria-pressed="true"][data-st="change"] { background: ${COLORS.design}; border-color: ${COLORS.design}; color: #fff; }
    .rv-ans textarea { width: 100%; box-sizing: border-box; min-height: 40px; resize: vertical; border: 1px solid rgba(29,62,99,.2); border-radius: 6px; padding: 7px 9px; font: 400 13px/1.4 Jost, system-ui, sans-serif; color: #1E2A3A; background: #FAF6EF; }
    .rv-send { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(29,62,99,.15); padding-top: 12px; }
    .rv-send select, .rv-send button { height: 38px; border-radius: 999px; font: 600 11px Jost, system-ui, sans-serif; letter-spacing: .1em; text-transform: uppercase; }
    .rv-send select { border: 1px solid rgba(29,62,99,.3); padding: 0 12px; background: #fff; color: #1E2A3A; }
    .rv-send .rv-copy { border: none; background: #1E2A3A; color: #FAF6EF; cursor: pointer; }
    .rv-msg { margin: 0; font: 400 12.5px/1.4 Jost, system-ui, sans-serif; color: #5E5850; }
  `;
  document.head.appendChild(css);

  // Tag matching elements; re-run whenever the page re-renders a section.
  function apply() {
    ITEMS.forEach(i => {
      if (!i.sel) return;
      document.querySelectorAll(i.sel).forEach(el => {
        el.setAttribute('data-rv', i.t);
        el.setAttribute('data-rv-label', i.label);
        if (i.pos) el.setAttribute('data-rv-pos', i.pos);
      });
    });
  }
  let queued = false;
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; apply(); }); } })
    .observe(document.body, { childList: true, subtree: true });
  apply();

  const root = document.documentElement;
  let on = true;
  try { on = sessionStorage.getItem('mp-review-off') !== '1'; } catch (e) {}
  root.classList.toggle('rv-on', on);

  const group = t => ITEMS.map((i, n) => ({ ...i, n })).filter(i => i.t === t);
  // Saved answers (this browser): { [id]: { st: 'ok'|'change', c: 'comment' } }
  const KEY = 'mp-review-answers', WHO = 'mp-review-who';
  let ans = {}, who = '';
  try { ans = JSON.parse(localStorage.getItem(KEY) || '{}'); who = localStorage.getItem(WHO) || ''; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ans)); localStorage.setItem(WHO, who); } catch (e) {} };
  const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const itemHTML = i => {
    const inner = `<b>${i.title}</b><span>${i.note}</span>`;
    const a = ans[i.id] || {};
    return `<li style="--c:${COLORS[i.t]}" data-id="${i.id}">${i.href ? `<a href="${i.href}" target="_blank" rel="noopener">${inner}</a>` : `<button type="button" data-rv-go="${i.n}">${inner}</button>`}
      <div class="rv-ans">
        <div class="rv-opts">
          <button type="button" data-st="ok" aria-pressed="${a.st === 'ok'}">${i.t === 'missing' ? 'Yes, fine' : 'Looks good'}</button>
          <button type="button" data-st="change" aria-pressed="${a.st === 'change'}">${i.t === 'missing' ? 'No / change' : 'Change this'}</button>
        </div>
        <textarea data-c placeholder="${i.t === 'missing' ? 'Your answer…' : 'Comment (optional)'}">${esc(a.c)}</textarea>
      </div></li>`;
  };
  const design = group('design'), missing = group('missing');

  const ui = document.createElement('div');
  ui.className = 'rv-ui';
  ui.innerHTML = `
    <div class="rv-panel" hidden>
      <h4><i style="background:${COLORS.design}"></i>Design changes · ${design.length}</h4>
      <ul>${design.map(itemHTML).join('')}</ul>
      <h4><i style="background:${COLORS.missing}"></i>Missing / to confirm · ${missing.length}</h4>
      <ul>${missing.map(itemHTML).join('')}</ul>
      <div class="rv-send">
        <select class="rv-who" aria-label="Who is answering?">
          <option value="">Who is answering?</option>
          <option>Michelle</option><option>Pa</option>
        </select>
        <p class="rv-msg" role="status"></p>
        <button type="button" class="rv-copy">Send answers as a link (WhatsApp, email…)</button>
      </div>
      <button type="button" class="rv-exit">Exit review mode</button>
    </div>
    <div class="rv-bar">
      <button type="button" class="rv-toggle" aria-pressed="${on}" title="Show or hide highlights">
        <span class="rv-dots"><i style="background:${COLORS.design}"></i><i style="background:${COLORS.missing}"></i></span>Review<span class="rv-switch"></span>
      </button>
      <button type="button" class="rv-list" aria-expanded="false">List</button>
    </div>`;
  document.body.appendChild(ui);

  const panel = $('.rv-panel', ui), toggle = $('.rv-toggle', ui), listBtn = $('.rv-list', ui);
  toggle.addEventListener('click', () => {
    on = !on;
    root.classList.toggle('rv-on', on);
    toggle.setAttribute('aria-pressed', String(on));
    try { sessionStorage.setItem('mp-review-off', on ? '0' : '1'); } catch (e) {}
  });
  listBtn.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    listBtn.setAttribute('aria-expanded', String(!panel.hidden));
  });
  const byId = id => ITEMS.find(i => i.id === id);
  const whoEl = $('.rv-who', ui), msg = $('.rv-msg', ui);
  whoEl.value = who;
  whoEl.addEventListener('change', () => { who = whoEl.value; save(); });
  const count = () => { const n = Object.values(ans).filter(a => a.st).length; msg.textContent = n ? `${n} of ${ITEMS.length} answered on this device.` : ''; };
  count();
  panel.addEventListener('input', e => {
    const li = e.target.closest('li[data-id]'); if (!li || !e.target.matches('[data-c]')) return;
    (ans[li.dataset.id] = ans[li.dataset.id] || {}).c = e.target.value; save();
  });
  const payload = () => ITEMS.filter(i => ans[i.id] && (ans[i.id].st || ans[i.id].c)).map(i => ({ id: i.id, type: i.t, title: i.title, status: ans[i.id].st || '', comment: (ans[i.id].c || '').trim() }));
  // No backend needed: answers travel inside a link that opens /review-answers.
  const b64 = str => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  $('.rv-copy', ui).addEventListener('click', async () => {
    const items = payload();
    if (!who) { msg.textContent = 'Please choose who is answering first.'; return; }
    if (!items.length) { msg.textContent = 'Nothing answered yet.'; return; }
    const url = location.origin + '/review-answers#d=' + b64(JSON.stringify({ from: who, at: new Date().toISOString(), answers: items }));
    try {
      if (navigator.share) { await navigator.share({ title: 'My review answers', text: 'My answers for the wedding website:', url }); msg.textContent = 'Shared.'; }
      else { await navigator.clipboard.writeText(url); msg.textContent = 'Link copied. Paste it in a message to Mauricio.'; }
    } catch (err) { if (err && err.name !== 'AbortError') msg.textContent = 'Could not share on this browser.'; }
  });
  panel.addEventListener('click', e => {
    const opt = e.target.closest('.rv-opts button');
    if (opt) {
      const li = opt.closest('li[data-id]'), a = ans[li.dataset.id] = ans[li.dataset.id] || {};
      a.st = a.st === opt.dataset.st ? '' : opt.dataset.st; save();
      li.querySelectorAll('.rv-opts button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.st === a.st)));
      count(); return;
    }
    if (e.target.closest('.rv-exit')) {
      try { sessionStorage.removeItem('mp-review'); sessionStorage.removeItem('mp-review-off'); } catch (err) {}
      location.href = location.pathname + location.hash;
      return;
    }
    const b = e.target.closest('[data-rv-go]');
    if (!b) return;
    const item = ITEMS[+b.dataset.rvGo];
    if (!on) toggle.click();
    if (item.prep) item.prep();
    if (!item.sel) return;
    requestAnimationFrame(() => {
      apply();
      const el = [...document.querySelectorAll(item.sel)].find(e => e.offsetParent || getComputedStyle(e).position === 'fixed');
      if (!el) return;
      if (getComputedStyle(el).position !== 'fixed') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('rv-flash'); void el.offsetWidth; el.classList.add('rv-flash');
      if (window.innerWidth < 900) { panel.hidden = true; listBtn.setAttribute('aria-expanded', 'false'); }
    });
  });
})();
