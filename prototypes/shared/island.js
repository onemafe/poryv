// Общий код прототипов экрана «Порыва».
// Макет выбирается по форме окна и способу ввода; остров вписывается в зону, свободную от панелей
// (панели помечены data-block). Поле ветра — грубая оценка без симуляции, только чтобы картинка была похожа на игру.
// Управление:
//  • фигуру тянут из запаса: над панелью за пальцем едет плоская иконка, над полем появляется объёмная фигура (висит над пальцем);
//  • поставленная фигура остаётся выделенной: приподнята, рядом кнопки ↻ (повернуть) и ✥ (тянуть — перенести);
//  • выделенную можно оставить в красном (там, где не встаёт) — она ждёт поворота или переноса; отпустить её в красном нельзя:
//    тап мимо, выбор другой фигуры или «Ветер!» — фигура вспыхивает и трясётся;
//  • пока тащишь фигуру, внизу появляется корзина — так фигуру убирают;
//  • свайп по полю крутит остров (без доводки), даже если палец задел невыделенную фигуру; два пальца или колесо — приблизить.
(function () {
  'use strict';
  const B = 10, S = 3, WIND = 22, RUN_T = 6, LIFT = 64, Q90 = Math.PI / 2, SEL_Z = 0.3;
  const CROP = 1.12;  // по ширине остров может выходить за край на 12%: срезаются пустые боковые углы ромба и хвосты стрелок
  const FZ = 1.4;     // во сколько раз остров приближается, пока несёшь фигуру
  const TYPES = {
    hut:    { name: 'Хижина',  len: 1, h: 0.9,  kind: 'house', limit: 14, k: 0.8, color: '#f3ead8', roof: '#c4553d' },
    house:  { name: 'Дом',     len: 2, h: 1.1,  kind: 'house', limit: 15, k: 0.8, color: '#efd9a7', roof: '#5f7fa8' },
    tower:  { name: 'Башня',   len: 1, h: 2.6,  kind: 'house', limit: 22, k: 0.85, color: '#d8d2e6', roof: '#3f4a6b' },
    fence:  { name: 'Забор',   len: 3, h: 0.45, kind: 'fence', limit: 26, k: 0.8, thin: 0.35, color: '#b98a5a', roof: '#8a6240' },
    wattle: { name: 'Плетень', len: 3, h: 0.75, kind: 'fence', k: 0.5, thin: 0.38, color: '#a7834f', roof: '#7a5d36' },
    tree:   { name: 'Дерево',  len: 1, h: 1.4,  kind: 'tree',  k: 0.45, color: '#5f9a5a', roof: '#3f7a45' },
    rock:   { name: 'Скала',   len: 1, h: 0.8,  kind: 'rock',  k: 0.65, color: '#9aa0a6', roof: '#b4b9be' },
  };
  const limText = T => (T.limit ? `до ${T.limit} м/с` : 'не ломается');
  const FIXED = [
    { type: 'hut', x: 6, y: 2, rot: 0 }, { type: 'hut', x: 6, y: 7, rot: 0 }, { type: 'house', x: 7, y: 4, rot: 1 },
    { type: 'rock', x: 1, y: 1, rot: 0 }, { type: 'rock', x: 1, y: 8, rot: 0 }, { type: 'tree', x: 9, y: 0, rot: 0 },
  ];
  FIXED.forEach(p => (p.fixed = true));
  const INV_ALL = { fence: 2, wattle: 1, tree: 2, hut: 1, house: 1, tower: 1 };
  // проверенная расстановка: её ставят «Подсказка» и фаза «Победа» в панели прототипа
  const SOLUTION = [{ type: 'fence', x: 4, y: 1, rot: 1 }, { type: 'fence', x: 4, y: 6, rot: 1 }, { type: 'wattle', x: 5, y: 4, rot: 1 },
    { type: 'tree', x: 5, y: 7, rot: 0 }, { type: 'tree', x: 5, y: 8, rot: 0 }];
  const PHASES = [['build', 'Расстановка'], ['talk', 'Реплика'], ['run', 'Прогон'], ['win', 'Победа'], ['lose', 'Поражение']];
  const VARIANTS = [
    { file: 'a-dock.html', key: 'A', name: 'Док' },
    { file: 'b-thumb.html', key: 'B', name: 'Под пальцем' },
    { file: 'c-journal.html', key: 'C', name: 'Журнал' },
    { file: 'd-pier.html', key: 'D', name: 'Пристань' },
  ];
  const LAYOUTS = { portrait: 'телефон вертикально', short: 'низкое окно', wide: 'широкое окно' };
  const C = { slab: '#314a66', slab2: '#26394f', ground: '#ece5d3', ground2: '#e2dac6', grid: 'rgba(40,52,72,0.13)', accent: '#f7c21b', ink: '#17212c', ok: '#23955e', bad: '#d63b45', stone: '#8f8b80', stoneTop: '#aaa69a' };
  const KEEPER = '<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" fill="#c6d3df"/><path d="M5 42Q21 30 37 42Z" fill="#f7c21b"/><circle cx="21" cy="23" r="9.5" fill="#f1c9a5"/><path d="M8 17.5Q21 21 34 17.5Q33 15 30 14.5Q28 5 21 5Q14 5 12 14.5Q9 15 8 17.5Z" fill="#f7c21b"/><g fill="none" stroke="#36506b" stroke-width="1"><circle cx="17.5" cy="23.5" r="2.6"/><circle cx="24.5" cy="23.5" r="2.6"/><path d="M20.1 23.5h1.8"/></g><circle cx="17.5" cy="23.5" r="1.1" fill="#17212c"/><circle cx="24.5" cy="23.5" r="1.1" fill="#17212c"/><path d="M15.5 28.3Q21 25.8 26.5 28.3Q21 30.2 15.5 28.3Z" fill="#8a8f96"/></svg>';
  const ICON_ROT = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.5H15"/></svg>';
  const ICON_MOVE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/></svg>';
  const ICON_OK = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
  const VIEWS = { diamond: { base: 0, name: 'Ромб' }, straight: { base: -Math.PI / 4, name: 'Прямо' } };
  const TILTS = { game: { k: 0.25, name: 'Как в игре' }, steep: { k: 0.34, name: 'Круче' } };

  const html = document.documentElement;
  const st = {
    phase: 'build', view: 'diamond', tilt: 'game', ang: 0, angT: 0, zoom: 1, panX: 0, panY: 0, nInv: 4,
    placed: [],      // свои фигуры на поле (выделенная — тоже здесь)
    selected: null,  // выделенная фигура: приподнята, может стоять «в красном» (p.bad)
    sel: null,       // тип, выбранный тапом в запасе: следующий тап по клетке ставит его
    drag: null,      // pending-new | pending-sel | pending-cam → new | move | cam
    t: 0, heat: true, showFree: false, dirty: true, clock: 0, shakeT: -9,
    hist: [],        // снимки расстановки для «Отменить»
    // приближение при переносе: fz — текущий множитель, fp — точка на экране, вокруг которой приближаем (едет за фигурой)
    autoZoom: true, fz: 1, fp: [0, 0],
    scene: true,     // полупрозрачные море и тучи вокруг острова (пункт под вопросом — выключается одним флагом)
    paused: false,   // открыто меню паузы: время стоит, поле под размытием
  };
  const view = { w: 0, h: 0, dpr: 1, tw: 20, hz: 12, k: 0.25, cos: 1, sin: 0, ox: 0, oy: 0, free: null, T: null };
  const n = B * S, field = new Float32Array(n * n), solid = new Uint8Array(n * n);
  const listeners = {};
  let ctx, V = view, frameEl, cv, fctx, scv, sctx, cfg, menuEl, pauseEl, talkEl, resultEl, toastEl, protoEl, protoTab, chipsEl, trashEl, dragIconEl;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const emit = (ev, d) => (listeners[ev] || []).forEach(f => f(d));
  const hzFor = (tw, k) => tw * 0.716 * Math.sqrt(1 - 4 * k * k);

  // ---------- фигуры и поле ----------
  const pieces = () => FIXED.concat(st.placed);
  const invMax = () => Object.fromEntries(Object.entries(INV_ALL).slice(0, st.nInv));
  const left = t => (invMax()[t] || 0) - st.placed.filter(p => p.type === t).length;
  function cells(p) { const L = TYPES[p.type].len, out = []; for (let i = 0; i < L; i++) out.push(p.rot ? [p.x, p.y + i] : [p.x + i, p.y]); return out; }
  const centerOff = p => { const m = Math.floor((TYPES[p.type].len - 1) / 2); return p.rot ? [0, m] : [m, 0]; };
  const defaultRot = t => (TYPES[t].kind === 'fence' ? 1 : 0); // забор сразу встаёт поперёк ветра
  function shapeBox(p) {
    const T = TYPES[p.type], L = T.len;
    let x0 = p.x, y0 = p.y, x1 = p.x + (p.rot ? 1 : L), y1 = p.y + (p.rot ? L : 1);
    if (T.thin) { if (p.rot) { x0 += T.thin; x1 -= T.thin; } else { y0 += T.thin; y1 -= T.thin; } }
    else { const k = T.kind === 'tree' ? 0.25 : T.kind === 'rock' ? 0.15 : 0.08; x0 += k; y0 += k; x1 -= k; y1 -= k; }
    return { x0, y0, x1, y1 };
  }
  function blocked(p, ignore) {
    const occ = new Set(); for (const q of pieces()) if (q !== ignore) for (const [x, y] of cells(q)) occ.add(x + ',' + y);
    return cells(p).some(([x, y]) => x < 0 || y < 0 || x >= B || y >= B || occ.has(x + ',' + y));
  }
  const counts = p => !(p.bad && p === st.selected); // фигура «в красном» на ветер не влияет
  function computeField() {
    const obs = pieces().filter(counts).map(p => {
      const T = TYPES[p.type], b = shapeBox(p);
      return { cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, hx: (b.x1 - b.x0) / 2, hy: (b.y1 - b.y0) / 2, k: T.k, L: 1.2 + 3.2 * T.h };
    });
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const px = (i + 0.5) / S, py = (j + 0.5) / S;
      let f = 1, s = 0;
      for (const o of obs) {
        const dx = px - o.cx, ly = Math.abs(py - o.cy) - o.hy, a = dx - o.hx;
        if (Math.abs(dx) < o.hx && ly < 0) { s = 1; break; }
        if (a > 0 && a < o.L && ly < 0.35) f *= 1 - o.k * (1 - a / o.L) * (ly < 0 ? 1 : 1 - ly / 0.35);
        else if (ly >= 0.35 && ly < 1.4 && a > -2 * o.hx - 0.8 && a < o.L * 0.6) f *= 1 + 0.12 * (1 - (ly - 0.35) / 1.05);
        else if (a < -2 * o.hx && a > -2 * o.hx - 0.7 && ly < 0) f *= 0.85;
      }
      field[j * n + i] = f; solid[j * n + i] = s;
    }
    st.dirty = true;
  }
  function fAt(x, y) {
    if (x < 0 || y < 0 || x >= B || y >= B) return 1;
    const k = Math.floor(y * S) * n + Math.floor(x * S);
    return solid[k] ? 0 : field[k];
  }
  function loads() {
    return pieces().filter(p => TYPES[p.type].kind === 'house' && counts(p)).map(p => {
      const T = TYPES[p.type], b = shapeBox(p), px = b.x0 - 0.2;
      const ms = WIND * Math.max(fAt(px, b.y0 + 0.15), fAt(px, (b.y0 + b.y1) / 2), fAt(px, b.y1 - 0.15));
      return { p, T, ms, ok: ms <= T.limit };
    });
  }

  // ---------- отмена: снимок до действия, в историю — только если расстановка изменилась ----------
  const snapshot = () => JSON.stringify({ p: st.placed.map(({ type, x, y, rot }) => ({ type, x, y, rot })), s: st.placed.indexOf(st.selected) });
  function record(before) { if (before !== snapshot()) { st.hist.push(before); if (st.hist.length > 60) st.hist.shift(); } updateUndo(); }
  function undo() {
    const s = st.hist.pop(); if (!s) return;
    const o = JSON.parse(s);
    st.placed = o.p.map(p => ({ ...p })); st.selected = o.s >= 0 ? st.placed[o.s] : null; st.sel = null;
    for (const p of st.placed) p.bad = blocked(p, p);
    computeField(); updateUI(); updateUndo();
  }
  function updateUndo() { for (const b of $$('[data-act="undo"]')) b.disabled = !st.hist.length || st.phase !== 'build'; }

  // ---------- проекция и рисование ----------
  function R(x, y) { const dx = x - B / 2, dy = y - B / 2; return [B / 2 + dx * V.cos - dy * V.sin, B / 2 + dx * V.sin + dy * V.cos]; }
  function Qr(X, Y, z) { return [V.ox + (X - Y) * V.tw / 2, V.oy + (X + Y) * V.tw * V.k - z * V.hz]; }
  function Q(x, y, z) { const r = R(x, y); return Qr(r[0], r[1], z); }
  function unQ(sx, sy) { // экран → точка доски на уровне земли
    const a = (sx - V.ox) / (V.tw / 2), b = (sy - V.oy) / (V.tw * V.k);
    const dx = (a + b) / 2 - B / 2, dy = (b - a) / 2 - B / 2;
    return [B / 2 + dx * V.cos + dy * V.sin, B / 2 - dx * V.sin + dy * V.cos];
  }
  const shadeCache = {};
  function shade(hex, k) {
    k = Math.round(k * 100) / 100; const key = hex + k; if (shadeCache[key]) return shadeCache[key];
    const v = parseInt(hex.slice(1), 16), c = [v >> 16, (v >> 8) & 255, v & 255].map(x => Math.max(0, Math.min(255, Math.round(x * k))));
    return (shadeCache[key] = `rgb(${c.join(',')})`);
  }
  const RAMP = [[0, [61, 127, 184]], [5.9, [70, 169, 166]], [10.9, [156, 207, 90]], [14, [240, 201, 60]], [17.9, [240, 138, 58]], [22.1, [216, 52, 76]], [28, [156, 42, 143]]];
  function ramp(ms, a) {
    ms = Math.max(0, Math.min(28, ms)); let i = 1;
    while (i < RAMP.length - 1 && RAMP[i][0] < ms) i++;
    const [m0, c0] = RAMP[i - 1], [m1, c1] = RAMP[i], t = (ms - m0) / (m1 - m0);
    return `rgba(${c0.map((c, k) => Math.round(c + (c1[k] - c) * t)).join(',')},${a})`;
  }
  function poly(pts, fill, stroke, lw) {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
  }
  function circle(c, r, fill) { ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 7); ctx.fillStyle = fill; ctx.fill(); }
  // призма на прямоугольнике доски при любом угле камеры: стенки, которые смотрят на зрителя, и крыша
  function box(x0, y0, x1, y1, z0, z1, side, top) {
    const c = [R(x0, y0), R(x1, y0), R(x1, y1), R(x0, y1)], cx = (c[0][0] + c[2][0]) / 2, cy = (c[0][1] + c[2][1]) / 2;
    for (let i = 0; i < 4; i++) {
      const a = c[i], b = c[(i + 1) % 4];
      let nx = (a[0] + b[0]) / 2 - cx, ny = (a[1] + b[1]) / 2 - cy; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      if (nx + ny <= 0.01) continue;
      poly([Qr(a[0], a[1], z0), Qr(b[0], b[1], z0), Qr(b[0], b[1], z1), Qr(a[0], a[1], z1)], shade(side, 0.86 + 0.06 * (ny - nx)));
    }
    poly(c.map(p => Qr(p[0], p[1], z1)), top || side);
  }
  // закреплённые постройки — тусклее своих: цвет наполовину смешан с серым
  const dimCache = {};
  function dim(hex) {
    if (dimCache[hex]) return dimCache[hex];
    const v = parseInt(hex.slice(1), 16), g = [0x9a, 0xa1, 0xa8], t = 0.45;
    const c = [v >> 16, (v >> 8) & 255, v & 255].map((x, i) => Math.round(x + (g[i] - x) * t));
    return (dimCache[hex] = '#' + c.map(x => x.toString(16).padStart(2, '0')).join(''));
  }
  function drawPiece(p, zl = 0) {
    const T0 = TYPES[p.type], b = shapeBox(p);
    const T = p.fixed && T0.kind !== 'rock' ? { ...T0, color: dim(T0.color), roof: dim(T0.roof) } : T0;
    if (T.kind === 'house') {
      box(b.x0, b.y0, b.x1, b.y1, zl, zl + T.h * 0.66, T.color, shade(T.color, 1.04));
      box(b.x0 - 0.04, b.y0 - 0.04, b.x1 + 0.04, b.y1 + 0.04, zl + T.h * 0.66, zl + T.h, T.roof, shade(T.roof, 1.12));
    } else if (T.kind === 'tree') {
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
      box(cx - 0.06, cy - 0.06, cx + 0.06, cy + 0.06, zl, zl + 0.55, '#7a5a3a');
      const c = Q(cx, cy, zl + 0.95);
      circle(c, V.tw * 0.3, T.color); circle([c[0] - V.tw * 0.07, c[1] - V.tw * 0.08], V.tw * 0.16, shade(T.color, 1.18));
    } else if (T.kind === 'rock') box(b.x0, b.y0, b.x1, b.y1, zl, zl + T.h * 0.7, T.color, T.roof);
    else box(b.x0, b.y0, b.x1, b.y1, zl, zl + T.h, T.color, T.roof);
  }
  // силуэт фигуры на экране — для попадания пальцем и для красной вспышки
  function hullOf(p, zl, pad) {
    const h = Math.max(TYPES[p.type].h, 0.5), pts = [];
    for (const [x, y] of cells(p)) for (const [a, b] of [[x - pad, y - pad], [x + 1 + pad, y - pad], [x + 1 + pad, y + 1 + pad], [x - pad, y + 1 + pad]]) pts.push(Q(a, b, zl), Q(a, b, zl + h));
    return convexHull(pts);
  }
  function cellPoly(x, y, z) { return [Q(x, y, z), Q(x + 1, y, z), Q(x + 1, y + 1, z), Q(x, y + 1, z)]; }
  function depthKey(p) { const b = shapeBox(p), r = R((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2); return r[0] + r[1]; }
  function tag(c, txt, bad) {
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(txt).width + 10;
    ctx.fillStyle = 'rgba(23,33,44,0.84)'; ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(c[0] - w / 2, c[1] - 9, w, 18, 6); else ctx.rect(c[0] - w / 2, c[1] - 9, w, 18);
    ctx.fill(); ctx.fillStyle = bad ? '#ff9a9a' : '#fff'; ctx.fillText(txt, c[0], c[1] + 0.5);
  }
  function houseTag(p, zl, showLoads, L) {
    const T = TYPES[p.type], b = shapeBox(p), c = Q((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, zl + T.h + 0.5);
    if (showLoads && L) {
      tag([c[0], c[1] - 6], `${Math.round(L.ms)} / ${T.limit} м/с`, !L.ok);
      const w = Math.max(28, V.tw * 0.85), h = 4;
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(c[0] - w / 2 - 1, c[1] + 5, w + 2, h + 2);
      ctx.fillStyle = L.ok ? C.ok : C.bad; ctx.fillRect(c[0] - w / 2, c[1] + 6, w * Math.min(1, L.ms / T.limit), h);
    } else tag([c[0], c[1] - 6], `${T.limit} м/с`);
  }

  // всё, кроме выделенной фигуры, — в готовый слой; выделенная рисуется каждый кадр (она покачивается)
  function drawStatic() {
    ctx = sctx; V = view;
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); ctx.clearRect(0, 0, view.w, view.h);
    ctx.save(); ctx.shadowColor = 'rgba(30,50,75,0.28)'; ctx.shadowBlur = V.tw * 1.4; ctx.shadowOffsetY = V.tw * 0.7;
    poly([Q(0, 0, -0.45), Q(B, 0, -0.45), Q(B, B, -0.45), Q(0, B, -0.45)], C.slab2); ctx.restore();
    box(0, 0, B, B, -0.45, 0, C.slab, C.slab);
    for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) poly(cellPoly(x, y, 0), (x + y) % 2 ? C.ground : C.ground2);
    if (st.heat) {
      const e = 1 / S + 0.01;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const k = j * n + i; if (solid[k]) continue;
        const x = i / S, y = j / S;
        poly([Q(x, y, 0.004), Q(x + e, y, 0.004), Q(x + e, y + e, 0.004), Q(x, y + e, 0.004)], ramp(WIND * field[k], 0.46));
      }
    }
    ctx.beginPath(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    for (let i = 0; i <= B; i++) { let a = Q(i, 0, 0.006), b = Q(i, B, 0.006); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); a = Q(0, i, 0.006); b = Q(B, i, 0.006); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();
    // свои фигуры — на жёлтой подложке, закреплённые — на каменном фундаменте
    for (const p of st.placed) if (p !== st.selected) for (const [x, y] of cells(p)) poly([Q(x + 0.06, y + 0.06, 0.008), Q(x + 0.94, y + 0.06, 0.008), Q(x + 0.94, y + 0.94, 0.008), Q(x + 0.06, y + 0.94, 0.008)], 'rgba(247,194,27,0.38)', 'rgba(217,164,0,0.6)', 1);
    const list = pieces().filter(p => p !== st.selected).sort((a, b) => depthKey(a) - depthKey(b));
    for (const p of list) {
      if (p.fixed && TYPES[p.type].kind !== 'rock') { const b = shapeBox(p); box(b.x0 - 0.1, b.y0 - 0.1, b.x1 + 0.1, b.y1 + 0.1, 0, 0.1, C.stone, C.stoneTop); }
      drawPiece(p, p.fixed && TYPES[p.type].kind !== 'rock' ? 0.1 : 0);
    }
    const showLoads = st.phase === 'run' || st.phase === 'win' || st.phase === 'lose', L = showLoads ? loads() : [];
    for (const p of pieces()) if (TYPES[p.type].kind === 'house' && p !== st.selected) houseTag(p, p.fixed ? 0.1 : 0, showLoads, L.find(l => l.p === p));
  }
  function drawSelected() {
    const p = st.selected; if (!p || !st.placed.includes(p)) return;
    const T = TYPES[p.type], age = st.clock - (p.popT || -9), pop = Math.max(0, 1 - age / 0.22);
    const zl = SEL_Z + 0.05 * Math.sin(st.clock * 4) + 1.4 * pop * pop;
    const sh = st.clock - st.shakeT, shaking = sh < 0.45;
    ctx.save();
    if (shaking) ctx.translate(Math.sin(sh * 60) * 7 * (1 - sh / 0.45), 0);
    for (const [x, y] of cells(p)) if (x >= 0 && y >= 0 && x < B && y < B) poly(cellPoly(x, y, 0.01), p.bad ? 'rgba(214,59,69,0.4)' : 'rgba(247,194,27,0.45)', p.bad ? C.bad : '#d9a400', 1.5);
    const b = shapeBox(p); ctx.globalAlpha = 0.22; poly([Q(b.x0, b.y0, 0.012), Q(b.x1, b.y0, 0.012), Q(b.x1, b.y1, 0.012), Q(b.x0, b.y1, 0.012)], '#17212c'); ctx.globalAlpha = 1;
    drawPiece(p, zl);
    const flash = shaking ? 0.55 * (1 - sh / 0.45) : 0;
    if (p.bad || flash) poly(hullOf(p, zl, 0.02), `rgba(214,59,69,${Math.max(p.bad ? 0.28 : 0, flash)})`, p.bad ? C.bad : null, 2);
    if (T.limit) houseTagSel(p, zl);
    ctx.restore();
  }
  function houseTagSel(p, zl) { const T = TYPES[p.type], b = shapeBox(p), c = Q((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, zl + T.h + 0.5); tag([c[0], c[1] - 6], limText(T), p.bad); }

  // струи ветра и стрелки — каждый кадр, поверх готового слоя
  const parts = Array.from({ length: 150 }, () => ({ x: -1 + Math.random() * (B + 2), y: Math.random() * B }));
  const ARROW_TAIL = 1.6;
  function drawFlow(dt, ts) {
    const run = st.phase === 'run', sp = run ? 3.4 : 1.5;
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, V.tw * 0.045);
    for (const q of parts) {
      let f = fAt(q.x, q.y);
      if (f === 0 || q.x > B + 0.8) { q.x = -1 + Math.random() * 0.6; q.y = Math.random() * B; f = 1; }
      q.x += sp * f * dt;
      const a = Q(q.x - 0.45 * f, q.y, 0.3), b = Q(q.x, q.y, 0.3);
      ctx.strokeStyle = `rgba(20,30,40,${0.32 * Math.min(1, f)})`; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    const off = run ? ((ts / 500) % 1) * 0.3 : 0;
    for (const y of [1, 3, 5, 7, 9]) {
      const x = -ARROW_TAIL + off;
      poly([Q(x, y - 0.09, 0.02), Q(x + 0.8, y - 0.09, 0.02), Q(x + 0.8, y - 0.3, 0.02), Q(x + 1.25, y, 0.02), Q(x + 0.8, y + 0.3, 0.02), Q(x + 0.8, y + 0.09, 0.02), Q(x, y + 0.09, 0.02)], C.accent, 'rgba(23,33,44,0.55)', 1);
    }
  }
  // ---------- приближение при переносе: камера едет за фигурой ----------
  // Пока несёшь фигуру над полем, остров приближен в FZ раз вокруг точки st.fp, а эта точка плавно догоняет фигуру.
  // Когда догнала, клетка под фигурой та же, что была бы без приближения: фигура не уползает из-под пальца,
  // и до любой клетки можно дотянуться, а вокруг фигуры всё крупно.
  function focusZoom(dt) {
    const d = st.drag, dragging = d && (d.kind === 'new' || d.kind === 'move');
    const target = st.autoZoom && dragging && d.zoomed ? FZ : 1;
    let moved = false;
    if (Math.abs(target - st.fz) > 1e-3) { st.fz += (target - st.fz) * Math.min(1, dt * 8); if (Math.abs(target - st.fz) < 2e-3) st.fz = target; moved = true; }
    if (dragging && d.zoomed) {
      const [fx, fy] = local(d.cx, d.cy), px = d.off ? fx + d.off[0] : fx, py = d.off ? fy + d.off[1] : fy - d.lift;
      const k = Math.min(1, dt * 10), nx = st.fp[0] + (px - st.fp[0]) * k, ny = st.fp[1] + (py - st.fp[1]) * k;
      if (Math.hypot(nx - st.fp[0], ny - st.fp[1]) > 0.05) { st.fp = [nx, ny]; moved = true; }
    }
    if (moved) { layoutView(true); if (dragging) dragTo(d.cx, d.cy); }
  }

  // ---------- сцена вокруг острова: море и тучи с наветренной стороны (под вопросом) ----------
  const waves = Array.from({ length: 46 }, () => newWave(true));
  const clouds = Array.from({ length: 6 }, (_, i) => ({ x: -12 + i * 2.2 + Math.random(), y: -3 + Math.random() * (B + 6), r: 1.3 + Math.random() * 1.1 }));
  function newWave(any) {
    const a = Math.random() * Math.PI * 2, rr = 6.2 + Math.random() * 4;
    return { x: B / 2 + Math.cos(a) * rr - (any ? 0 : 3), y: B / 2 + Math.sin(a) * rr, l: 0.4 + Math.random() * 0.5 };
  }
  function drawScene(dt) {
    const run = st.phase === 'run', c = Q(B / 2, B / 2, -0.5), R0 = V.tw * 10.5;
    // море — мягкое пятно вокруг острова, сплюснутое под наклон камеры
    ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(1, 2 * V.k);
    const g = ctx.createRadialGradient(0, 0, V.tw * 4, 0, 0, R0);
    g.addColorStop(0, 'rgba(70,130,175,0.34)'); g.addColorStop(0.6, 'rgba(70,130,175,0.16)'); g.addColorStop(1, 'rgba(70,130,175,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R0, 0, 7); ctx.fill(); ctx.restore();
    // блики на воде плывут по ветру
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, V.tw * 0.05);
    for (let i = 0; i < waves.length; i++) {
      const w = waves[i]; w.x += (run ? 1.4 : 0.45) * dt;
      const dist = Math.hypot(w.x - B / 2, w.y - B / 2);
      if (dist > 10.5 || (w.x > -0.6 && w.x < B + 0.6 && w.y > -0.6 && w.y < B + 0.6)) { waves[i] = newWave(false); continue; }
      const a = Q(w.x, w.y, -0.48), b = Q(w.x + w.l, w.y, -0.48), al = 0.5 * (1 - dist / 10.5);
      ctx.strokeStyle = `rgba(255,255,255,${al.toFixed(3)})`; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // тучи собираются с наветренной стороны и ползут к острову; в прогон — темнее и быстрее
    for (const cl of clouds) {
      cl.x += (run ? 1.1 : 0.22) * dt;
      if (cl.x > 0.5) { cl.x = -13; cl.y = -3 + Math.random() * (B + 6); }
      const fade = Math.min(1, (cl.x + 13) / 4) * Math.min(1, (0.5 - cl.x) / 3), al = (run ? 0.3 : 0.17) * fade;
      for (const [dx, dy, s] of [[0, 0, 1], [0.9, 0.4, 0.75], [-0.8, 0.3, 0.7]]) {
        const p = Q(cl.x + dx, cl.y + dy, 3.4), r = V.tw * cl.r * s;
        const cg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
        cg.addColorStop(0, `rgba(66,76,92,${al.toFixed(3)})`); cg.addColorStop(1, 'rgba(66,76,92,0)');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill();
      }
    }
  }

  let last = 0;
  function loop(ts) {
    // на паузе время стоит: не идут прогон, струи, тучи и покачивание выделенной фигуры
    const dt = st.paused ? 0 : Math.min(0.05, (ts - (last || ts)) / 1000); last = ts; st.clock += dt;
    if (!(st.drag && st.drag.kind === 'cam') && Math.abs(st.angT - st.ang) > 1e-4) {
      st.ang += (st.angT - st.ang) * Math.min(1, dt * 12); if (Math.abs(st.angT - st.ang) < 2e-3) st.ang = st.angT;
      layoutView(); st.dirty = true;
    }
    if (view.T) { // масштаб и положение плавно подстраиваются под новый угол
      let moving = false;
      for (const k of ['tw', 'ox', 'oy']) { const d = view.T[k] - view[k]; if (Math.abs(d) > 0.05) { view[k] += d * Math.min(1, dt * 9); moving = true; } else view[k] = view.T[k]; }
      view.hz = hzFor(view.tw, view.k); if (moving) st.dirty = true;
    }
    focusZoom(dt);
    if (st.phase === 'run') { st.t += dt; if (st.t >= RUN_T) finishRun(); updateGo(); }
    if (st.dirty) {
      view.cos = Math.cos(st.ang); view.sin = Math.sin(st.ang);
      drawStatic(); st.dirty = false; updateWindArrow(); placeChips(); emit('move');
    }
    fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.clearRect(0, 0, cv.width, cv.height);
    ctx = fctx; V = view;
    if (st.scene) { ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); drawScene(dt); ctx.setTransform(1, 0, 0, 1, 0, 0); }
    fctx.drawImage(scv, 0, 0);
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    drawSelected();
    drawFlow(dt, ts);
    if (st.showFree && view.free) {
      const f = view.free; ctx.setLineDash([6, 5]); ctx.strokeStyle = '#7a4fd0'; ctx.lineWidth = 2; ctx.strokeRect(f.x, f.y, f.w, f.h); ctx.setLineDash([]);
      ctx.fillStyle = '#7a4fd0'; ctx.font = '500 11px "JetBrains Mono", monospace'; ctx.textAlign = 'left'; ctx.fillText('свободная зона поля', f.x + 6, f.y + 15);
    }
    requestAnimationFrame(loop);
  }
  function drawIcon(cvs, type) {
    const T = TYPES[type], L = T.len, wd = 96, ht = 84, c2 = cvs.getContext('2d');
    cvs.width = wd; cvs.height = ht;
    const saveCtx = ctx, saveV = V;
    const tw = Math.min(2 * (wd - 10) / (L + 1), (ht - 10) / ((L + 1) / 4 + T.h * 0.62 + 0.2));
    V = { tw, hz: tw * 0.62, k: 0.25, cos: 1, sin: 0, ox: 0, oy: 0 };
    V.ox = wd / 2 - (L - 1) * tw / 4; V.oy = ht / 2 - ((L + 1) * tw / 4 - T.h * V.hz) / 2;
    ctx = c2; ctx.clearRect(0, 0, wd, ht);
    drawPiece({ type, x: 0, y: 0, rot: 0 });
    ctx = saveCtx; V = saveV;
  }

  // ---------- вписывание острова ----------
  function detect() {
    const w = innerWidth, h = innerHeight;
    let layout = 'wide';
    if (w > h && h < 520) layout = 'short';
    else if (w < 600 || w / h < 0.85) layout = 'portrait';
    html.dataset.layout = layout;
    html.dataset.input = matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse';
    html.style.setProperty('--ih', h + 'px');
  }
  function freeRect(W, H) {
    const fr = frameEl.getBoundingClientRect(), ins = { t: 0, r: 0, b: 0, l: 0 };
    // data-block-portrait / -short / -wide — своё поведение панели в этом макете
    const lk = 'block' + html.dataset.layout[0].toUpperCase() + html.dataset.layout.slice(1);
    for (const el of $$('[data-block]', frameEl)) {
      let edge = el.dataset[lk] || el.dataset.block;
      if (edge === 'none' || el.closest('[hidden]')) continue;
      const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      const x0 = r.left - fr.left, y0 = r.top - fr.top, x1 = x0 + r.width, y1 = y0 + r.height;
      if (edge.length !== 1 || !'trbl'.includes(edge)) {
        const d = { t: y0, b: H - y1, l: x0, r: W - x1 };
        // во всю высоту — значит, боковая; во всю ширину — верхняя или нижняя; иначе — по вытянутости и ближнему краю
        const cand = d.t < 2 && d.b < 2 ? ['l', 'r'] : d.l < 2 && d.r < 2 ? ['t', 'b']
          : r.width > r.height * 1.3 ? ['t', 'b'] : r.height > r.width * 1.3 ? ['l', 'r'] : ['t', 'b', 'l', 'r'];
        edge = cand.reduce((a, c) => (d[c] < d[a] ? c : a));
      }
      ins[edge] = Math.max(ins[edge], edge === 't' ? y1 : edge === 'b' ? H - y0 : edge === 'l' ? x1 : W - x0);
    }
    const pad = 4, side = 12, f = { x: ins.l + side, y: ins.t + pad, w: W - ins.l - ins.r - 2 * side, h: H - ins.t - ins.b - 2 * pad };
    return f.w < 120 || f.h < 100 ? { x: 0, y: 0, w: W, h: H } : f;
  }
  // габарит сцены (доска, стрелки ветра, высота построек) при угле камеры ang, в долях tw
  function extents(ang) {
    const save = V, k = TILTS[st.tilt].k;
    V = { cos: Math.cos(ang), sin: Math.sin(ang), k, ox: 0, oy: 0, tw: 1, hz: hzFor(1, k) };
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, bx0 = 1e9, bx1 = -1e9;
    for (const [x, y] of [[0, 0], [B, 0], [B, B], [0, B], [-ARROW_TAIL, 1], [-ARROW_TAIL, B - 1]]) {
      const [sx, sy] = Q(x, y, 0); x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
      if (x >= 0) { bx0 = Math.min(bx0, sx); bx1 = Math.max(bx1, sx); }
    }
    const hz = V.hz; V = save;
    return { x0, x1, bx0, bx1, y0: y0 - 1.45 * hz, y1: y1 + 0.5 * hz };
  }
  // цель для масштаба и положения при текущем угле; immediate — сразу, без плавного перехода
  function layoutView(immediate) {
    const f = view.free; if (!f) return;
    // масштаб и центр считаем для исходного угла вида, а не для текущего: при повороте остров крутится на месте,
    // не приближаясь и не отдаляясь
    const k = TILTS[st.tilt].k, e = extents(VIEWS[st.view].base);
    // по ширине — доска (без стрелок) с запасом CROP за край, по высоте — всё целиком
    const tw0 = Math.max(8, Math.min(120, Math.min(f.w * CROP / (e.bx1 - e.bx0), f.h / (e.y1 - e.y0))));
    const fitsAll = tw0 * (e.x1 - e.x0) <= f.w; // влезает со стрелками — центрируем всё, иначе — только доску
    const cx = fitsAll ? (e.x0 + e.x1) / 2 : (e.bx0 + e.bx1) / 2;
    // остров — посередине между верхней и нижней панелью
    const cyS = f.y + f.h / 2;
    let tw = tw0 * st.zoom, ox = f.x + f.w / 2 - cx * tw + st.panX, oy = cyS - (e.y0 + e.y1) / 2 * tw + st.panY;
    // приближение при переносе — вокруг точки st.fp, которая едет за фигурой
    if (st.fz > 1.001) { const z = st.fz; ox = st.fp[0] + (ox - st.fp[0]) * z; oy = st.fp[1] + (oy - st.fp[1]) * z; tw *= z; }
    view.k = k;
    view.T = { tw, ox, oy };
    if (immediate) { Object.assign(view, view.T); view.hz = hzFor(view.tw, k); }
    st.dirty = true;
  }
  function fit() {
    const r = frameEl.getBoundingClientRect();
    view.w = r.width; view.h = r.height; view.dpr = Math.min(2, devicePixelRatio || 1);
    for (const c of [cv, scv]) { c.width = Math.round(r.width * view.dpr); c.height = Math.round(r.height * view.dpr); }
    view.free = freeRect(r.width, r.height);
    layoutView(true);
    view.cos = Math.cos(st.ang); view.sin = Math.sin(st.ang);
    drawStatic(); st.dirty = false; updateWindArrow(); placeChips(); placeTrash();
    emit('fit', { free: view.free, w: r.width, h: r.height }); emit('move');
    updateProtoInfo();
  }
  let fitQueued = false;
  function queueFit() { if (fitQueued) return; fitQueued = true; requestAnimationFrame(() => { fitQueued = false; fit(); }); }
  function toScreen(x, y, z) { V = view; return Q(x, y, z); }
  // габарит острова на экране при текущем угле — для того, что к нему привязано (причал в варианте D)
  function islandInfo() {
    V = view; const cs = [[0, 0], [B, 0], [B, B], [0, B]].map(([x, y]) => Q(x, y, 0));
    const bottom = cs.reduce((a, c) => (c[1] > a[1] ? c : a)), lft = cs.reduce((a, c) => (c[0] < a[0] ? c : a));
    return { x0: Math.min(...cs.map(c => c[0])), x1: Math.max(...cs.map(c => c[0])), y0: Math.min(...cs.map(c => c[1])), y1: Math.max(...cs.map(c => c[1])) + 0.45 * view.hz,
      bottom: [bottom[0], bottom[1] + 0.45 * view.hz], left: lft, mid: Q(B / 2, B / 2, 0) };
  }

  // ---------- интерфейс ----------
  function el(tag, cls, htmlStr) { const e = document.createElement(tag); if (cls) e.className = cls; if (htmlStr != null) e.innerHTML = htmlStr; return e; }
  function buildInv() {
    const box = document.getElementById('inv'); if (!box) return;
    box.innerHTML = ''; box.dataset.n = st.nInv;
    for (const type of Object.keys(invMax())) {
      const T = TYPES[type], b = el('button', 'piece');
      b.type = 'button'; b.dataset.piece = type; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<canvas aria-hidden="true"></canvas><span class="nm">${T.name}</span><span class="cnt"></span><span class="sp">${limText(T)}</span>`;
      b.title = `${T.name}: ${limText(T)}`;
      box.appendChild(b); drawIcon(b.querySelector('canvas'), type);
    }
  }
  function updateUI() {
    for (const b of $$('[data-piece]')) {
      const t = b.dataset.piece, c = left(t);
      b.querySelector('.cnt').textContent = '×' + c;
      b.disabled = c <= 0 || st.phase !== 'build';
      b.setAttribute('aria-pressed', String(st.sel === t));
    }
    html.classList.toggle('has-sel', !!(st.sel || st.selected));
    updateGo(); placeChips(); st.dirty = true;
  }
  function updateGo() {
    const run = st.phase === 'run';
    for (const b of $$('[data-act="go"]')) {
      const l = b.querySelector('.lbl'); if (l) l.textContent = run ? 'Стоп' : 'Ветер!';
      b.style.setProperty('--p', run ? (st.t / RUN_T).toFixed(3) : 0);
      b.disabled = st.phase === 'win' || st.phase === 'lose';
    }
    for (const e of $$('[data-run-time]')) e.textContent = `${st.t.toFixed(1).replace('.', ',')} из ${RUN_T} с`;
  }
  function updateWindArrow() {
    V = view; const a = Q(0, 5, 0), b = Q(1, 5, 0), deg = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    for (const e of $$('[data-wind-arrow]')) e.style.transform = `rotate(${deg.toFixed(1)}deg)`;
  }
  // корзина — внизу свободной зоны, то есть над нижней панелью, под сценой
  function placeTrash() {
    const f = view.free; if (!trashEl || !f) return;
    trashEl.style.left = (f.x + f.w / 2 - 34) + 'px'; trashEl.style.top = (f.y + f.h - 76) + 'px';
  }
  // кнопки ↻ ✥ ✓ — под выделенной фигурой; ✓ серая, пока фигура в красном
  function placeChips() {
    if (!chipsEl) return;
    const dragging = st.drag && (st.drag.kind === 'new' || st.drag.kind === 'move');
    const p = st.selected, show = p && st.phase === 'build' && !dragging && st.placed.includes(p);
    chipsEl.hidden = !show; if (!show) return;
    const ok = chipsEl.querySelector('.c-ok'); ok.setAttribute('aria-disabled', String(!!p.bad)); ok.title = p.bad ? 'Сюда не встаёт' : 'Поставить';
    V = view; const pts = cells(p).flatMap(([x, y]) => cellPoly(x, y, 0));
    const cx = (Math.min(...pts.map(q => q[0])) + Math.max(...pts.map(q => q[0]))) / 2, by = Math.max(...pts.map(q => q[1]));
    const w = chipsEl.offsetWidth || 100, hgt = chipsEl.offsetHeight || 44;
    chipsEl.style.left = Math.max(6, Math.min(view.w - w - 6, cx - w / 2)) + 'px';
    chipsEl.style.top = Math.max(6, Math.min(view.h - hgt - 6, by + 10)) + 'px';
  }
  function setPause(on) {
    st.paused = on; pauseEl.hidden = !on;
    if (on && st.drag) { if (st.drag.kind === 'new' || st.drag.kind === 'move') endDrag(true); st.drag = null; }
  }
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (toastEl.hidden = true), 2600);
  }
  function shake(msg) {
    st.shakeT = st.clock;
    try { if (navigator.vibrate) navigator.vibrate([40, 30, 40]); } catch (err) { /* вибрации нет — не страшно */ }
    if (msg) toast(msg);
  }
  // «отпустить» выделенную фигуру. В красном нельзя — она вспыхивает и ждёт
  function tryCommit() {
    const p = st.selected;
    if (p && p.bad) { shake('Сюда не встаёт: поверни, перенеси или утащи в корзину'); return false; }
    st.selected = null; updateUI(); return true;
  }
  function select(p) { st.selected = p; st.sel = null; p.bad = blocked(p, p); computeField(); updateUI(); }
  function setPhase(ph) {
    if (ph !== 'build') {
      if (st.selected && st.selected.bad) st.placed.splice(st.placed.indexOf(st.selected), 1);
      st.selected = null; st.sel = null; st.drag = null; html.classList.remove('dragging');
    }
    st.phase = ph; if (ph !== 'run') st.t = 0;
    html.dataset.phase = ph;
    for (const e of $$('[data-show]')) e.hidden = !e.dataset.show.split(' ').includes(ph);
    if (ph === 'win' || ph === 'lose') fillResult(ph);
    if (ph !== 'build' && pauseEl) setPause(false);
    computeField(); updateUI(); updateUndo(); emit('phase', ph); updateProtoInfo();
  }
  function reset() { st.placed = []; st.selected = null; st.sel = null; computeField(); }
  function placeSolution() { reset(); for (const p of SOLUTION) st.placed.push({ ...p }); computeField(); }
  function finishRun() { const L = loads(); setPhase(L.every(x => x.ok) ? 'win' : 'lose'); }
  function fillResult(ph) {
    const L = loads(), rest = Object.keys(invMax()).reduce((a, t) => a + left(t), 0);
    if (ph === 'win') {
      const stars = [true, rest > 0, L.every(x => x.ms <= x.T.limit * 0.9)];
      resultEl.innerHTML = `<div class="res-h"><span class="res-k">Деревня · 8 из 8</span><h2>Посёлок устоял</h2></div>
        <ol class="stars">${['Все дома целы', 'Осталась лишняя фигура', 'Ни одной трещины'].map((t, i) => `<li class="${stars[i] ? 'on' : ''}"><span aria-hidden="true">★</span>${t}</li>`).join('')}</ol>
        <div class="res-acts"><button class="btn go" data-act="next"><span class="lbl">Дальше</span></button><button class="btn" data-act="again">Заново</button><button class="btn" data-act="share">Поделиться</button></div>
        <p class="pnote">Межэкранная реклама — сразу после «Дальше», до отрисовки следующего уровня.</p>`;
    } else {
      const bad = L.find(x => !x.ok) || L[0];
      resultEl.innerHTML = `<div class="res-h"><span class="res-k">Деревня · 8 из 8</span><h2>Не устояло</h2></div>
        <p class="res-why">${bad.T.name}: ветер ${Math.round(bad.ms)} м/с, а держит ${bad.T.limit}. Ищи синие пятна — там тихо.</p>
        <div class="res-acts"><button class="btn go" data-act="again"><span class="lbl">Заново</span></button><button class="btn" data-act="hint">💡 Подсказка <span class="ad">▶ реклама</span></button></div>`;
    }
  }
  function hintPlace() {
    if (st.phase !== 'build') setPhase('build');
    if (!tryCommit()) return;
    for (const s of SOLUTION) {
      if (st.placed.some(p => p.type === s.type && p.x === s.x && p.y === s.y && p.rot === s.rot)) continue;
      if (left(s.type) <= 0) continue;
      const p = { ...s }; if (blocked(p)) continue;
      const before = snapshot();
      st.placed.push(p); p.popT = st.clock; select(p); record(before);
      toast('Подсказка: фигура встала на место. В игре — после рекламы, первые две бесплатно');
      return;
    }
    toast('Подсказывать больше нечего');
  }
  // поворот вокруг середины фигуры, без подвинок: если не встаёт — фигура остаётся красной и ждёт
  function rotateP(p, noRecord) {
    const before = snapshot(), nr = p.rot ? 0 : 1, oc = centerOff(p), nc = centerOff({ ...p, rot: nr });
    p.x += oc[0] - nc[0]; p.y += oc[1] - nc[1]; p.rot = nr;
    p.bad = blocked(p, p); computeField(); updateUI();
    if (!noRecord) record(before);
  }
  function removeP(p) { const i = st.placed.indexOf(p); if (i >= 0) st.placed.splice(i, 1); if (st.selected === p) st.selected = null; computeField(); updateUI(); }
  function turnCam(k) { st.angT = st.ang + k * Q90; }
  function act(a, src) {
    switch (a) {
      case 'go':
        if (st.phase === 'build' || st.phase === 'talk') { if (st.phase === 'build' && !tryCommit()) break; setPhase('run'); }
        else if (st.phase === 'run') setPhase('build');
        break;
      case 'camL': turnCam(-1); break;
      case 'camR': turnCam(1); break;
      case 'rot':
        if (st.drag && st.drag.piece) rotateP(st.drag.piece, true);
        else if (st.selected) rotateP(st.selected);
        else toast('Нажми на свою фигуру — она выделится, рядом появится кнопка поворота');
        break;
      case 'grab': toast('Зажми и тяни — фигура поедет за пальцем'); break;
      case 'ok': tryCommit(); break;
      case 'undo': undo(); break;
      case 'stash': if (st.selected) { const before = snapshot(); removeP(st.selected); record(before); } else { st.sel = null; updateUI(); } break;
      case 'hint': hintPlace(); break;
      case 'menu': setPause(!st.paused); break;
      case 'talk-next': case 'talk-skip': setPhase('build'); break;
      case 'again': { const before = snapshot(); reset(); setPause(false); setPhase('build'); record(before); break; }
      case 'next': reset(); st.hist = []; setPhase('talk'); toast('Тут — межэкранная реклама, потом следующий уровень'); break;
      case 'share': toast('Поделиться — картинка расстановки в историю VK'); break;
      case 'map': setPause(false); toast('Здесь откроется карта уровней'); break;
      case 'community': toast('Сообщество игры VK. В сборке для Яндекса кнопки нет — внешние ссылки запрещены'); break;
      case 'tog': {
        const on = src.getAttribute('aria-pressed') !== 'true';
        src.setAttribute('aria-pressed', String(on)); src.textContent = on ? 'Вкл' : 'Выкл';
        if (src.dataset.key === 'heat') { st.heat = on; st.dirty = true; }
        break;
      }
      case 'lang': for (const b of src.parentElement.children) b.setAttribute('aria-pressed', String(b === src)); break;
      case 'proto': protoEl.hidden = !protoEl.hidden; updateProtoInfo(); break;
      case 'phase': protoPhase(src.dataset.ph); break;
      case 'pview': st.view = src.dataset.v; st.angT = VIEWS[st.view].base; st.zoom = 1; st.panX = st.panY = 0; updateProtoInfo(); break;
      case 'ptilt': st.tilt = src.dataset.v; layoutView(); updateProtoInfo(); break;
      case 'pzoom': st.autoZoom = src.dataset.v === 'on'; updateProtoInfo(); break;
      case 'pscene': st.scene = src.dataset.v === 'on'; updateProtoInfo(); break;
      case 'pinv':
        st.nInv = +src.dataset.v; st.placed = st.placed.filter(p => invMax()[p.type] && st.placed.filter(q => q.type === p.type).indexOf(p) < invMax()[p.type]);
        if (!st.placed.includes(st.selected)) st.selected = null;
        buildInv(); computeField(); updateUI(); updateProtoInfo(); emit('inv'); queueFit();
        break;
    }
  }
  function protoPhase(ph) {
    if (ph === 'win') { placeSolution(); setPhase('win'); }
    else if (ph === 'lose') { reset(); setPhase('lose'); }
    else { if (ph === 'run' && !st.placed.length) placeSolution(); setPhase(ph); }
  }

  // ---------- касания и мышь ----------
  const local = (cx, cy) => { const r = cv.getBoundingClientRect(); return [cx - r.left, cy - r.top]; };
  function convexHull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of pts.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function inHull(h, x, y) {
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    for (let i = 0; i < h.length; i++) if (cr(h[i], h[(i + 1) % h.length], [x, y]) < 0) return false;
    return h.length > 2;
  }
  // фигура под пальцем: сначала выделенная (она приподнята), потом остальные — ближняя к зрителю
  function pieceAtScreen(sx, sy, touch) {
    V = view; const pad = touch ? 0.25 : 0.02;
    if (st.selected && st.placed.includes(st.selected) && inHull(hullOf(st.selected, SEL_Z, pad), sx, sy)) return st.selected;
    let best = null, bd = -1e9;
    for (const p of pieces()) { const d = depthKey(p); if (d > bd && inHull(hullOf(p, 0, pad), sx, sy)) { best = p; bd = d; } }
    return best;
  }
  // корзина — только для уже поставленных фигур: новую убирают, отпустив над запасом, а её палец ведёт снизу как раз через корзину
  const overTrash = (cx, cy) => { if (!html.classList.contains('dragging-move')) return false; const r = trashEl.getBoundingClientRect(); return cx >= r.left - 12 && cx <= r.right + 12 && cy >= r.top - 12 && cy <= r.bottom + 12; };
  function startDrag(d) {
    d.before = snapshot();
    st.drag = d; html.classList.add('dragging'); html.classList.toggle('dragging-move', d.kind === 'move'); placeTrash();
    drawIcon(dragIconEl.querySelector('canvas'), d.piece.type);
    placeChips();
  }
  function dragTo(cx, cy) {
    const d = st.drag, p = d.piece; d.cx = cx; d.cy = cy;
    const trash = overTrash(cx, cy); trashEl.classList.toggle('hot', trash);
    // новая фигура висит над пальцем; уже поставленную везём с тем же смещением, с каким взяли, — без скачка
    V = view; const [lx, ly] = local(cx, cy);
    const [bx, by] = d.off ? unQ(lx + d.off[0], ly + d.off[1]) : unQ(lx, ly - d.lift);
    const on = !trash && bx > -0.3 && by > -0.3 && bx < B + 0.3 && by < B + 0.3;
    if (on) {
      // фигура впервые над полем — приближаем остров вокруг этой точки (если прошлое приближение уже отъехало)
      if (!d.zoomed) { d.zoomed = true; if (st.fz < 1.05) st.fp = d.off ? [lx + d.off[0], ly + d.off[1]] : [lx, ly - d.lift]; }
      const off = centerOff(p), nx = Math.floor(bx) - off[0], ny = Math.floor(by) - off[1];
      const fresh = !st.placed.includes(p);
      if (fresh) { st.placed.push(p); p.popT = st.clock; }
      if (fresh || p.x !== nx || p.y !== ny) { p.x = nx; p.y = ny; st.selected = p; p.bad = blocked(p, p); computeField(); updateUI(); }
    } else if (st.placed.includes(p)) { st.placed.splice(st.placed.indexOf(p), 1); if (st.selected === p) st.selected = null; computeField(); updateUI(); }
    // над панелью за пальцем едет плоская иконка; над полем она гаснет — там уже объёмная фигура
    dragIconEl.classList.toggle('on-board', on);
    dragIconEl.style.transform = `translate(${cx - 30}px, ${cy - (d.off ? 0 : d.lift) - 30}px)`;
  }
  // точка, за которую «держим» фигуру: середина её средней клетки на земле
  function anchorOf(p) { V = view; const o = centerOff(p); return Q(p.x + o[0] + 0.5, p.y + o[1] + 0.5, 0); }
  function endDrag(cancel, cx, cy) {
    const toTrash = !cancel && overTrash(cx, cy);
    const d = st.drag; st.drag = null; html.classList.remove('dragging', 'dragging-move'); trashEl.classList.remove('hot'); dragIconEl.classList.remove('on-board');
    const p = d.piece, onBoard = st.placed.includes(p);
    if (toTrash) { removeP(p); record(d.before); return; }
    if (onBoard) { st.selected = p; p.bad = blocked(p, p); }
    else if (d.kind === 'move') { Object.assign(p, d.orig); st.placed.push(p); st.selected = p; p.bad = blocked(p, p); }
    computeField(); updateUI(); record(d.before);
  }
  const pointers = new Map(); let pinch = null;
  function startPinch() {
    const [a, b] = [...pointers.values()];
    pinch = { d0: Math.hypot(a[0] - b[0], a[1] - b[1]), z0: st.zoom, m0: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], p0: [st.panX, st.panY] };
    if (st.drag && (st.drag.kind === 'move' || st.drag.kind === 'new')) endDrag(true);
    st.drag = null;
  }
  function onDown(e) {
    const touch = e.pointerType !== 'mouse', lift = touch ? LIFT : 0;
    const grab = e.target.closest('[data-grab]');
    if (grab && st.selected && st.phase === 'build') {
      try { grab.setPointerCapture(e.pointerId); } catch (err) { /* нет захвата */ }
      const p = st.selected;
      st.drag = { kind: 'pending-grab', piece: p, id: e.pointerId, sx: e.clientX, sy: e.clientY, lift, orig: { x: p.x, y: p.y, rot: p.rot } };
      return;
    }
    const pb = e.target.closest('[data-piece]');
    if (pb) {
      if (pb.disabled || e.button > 0 || st.phase !== 'build') return;
      try { pb.setPointerCapture(e.pointerId); } catch (err) { /* нет захвата */ }
      st.drag = { kind: 'pending-new', type: pb.dataset.piece, id: e.pointerId, sx: e.clientX, sy: e.clientY, lift };
      return;
    }
    if (e.target !== cv) return;
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* нет захвата */ }
    pointers.set(e.pointerId, local(e.clientX, e.clientY));
    if (pointers.size === 2) { startPinch(); return; }
    if (e.button === 2) return;
    const hit = st.phase === 'build' ? pieceAtScreen(...local(e.clientX, e.clientY), touch) : null;
    if (hit && hit === st.selected) st.drag = { kind: 'pending-sel', piece: hit, id: e.pointerId, sx: e.clientX, sy: e.clientY, lift, orig: { x: hit.x, y: hit.y, rot: hit.rot } };
    else st.drag = { kind: 'pending-cam', id: e.pointerId, sx: e.clientX, sy: e.clientY, ang0: st.ang, hit };
  }
  function onMove(e) {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, local(e.clientX, e.clientY));
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      st.zoom = Math.min(2.6, Math.max(1, pinch.z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d0));
      if (st.zoom <= 1.02) { st.panX = st.panY = 0; } else { st.panX = pinch.p0[0] + (a[0] + b[0]) / 2 - pinch.m0[0]; st.panY = pinch.p0[1] + (a[1] + b[1]) / 2 - pinch.m0[1]; }
      layoutView(true); return;
    }
    const d = st.drag; if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy, far = Math.hypot(dx, dy) > 8;
    if (d.kind === 'pending-new' && far) {
      if (!tryCommit()) { st.drag = null; return; }
      startDrag({ kind: 'new', piece: { type: d.type, rot: defaultRot(d.type), x: 0, y: 0 }, id: d.id, lift: d.lift });
    } else if ((d.kind === 'pending-sel' || d.kind === 'pending-grab') && far) {
      const a = anchorOf(d.piece), [lx, ly] = local(d.sx, d.sy);
      startDrag({ kind: 'move', piece: d.piece, orig: d.orig, id: d.id, lift: 0, off: [a[0] - lx, a[1] - ly] });
    } else if (d.kind === 'pending-cam' && Math.abs(dx) > 10) d.kind = 'cam';
    const k = st.drag && st.drag.kind;
    if (k === 'new' || k === 'move') dragTo(e.clientX, e.clientY);
    else if (k === 'cam') { st.ang = st.angT = d.ang0 - dx / (5 * view.tw); st.dirty = true; }
  }
  function onUp(e) {
    if (pointers.has(e.pointerId)) pointers.delete(e.pointerId);
    if (pinch) { if (pointers.size < 2) pinch = null; return; }
    const d = st.drag; if (!d || e.pointerId !== d.id) return;
    const cancel = e.type === 'pointercancel';
    if (d.kind === 'new' || d.kind === 'move') { endDrag(cancel, e.clientX, e.clientY); return; }
    st.drag = null;
    if (cancel) return;
    if (d.kind === 'cam') { layoutView(); return; } // где отпустил, там и остался; масштаб подстроится
    if (d.kind === 'pending-grab') { act('grab'); placeChips(); return; }
    if (d.kind === 'pending-sel') { rotateP(d.piece); return; }
    if (d.kind === 'pending-new') { if (tryCommit()) { st.sel = st.sel === d.type ? null : d.type; updateUI(); } return; }
    if (d.kind === 'pending-cam' && st.phase === 'build') {
      if (d.hit && !d.hit.fixed) { if (tryCommit()) select(d.hit); return; }
      if (!tryCommit()) return;
      if (st.sel) { // режим «выбрал в запасе — тапнул по клетке»
        V = view; const [bx, by] = unQ(...local(e.clientX, e.clientY));
        if (bx < 0 || by < 0 || bx >= B || by >= B) return;
        const p = { type: st.sel, rot: defaultRot(st.sel), x: 0, y: 0 }, off = centerOff(p);
        p.x = Math.floor(bx) - off[0]; p.y = Math.floor(by) - off[1]; p.popT = st.clock;
        const before = snapshot();
        st.placed.push(p); const t = st.sel; select(p); if (left(t) > 0) st.sel = t; updateUI(); record(before);
      }
    }
  }

  function buildChrome() {
    const hud = frameEl.querySelector('.hud');
    const slot = id => document.getElementById(id) || hud;
    talkEl = el('div', 'card talk');
    talkEl.id = 'talk'; talkEl.dataset.show = 'talk'; talkEl.dataset.block = 'none'; talkEl.hidden = true;
    talkEl.innerHTML = `<div class="say"><div class="ava">${KEEPER}</div><div><span class="who">Петрович</span> <span class="role">смотритель метеостанции</span>
      <p>Последний посёлок перед бурей. С моря идёт 22 метра — прикрой все три дома.</p></div></div>
      <div class="say-acts"><button class="skip" type="button" data-act="talk-skip">Пропустить</button><button class="btn go sm" type="button" data-act="talk-next"><span class="lbl">Понятно</span></button></div>`;
    slot('talk-slot').appendChild(talkEl);
    resultEl = el('div', 'card result'); resultEl.id = 'result'; resultEl.dataset.show = 'win lose'; resultEl.dataset.block = 'none'; resultEl.hidden = true;
    slot('result-slot').appendChild(resultEl);
    // пауза: размытие на весь экран, игра под ним стоит, меню — по центру поверх
    pauseEl = el('div', 'pause'); pauseEl.hidden = true; pauseEl.dataset.block = 'none';
    pauseEl.addEventListener('click', e => { if (e.target === pauseEl) setPause(false); });
    menuEl = el('div', 'card menu'); menuEl.id = 'menu'; menuEl.setAttribute('role', 'dialog'); menuEl.setAttribute('aria-label', 'Пауза');
    menuEl.innerHTML = `<div class="m-head"><b>Пауза</b><button class="btn icon" type="button" data-act="menu" aria-label="Закрыть">✕</button></div>
      <button class="btn wide" type="button" data-act="menu">Продолжить</button>
      <button class="btn wide" type="button" data-act="again">Начать уровень заново</button>
      <button class="btn wide" type="button" data-act="map">Карта уровней</button>
      <div class="m-row"><span>Звук</span><button class="tog" type="button" data-act="tog" data-key="sound" aria-pressed="true">Вкл</button></div>
      <div class="m-row"><span>Поле скоростей</span><button class="tog" type="button" data-act="tog" data-key="heat" aria-pressed="true">Вкл</button></div>
      <div class="m-row"><span>Язык</span><div class="seg"><button type="button" data-act="lang" aria-pressed="true">Русский</button><button type="button" data-act="lang" aria-pressed="false">English</button></div></div>
      <button class="btn wide" type="button" data-act="community">Сообщество игры</button>
      <p class="pnote">«Сообщество» — только в сборке VK. «Выхода из игры» нет: Яндекс просит не делать.</p>`;
    pauseEl.appendChild(menuEl); frameEl.appendChild(pauseEl);
    chipsEl = el('div', 'chips'); chipsEl.hidden = true; chipsEl.dataset.block = 'none';
    chipsEl.innerHTML = `<button type="button" class="c-rot" data-act="rot" aria-label="Повернуть фигуру" title="Повернуть (R)">${ICON_ROT}</button><button type="button" class="c-move" data-grab data-act="grab" aria-label="Перенести фигуру — зажми и тяни" title="Зажми и тяни">${ICON_MOVE}</button><button type="button" class="c-ok" data-act="ok" aria-label="Поставить сюда" title="Поставить (Enter)">${ICON_OK}</button>`;
    hud.appendChild(chipsEl);
    trashEl = el('div', 'trash', `${ICON_TRASH}<span>Убрать</span>`); trashEl.dataset.block = 'none'; trashEl.setAttribute('aria-hidden', 'true');
    frameEl.appendChild(trashEl);
    dragIconEl = el('div', 'drag-icon', '<canvas></canvas>'); document.body.appendChild(dragIconEl);
    toastEl = el('div', 'toast'); toastEl.hidden = true; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl);

    protoTab = el('button', 'proto-tab', `прототип ${cfg.key}`); protoTab.type = 'button'; protoTab.dataset.act = 'proto';
    protoEl = el('div', 'proto'); protoEl.hidden = true;
    // кнопка «Закрыть» — внизу: вверху её закрывают кнопки встроенного браузера (Telegram, VK)
    protoEl.innerHTML = `<div class="p-head"><b>Вариант ${cfg.key} · ${cfg.name}</b></div>
      <p>${cfg.desc}</p>
      <p class="p-now">Макет: <b data-p-layout></b><br>Ввод: <b data-p-input></b> · окно <b data-p-size></b></p>
      <div class="p-ph">${PHASES.map(([k, t], i) => `<button type="button" data-act="phase" data-ph="${k}"><span>${i + 1}</span>${t}</button>`).join('')}</div>
      <div class="p-row"><span>Вид</span>${Object.entries(VIEWS).map(([k, v]) => `<button type="button" data-act="pview" data-v="${k}">${v.name}</button>`).join('')}</div>
      <div class="p-row"><span>Камера</span>${Object.entries(TILTS).map(([k, v]) => `<button type="button" data-act="ptilt" data-v="${k}">${v.name}</button>`).join('')}</div>
      <div class="p-row"><span>Лупа</span><button type="button" data-act="pzoom" data-v="on">Приближать при переносе</button><button type="button" data-act="pzoom" data-v="off">Нет</button></div>
      <div class="p-row"><span>Сцена</span><button type="button" data-act="pscene" data-v="on">Море и тучи</button><button type="button" data-act="pscene" data-v="off">Нет</button></div>
      ${cfg.invToggle ? `<div class="p-row"><span>Фигур</span><button type="button" data-act="pinv" data-v="4">4</button><button type="button" data-act="pinv" data-v="6">6</button></div>` : ''}
      <label class="p-chk"><input type="checkbox" id="p-free"> Показать свободную зону поля</label>
      <ul class="p-tip">
        <li>Тяни фигуру из запаса на поле: над панелью едет иконка, над полем — сама фигура, она висит над пальцем.</li>
        <li>Поставленная фигура выделена: приподнята, рядом ↻ и ✥ (зажми и тяни). Тап по выделенной — тоже поворот.</li>
        <li>Можно оставить её в красном — дождётся поворота или переноса. Отпустить в красном не выйдет: тап мимо, «Ветер!» — фигура вздрогнет.</li>
        <li>Пока тащишь — внизу корзина. Свои фигуры — на жёлтой подложке, закреплённые — на каменном фундаменте.</li>
        <li>Провести по полю — повернуть остров (где отпустил, там и остался). Два пальца — приблизить.</li>
        <li>Пока несёшь фигуру над полем, остров приближается, а камера едет за фигурой.</li>
      </ul>
      <nav class="p-nav">${VARIANTS.map(v => `<a href="${v.file}"${v.key === cfg.key ? ' aria-current="page"' : ''}>${v.key} · ${v.name}</a>`).join('')}<a href="index.html">Все варианты</a></nav>
      <button type="button" class="p-close" data-act="proto">✕ Закрыть</button>`;
    document.body.append(protoTab, protoEl);
    protoEl.querySelector('#p-free').addEventListener('change', e => { st.showFree = e.target.checked; });
  }
  function updateProtoInfo() {
    if (!protoEl) return;
    const q = s => protoEl.querySelector(s);
    q('[data-p-layout]').textContent = LAYOUTS[html.dataset.layout] + ` (${html.dataset.layout})`;
    q('[data-p-input]').textContent = html.dataset.input === 'touch' ? 'палец' : 'мышь';
    q('[data-p-size]').textContent = `${innerWidth}×${innerHeight}`;
    for (const b of $$('[data-ph]', protoEl)) b.setAttribute('aria-pressed', String(b.dataset.ph === st.phase));
    for (const b of $$('[data-act="pview"]', protoEl)) b.setAttribute('aria-pressed', String(b.dataset.v === st.view));
    for (const b of $$('[data-act="ptilt"]', protoEl)) b.setAttribute('aria-pressed', String(b.dataset.v === st.tilt));
    for (const b of $$('[data-act="pinv"]', protoEl)) b.setAttribute('aria-pressed', String(+b.dataset.v === st.nInv));
    for (const b of $$('[data-act="pzoom"]', protoEl)) b.setAttribute('aria-pressed', String((b.dataset.v === 'on') === st.autoZoom));
    for (const b of $$('[data-act="pscene"]', protoEl)) b.setAttribute('aria-pressed', String((b.dataset.v === 'on') === st.scene));
  }

  function init(c) {
    cfg = c;
    if (c.view && VIEWS[c.view]) { st.view = c.view; st.ang = st.angT = VIEWS[c.view].base; }
    if (c.tilt && TILTS[c.tilt]) st.tilt = c.tilt;
    if (c.inv) st.nInv = c.inv;
    detect();
    frameEl = document.querySelector('.frame');
    cv = document.getElementById('c'); fctx = cv.getContext('2d');
    scv = document.createElement('canvas'); sctx = scv.getContext('2d');
    buildChrome(); buildInv();
    computeField();
    html.dataset.phase = st.phase;
    for (const e of $$('[data-show]')) e.hidden = !e.dataset.show.split(' ').includes(st.phase);
    updateUI();
    document.addEventListener('click', e => { if (e.target.closest('[data-piece]') || e.target.closest('[data-grab]')) return; const a = e.target.closest('[data-act]'); if (a) act(a.dataset.act, a); });
    document.addEventListener('pointerdown', onDown);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (e.target === cv && st.phase === 'build') { const p = pieceAtScreen(...local(e.clientX, e.clientY), false); if (p && !p.fixed) { if (p !== st.selected && !tryCommit()) return; select(p); rotateP(p); } }
    });
    cv.addEventListener('wheel', e => {
      e.preventDefault();
      st.zoom = Math.min(2.6, Math.max(1, st.zoom * Math.exp(-e.deltaY * 0.0015))); if (st.zoom <= 1.02) st.panX = st.panY = 0; layoutView(true);
    }, { passive: false });
    addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('input')) return;
      const k = e.code;
      if (st.paused && k !== 'Escape') return; // на паузе игра не слушает клавиши, кроме выхода из паузы
      if (k === 'KeyR') act('rot'); else if (k === 'KeyQ') act('camL'); else if (k === 'KeyE') act('camR');
      else if (k === 'Space') { e.preventDefault(); act('go'); }
      else if (k === 'Delete' || k === 'Backspace') act('stash');
      else if (k === 'Enter') act('ok');
      else if (k === 'KeyZ' && (e.metaKey || e.altKey)) act('undo'); // Ctrl не берём: Яндекс запрещает сочетания с Ctrl
      else if (k === 'Escape') { if (st.paused) setPause(false); else { st.sel = null; tryCommit(); } }
      else if (/^Digit[1-5]$/.test(k)) protoPhase(PHASES[+k.slice(5) - 1][0]);
    });
    addEventListener('resize', () => { detect(); queueFit(); });
    const ro = new ResizeObserver(queueFit);
    ro.observe(frameEl); for (const b of $$('[data-block]', frameEl)) if (b.dataset.block !== 'none') ro.observe(b);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);
    fit(); requestAnimationFrame(loop);
  }

  window.Proto = { init, on: (ev, f) => (listeners[ev] = listeners[ev] || []).push(f), toScreen, islandInfo, view, st, TYPES, FIXED };
})();
