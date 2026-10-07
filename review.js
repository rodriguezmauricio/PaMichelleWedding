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

  const ITEMS = [
    // ---- Orange: design changes ----
    { t: 'design', sel: '.signature', label: 'Changed · fits one line on phones', title: 'Welcome signature',
      note: 'In v3 “Michelle & Pa” wrapped onto two lines on phones. It now scales down slightly and stays on one line.' },
    { t: 'design', sel: '.welcome-photo', label: 'Changed · photo re-cropped', title: 'Couple photo',
      note: 'The original was a phone screenshot with black bars and the home-bar line. Cropped to the photo only, at full resolution.' },
    { t: 'design', sel: '[data-ev] .event-btns', label: 'Changed · real calendar files', title: '“Calendar +” buttons',
      note: 'Now open a real calendar file, so iPhones show “Add to Calendar” directly.' },
    { t: 'design', sel: '.rsvp-actions', label: 'Added · checks, sending & error states', title: 'RSVP checks',
      note: 'Guests can’t continue without a name, a yes/no, or at least one event. Email format is checked. Shows “Sending…”, and an honest error if a reply fails (v3 always said “Gracias”).' },
    { t: 'design', sel: '#dock', label: 'Changed · fades in (mobile only)', title: 'Mobile quick-links bar',
      note: 'Fades and slides in instead of popping in. Only on phones, after scrolling past the top.' },
    { t: 'design', sel: '.split-head', label: 'Fixed · heading no longer slides over the list (phones)', title: 'Local Guide + Q&A headings',
      note: 'In v3 these headings stayed pinned while scrolling, which on phones slid them over the list. Now pinned on desktop only, where they sit beside the list.' },
    { t: 'design', sel: null, title: 'Fonts load from the site itself',
      note: 'Fonts were loaded from Google and failed on some phones (default fonts showed instead). They are now part of the site: faster, always load, and no EU privacy issue with Google Fonts.' },
    { t: 'design', sel: null, href: '/guests', title: 'New: guest list page (/guests)',
      note: 'Password-protected page showing every reply, totals per event, dietary notes, and a CSV download.' },

    // ---- Red: missing / needs confirmation ----
    { t: 'missing', sel: '#rsvpForm, #rsvpSent', skip: !backendMissing, label: 'Demo only · replies are NOT saved yet', title: 'RSVP backend',
      note: 'In review mode you can try the whole RSVP and see “Gracias”, but nothing is saved until the Google Sheet is connected (apps-script/SETUP.md).' },
    { t: 'missing', sel: '.hero-art', label: 'Confirm · is this artwork final?', title: 'Hero illustration',
      note: 'The file is named “ChatGPT Image…”. Final, or a placeholder?' },
    { t: 'missing', sel: '[data-ev="ceremony"] .bus-note', prep: sunday, label: 'Missing · return bus times', title: 'Wedding-day buses',
      note: 'Says “Return times to follow”. Need the return times from La Viñuela.' },
    { t: 'missing', sel: '[data-ev="reception"] .venue', prep: sunday, label: 'Missing · full venue address', title: 'Reception address',
      note: 'Only says “Lake Viñuela, approx. 40 min from Nerja”. Need the full address for maps and the calendar file.' },
    { t: 'missing', sel: '.driver:not(.driver-solid)', prep: taxi, label: 'Missing · phone or link for Manolo', title: 'Driver: Manolo',
      note: 'Paul has a website; Manolo / Nexotransfer has no phone number or link, so guests can’t book.' },
    { t: 'missing', sel: '.timetable', prep: bus, label: 'Confirm · re-check times nearer the date', title: 'ALSA bus timetable',
      note: 'Bus times change. Re-check against ALSA a month or two before May 2027.' },
    { t: 'missing', sel: '.map-arch', pos: 'in', label: 'Check · map loads on a real phone', title: 'Map of Nerja',
      note: 'The Google Maps embed couldn’t be verified in automated testing. Check it on a phone.' },
    { t: 'missing', sel: '.step-name', label: 'Confirm · one reply can cover several people', title: 'Headcount',
      note: '“Full name(s)” means one reply may be a couple or family, and there’s no “how many guests” field — so there’s no exact headcount. Add one?' },
    { t: 'missing', sel: '.footer-contact > div:first-child', label: 'Missing · phone or email for Michelle / Pa', title: 'Footer contact',
      note: 'Says “Contact Michelle or Pa” with no way to contact them.' },
    { t: 'missing', sel: '.qa:last-child', label: 'Missing · same contact details', title: 'Q&A: who to contact',
      note: 'Answer is just “Michelle or Pa.” Add a phone number or email.' },
    { t: 'missing', sel: null, title: 'Link preview image',
      note: 'WhatsApp / iMessage previews need the final domain set in the page settings. Done once the domain is connected.' },
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
    .rv-panel { width: min(360px, calc(100vw - 24px)); max-height: min(60vh, 520px); overflow: auto; background: #FAF6EF; color: #1E2A3A; border-radius: 14px; box-shadow: 0 18px 50px rgba(20,32,52,.35); padding: 16px; display: flex; flex-direction: column; gap: 14px; }
    .rv-panel h4 { margin: 0; display: flex; align-items: center; gap: 8px; font: 600 10px Jost, system-ui, sans-serif; letter-spacing: .2em; text-transform: uppercase; }
    .rv-panel h4 i { width: 10px; height: 10px; border-radius: 50%; }
    .rv-panel ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .rv-panel li button, .rv-panel li a { width: 100%; display: flex; flex-direction: column; gap: 3px; text-align: left; background: #fff; border: 1px solid rgba(29,62,99,.12); border-left: 3px solid var(--c); border-radius: 6px; padding: 9px 11px; cursor: pointer; color: inherit; text-decoration: none; font: 400 13px/1.45 Jost, system-ui, sans-serif; }
    .rv-panel li button:hover, .rv-panel li a:hover { border-color: var(--c); }
    .rv-panel li b { font-weight: 600; font-size: 13px; }
    .rv-panel li span { color: #5E5850; font-size: 12.5px; }
    .rv-panel .rv-exit { align-self: flex-start; background: none; border: none; padding: 4px 0; color: #5E5850; font: 500 11px Jost, system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; text-decoration: underline; cursor: pointer; }
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
  const itemHTML = i => {
    const inner = `<b>${i.title}</b><span>${i.note}</span>`;
    return `<li style="--c:${COLORS[i.t]}">${i.href ? `<a href="${i.href}" target="_blank" rel="noopener">${inner}</a>` : `<button type="button" data-rv-go="${i.n}">${inner}</button>`}</li>`;
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
  panel.addEventListener('click', e => {
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
