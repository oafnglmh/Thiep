/* =========================================================
   Thiệp mời Lễ Tốt Nghiệp — script
   Sửa thông tin mặc định trong CONFIG bên dưới.
   ========================================================= */
(() => {
  'use strict';

  const CONFIG = {
    graduate: 'Phan Thị Duyên',
    major: 'Department of International Trade',
    school: '',                                   // VD: 'Trường Đại học ...' (để trống sẽ ẩn)
    defaultGuest: 'bạn thân mến',
    start: '2026-12-08T11:00:00+07:00',
    end: '2026-12-08T14:00:00+07:00',
    venue: 'Nhà hát Hòa Bình',
    address: 'Số 240 đường 3 Tháng 2, Phường Hòa Hưng, TP. Hồ Chí Minh',
    music: '',            // VD: 'assets/music.mp3' — để trống sẽ ẩn nút nhạc
    rsvpEndpoint: '',     // URL Google Apps Script / Formspree nếu muốn lưu phản hồi về máy chủ
    gallery: ['assets/photo-1.jpg', 'assets/photo-2.jpg', 'assets/photo-3.jpg', 'assets/photo-4.jpg']
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clean = v => (v || '').replace(/\s+/g, ' ').trim().slice(0, 80);

  /* ---------------- Dữ liệu từ URL ---------------- */
  const qs = new URLSearchParams(location.search);
  const state = {
    guest: clean(qs.get('to')),
    name: clean(qs.get('n')) || CONFIG.graduate,
    major: qs.has('m') ? clean(qs.get('m')) : CONFIG.major,
    school: qs.has('s') ? clean(qs.get('s')) : CONFIG.school
  };
  const isGuestView = qs.has('to') && !qs.has('edit');

  const givenName = n => n.split(' ').filter(Boolean).pop() || n;

  function splitName(el, text) {
    el.textContent = '';
    let i = 0;
    text.split(' ').forEach((word, wi, arr) => {
      const w = document.createElement('span');
      w.className = 'w';
      Array.from(word.normalize('NFC')).forEach(c => {
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.style.setProperty('--i', i++);
        ch.textContent = c;
        w.appendChild(ch);
      });
      el.appendChild(w);
      if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.setAttribute('aria-label', text);
  }

  function applyState() {
    const guest = state.guest || CONFIG.defaultGuest;
    $$('[data-bind="guest"]').forEach(el => (el.textContent = guest));
    $$('[data-bind="name"]').forEach(el => {
      if (el.id === 'gradName') splitName(el, state.name);
      else el.textContent = state.name;
    });
    $$('[data-bind="major"]').forEach(el => (el.textContent = state.major));
    $$('[data-bind="school"]').forEach(el => (el.textContent = state.school));
    $$('[data-bind="short"]').forEach(el => (el.textContent = givenName(state.name)));
    $$('[data-bind="initial"]').forEach(el => (el.textContent = givenName(state.name).charAt(0).toUpperCase()));
    document.title = `Thiệp mời Lễ Tốt Nghiệp · ${state.name}`;
    const fName = $('#fName');
    if (fName && !fName.dataset.touched) fName.value = state.guest;
    updateCalendarLinks();
  }

  /* ---------------- Con dấu sáp (viền gợn) ---------------- */
  (function waxSeal() {
    const pts = [];
    const n = 64;
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI * 2;
      const r = 44 + Math.sin(a * 9) * 1.8 + Math.sin(a * 23 + 1) * 1.1 + Math.cos(a * 5) * 1.2;
      pts.push(`${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`);
    }
    $('#sealEdge').setAttribute('d', `M${pts.join('L')}Z`);
  })();

  /* ---------------- Mở phong bì ---------------- */
  const intro = $('#intro');
  const envelope = $('#envelope');
  const hero = $('#hero');
  let opened = false;

  function openInvite() {
    if (opened) return;
    opened = true;
    intro.classList.add('is-opening');
    envelope.classList.add('open');
    Music.play();

    setTimeout(() => {
      intro.classList.add('is-gone');
      document.body.classList.remove('is-locked');
      document.body.classList.add('is-open');
      window.scrollTo(0, 0);
      hero.classList.add('play');
      burst();
      Petals.start();
      initReveal();
    }, reduceMotion ? 200 : 1900);

    setTimeout(() => { intro.hidden = true; }, reduceMotion ? 400 : 3100);
  }
  envelope.addEventListener('click', openInvite);
  $('#seal').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvite(); }
  });

  function burst() {
    if (reduceMotion || typeof window.confetti !== 'function') return;
    const colors = ['#F4C6CE', '#E59CAB', '#B45A70', '#FBF4F1', '#D9B98A'];
    const base = { colors, ticks: 260, gravity: .8, scalar: .9, disableForReducedMotion: true };
    window.confetti({ ...base, particleCount: 70, spread: 75, startVelocity: 38, origin: { x: .5, y: .55 } });
    setTimeout(() => {
      window.confetti({ ...base, particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: .75 } });
      window.confetti({ ...base, particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: .75 } });
    }, 250);
  }

  /* ---------------- Reveal khi cuộn ---------------- */
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------------- Parallax nhẹ ---------------- */
  (function parallax() {
    if (reduceMotion) return;
    const arch = $('#archBg');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        arch.style.transform = `translateY(${y * 0.12}px)`;
        ticking = false;
      });
    }, { passive: true });
  })();

  /* ---------------- Cánh hoa rơi ---------------- */
  const Petals = (() => {
    const cv = $('#petals');
    const ctx = cv.getContext('2d');
    const colors = ['#F4C6CE', '#EDA9B6', '#F9DDE2', '#E594A4', '#F6D0C8'];
    let w = 0, h = 0, list = [], raf = 0, running = false;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const rnd = (a, b) => a + Math.random() * (b - a);
    function make(scatter) {
      return {
        x: rnd(0, w), y: scatter ? rnd(-h, 0) : rnd(-60, -20),
        s: rnd(5, 11), vy: rnd(.45, 1.15), vx: rnd(-.25, .35),
        rot: rnd(0, 6.28), vr: rnd(-.025, .025),
        flip: rnd(0, 6.28), vf: rnd(.015, .04),
        sway: rnd(0, 6.28), vs: rnd(.008, .02),
        c: colors[(Math.random() * colors.length) | 0], a: rnd(.55, .9)
      };
    }
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip));
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      const s = p.s;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * .95, -s * .55, s * .6, s * .75, 0, s);
      ctx.bezierCurveTo(-s * .6, s * .75, -s * .95, -s * .55, 0, -s);
      ctx.fill();
      ctx.globalAlpha = p.a * .35;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.moveTo(0, -s * .6);
      ctx.quadraticCurveTo(s * .12, 0, 0, s * .7);
      ctx.stroke();
      ctx.restore();
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of list) {
        p.sway += p.vs;
        p.x += p.vx + Math.sin(p.sway) * .55;
        p.y += p.vy;
        p.rot += p.vr;
        p.flip += p.vf;
        if (p.y > h + 30 || p.x < -40 || p.x > w + 40) Object.assign(p, make(false));
        drawPetal(p);
      }
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (reduceMotion || running) return;
      running = true;
      resize();
      const count = w < 600 ? 16 : 28;
      list = Array.from({ length: count }, () => make(true));
      frame();
    }
    window.addEventListener('resize', () => running && resize());
    document.addEventListener('visibilitychange', () => {
      if (!running) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); frame(); }
    });
    return { start };
  })();

  /* ---------------- Nhạc nền (tùy chọn) ---------------- */
  const Music = (() => {
    const btn = $('#musicBtn');
    if (!CONFIG.music) return { play() {} };
    const audio = new Audio(CONFIG.music);
    audio.loop = true; audio.volume = .55;
    btn.hidden = false;
    const sync = () => btn.classList.toggle('is-playing', !audio.paused);
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    btn.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
    return { play: () => audio.play().catch(() => {}) };
  })();

  /* ---------------- Lịch tháng 12/2026 ---------------- */
  (function calendar() {
    const grid = $('#calGrid');
    const y = 2026, m = 11, mark = 8;
    ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].forEach(d => {
      const s = document.createElement('span');
      s.className = 'dow'; s.textContent = d;
      grid.appendChild(s);
    });
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('span'));
    for (let d = 1; d <= days; d++) {
      const cell = document.createElement('span');
      cell.className = 'd';
      if ((offset + d) % 7 === 0) cell.classList.add('sun');
      const t = document.createElement('span');
      t.textContent = d;
      cell.appendChild(t);
      if (d === mark) {
        cell.classList.add('mark');
        cell.setAttribute('aria-label', `Ngày ${d} — ngày lễ`);
        cell.insertAdjacentHTML('beforeend',
          '<svg class="ring" viewBox="0 0 48 46" aria-hidden="true"><path d="M30 5C17 2 4 10 4 23s11 20 22 19 19-9 18-20C43 11 33 4 22 6"/></svg>');
      }
      grid.appendChild(cell);
    }
  })();

  /* ---------------- Đếm ngược ---------------- */
  (function countdown() {
    const start = new Date(CONFIG.start).getTime();
    const end = new Date(CONFIG.end).getTime();
    const units = { d: $('[data-u="d"]'), h: $('[data-u="h"]'), m: $('[data-u="m"]'), s: $('[data-u="s"]') };
    const box = $('#countdown'), done = $('#countDone'), label = $('#countLabel');
    const pad = n => String(n).padStart(2, '0');
    let timer;

    function set(el, v) {
      if (el.textContent === v) return;
      el.textContent = v;
      el.classList.remove('flip');
      void el.offsetWidth;
      el.classList.add('flip');
    }
    function tick() {
      const now = Date.now();
      if (now >= start) {
        box.hidden = true; label.hidden = true; done.hidden = false;
        done.textContent = now < end
          ? 'Buổi lễ đang diễn ra — hẹn gặp bạn ở Nhà hát Hòa Bình!'
          : 'Cảm ơn bạn đã cùng mình đi qua cột mốc đáng nhớ này.';
        clearInterval(timer);
        return;
      }
      let diff = Math.floor((start - now) / 1000);
      const d = Math.floor(diff / 86400); diff -= d * 86400;
      const h = Math.floor(diff / 3600); diff -= h * 3600;
      const m = Math.floor(diff / 60);
      const s = diff - m * 60;
      set(units.d, pad(d)); set(units.h, pad(h)); set(units.m, pad(m)); set(units.s, pad(s));
    }
    tick();
    timer = setInterval(tick, 1000);
  })();

  /* ---------------- Lịch: Google + .ics ---------------- */
  const toICSDate = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const fullAddress = () => `${CONFIG.venue}, ${CONFIG.address}`;

  function updateCalendarLinks() {
    const p = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Lễ tốt nghiệp của ${state.name}`,
      dates: `${toICSDate(CONFIG.start)}/${toICSDate(CONFIG.end)}`,
      details: `Thân mời ${state.guest || 'bạn'} đến dự lễ tốt nghiệp của ${state.name}.\nThiệp mời: ${location.href}`,
      location: fullAddress()
    });
    $('#gcalBtn').href = `https://calendar.google.com/calendar/render?${p.toString()}`;
  }

  $('#icsBtn').addEventListener('click', () => {
    const esc = s => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Graduation Invite//VI', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:grad-${toICSDate(CONFIG.start)}@thiep-tot-nghiep`,
      `DTSTAMP:${toICSDate(new Date().toISOString())}`,
      `DTSTART:${toICSDate(CONFIG.start)}`,
      `DTEND:${toICSDate(CONFIG.end)}`,
      `SUMMARY:${esc('Lễ tốt nghiệp của ' + state.name)}`,
      `LOCATION:${esc(fullAddress())}`,
      `DESCRIPTION:${esc('Thiệp mời: ' + location.href)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Lễ tốt nghiệp', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'le-tot-nghiep-08-12-2026.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Đã tải file lịch');
  });

  /* ---------------- Bản đồ ---------------- */
  (function map() {
    const q = encodeURIComponent(`${CONFIG.venue}, 240 đường 3 Tháng 2, Hòa Hưng, Hồ Chí Minh`);
    $('#mapFrame').src = `https://maps.google.com/maps?q=${q}&z=16&hl=vi&output=embed`;
    $('#dirBtn').href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  })();

  /* ---------------- Lightbox ---------------- */
  (function lightbox() {
    const lb = $('#lightbox'), img = $('.lb-img', lb), count = $('.lb-count', lb);
    const pics = CONFIG.gallery;
    let idx = 0, sx = 0;

    function show(i) {
      idx = (i + pics.length) % pics.length;
      img.classList.add('swap');
      setTimeout(() => {
        img.src = pics[idx];
        img.onload = () => img.classList.remove('swap');
        count.textContent = `${idx + 1} / ${pics.length}`;
      }, 160);
    }
    function open(i) {
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('show'));
      document.body.style.overflow = 'hidden';
      show(i);
    }
    function close() {
      lb.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => (lb.hidden = true), 350);
    }
    $$('.gal-item').forEach(b => b.addEventListener('click', () => open(+b.dataset.idx)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-nav.prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-nav.next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    lb.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  })();

  /* ---------------- Hộp quà ---------------- */
  (function gift() {
    const btn = $('#giftToggle'), box = $('#giftBox'), label = $('span', btn);
    btn.addEventListener('click', () => {
      const open = box.hidden;
      box.hidden = !open;
      box.classList.toggle('show', open);
      btn.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Đóng hộp quà' : 'Mở hộp quà';
    });
    $$('[data-copy]').forEach(b => b.addEventListener('click', () =>
      copy(b.dataset.copy).then(() => toast('Đã sao chép số tài khoản'))));
  })();

  /* ---------------- RSVP ---------------- */
  (function rsvp() {
    const form = $('#rsvpForm'), doneBox = $('#rsvpDone'), msg = $('#rsvpMsg');
    const out = $('#fCount'), party = $('#partyField'), nameIn = $('#fName');
    const KEY = 'grad-rsvp-2026';
    let count = 1;

    nameIn.addEventListener('input', () => {
      nameIn.dataset.touched = '1';
      nameIn.closest('.field').classList.remove('error');
    });
    $$('[data-step]', form).forEach(b => b.addEventListener('click', () => {
      count = Math.max(1, Math.min(10, count + +b.dataset.step));
      out.textContent = count;
    }));
    $$('input[name="attend"]', form).forEach(r => r.addEventListener('change', () =>
      party.classList.toggle('off', form.attend.value === 'no')));

    function showDone(data) {
      form.hidden = true;
      doneBox.hidden = false;
      msg.textContent = data.attend === 'yes'
        ? `Mình đã nhận được xác nhận của ${data.name}${data.count > 1 ? ` (${data.count} người)` : ''}. Hẹn gặp bạn ngày 08.12 nhé!`
        : `Tiếc quá, nhưng cảm ơn ${data.name} đã dành lời chúc cho mình. Mình sẽ nhớ bạn!`;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = clean(nameIn.value);
      if (!name) {
        nameIn.closest('.field').classList.add('error');
        nameIn.focus();
        return;
      }
      const data = {
        name,
        attend: form.attend.value,
        count: form.attend.value === 'yes' ? count : 0,
        wish: $('#fWish').value.trim().slice(0, 300),
        guestLink: state.guest,
        at: new Date().toISOString()
      };
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {}
      if (CONFIG.rsvpEndpoint) {
        fetch(CONFIG.rsvpEndpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) }).catch(() => {});
      }
      showDone(data);
      if (data.attend === 'yes') burst();
    });

    $('#rsvpEdit').addEventListener('click', () => {
      doneBox.hidden = true;
      form.hidden = false;
    });

    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && saved.name) {
        nameIn.value = saved.name; nameIn.dataset.touched = '1';
        form.attend.value = saved.attend;
        count = saved.count || 1; out.textContent = count;
        $('#fWish').value = saved.wish || '';
        party.classList.toggle('off', saved.attend === 'no');
        showDone(saved);
      }
    } catch (_) {}
  })();

  /* ---------------- Tiện ích ---------------- */
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(resolve => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove(); resolve();
    });
  }
  let toastTimer;
  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* =========================================================
     Bảng TẠO THIỆP (chỉ hiện với chủ thiệp — không hiện khi link có ?to=)
     ========================================================= */
  (function creator() {
    const fab = $('#createBtn');
    if (isGuestView) return;
    fab.hidden = false;

    const sheet = $('#sheet'), backdrop = $('#sheetBackdrop');
    const cGuest = $('#cGuest'), cName = $('#cName'), cMajor = $('#cMajor'), cSchool = $('#cSchool'), cLink = $('#cLink');
    const qrWrap = $('#qrWrap'), qrBox = $('#qrBox');
    const base = location.href.split(/[?#]/)[0];

    cGuest.value = state.guest;
    cName.value = state.name;
    cMajor.value = state.major;
    cSchool.value = state.school;

    function buildLink(guest) {
      const p = new URLSearchParams();
      if (guest) p.set('to', guest);
      if (state.name !== CONFIG.graduate) p.set('n', state.name);
      if (state.major !== CONFIG.major) p.set('m', state.major);
      if (state.school !== CONFIG.school) p.set('s', state.school);
      const q = p.toString();
      return q ? `${base}?${q}` : base;
    }
    const inviteMsg = (guest, link) =>
      `Thân gửi ${guest || 'bạn'},\n${givenName(state.name)} trân trọng mời ${guest || 'bạn'} đến dự Lễ Tốt Nghiệp của mình vào 11:00 – 14:00, Thứ Ba ngày 08.12.2026 tại Nhà hát Hòa Bình (240 đường 3 Tháng 2, P. Hòa Hưng, TP.HCM).\nThiệp mời: ${link}`;

    function refresh() {
      state.guest = clean(cGuest.value);
      state.name = clean(cName.value) || CONFIG.graduate;
      state.major = clean(cMajor.value);
      state.school = clean(cSchool.value);
      applyState();
      cLink.value = buildLink(state.guest);
      if (!qrWrap.hidden) renderQR();
    }

    function openSheet() {
      refresh();
      sheet.classList.add('show'); backdrop.classList.add('show');
      sheet.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => cGuest.focus({ preventScroll: true }), 400);
    }
    function closeSheet() {
      sheet.classList.remove('show'); backdrop.classList.remove('show');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    fab.addEventListener('click', openSheet);
    backdrop.addEventListener('click', closeSheet);
    $('#sheetClose').addEventListener('click', closeSheet);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('show')) closeSheet(); });
    [cGuest, cName, cMajor, cSchool].forEach(i => i.addEventListener('input', refresh));

    // Tabs
    $$('.tab', sheet).forEach(t => t.addEventListener('click', () => {
      $$('.tab', sheet).forEach(x => x.classList.toggle('on', x === t));
      $$('.panel', sheet).forEach(p => (p.hidden = p.dataset.panel !== t.dataset.tab));
    }));

    $('#cCopy').addEventListener('click', () => copy(cLink.value).then(() => toast('Đã sao chép link thiệp')));
    $('#cCopyMsg').addEventListener('click', () => copy(inviteMsg(state.guest, cLink.value)).then(() => toast('Đã sao chép lời mời')));
    $('#cShare').addEventListener('click', () => {
      const link = cLink.value;
      if (navigator.share) {
        navigator.share({ title: 'Thiệp mời Lễ Tốt Nghiệp', text: inviteMsg(state.guest, link).replace(/\nThiệp mời: .*$/, ''), url: link }).catch(() => {});
      } else copy(link).then(() => toast('Đã sao chép link thiệp'));
    });

    function renderQR() {
      qrBox.textContent = '';
      if (typeof window.QRCode !== 'function') { qrBox.textContent = 'Không tải được thư viện QR.'; return; }
      new window.QRCode(qrBox, {
        text: cLink.value, width: 360, height: 360,
        colorDark: '#6B2A3C', colorLight: '#FFFFFF', correctLevel: window.QRCode.CorrectLevel.M
      });
    }
    $('#cQr').addEventListener('click', () => {
      qrWrap.hidden = !qrWrap.hidden;
      if (!qrWrap.hidden) renderQR();
    });
    $('#qrDl').addEventListener('click', () => {
      const c = $('canvas', qrBox);
      if (!c) return;
      const a = document.createElement('a');
      a.href = c.toDataURL('image/png');
      a.download = `qr-thiep-${(state.guest || 'moi').replace(/\s+/g, '-')}.png`;
      a.click();
    });

    // Tạo hàng loạt
    const bList = $('#bList'), bCopyAll = $('#bCopyAll');
    let bulk = [];
    $('#bMake').addEventListener('click', () => {
      const names = [...new Set($('#bNames').value.split('\n').map(clean).filter(Boolean))];
      bulk = names.map(n => ({ name: n, link: buildLink(n) }));
      bList.textContent = '';
      bulk.forEach((b, i) => {
        const li = document.createElement('li');
        li.style.animationDelay = `${i * 40}ms`;
        const bn = document.createElement('span'); bn.className = 'bn'; bn.textContent = b.name;
        const bl = document.createElement('span'); bl.className = 'bl'; bl.textContent = b.link;
        const btn = document.createElement('button');
        btn.type = 'button'; btn.setAttribute('aria-label', `Sao chép lời mời cho ${b.name}`);
        btn.innerHTML = '<svg class="ic"><use href="#i-copy"/></svg>';
        btn.addEventListener('click', () => copy(inviteMsg(b.name, b.link)).then(() => toast(`Đã sao chép lời mời cho ${b.name}`)));
        li.append(bn, bl, btn);
        bList.appendChild(li);
      });
      bCopyAll.disabled = !bulk.length;
      if (!bulk.length) toast('Hãy nhập ít nhất một tên');
    });
    bCopyAll.addEventListener('click', () =>
      copy(bulk.map(b => `${b.name}: ${b.link}`).join('\n')).then(() => toast(`Đã sao chép ${bulk.length} link`)));
  })();

  applyState();
})();
