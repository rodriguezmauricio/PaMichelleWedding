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
    .rv-panel li { --c: #999; background: #fff; border-left: 3px solid var(--c); border-radius: 6px; }
    .rv-go { background: #C9A55A !important; color: #1E2A3A !important; }
    .rv-on [data-rv].rv-cur { outline-style: solid; outline-width: 4px; }
    .rv-stepping .rv-ui { display: none; }
    .rv-stepping body { padding-bottom: 380px; }
    .rv-step, .rv-welcome > div { font-family: Jost, system-ui, sans-serif; color: #1E2A3A; background: #FAF6EF; box-shadow: 0 18px 50px rgba(20,32,52,.4); }
    .rv-step { position: fixed; z-index: 140; left: 50%; bottom: calc(10px + env(safe-area-inset-bottom)); transform: translateX(-50%); width: min(540px, calc(100vw - 20px)); max-height: 78vh; overflow: auto; border-radius: 16px; padding: 16px 16px 14px; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; }
    .rv-step[hidden], .rv-welcome[hidden] { display: none; }
    .rv-bar0 { height: 4px; border-radius: 4px; background: rgba(29,62,99,.12); overflow: hidden; }
    .rv-bar0 i { display: block; height: 100%; background: #2E7D4F; transition: width .25s; }
    .rv-sh { display: flex; align-items: center; gap: 8px; font: 600 11px Jost, system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #5E5850; }
    .rv-sh i { width: 10px; height: 10px; border-radius: 50%; }
    .rv-sh .rv-x { margin-left: auto; width: 36px; height: 36px; border: none; background: transparent; font-size: 24px; line-height: 1; cursor: pointer; color: #1E2A3A; }
    .rv-step h3 { margin: 0; font: 600 18px/1.25 Jost, system-ui, sans-serif; }
    .rv-step p { margin: 0; font: 400 14px/1.5 Jost, system-ui, sans-serif; color: #3d3a35; }
    .rv-step a { color: #1D3E63; font-weight: 600; }
    .rv-opts { display: flex; gap: 8px; }
    .rv-opts button { flex: 1; min-height: 48px; border-radius: 12px; border: 2px solid rgba(29,62,99,.25); background: #fff; color: #1E2A3A; font: 600 14px Jost, system-ui, sans-serif; cursor: pointer; padding: 6px 8px; }
    .rv-opts button[aria-pressed="true"][data-st="ok"] { background: #2E7D4F; border-color: #2E7D4F; color: #fff; }
    .rv-opts button[aria-pressed="true"][data-st="change"] { background: ${COLORS.design}; border-color: ${COLORS.design}; color: #fff; }
    .rv-step textarea { width: 100%; box-sizing: border-box; min-height: 60px; resize: vertical; border: 1px solid rgba(29,62,99,.25); border-radius: 10px; padding: 9px 11px; font: 400 15px/1.4 Jost, system-ui, sans-serif; color: #1E2A3A; background: #fff; }
    .rv-nav { display: flex; gap: 8px; }
    .rv-nav button, .rv-big { min-height: 48px; border-radius: 999px; font: 600 13px Jost, system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
    .rv-nav .rv-back { flex: 0 0 auto; padding: 0 20px; border: 1px solid rgba(29,62,99,.3); background: transparent; color: #1E2A3A; }
    .rv-nav .rv-next, .rv-big { flex: 1; border: none; background: #1E2A3A; color: #FAF6EF; padding: 0 16px; }
    .rv-step select { height: 48px; border-radius: 12px; border: 1px solid rgba(29,62,99,.3); padding: 0 12px; background: #fff; font: 500 15px Jost, system-ui, sans-serif; color: #1E2A3A; }
    .rv-sum { display: flex; flex-wrap: wrap; gap: 6px 14px; font: 600 14px Jost, system-ui, sans-serif; }
    .rv-miss { display: flex; flex-wrap: wrap; gap: 6px; }
    .rv-miss button { border: 1px solid rgba(29,62,99,.3); background: #fff; border-radius: 999px; padding: 6px 12px; font: 500 12px Jost, system-ui, sans-serif; cursor: pointer; }
    .rv-welcome { position: fixed; inset: 0; z-index: 150; background: rgba(20,32,52,.55); display: flex; align-items: center; justify-content: center; padding: 16px; }
    .rv-welcome > div { width: min(440px, 100%); border-radius: 18px; padding: 26px 22px; display: flex; flex-direction: column; gap: 12px; text-align: center; }
    .rv-welcome h2 { margin: 0; font: 400 28px/1.15 'Playfair Display', Georgia, serif; }
    .rv-welcome p { margin: 0; font: 400 15px/1.55 Jost, system-ui, sans-serif; }
    .rv-welcome .rv-later { border: none; background: none; text-decoration: underline; cursor: pointer; font: 500 13px Jost, system-ui, sans-serif; color: #5E5850; padding: 8px; }
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

  const N = ITEMS.length;
  // Saved answers (this browser): { [id]: { st: 'ok'|'change', c: 'comment' } }
  const KEY = 'mp-review-answers', WHO = 'mp-review-who', WELCOMED = 'mp-review-welcomed';
  let ans = {}, who = '', welcomed = false;
  try { ans = JSON.parse(localStorage.getItem(KEY) || '{}'); who = localStorage.getItem(WHO) || ''; welcomed = !!localStorage.getItem(WELCOMED); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ans)); localStorage.setItem(WHO, who); } catch (e) {} };
  const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const st = id => (ans[id] || {}).st || '';
  const done = () => ITEMS.filter(i => st(i.id)).length;

  // ---- Bar + list panel ----
  const ui = document.createElement('div');
  ui.className = 'rv-ui';
  ui.innerHTML = `
    <div class="rv-panel" hidden></div>
    <div class="rv-bar">
      <button type="button" class="rv-toggle" aria-pressed="${on}" title="Show or hide highlights">
        <span class="rv-dots"><i style="background:${COLORS.design}"></i><i style="background:${COLORS.missing}"></i></span>Review<span class="rv-switch"></span>
      </button>
      <button type="button" class="rv-go"></button>
      <button type="button" class="rv-list" aria-expanded="false">List</button>
    </div>`;
  document.body.appendChild(ui);
  const panel = $('.rv-panel', ui), toggle = $('.rv-toggle', ui), listBtn = $('.rv-list', ui), goBtn = $('.rv-go', ui);

  const mark = id => st(id) === 'ok' ? '✓ ' : st(id) === 'change' ? '✎ ' : '';
  function renderPanel() {
    const li = (i, n) => `<li style="--c:${COLORS[i.t]}"><button type="button" data-n="${n}"><b>${mark(i.id)}${i.title}</b><span>${i.note}</span></button></li>`;
    const part = t => ITEMS.map((i, n) => i.t === t ? li(i, n) : '').join('');
    panel.innerHTML = `
      <h4><i style="background:${COLORS.design}"></i>Design changes</h4><ul>${part('design')}</ul>
      <h4><i style="background:${COLORS.missing}"></i>Questions for you</h4><ul>${part('missing')}</ul>
      <button type="button" class="rv-exit">Exit review mode</button>`;
    goBtn.textContent = done() === 0 ? 'Start' : done() >= N ? 'Finish' : `Answer ${done()}/${N}`;
  }
  renderPanel();

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
  panel.addEventListener('click', e => {
    if (e.target.closest('.rv-exit')) {
      try { sessionStorage.removeItem('mp-review'); sessionStorage.removeItem('mp-review-off'); } catch (err) {}
      location.href = location.pathname + location.hash;
      return;
    }
    const b = e.target.closest('[data-n]');
    if (b) openStep(+b.dataset.n);
  });
  goBtn.addEventListener('click', () => openStep(done() >= N ? N : ITEMS.findIndex(i => !st(i.id))));

  // ---- Guided steps ----
  const stepEl = document.createElement('div');
  stepEl.className = 'rv-step'; stepEl.hidden = true;
  stepEl.setAttribute('role', 'dialog'); stepEl.setAttribute('aria-label', 'Review');
  document.body.appendChild(stepEl);
  let cur = 0;

  function focusItem(item) {
    document.querySelectorAll('.rv-cur').forEach(el => el.classList.remove('rv-cur'));
    if (!on) toggle.click();
    if (item.prep) item.prep();
    if (!item.sel) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setTimeout(() => {
      apply();
      const el = [...document.querySelectorAll(item.sel)].find(e => e.offsetParent || getComputedStyle(e).position === 'fixed');
      if (!el) return;
      el.classList.add('rv-cur');
      if (getComputedStyle(el).position !== 'fixed') {
        window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 110), behavior: 'smooth' });
      }
      el.classList.remove('rv-flash'); void el.offsetWidth; el.classList.add('rv-flash');
    }, 60);
  }

  function renderStep() {
    if (cur >= N) { renderFinish(); return; }
    const i = ITEMS[cur], a = ans[i.id] || {}, q = i.t === 'missing';
    stepEl.innerHTML = `
      <div class="rv-bar0"><i style="width:${Math.round(done() / N * 100)}%"></i></div>
      <div class="rv-sh"><i style="background:${COLORS[i.t]}"></i><span>${q ? 'Question' : 'Change'} ${cur + 1} of ${N}</span><button type="button" class="rv-x" data-close aria-label="Close">×</button></div>
      <h3>${i.title}</h3>
      <p>${i.note}</p>
      ${i.href ? `<p><a href="${i.href}" target="_blank" rel="noopener">Open this page ↗</a></p>` : ''}
      <div class="rv-opts">
        <button type="button" data-st="ok" aria-pressed="${a.st === 'ok'}">${q ? '✓ Yes, that’s fine' : '✓ Looks good'}</button>
        <button type="button" data-st="change" aria-pressed="${a.st === 'change'}">${q ? '✎ No / I’ll explain' : '✎ I’d change it'}</button>
      </div>
      <textarea data-c placeholder="${q ? 'Type your answer here…' : 'Anything to add? (optional)'}">${esc(a.c)}</textarea>
      <div class="rv-nav">
        ${cur > 0 ? '<button type="button" class="rv-back" data-nav="-1">Back</button>' : ''}
        <button type="button" class="rv-next" data-nav="1">${cur === N - 1 ? 'Finish' : 'Next'}</button>
      </div>`;
  }

  function renderFinish() {
    document.querySelectorAll('.rv-cur').forEach(el => el.classList.remove('rv-cur'));
    const ok = ITEMS.filter(i => st(i.id) === 'ok').length, ch = ITEMS.filter(i => st(i.id) === 'change').length;
    const open = ITEMS.map((i, n) => ({ i, n })).filter(x => !st(x.i.id));
    stepEl.innerHTML = `
      <div class="rv-bar0"><i style="width:${Math.round(done() / N * 100)}%"></i></div>
      <div class="rv-sh"><span>All done?</span><button type="button" class="rv-x" data-close aria-label="Close">×</button></div>
      <div class="rv-sum"><span style="color:#2E7D4F">✓ ${ok} good</span><span style="color:${COLORS.design}">✎ ${ch} to change</span><span>${open.length} not answered</span></div>
      ${open.length ? `<p>Not answered yet (tap to go there):</p><div class="rv-miss">${open.map(x => `<button type="button" data-jump="${x.n}">${x.i.title}</button>`).join('')}</div>` : ''}
      <select class="rv-who" aria-label="Who is answering?">
        <option value="">Who is answering?</option>
        <option${who === 'Michelle' ? ' selected' : ''}>Michelle</option><option${who === 'Pa' ? ' selected' : ''}>Pa</option>
      </select>
      <button type="button" class="rv-big" data-share>Send my answers to Mauricio</button>
      <p class="rv-msg" role="status">This opens your share menu (WhatsApp, email…). Send it to Mauricio and you’re done.</p>
      <div class="rv-nav"><button type="button" class="rv-back" data-nav="-1">Back</button></div>`;
  }

  function openStep(n) {
    cur = Math.max(0, Math.min(N, n));
    panel.hidden = true; listBtn.setAttribute('aria-expanded', 'false');
    stepEl.hidden = false; root.classList.add('rv-stepping');
    renderStep();
    if (cur < N) focusItem(ITEMS[cur]);
  }
  function closeStep() {
    stepEl.hidden = true; root.classList.remove('rv-stepping');
    document.querySelectorAll('.rv-cur').forEach(el => el.classList.remove('rv-cur'));
    renderPanel();
  }

  // No backend: answers travel inside a link that opens /review-answers.
  const b64 = str => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = () => ITEMS.filter(i => ans[i.id] && (ans[i.id].st || (ans[i.id].c || '').trim())).map(i => ({ id: i.id, type: i.t, title: i.title, status: ans[i.id].st || '', comment: (ans[i.id].c || '').trim() }));
  async function share() {
    const msg = $('.rv-msg', stepEl), items = payload();
    if (!who) { msg.textContent = 'Please choose who is answering (Michelle or Pa) first.'; return; }
    if (!items.length) { msg.textContent = 'You haven’t answered anything yet.'; return; }
    const url = location.origin + '/review-answers#d=' + b64(JSON.stringify({ from: who, at: new Date().toISOString(), answers: items }));
    try {
      if (navigator.share) { await navigator.share({ title: 'Our wedding website answers', text: 'Our answers for the wedding website:', url }); msg.textContent = 'Thank you! Sent.'; }
      else { await navigator.clipboard.writeText(url); msg.textContent = 'Link copied. Paste it in a message to Mauricio.'; }
    } catch (err) { if (err && err.name !== 'AbortError') msg.textContent = 'Could not share here. Try on your phone.'; }
  }

  stepEl.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.close !== undefined) return closeStep();
    if (t.dataset.st) {
      const id = ITEMS[cur].id, a = ans[id] = ans[id] || {};
      a.st = a.st === t.dataset.st ? '' : t.dataset.st; save();
      stepEl.querySelectorAll('.rv-opts button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.st === a.st)));
      stepEl.querySelector('.rv-bar0 i').style.width = Math.round(done() / N * 100) + '%';
      return;
    }
    if (t.dataset.nav) return openStep(cur + Number(t.dataset.nav));
    if (t.dataset.jump) return openStep(+t.dataset.jump);
    if (t.dataset.share !== undefined) return share();
  });
  stepEl.addEventListener('input', e => {
    if (e.target.matches('[data-c]')) { const id = ITEMS[cur].id; (ans[id] = ans[id] || {}).c = e.target.value; save(); }
  });
  stepEl.addEventListener('change', e => { if (e.target.matches('.rv-who')) { who = e.target.value; save(); } });

  // ---- First-visit welcome ----
  if (!welcomed && done() === 0) {
    const w = document.createElement('div');
    w.className = 'rv-welcome';
    const q = ITEMS.filter(i => i.t === 'missing').length;
    w.innerHTML = `<div>
      <h2>Hi Michelle &amp; Pa 👋</h2>
      <p>Your website is ready to review. We need your OK on <b>${N - q} changes</b> and your answer to <b>${q} questions</b>. It takes about 3 minutes.</p>
      <p>Each item is highlighted on the page. Just tap an answer and go to the next one.</p>
      <button type="button" class="rv-big" data-start>Start</button>
      <button type="button" class="rv-later" data-later>I’ll look around first</button></div>`;
    document.body.appendChild(w);
    w.addEventListener('click', e => {
      const s = e.target.closest('[data-start]'), l = e.target.closest('[data-later]');
      if (!s && !l) return;
      try { localStorage.setItem(WELCOMED, '1'); } catch (err) {}
      w.remove();
      if (s) openStep(0);
    });
  }
})();
