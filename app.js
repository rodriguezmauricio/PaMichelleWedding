(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const maps = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wideMQ = window.matchMedia('(min-width: 900px)');

  /* ---------- Intro curtain ---------- */
  const intro = $('#intro');
  if (intro) {
    if (document.documentElement.classList.contains('intro-seen')) {
      intro.remove();
    } else {
      let lifted = false;
      const lift = () => {
        if (lifted) return;
        lifted = true;
        clearTimeout(timer);
        intro.classList.add('lift');
        try { sessionStorage.setItem('mp-intro-seen', '1'); } catch (e) {}
        setTimeout(() => intro.remove(), 1000);
      };
      const timer = setTimeout(lift, reduceMotion ? 900 : 2300);
      intro.addEventListener('click', lift);
      document.addEventListener('keydown', lift, { once: true });
      requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('play')));
    }
  }

  /* ---------- Countdown (ceremony: 9 May 2027, 16:00 CEST) ---------- */
  const TARGET = Date.UTC(2027, 4, 9, 14, 0, 0);
  const cd = $('#countdown');
  cd.innerHTML = ['Days', 'Hours', 'Mins', 'Secs'].map(l => `<div><b>0</b><small>${l}</small></div>`).join('');
  const cdNums = $$('b', cd);
  const tick = () => {
    const d = Math.max(0, TARGET - Date.now());
    const v = [Math.floor(d / 864e5), pad(Math.floor(d / 36e5) % 24), pad(Math.floor(d / 6e4) % 60), pad(Math.floor(d / 1000) % 60)];
    v.forEach((x, i) => { if (cdNums[i].textContent !== String(x)) cdNums[i].textContent = x; });
  };
  tick();
  setInterval(tick, 1000);

  /* ---------- Marquee ---------- */
  const words = ['Welcome drinks', 'El Salvador', 'I do', 'La Viñuela', 'The cure', 'Nerja MMXXVII'];
  const run = words.map(w => `<span><em>${esc(w)}</em><i></i></span>`).join('');
  $('#marquee').innerHTML = run + run;

  /* ---------- Top bar, menu, dock, parallax ---------- */
  const bar = $('#bar'), menu = $('#menu'), dock = $('#dock'), menuBtn = $('#menuOpen'), heroPx = $('#heroParallax');
  let menuOpen = false;
  const setMenu = open => {
    menuOpen = open;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('locked', open);
    if (open) $('#menuClose').focus();
    updateDock();
  };
  menuBtn.addEventListener('click', () => setMenu(true));
  $('#menuClose').addEventListener('click', () => { setMenu(false); menuBtn.focus(); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });
  wideMQ.addEventListener('change', e => { if (e.matches && menuOpen) setMenu(false); if (e.matches && heroPx) heroPx.style.transform = ''; });

  let scrolled = false;
  function updateDock() { dock.classList.toggle('show', scrolled && !menuOpen && !wideMQ.matches); }
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      bar.classList.toggle('solid', y > 30);
      const s = y > window.innerHeight * 0.7;
      if (s !== scrolled) { scrolled = s; updateDock(); }
      if (heroPx && wideMQ.matches && !reduceMotion) heroPx.style.transform = `translate3d(0,${Math.min(y, 900) * 0.07}px,0)`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- The Weekend ---------- */
  const EVENTS = [
    { id: 'welcome', day: 'sat', date: '8 May', title: 'Welcome Drinks', time: '18:00',
      desc: "Join us for a few drinks overlooking the sea, in Cochran's Terrace, Nerja, to get the fun started for the weekend! Please try to be as punctual as possible as the venue has requested this.",
      venue: "Cochran's Terrace", address: 'C. Salón, 12, 29780 Nerja, Málaga, Spain', q: "Cochran's Terrace, C. Salón 12, Nerja" },
    { id: 'ceremony', day: 'sun', date: '9 May', title: 'Ceremony', time: '16:00', bus: true,
      desc: 'Please join us in El Salvador Church, Nerja at 4pm for our wedding ceremony. This is located right in the centre of town. After we say "I Do" there will be buses departing from Carabeo car park taking us to the venue.',
      venue: 'El Salvador Church, Nerja', address: 'Iglesia de El Salvador, beside Balcón de Europa, Nerja', q: 'Iglesia de El Salvador, Nerja' },
    { id: 'reception', day: 'sun', date: '9 May', title: 'Wedding Reception', time: '18:00',
      desc: 'Our wedding reception will take place at Hotel La Viñuela, a stunning lakefront boutique hotel approximately 40 minutes from Nerja town centre. Complimentary buses will be provided to the venue on the day of the wedding.',
      venue: 'B bou Hotel La Viñuela & Spa', address: 'Lake Viñuela, approx. 40 min from Nerja', q: 'B bou Hotel La Viñuela & Spa' },
    { id: 'day2', day: 'mon', date: '10 May', title: 'The Cure', time: '19:00',
      desc: 'Join us for the cure (a shot of cold Jäger) and to finish off the celebrations at Buddha Bar rooftop terrace. Pizzas and tapas will be served at 7pm.',
      venue: 'Buddha Bar', address: 'C. de la Gloria, 13, 29780 Nerja, Málaga, Spain', q: 'Buddha Bar, C. de la Gloria 13, Nerja' },
  ].map((e, i) => ({ ...e, num: ['I', 'II', 'III', 'IV'][i] }));
  const DAY_KEYS = ['sat', 'sun', 'mon'];
  const DAY_META = { sat: ['Sat', '08', 'Day 0', 'Saturday — Day 0'], sun: ['Sun', '09', 'The day', 'Sunday — The Wedding'], mon: ['Mon', '10', 'Day 2', 'Monday — Day 2'] };
  let day = 'sat';

  const daysEl = $('#days'), panel = $('#dayPanel');
  daysEl.innerHTML = DAY_KEYS.map(k => `<button type="button" class="day" role="tab" data-day="${k}"><span>${DAY_META[k][0]}</span><span>${DAY_META[k][1]}</span><span>${DAY_META[k][2]}</span></button>`).join('');
  daysEl.addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (b) setDay(b.dataset.day); });

  const eventHTML = e => `
    <article class="event" data-ev="${e.id}">
      <div class="event-rail"><span></span><span></span></div>
      <div class="event-body">
        <div class="event-time"><span>${e.time}</span><span>${e.num} · ${e.date}</span></div>
        <h3 class="event-title">${esc(e.title)}</h3>
        <p class="copy">${esc(e.desc)}</p>
        <div class="venue"><span class="label">Venue</span><span>${esc(e.venue)}</span><span>${esc(e.address)}</span></div>
        <div class="event-btns">
          <a class="pill pill-solid" href="${maps(e.q)}" target="_blank" rel="noopener">Directions ↗</a>
          <a class="pill pill-line" href="cal/michelle-pa-${e.id}.ics">Calendar +</a>
        </div>
        ${e.bus ? `<div class="bus-note"><span>then →</span><span>Complimentary buses depart <strong>Carabeo car park</strong> for La Viñuela, about 40 minutes away. Return times to follow.</span></div>` : ''}
      </div>
    </article>`;

  function setDay(k) {
    day = k;
    const i = DAY_KEYS.indexOf(k), evs = EVENTS.filter(e => e.day === k);
    $$('.day', daysEl).forEach(b => b.setAttribute('aria-selected', String(b.dataset.day === k)));
    const prev = DAY_KEYS[i - 1], next = DAY_KEYS[i + 1];
    panel.innerHTML = `
      <div class="day-head"><span>${DAY_META[k][3]}</span><span>${evs.length === 1 ? '1 event' : evs.length + ' events'}</span></div>
      ${evs.map(eventHTML).join('')}
      <div class="day-nav">
        <button type="button" data-go="${prev || ''}" class="${prev ? '' : 'off'}" ${prev ? '' : 'tabindex="-1" aria-hidden="true"'}>← ${prev ? DAY_META[prev][0] : ''}</button>
        <button type="button" data-go="${next || ''}" class="${next ? '' : 'off'}" ${next ? '' : 'tabindex="-1" aria-hidden="true"'}>${next ? DAY_META[next][0] : ''} →</button>
      </div>`;
  }
  panel.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && b.dataset.go) setDay(b.dataset.go); });
  let tx = 0, ty = 0;
  panel.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const n = DAY_KEYS[DAY_KEYS.indexOf(day) + (dx < 0 ? 1 : -1)];
      if (n) setDay(n);
    }
  }, { passive: true });
  setDay('sat');

  /* ---------- RSVP ---------- */
  const EVENT_CHOICES = [['welcome', 'Welcome Drinks', 'Sat 8 May · 18:00'], ['wedding', 'Ceremony & Reception', 'Sun 9 May · 16:00'], ['cure', 'The Cure', 'Mon 10 May · 19:00']];
  const F = { name: '', attending: null, events: ['welcome', 'wedding', 'cure'], diet: '', email: '', note: '' };
  let step = 0, sending = false;
  const form = $('#rsvpForm'), stepEl = $('#rsvpStep'), nextBtn = $('#rsvpNext'), backBtn = $('#rsvpBack'), errEl = $('#rsvpError'), sentEl = $('#rsvpSent');

  const steps = () => ['name', 'attend', ...(F.attending === 'yes' ? ['events'] : []), 'details'];
  const firstName = () => F.name.trim().split(/\s+/)[0] || '';
  const validEmail = s => !s.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  const canNext = cur =>
    cur === 'name' ? !!F.name.trim() :
    cur === 'attend' ? !!F.attending :
    cur === 'events' ? F.events.length > 0 :
    validEmail(F.email);

  function syncButton() {
    const list = steps(), cur = list[Math.min(step, list.length - 1)];
    nextBtn.classList.toggle('ready', canNext(cur));
  }

  function renderRsvp() {
    const list = steps(), si = Math.min(step, list.length - 1), cur = list[si], last = si === list.length - 1;
    step = si;
    $('#stepLabel').textContent = `Step ${si + 1} of ${list.length}`;
    $('#stepFill').style.width = ((si + 1) / list.length * 100) + '%';
    nextBtn.textContent = sending ? 'Sending…' : last ? 'Send reply' : 'Continue';
    backBtn.hidden = si === 0;
    errEl.hidden = true;

    if (cur === 'name') {
      stepEl.innerHTML = `<label class="step step-name"><span class="q">Who's replying?</span>
        <input class="line-input big" data-k="name" autocomplete="name" placeholder="Full name(s), as on your invite" value="${esc(F.name)}"></label>`;
    } else if (cur === 'attend') {
      const fn = firstName();
      stepEl.innerHTML = `<div class="step" style="text-align:center"><span class="q">${esc(fn ? fn + ', will you attend?' : 'Will you attend?')}</span>
        <div class="attend">${[['yes', 'Sí', 'Joyfully accepts'], ['no', 'Ay…', 'Regretfully declines']].map(([v, s, l]) =>
          `<button type="button" class="opt" data-attend="${v}" aria-pressed="${F.attending === v}"><span>${s}</span><span>${l}</span></button>`).join('')}</div></div>`;
    } else if (cur === 'events') {
      stepEl.innerHTML = `<div class="step"><span class="q">Which will you join?</span>
        <div class="chips">${EVENT_CHOICES.map(([k, l, s]) => { const on = F.events.includes(k);
          return `<button type="button" class="opt" data-event="${k}" aria-pressed="${on}"><span class="chip-text"><span>${esc(l)}</span><span>${s}</span></span><span class="chip-mark">${on ? '✓' : ''}</span></button>`; }).join('')}</div>
        <label class="field">Dietary requirements<input class="line-input" data-k="diet" placeholder="None" value="${esc(F.diet)}"></label></div>`;
    } else {
      stepEl.innerHTML = `<div class="step step-details"><span class="q">Last of all</span>
        <label class="field">Email<input class="line-input" type="email" data-k="email" autocomplete="email" inputmode="email" placeholder="For updates" value="${esc(F.email)}"></label>
        <label class="field">A note for the couple<textarea class="line-input" rows="3" data-k="note" placeholder="Optional">${esc(F.note)}</textarea></label></div>`;
    }
    syncButton();
  }

  stepEl.addEventListener('input', e => { const k = e.target.dataset.k; if (k) { F[k] = e.target.value; syncButton(); } });
  stepEl.addEventListener('click', e => {
    const a = e.target.closest('[data-attend]'), ev = e.target.closest('[data-event]');
    if (a) { F.attending = a.dataset.attend; renderRsvp(); a && $(`[data-attend="${F.attending}"]`, stepEl).focus(); }
    if (ev) {
      const k = ev.dataset.event;
      F.events = F.events.includes(k) ? F.events.filter(x => x !== k) : [...F.events, k];
      ev.setAttribute('aria-pressed', String(F.events.includes(k)));
      $('.chip-mark', ev).textContent = F.events.includes(k) ? '✓' : '';
      syncButton();
    }
  });
  backBtn.addEventListener('click', () => { step = Math.max(0, step - 1); renderRsvp(); });

  async function sendReply() {
    const yes = F.attending === 'yes';
    const endpoint = (window.MP_CONFIG || {}).rsvpEndpoint;
    if (!endpoint) {
      // Review mode (?review) before the backend exists: let the couple try the flow; nothing is saved.
      if (window.MP_REVIEW) { await new Promise(r => setTimeout(r, 700)); return; }
      throw new Error('RSVP endpoint not configured (config.js)');
    }
    const payload = {
      name: F.name.trim(),
      attending: yes ? 'Yes' : 'No',
      events: yes ? EVENT_CHOICES.filter(([k]) => F.events.includes(k)).map(([, l]) => l).join(', ') : '',
      diet: yes ? F.diet.trim() : '',
      email: F.email.trim(),
      note: F.note.trim(),
      website: '', // honeypot, must stay empty
    };
    // No custom headers: keeps this a "simple" CORS request, which Apps Script accepts.
    const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || 'HTTP ' + res.status);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    const list = steps(), cur = list[step];
    if (!canNext(cur)) {
      if (cur === 'details') { errEl.textContent = 'That email address doesn’t look right.'; errEl.hidden = false; }
      return;
    }
    if (step < list.length - 1) { step++; renderRsvp(); return; }

    sending = true; nextBtn.disabled = true; nextBtn.textContent = 'Sending…';
    try {
      await sendReply();
      const fn = firstName(), yes = F.attending === 'yes';
      $('#sentLine').textContent = yes ? `We can't wait to see you${fn ? ', ' + fn : ''}.` : `We'll miss you${fn ? ', ' + fn : ''}.`;
      $('#sentSub').textContent = yes ? `Your reply for ${F.events.length} of 3 events has been received.` : 'Thank you for letting us know — your reply has been received.';
      form.hidden = true; sentEl.hidden = false;
    } catch (err) {
      errEl.textContent = 'Sorry — your reply didn’t send. Please try again, or message Michelle or Pa directly.';
      errEl.hidden = false;
    } finally {
      sending = false; nextBtn.disabled = false;
      if (!form.hidden) nextBtn.textContent = 'Send reply';
    }
  });
  $('#rsvpEdit').addEventListener('click', () => { sentEl.hidden = true; form.hidden = false; step = 0; renderRsvp(); });
  renderRsvp();

  /* ---------- Travel ---------- */
  const tabs = $$('.tabs [data-tab]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    $$('.tpanel').forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
  }));
  const DEPARTURES = ['07:00', '08:15*', '09:15', '10:30', '11:00***', '11:45', '12:30***', '13:00', '14:15', '15:15', '16:30***', '17:30***', '18:45', '19:30***', '20:15', '20:45***', '21:30', '23:00']
    .map(x => { const t = x.replace(/\*/g, ''), m = x.slice(t.length); return { t, m, direct: m === '***' }; });
  let directOnly = false;
  const renderDepartures = () => {
    $('#departures').innerHTML = DEPARTURES.filter(d => !directOnly || d.direct)
      .map(d => `<div class="${d.direct ? 'direct' : ''}"><span>${d.t}</span><span>${d.m}</span></div>`).join('');
  };
  $('#directToggle').addEventListener('click', e => {
    directOnly = !directOnly;
    e.currentTarget.setAttribute('aria-checked', String(directOnly));
    renderDepartures();
  });
  renderDepartures();

  /* ---------- Stay ---------- */
  const HOTELS = [
    ['Hotel Balcón de Europa', 'Hotel', 4, 'Right beside the church and the beach — great location.', 'Beside the Balcón', 'hotelbalconeuropa.com'],
    ['Toboso Aparthotel', 'Aparthotel', 0, "Next to Hotel Balcón de Europa. 12 studios + 18 apartments. Cochran's Terrace & Irish Pub are part of this complex — where we meet the day before. 10% off if you become a member on their website.", 'Beside the Balcón', 'tobosoaparthotel.com'],
    ['Hotel Plaza Cavana', 'Hotel', 3, 'Centre, directly across from the church. Rooftop pool.', 'Across from the church', 'hotelplazacavana.com'],
    ['Parador de Nerja', 'Hotel', 4, 'Overlooks Burriana Beach.', '10–15 min walk', 'parador.es'],
    ['Sibarys Hotel', 'Hotel', 3, 'Centre of Nerja, recently refurbished.', 'Town centre', 'hotelsibarys.es/en/'],
    ['Hotel Paraíso del Mar', 'Hotel', 3, 'Steps to Burriana Beach, lovely sea views, clean.', '10–15 min walk', 'hotelparaisodelmar.es'],
    ['Hotel Carabeo', 'Boutique hotel', 0, 'Small, good location.', '2 min to centre', 'hotelcarabeo.com'],
    ['MB Boutique Hotel', 'Boutique hotel', 0, 'New.', '15 min walk', 'mbboutiquehotel.es/en'],
    ['Hostal Marrisal', 'Hostal', 0, 'Right next to Hotel Balcón and Toboso — perfect location.', 'Beside the Balcón', 'hostalmarrisal.com'],
    ['Hostal Doña Carmen', 'Hostal', 0, 'Centre, recently refurbished.', 'Town centre', 'hostalcarmennerja.com'],
    ['Hostal Boutique Puerta de Nerja', 'Hostal', 0, 'Modern, centre of town.', 'Town centre', 'lapuertadenerja.com'],
    ['VG Hostal Boutique', 'Hostal', 0, 'Modern.', '5 min to the Balcón', 'hostalnerjavg.com'],
    ['Hostal Nerjasol', 'Hostal', 0, 'Calle Pintada.', '2 min from Hotel Balcón', 'hostalnerjasol.es'],
  ];
  let filter = 'All', allHotels = false;
  const matches = (h, f) => f === 'All' || (f === 'Hostales' ? h[1] === 'Hostal' : h[1] !== 'Hostal');
  function renderHotels() {
    $('#filters').innerHTML = ['All', 'Hotels', 'Hostales'].map(f =>
      `<button type="button" data-filter="${f}" aria-pressed="${filter === f}">${f} <em>${HOTELS.filter(h => matches(h, f)).length}</em></button>`).join('');
    const list = HOTELS.filter(h => matches(h, filter));
    const limit = allHotels || filter !== 'All' ? list.length : 6;
    $('#hotels').innerHTML = list.slice(0, limit).map(([name, type, stars, notes, walk, url], i) => `
      <article class="hotel">
        <div class="hotel-name"><span>${pad(i + 1)}</span><div><h3>${esc(name)}</h3><span class="hotel-type">${esc(type)} <span>${stars ? '★'.repeat(stars) : ''}</span></span></div></div>
        <p>${esc(notes)}</p>
        <div class="hotel-meta"><span>${esc(walk)}</span><div>
          <a class="pill pill-solid pill-sm" href="https://${url}" target="_blank" rel="noopener">Website</a>
          <a class="pill pill-line pill-sm" href="${maps(name + ', Nerja')}" target="_blank" rel="noopener">Map</a>
        </div></div>
      </article>`).join('');
    const more = $('#moreHotels');
    more.hidden = list.length <= limit;
    more.textContent = `Show all ${list.length} places`;
  }
  $('#filters').addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (b) { filter = b.dataset.filter; renderHotels(); } });
  $('#moreHotels').addEventListener('click', () => { allHotels = true; renderHotels(); });
  renderHotels();

  /* ---------- Local Guide ---------- */
  const SALONS = [
    ["Erica's Hair Salon", 'C. Almte. Ferrándiz, 10', '+34 952 52 39 66'], ['Beauty by Katie', 'C. Granada, 42', '+34 618 41 20 66'],
    ['Sparkles Hair Salon', 'C. Pintada, 76', '+34 622 72 55 29'], ['Nora Hair and Beauty (Nora Gerritzen)', 'Calle el Chaparil 5, Edf. los Tesoros local 2', '+34 952 52 27 62'],
    ['Peluquería Alejandra Segura', 'C. el Barrio, 48', '+34 647 65 70 46'], ['Salón de Belleza Mima-T', 'C. el Barrio, 22', '+34 696 01 99 23'],
    ['Tamara Franco Hair & Beauty', 'C. el Chaparil, 4, local 2', '+34 604 46 20 70'], ['Barber Floww', 'C. Málaga, 17', '+34 642 46 51 18'],
  ];
  $('#salons').innerHTML = SALONS.map(([name, addr, phone]) => `
    <div class="salon">
      <div>
        <h3>${esc(name)}</h3>
        <a class="salon-addr" href="${maps(name + ', ' + addr + ', 29780 Nerja')}" target="_blank" rel="noopener">${esc(addr)} ↗</a>
        <span class="salon-phone">${phone}</span>
      </div>
      <a class="call" href="tel:${phone.replace(/\s/g, '')}" aria-label="Call ${esc(name)}">Call</a>
    </div>`).join('');

  /* ---------- Q&A ---------- */
  const QA = [
    ["When's the RSVP deadline?", 'Please RSVP as soon as possible, or at the latest by 9 February 2027, so we can get an accurate headcount.'],
    ['Can I bring a plus one?', "Check your invite to see if you've got a plus one!"],
    ['Are children welcome?', 'As much as we adore your little ones, we won\'t be able to accommodate them at the ceremony or reception. We know some of you will travel with children, so they\'re more than welcome at "Day 0" and "Day 2", along with any relatives looking after them.', 'sitter'],
    ['Would you recommend hiring a car?', "If you're staying in Nerja town centre, you won't need one."],
    ['If I leave the reception early, how do I get back to Nerja?', 'Our wedding planner Patty will be there to organise taxis for anyone leaving early, grouping people to keep costs down.'],
    ['Hair & makeup recommendations?', "We've gathered eight salons in Nerja, with tap-to-call numbers, in our Local Guide.", 'link'],
    ['What shoes should I wear?', 'Part of the reception area is on grass — opt for block heels or sandals instead of stilettos!'],
    ['Is the wedding indoors or outdoors?', 'The reception will be outside overlooking Lake Viñuela, and the party moves inside later on.'],
    ['Who should I contact with questions?', 'Michelle or Pa.'],
  ];
  $('#qas').innerHTML = QA.map(([q, a, x], i) => `
    <div class="qa">
      <button type="button" aria-expanded="false" aria-controls="qa-${i}"><span>${esc(q)}</span><span class="qa-ico" aria-hidden="true">+</span></button>
      <div class="qa-a" id="qa-${i}" hidden>
        <p>${esc(a)}</p>
        ${x === 'sitter' ? `<div class="sitter"><span>Need a babysitter?</span><span>Our wedding planner recommends <strong>Becky</strong> — she has worked with Patty for over 15 years and comes highly recommended. Reviews: Facebook page "Creche Spain".</span><a href="mailto:crechespain@gmail.com">crechespain@gmail.com</a></div>` : ''}
        ${x === 'link' ? `<a href="#guide">Open the Local Guide →</a>` : ''}
      </div>
    </div>`).join('');
  $('#qas').addEventListener('click', e => {
    const b = e.target.closest('.qa > button');
    if (!b) return;
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    $('#' + b.getAttribute('aria-controls')).hidden = !open;
  });

  /* ---------- Scroll reveal + active section ---------- */
  if ('IntersectionObserver' in window) {
    if (!reduceMotion) {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.remove('reveal-pending'); io.unobserve(e.target); }
      }), { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      $$('[data-reveal]').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.classList.add('reveal-pending');
        requestAnimationFrame(() => el.classList.add('reveal-armed'));
        io.observe(el);
      });
    }
    const dockLinks = $$('[data-dock]', dock), dockRsvp = $('.dock-rsvp', dock);
    const io2 = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      dockLinks.forEach(a => a.classList.toggle('on', a.dataset.dock === id || (a.dataset.dock === 'qa' && id === 'guide')));
      dockRsvp.classList.toggle('on', id === 'rsvp');
    }), { rootMargin: '-45% 0px -50% 0px' });
    ['welcome', 'weekend', 'rsvp', 'travel', 'stay', 'guide', 'qa'].forEach(id => { const el = document.getElementById(id); if (el) io2.observe(el); });
  }
})();
