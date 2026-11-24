// Tomato Studio: page behaviour on top of the template's main.js (which sends the form).
// Everything here is an enhancement: without JavaScript the menu is always open, every project is
// listed and a project link opens its first photo.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');

  /* ===== Hero film: still poster for people who ask for less motion ===== */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('video[autoplay]').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
  }

  /* ===== Mobile menu ===== */
  const nav = $('#nav');
  const toggle = $('#mtoggle');
  if (nav && toggle) {
    const set = (open) => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Zamknij' : 'Menu';
    };
    toggle.addEventListener('click', () => set(!nav.classList.contains('open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); toggle.focus(); } });
  }

  /* ===== Realizacje: old links like realizacje.html#domy go to the category's own page ===== */
  if (/realizacje(\.html)?$/.test(location.pathname)) {
    const page = { domy: 'domy', mieszkania: 'mieszkania', apartamenty: 'apartamenty', inwest: 'lokale-inwestycyjne' }[location.hash.slice(1)];
    if (page) location.replace('realizacje-' + page + '.html');
  }

  /* ===== Project gallery (lightbox), used on the project pages (realizacje/<projekt>.html) =====
     A photo link: <a href="…/img/realizacje/<id>/03.jpg" data-gal data-count="9" data-name="…" data-catname="…">.
     Photos are 01.jpg … NN.jpg in the same folder; the gallery opens at the clicked photo. */
  const lb = $('#lb');
  let moved = false; // set while dragging the home slider, so a drag does not open a gallery
  if (lb) {
    const img = document.createElement('img'), cap = $('#lb-cap'), prev = $('#lb-p'), next = $('#lb-n'), close = $('#lb-x');
    img.id = 'lb-img';
    cap.before(img);
    let cur = null, idx = 0, lastFocus = null, ext = '.jpg';
    const src = (i) => cur.base + pad(i + 1) + ext;
    // Use the format the browser already picked from <picture> (AVIF, WebP or JPG) for the big photos too
    const pickExt = (a) => {
      const shown = [a.querySelector('img'), $('.proj-hero img')].map((i) => i && i.currentSrc).find(Boolean) || '';
      ext = (shown.match(/\.(avif|webp)$/) || ['.jpg'])[0];
    };
    const show = () => {
      img.src = src(idx);
      img.alt = `${cur.name} – zdjęcie ${idx + 1}`;
      cap.textContent = `${cur.name} · ${cur.cat} · ${idx + 1} / ${cur.n}`;
      prev.hidden = next.hidden = cur.n < 2;
      new Image().src = src((idx + 1) % cur.n); // preload the next photo
    };
    const open = (a) => {
      const href = a.getAttribute('href');
      cur = { base: href.slice(0, href.lastIndexOf('/') + 1), n: Number(a.dataset.count) || 1, name: a.dataset.name || '', cat: a.dataset.catname || '' };
      pickExt(a);
      idx = Math.max(0, Math.min(cur.n - 1, (parseInt(href.slice(href.lastIndexOf('/') + 1), 10) || 1) - 1)); lastFocus = a;
      lb.hidden = false; document.body.style.overflow = 'hidden';
      show(); close.focus();
    };
    const shut = () => { lb.hidden = true; img.removeAttribute('src'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    const step = (d) => { idx = (idx + d + cur.n) % cur.n; show(); };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-gal]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (!moved) open(a);
    });
    close.addEventListener('click', shut);
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) shut(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') shut();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'Tab') { // keep focus inside the dialog
        const f = [close, prev, next].filter((b) => !b.hidden);
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    let tx = null;
    lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      tx = null;
    });
  }

  /* ===== Home "Wybrane realizacje": drag with the mouse, start on the middle project ===== */
  const gal = $('#gal');
  if (gal) {
    let down = false, x0 = 0, left0 = 0;
    const center = () => {
      const s = $$('.slide', gal);
      const mid = s[Math.floor(s.length / 2)];
      if (mid) gal.scrollLeft = mid.offsetLeft - gal.offsetLeft - (gal.clientWidth - mid.offsetWidth) / 2;
    };
    gal.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; x0 = e.clientX; left0 = gal.scrollLeft;
      e.preventDefault();
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 5) { moved = true; gal.classList.add('drag'); }
      gal.scrollLeft = left0 - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      const keep = gal.scrollLeft;
      gal.classList.remove('drag');
      gal.scrollLeft = keep;
      setTimeout(() => { moved = false; }, 60);
    });
    gal.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true); // a drag is not a click on the project
    center();
    window.addEventListener('resize', center);
  }

  /* ===== Dropdowns in the site's style: each <select> in a form gets a button and a list.
     The select stays in the page (hidden) and is what the form sends; without JavaScript
     the plain select is shown. ===== */
  let ddN = 0;
  const dropdowns = [];
  $$('.lead-form select').forEach((sel) => {
    const label = sel.closest('label');
    const n = ++ddN;
    const box = document.createElement('div');
    const btn = document.createElement('button');
    const list = document.createElement('ul');
    box.className = 'dd';
    btn.type = 'button'; btn.className = 'dd-btn'; btn.id = `dd-b${n}`;
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    list.className = 'dd-list'; list.id = `dd-l${n}`; list.hidden = true; list.tabIndex = -1;
    list.setAttribute('role', 'listbox'); btn.setAttribute('aria-controls', list.id);
    if (label && label.firstChild && label.firstChild.nodeType === 3) { // name the button and list after the label text
      const t = document.createElement('span');
      t.id = `dd-t${n}`;
      t.appendChild(document.createTextNode(label.firstChild.textContent));
      label.replaceChild(t, label.firstChild);
      btn.setAttribute('aria-labelledby', `${t.id} ${btn.id}`);
      list.setAttribute('aria-labelledby', t.id);
    }
    const opts = [...sel.options].map((o, i) => {
      const li = document.createElement('li');
      li.id = `dd-o${n}-${i}`; li.setAttribute('role', 'option'); li.textContent = o.textContent;
      list.appendChild(li);
      return li;
    });
    sel.before(box); box.append(btn, list, sel); // button first: clicking the label text opens the list
    let active = 0;
    const sync = () => {
      btn.textContent = btn.title = sel.options[sel.selectedIndex]?.textContent || ''; // title: full text when it is cut short
      opts.forEach((li, i) => li.setAttribute('aria-selected', String(i === sel.selectedIndex)));
    };
    const setActive = (i) => {
      active = Math.max(0, Math.min(opts.length - 1, i));
      opts.forEach((li, j) => li.classList.toggle('active', j === active));
      list.setAttribute('aria-activedescendant', opts[active].id);
      opts[active].scrollIntoView({ block: 'nearest' });
    };
    const isOpen = () => !list.hidden;
    const close = (focus) => {
      if (!isOpen()) return;
      list.hidden = true; box.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
      if (focus) btn.focus();
    };
    const open = () => {
      dropdowns.forEach((d) => d !== close && d(false));
      list.classList.remove('up');
      list.hidden = false; box.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      const r = list.getBoundingClientRect();
      if (r.bottom > window.innerHeight && btn.getBoundingClientRect().top > r.height + 12) list.classList.add('up');
      setActive(sel.selectedIndex); list.focus({ preventScroll: true });
    };
    const pick = (i) => {
      if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      sync(); close(true);
    };
    dropdowns.push(close);
    btn.addEventListener('click', (e) => { e.preventDefault(); if (isOpen()) close(true); else open(); });
    btn.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
    });
    let typed = '', typedAt = 0;
    list.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowDown') setActive(active + 1);
      else if (k === 'ArrowUp') setActive(active - 1);
      else if (k === 'Home' || k === 'PageUp') setActive(0);
      else if (k === 'End' || k === 'PageDown') setActive(opts.length - 1);
      else if (k === 'Enter' || k === ' ') pick(active);
      else if (k === 'Escape') close(true);
      else if (k === 'Tab') { close(false); btn.focus(); return; }
      else if (k.length === 1) { // jump to an option by its first letters
        typed = (Date.now() - typedAt > 700 ? '' : typed) + k.toLowerCase(); typedAt = Date.now();
        const i = opts.findIndex((li) => li.textContent.toLowerCase().startsWith(typed));
        if (i >= 0) setActive(i);
      } else return;
      e.preventDefault();
    });
    list.addEventListener('click', (e) => {
      e.preventDefault();
      const li = e.target.closest('li');
      if (li) pick(opts.indexOf(li));
    });
    list.addEventListener('mousemove', (e) => { const li = e.target.closest('li'); if (li) setActive(opts.indexOf(li)); });
    list.addEventListener('focusout', (e) => { if (!box.contains(e.relatedTarget)) close(false); });
    sel.addEventListener('change', sync);
    if (sel.form) sel.form.addEventListener('reset', () => setTimeout(sync));
    sync();
  });
  document.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('.dd'))) dropdowns.forEach((c) => c(false)); });

  /* ===== Forms: the form service receives name, email and message, so every other answer
     (phone, type, size, budget…) is written into the message just before sending. ===== */
  const form = $('#lead-form');
  if (form) {
    const SKIP = new Set(['name', 'email', 'message', 'page', '_subject', '_gotcha', 'access_key', 'cf-turnstile-response']);
    const labelOf = (el) => {
      const l = el.closest('label');
      return l ? (l.firstChild.textContent || '').replace(/\*/g, '').trim() : el.name;
    };
    document.addEventListener('submit', (e) => {
      if (e.target !== form) return;
      const lines = [];
      $$('input, select, textarea', form).forEach((el) => {
        if (!el.name || SKIP.has(el.name) || el.type === 'hidden') return;
        if (el.type === 'checkbox') { if (el.checked) lines.push('Zgoda na kontakt: tak'); return; }
        const v = el.value.trim();
        if (v) lines.push(`${labelOf(el)}: ${v}`);
      });
      form.elements.message.value = lines.join('\n');
    }, true); // capture: runs before main.js reads the form
  }
})();
