/* ===========================================================================
   RishitOS — shell runtime
   Boot sequence · window manager · dock · menu bar · desktop icons.
   Pure vanilla JS, no build. App interiors are Phase-1 stubs.
   =========================================================================== */
(() => {
  'use strict';

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MENUBAR_H = 28;
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ---------------------------------------------------------------------- */
  /* App registry                                                           */
  /* ---------------------------------------------------------------------- */
  const APPS = [
    { id: 'about',     name: 'About',       w: 780, h: 540, phase: 'Terminal' },
    { id: 'projects',  name: 'Projects',    w: 760, h: 540, phase: 'Blueprint' },
    { id: 'documents', name: 'Documents',   w: 760, h: 600, phase: 'Preprint' },
    { id: 'recipes',   name: 'Recipe Book', w: 900, h: 600, phase: 'Field notes' },
  ];
  const APP = Object.fromEntries(APPS.map(a => [a.id, a]));
  const DESK_ICONS = ['documents', 'recipes', 'about'];
  /* apps whose interior is a self-contained doc loaded in an iframe */
  const FRAMED = new Set(['about', 'projects', 'documents', 'recipes']);
  /* dock quick-links — each opens its destination directly (no window) */
  const LINKS = [
    { id: 'github',   name: 'GitHub · @R-C101',           href: 'https://github.com/R-C101' },
    { id: 'x',        name: 'X · @rishitchugh',           href: 'https://x.com/chughrishit' },
    { id: 'linkedin', name: 'LinkedIn · in/rishit-chugh',  href: 'https://www.linkedin.com/in/rishit-chugh/' },
    { id: 'email',    name: 'rishitchugh@gmail.com',       href: 'mailto:rishitchugh@gmail.com' },
  ];

  /* ---------------------------------------------------------------------- */
  /* Iconography (authored SVG, palette-locked)                             */
  /* ---------------------------------------------------------------------- */
  const TILES = {
    about:     'linear-gradient(160deg,#22334d,#111b2e)',
    projects:  'linear-gradient(160deg,#0d4bab,#08306b)',
    documents: 'linear-gradient(160deg,#ffffff,#eef2f8)',
    recipes:   'linear-gradient(160deg,#f2913f,#df611a)',
    github:    'linear-gradient(160deg,#3b444f,#1b2027)',
    x:         'linear-gradient(160deg,#34353b,#0a0a0c)',
    linkedin:  'linear-gradient(160deg,#2f80e8,#0a66c2)',
    email:     'linear-gradient(160deg,#f2913f,#df611a)',
    terminal:  'linear-gradient(160deg,#22334d,#111b2e)',
  };
  function glyph(id, s) {
    const open = `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">`;
    switch (id) {
      case 'about':
        // terminal mark, so it reads as "click to open a terminal"
        return `${open}<path d="M5 8l4 4-4 4" stroke="#4fd6ff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16h7" stroke="#f6923c" stroke-width="1.9" stroke-linecap="round"/></svg>`;
      case 'github':
        return `${open}<path fill="#fff" d="M12 1.7A10.3 10.3 0 0 0 8.74 21.8c.51.1.7-.22.7-.49v-1.9c-2.86.62-3.47-1.2-3.47-1.2-.47-1.2-1.14-1.52-1.14-1.52-.93-.64.07-.63.07-.63 1.03.07 1.57 1.06 1.57 1.06.92 1.57 2.4 1.12 2.99.85.09-.66.36-1.12.65-1.37-2.29-.26-4.69-1.14-4.69-5.09 0-1.12.4-2.04 1.06-2.76-.11-.26-.46-1.31.1-2.72 0 0 .86-.28 2.83 1.05a9.8 9.8 0 0 1 5.15 0c1.96-1.33 2.82-1.05 2.82-1.05.56 1.41.21 2.46.1 2.72.66.72 1.06 1.64 1.06 2.76 0 3.96-2.41 4.83-4.7 5.08.37.32.7.95.7 1.92v2.85c0 .28.19.6.71.49A10.3 10.3 0 0 0 12 1.7Z"/></svg>`;
      case 'x':
        return `${open}<path fill="#fff" d="M17.9 3h3.1l-6.77 7.73L22.2 21h-6.2l-4.86-6.35L5.58 21H2.46l7.24-8.27L2 3h6.36l4.39 5.8L17.9 3Zm-1.09 16.13h1.72L7.28 4.78H5.44l11.37 14.35Z"/></svg>`;
      case 'linkedin':
        return `${open}<path fill="#fff" d="M6.94 5A1.94 1.94 0 1 1 3.06 5a1.94 1.94 0 0 1 3.88 0ZM3.3 8.5h3.26V21H3.3V8.5Zm5.32 0h3.13v1.71h.04c.44-.82 1.5-1.69 3.09-1.69 3.3 0 3.91 2.17 3.91 5v6.48h-3.26v-5.74c0-1.37-.02-3.13-1.9-3.13-1.91 0-2.2 1.49-2.2 3.03V21H8.62V8.5Z"/></svg>`;
      case 'email':
        return `${open}<rect x="2.9" y="4.8" width="18.2" height="14.4" rx="2.6" fill="none" stroke="#fff" stroke-width="1.7"/><path d="m3.4 6.2 8.6 6.2 8.6-6.2" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case 'projects':
        return `${open}<g stroke="rgba(255,255,255,.8)" stroke-width="1.1"><path d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16"/></g><path d="M5.5 18.5 18.5 18.5 18.5 6.5Z" fill="rgba(242,107,29,.92)" stroke="#fff" stroke-width="1.1" stroke-linejoin="round"/></svg>`;
      case 'documents':
        return `${open}<path d="M6.5 3.2h6.6L17.5 7.4V20.8H6.5Z" fill="#fff" stroke="#0b5fd6" stroke-width="1.5" stroke-linejoin="round"/><path d="M13.1 3.2v4.2h4.4" fill="#fff2e8" stroke="#f26b1d" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 12h5.6M9 14.8h5.6M9 17.6h3.4" stroke="#0b5fd6" stroke-width="1.25" stroke-linecap="round"/></svg>`;
      case 'recipes':
        return `${open}<rect x="5.2" y="3.6" width="13.6" height="16.8" rx="1.6" fill="#fff8ee" stroke="#ffffff" stroke-width="1.3"/><path d="M8.4 8.6h7M8.4 11.4h7M8.4 14.2h5" stroke="#df611a" stroke-width="1.15" stroke-linecap="round"/><rect x="13.4" y="2.6" width="2.5" height="18.8" fill="rgba(20,32,46,.5)"/></svg>`;
      case 'contact':
        return `${open}<rect x="3.4" y="6" width="17.2" height="12" rx="2.2" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M4.2 7.2 12 13l7.8-5.8" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18.4" cy="6.4" r="2.7" fill="#f26b1d" stroke="#fff" stroke-width="1"/></svg>`;
      case 'terminal':
        return `${open}<path d="M5 8l4 4-4 4" stroke="#4fd6ff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16h7" stroke="#f6923c" stroke-width="1.9" stroke-linecap="round"/></svg>`;
      case 'mark':
        return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#fff" stroke-width="1.7"/><path d="M12 4.5v15M4.5 12h15" stroke="#fff" stroke-width="1.1" opacity=".55"/><circle cx="12" cy="12" r="2.3" fill="#f6923c"/></svg>`;
      default: return '';
    }
  }
  function tile(id, size, radius) {
    return `<span style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${TILES[id]};display:grid;place-items:center;box-shadow:var(--shadow-tile);overflow:hidden;flex:0 0 auto">${glyph(id, Math.round(size * 0.56))}</span>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Menu bar                                                               */
  /* ---------------------------------------------------------------------- */
  let appNameEl, clockEl;
  function buildMenubar() {
    const bar = $('#menubar');
    const mark = el('span', 'mb-mark', glyph('mark', 12));
    appNameEl = el('span', 'mb-app', 'RishitOS');
    bar.append(mark, appNameEl);
    ['File', 'View', 'Window', 'Help'].forEach(m => bar.append(el('span', 'mb-menu', m)));
    bar.append(el('span', 'mb-spacer'));

    const status = el('div', 'mb-status');
    status.innerHTML =
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#263447" stroke-width="1.8" stroke-linecap="round"><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8 15.5a5 5 0 0 1 8 0"/><circle cx="12" cy="19" r="1.1" fill="#263447" stroke="none"/></svg>` +
      `<svg width="20" height="16" viewBox="0 0 26 16" fill="none" stroke="#263447" stroke-width="1.4"><rect x="1" y="3" width="21" height="10" rx="2.6"/><rect x="3" y="5" width="14" height="6" rx="1.2" fill="#263447" stroke="none"/><path d="M24 6v4" stroke-linecap="round"/></svg>`;
    clockEl = el('span', 'mb-clock');
    status.append(clockEl);
    bar.append(status);
    tickClock();
    setInterval(tickClock, 15000);
  }
  function tickClock() {
    const d = new Date();
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const date = d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
    clockEl.innerHTML = `<span class="mb-date">${date}</span>${time}`;
  }

  /* ---------------------------------------------------------------------- */
  /* Dock                                                                   */
  /* ---------------------------------------------------------------------- */
  const dockEls = {};
  function buildDock() {
    const dock = $('#dock');
    APPS.forEach(a => {
      const item = el('button', 'dock-item');
      item.type = 'button';
      item.setAttribute('aria-label', a.name);
      item.innerHTML = tile(a.id, 50, 14) +
        `<span class="tip">${a.name}</span><span class="run"></span>`;
      item.addEventListener('click', () => toggleApp(a.id));
      dock.append(item);
      dockEls[a.id] = item;
    });
    dock.append(el('span', 'dock-sep'));
    LINKS.forEach(l => {
      const item = el('button', 'dock-item link');
      item.type = 'button';
      item.setAttribute('aria-label', 'Open ' + l.name);
      item.innerHTML = tile(l.id, 50, 14) + `<span class="tip">${l.name}</span>`;
      item.addEventListener('click', () => {
        if (l.href.startsWith('mailto:')) location.href = l.href;
        else window.open(l.href, '_blank', 'noopener');
      });
      dock.append(item);
    });
  }
  function setRunning(id, on) { dockEls[id]?.classList.toggle('running', on); }

  /* ---------------------------------------------------------------------- */
  /* Desktop icons                                                          */
  /* ---------------------------------------------------------------------- */
  function buildDeskIcons() {
    const host = $('#desk-icons');
    DESK_ICONS.forEach(id => {
      const a = APP[id];
      const icon = el('div', 'desk-icon');
      icon.tabIndex = 0;
      icon.innerHTML =
        `<span class="di-glyph" style="background:${TILES[id]}">${glyph(id, 26)}</span>` +
        `<span class="di-label">${a.name}</span>`;
      icon.addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('.desk-icon.sel').forEach(n => n.classList.remove('sel'));
        icon.classList.add('sel');
      });
      icon.addEventListener('dblclick', () => openApp(id));
      icon.addEventListener('keydown', e => { if (e.key === 'Enter') openApp(id); });
      host.append(icon);
    });
    $('#desktop').addEventListener('pointerdown', e => {
      if (e.target.closest('.win') || e.target.closest('.desk-icon')) return;
      document.querySelectorAll('.desk-icon.sel').forEach(n => n.classList.remove('sel'));
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Window manager                                                         */
  /* ---------------------------------------------------------------------- */
  const wins = new Map();
  let zTop = 100;

  function workspace() {
    const dockRect = $('#dock').getBoundingClientRect();
    return {
      x: 8, y: MENUBAR_H + 8,
      w: innerWidth - 16,
      h: innerHeight - MENUBAR_H - (innerHeight - dockRect.top) - 16,
    };
  }
  function place(win) {
    win.el.style.transform = `translate3d(${win.x}px,${win.y}px,0)`;
    win.el.style.width = win.w + 'px';
    win.el.style.height = win.h + 'px';
  }

  /* window interior: an iframe-hosted app world, or a stub fallback */
  function bodyHTML(id) {
    if (FRAMED.has(id)) {
      return `<div class="win-body framed loading">
        <div class="frame-spin"><i></i></div>
        <iframe class="app-frame" title="${APP[id].name}" src="apps/${id}/index.html"></iframe>
        <div class="frame-shield"></div>
      </div>`;
    }
    return `<div class="win-body">${appBody(id)}</div>`;
  }

  function toggleApp(id) {
    const win = wins.get(id);
    if (!win) return openApp(id);
    if (win.min) return restoreWin(win);
    if (win.el.style.zIndex == zTop) minimizeWin(win);   // front window → minimise
    else focusWin(win);
  }

  function openApp(id) {
    let win = wins.get(id);
    if (win) { if (win.min) restoreWin(win); focusWin(win); return; }

    const a = APP[id];
    const node = el('div', 'win');
    node.dataset.app = id;
    const w = Math.min(a.w, innerWidth - 40);
    const h = Math.min(a.h, innerHeight - MENUBAR_H - 110);
    const n = wins.size;
    const x = clamp(Math.round((innerWidth - w) / 2) + n * 26 - 40, 12, innerWidth - w - 12);
    const y = clamp(MENUBAR_H + 46 + n * 24, MENUBAR_H + 12, innerHeight - 160);

    node.innerHTML =
      `<div class="win-bar">
         <div class="traffic">
           <button class="tl c" aria-label="Close">${tlGlyph('c')}</button>
           <button class="tl m" aria-label="Minimise">${tlGlyph('m')}</button>
           <button class="tl f" aria-label="Maximise">${tlGlyph('f')}</button>
         </div>
         <div class="win-title">${a.name}</div>
       </div>
       ${bodyHTML(id)}
       <span class="win-rz e"></span><span class="win-rz s"></span><span class="win-rz se"></span>`;

    win = { id, el: node, x, y, w, h, min: false, max: false, prev: null };
    wins.set(id, win);
    $('#windows').append(node);
    place(win);
    setRunning(id, true);

    $('.tl.c', node).addEventListener('click', e => { e.stopPropagation(); closeWin(win); });
    $('.tl.m', node).addEventListener('click', e => { e.stopPropagation(); minimizeWin(win); });
    $('.tl.f', node).addEventListener('click', e => { e.stopPropagation(); toggleMax(win); });
    node.addEventListener('pointerdown', () => focusWin(win), true);
    dragify(win);
    resizify(win);
    focusWin(win);

    /* reveal the app world once its iframe has painted */
    const frame = $('.app-frame', node);
    if (frame) {
      const reveal = () => {
        frame.classList.add('ready');
        const body = $('.win-body', node);
        body?.classList.remove('loading');
        $('.frame-spin', node)?.remove();
      };
      frame.addEventListener('load', reveal, { once: true });
      // safety net if load fired before the listener attached
      setTimeout(() => { if (!frame.classList.contains('ready')) reveal(); }, 1600);
    }

    node.animate(
      [{ transform: `translate3d(${x}px,${y + 14}px,0) scale(.94)`, opacity: 0 },
       { transform: `translate3d(${x}px,${y}px,0) scale(1)`, opacity: 1 }],
      { duration: REDUCED ? 0 : 320, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  function focusWin(win) {
    if (win.min) return;
    win.el.style.zIndex = ++zTop;
    wins.forEach(w => w.el.classList.toggle('focused', w === win));
    appNameEl.textContent = APP[win.id].name;
  }
  function frontWin() {
    let top = null;
    wins.forEach(w => { if (!w.min && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w; });
    return top;
  }
  function closeWin(win) {
    win.el.animate([{ opacity: 1, transform: win.el.style.transform + ' scale(1)' },
                    { opacity: 0, transform: win.el.style.transform + ' scale(.94)' }],
      { duration: REDUCED ? 0 : 180, easing: 'ease-in' }).onfinish = () => {
        win.el.remove(); wins.delete(win.id); setRunning(win.id, false);
        const f = frontWin(); if (f) focusWin(f); else appNameEl.textContent = 'RishitOS';
      };
  }
  function minimizeWin(win) {
    const d = dockEls[win.id].getBoundingClientRect();
    const tx = d.left + d.width / 2 - (win.x + win.w / 2);
    const ty = d.top + d.height / 2 - (win.y + win.h / 2);
    win.min = true;
    win.el.animate(
      [{ transform: `translate3d(${win.x}px,${win.y}px,0) scale(1)`, opacity: 1 },
       { transform: `translate3d(${win.x + tx}px,${win.y + ty}px,0) scale(.12)`, opacity: 0 }],
      { duration: REDUCED ? 0 : 300, easing: 'cubic-bezier(.5,0,.5,1)' }).onfinish = () => {
        win.el.style.visibility = 'hidden';
        const f = frontWin(); if (f) focusWin(f); else appNameEl.textContent = 'RishitOS';
      };
  }
  function restoreWin(win) {
    win.min = false;
    win.el.style.visibility = 'visible';
    const d = dockEls[win.id].getBoundingClientRect();
    const tx = d.left + d.width / 2 - (win.x + win.w / 2);
    const ty = d.top + d.height / 2 - (win.y + win.h / 2);
    win.el.animate(
      [{ transform: `translate3d(${win.x + tx}px,${win.y + ty}px,0) scale(.12)`, opacity: 0 },
       { transform: `translate3d(${win.x}px,${win.y}px,0) scale(1)`, opacity: 1 }],
      { duration: REDUCED ? 0 : 300, easing: 'cubic-bezier(.16,1,.3,1)' });
    focusWin(win);
  }
  function toggleMax(win) {
    win.el.classList.add('maximizing');
    if (!win.max) {
      win.prev = { x: win.x, y: win.y, w: win.w, h: win.h };
      const ws = workspace();
      Object.assign(win, ws); win.max = true;
    } else {
      Object.assign(win, win.prev); win.max = false;
    }
    place(win);
    setTimeout(() => win.el.classList.remove('maximizing'), 300);
  }

  /* drag by title bar */
  function dragify(win) {
    const bar = $('.win-bar', win.el);
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('.tl') || win.max) return;
      e.preventDefault();
      bar.setPointerCapture(e.pointerId);
      const sx = e.clientX, sy = e.clientY, ox = win.x, oy = win.y;
      const move = ev => {
        win.x = clamp(ox + ev.clientX - sx, -(win.w - 130), innerWidth - 130);
        win.y = clamp(oy + ev.clientY - sy, MENUBAR_H, innerHeight - 44);
        win.el.style.transform = `translate3d(${win.x}px,${win.y}px,0)`;
      };
      const up = ev => {
        bar.releasePointerCapture(e.pointerId);
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
    });
  }
  /* resize via edge/corner handles */
  function resizify(win) {
    win.el.querySelectorAll('.win-rz').forEach(h => {
      const axis = h.classList.contains('se') ? 'both' : h.classList.contains('e') ? 'x' : 'y';
      h.addEventListener('pointerdown', e => {
        if (win.max) return;
        e.preventDefault(); e.stopPropagation();
        h.setPointerCapture(e.pointerId);
        const sx = e.clientX, sy = e.clientY, ow = win.w, oh = win.h;
        const move = ev => {
          if (axis !== 'y') win.w = clamp(ow + ev.clientX - sx, 320, innerWidth - win.x - 8);
          if (axis !== 'x') win.h = clamp(oh + ev.clientY - sy, 200, innerHeight - win.y - 8);
          win.el.style.width = win.w + 'px';
          win.el.style.height = win.h + 'px';
        };
        const up = () => {
          h.releasePointerCapture(e.pointerId);
          h.removeEventListener('pointermove', move);
          h.removeEventListener('pointerup', up);
        };
        h.addEventListener('pointermove', move);
        h.addEventListener('pointerup', up);
      });
    });
  }

  function tlGlyph(k) {
    if (k === 'c') return `<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5"/></svg>`;
    if (k === 'm') return `<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M1.5 4h5"/></svg>`;
    return `<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M4 1.5v5M1.5 4h5"/></svg>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Phase-1 stub interiors                                                 */
  /* ---------------------------------------------------------------------- */
  function appBody(id) {
    if (id === 'about') {
      return `<div class="stub">
        <span class="stub-glyph" style="background:${TILES.about};width:84px;height:84px">${glyph('about', 40)}</span>
        <h2 style="font-size:27px">Rishit Chugh</h2>
        <p style="color:var(--ink);max-width:32ch"><strong>ML Engineer</strong> — real-time sports analytics &amp; LLM research.</p>
        <span class="stub-tag">about.app · full experience in Phase 2</span>
      </div>`;
    }
    const a = APP[id];
    return `<div class="stub">
      <span class="stub-glyph" style="background:${TILES[id]}">${glyph(id, 34)}</span>
      <h2>${a.name}</h2>
      <p>This window is ready. Its interior gets designed next.</p>
      <span class="stub-tag">${a.phase}</span>
    </div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Boot sequence                                                          */
  /* ---------------------------------------------------------------------- */
  const BOOT = [
    ['RishitOS 2.0 — blueprint build', 'dim'],
    ['mounting /apps ............. about · experience · projects', 'ok'],
    ['loading /documents ......... RECAP · résumé', 'ok'],
    ['indexing /recipes .......... 55 entries', 'ok'],
    ['starting window server .....', 'ok'],
    ['calibrating dock ...........', 'ok'],
    ['ready.', 'dim'],
  ];
  let booted = false, bootTimer = null;
  function buildBoot() {
    const boot = $('#boot');
    boot.innerHTML =
      `<div class="boot-mark">${glyph('mark', 78)}</div>
       <div class="boot-title">RishitOS</div>
       <div class="boot-log" id="boot-log"></div>
       <div class="boot-prog"><i id="boot-bar"></i></div>
       <div class="boot-skip">press any key to skip</div>`;
    const log = $('#boot-log'), bar = $('#boot-bar');
    const line = (t, cls) => cls === 'ok'
      ? `<span class="ok">[ ok ]</span> ${t}` : `<span class="dim">${t}</span>`;

    if (REDUCED) {
      log.innerHTML = BOOT.map(([t, c]) => line(t, c)).join('\n');
      bar.style.transform = 'scaleX(1)';
      bootTimer = setTimeout(finishBoot, 700);
    } else {
      let i = 0;
      const step = () => {
        if (i >= BOOT.length) { bootTimer = setTimeout(finishBoot, 340); return; }
        const [t, c] = BOOT[i];
        log.innerHTML = BOOT.slice(0, i + 1).map(([tt, cc]) => line(tt, cc)).join('\n')
          + '<span class="caret"></span>';
        bar.style.transform = 'scaleX(' + ((i + 1) / BOOT.length).toFixed(3) + ')';
        i++;
        bootTimer = setTimeout(step, 210);
      };
      step();
    }
    addEventListener('keydown', skipBoot);
    boot.addEventListener('click', skipBoot);
  }
  function skipBoot() { finishBoot(); }
  function finishBoot() {
    if (booted) return; booted = true;
    clearTimeout(bootTimer);
    removeEventListener('keydown', skipBoot);
    const boot = $('#boot');
    $('#boot-bar').style.transform = 'scaleX(1)';
    boot.classList.add('gone');
    document.body.classList.remove('booting');
    setTimeout(() => {
      boot.remove();
      if (!document.body.classList.contains('small')) launchInitial();
    }, REDUCED ? 0 : 520);
  }

  /* Deep-link: #projects (or #projects,documents) opens those apps on load;
     otherwise the desktop greets you with About. */
  function launchInitial() {
    const ids = decodeURIComponent(location.hash.slice(1))
      .split(',').map(s => s.trim()).filter(id => APP[id]);
    if (ids.length) ids.forEach(openApp);
    else openApp('about');
  }

  /* ---------------------------------------------------------------------- */
  /* Small-screen guard                                                     */
  /* ---------------------------------------------------------------------- */
  function checkSize() {
    document.body.classList.toggle('small', innerWidth < 820);
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                   */
  /* ---------------------------------------------------------------------- */
  function init() {
    buildMenubar();
    buildDock();
    buildDeskIcons();
    checkSize();
    addEventListener('resize', checkSize);
    $('#sn-enter')?.addEventListener('click', () => {
      document.body.classList.remove('small');
      if (!wins.size) openApp('about');
    });
    buildBoot();
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
  else init();
})();
