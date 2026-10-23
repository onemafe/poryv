// Общее для инструментов: ядро симуляции из Порыв.html (без DOM) и прогон уровня.
const fs = require('fs');
const path = require('path');

function loadSim() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'Порыв.html'), 'utf8');
  const script = html.split('<script>')[1].split('// ===== Игра: ввод')[0];
  return new Function(script + ';return { createWorld, applyLevel, beginRun, runStep, evaluate, rebuild, canPlace, pieceCells, worstLoad, starsFor, speedAtCell, cellMean, TYPES, PAR, LEVELS, BOARD };')();
}

// прогон: placed — фигуры игрока; опции: durMul, gatePlan, stopOnBreak, peaks — скорость по клеткам (максимум за прогон)
function run(sim, L, placed, o = {}) {
  const w = sim.createWorld();
  sim.applyLevel(w, L);
  w.duration *= o.durMul || 1;
  // вырубка: срубленные деревья убираем (по умолчанию — как в решении уровня, если ставим решение)
  const cuts = o.cuts || (placed === L.solution ? L.solutionCuts : null) || [];
  w.pieces = w.pieces.filter(p => !(p.cut && cuts.some(([x, y]) => p.x === x && p.y === y)));
  for (const p of placed) w.pieces.push({ ...p, broken: false, load: 0, hp: 1 });
  sim.rebuild(w); sim.beginRun(w);
  const peak = o.peaks ? new Float32Array(sim.BOARD * sim.BOARD) : null;
  let broke = false;
  while (w.running) {
    if (o.gatePlan) for (const g of w.pieces) if (g.type === 'gate' && !g.jammed) {
      const shut = o.gatePlan.some(([a, b]) => w.t >= a && w.t < b);
      if (g.open === shut) { g.open = !shut; sim.rebuild(w); }
    }
    const b = sim.runStep(w, 1 / 60);
    if (b && b.length) { broke = true; if (o.stopOnBreak) return { ok: false, w }; }
    if (peak && w.t > 1.5) for (let y = 0; y < sim.BOARD; y++) for (let x = 0; x < sim.BOARD; x++) {
      const v = sim.speedAtCell(w, x + 0.5, y + 0.5); if (v > peak[y * sim.BOARD + x]) peak[y * sim.BOARD + x] = v;
    }
  }
  const ev = sim.evaluate(w);
  return { ok: ev.ok, fails: ev.fails.map(f => f.text), w, peak, worst: sim.worstLoad(w).r };
}

// карта: буквы построек и скорость ветра в клетках (м/с, максимум за прогон после разгона)
const LETTER = { stack: 's', wall: '#', kiosk: 'k', hut: 'h', house: 'H', corner: 'L', tower: 'T', slab: 'S', fence: 'f', tree: 't', mill: 'm', rock: 'r', arch: 'A', rotunda: 'O', wedge: 'W', chimney: 'C', tent: 'p', gate: 'g', wattle: 'w' };
function fieldMap(sim, L, placed, o = {}) {
  const r = run(sim, L, placed, { ...o, peaks: true });
  const occ = new Map();
  for (const p of r.w.pieces) for (const [x, y] of sim.pieceCells(p)) occ.set(x + ',' + y, (p.broken ? '!' : '') + LETTER[p.type]);
  const lines = ['     ' + Array.from({ length: sim.BOARD }, (_, x) => String(x).padStart(3)).join('')];
  for (let y = 0; y < sim.BOARD; y++) {
    let s = String(y).padStart(3) + '  ';
    for (let x = 0; x < sim.BOARD; x++) {
      const k = x + ',' + y;
      if (occ.has(k)) s += occ.get(k).padStart(3);
      else if (r.w.roads.has(k)) s += (Math.round(r.peak[y * sim.BOARD + x]) + '=').padStart(3);
      else s += String(Math.round(r.peak[y * sim.BOARD + x])).padStart(3);
    }
    lines.push(s);
  }
  return { text: lines.join('\n'), ok: r.ok, fails: r.fails, worst: r.worst, w: r.w };
}

module.exports = { loadSim, run, fieldMap };
