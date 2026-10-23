// Перебор всех расстановок запаса уровня: сколько решений и где стоят фигуры в решениях.
// Нужен, чтобы проверить, что решение читается по полю ветра, а не одно-единственное «до клетки».
// Запуск: node tools/solve.js «Название уровня»        — уровень из Порыв.html
//         node tools/solve.js «Название» файл.js         — уровень из файла (module.exports = [уровни]) — для черновиков
// Для 3+ фигур перебор долгий: ограничь клетки полем near: [[x0, y0, x1, y1]] в уровне.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const { loadSim, run, fieldMap } = require('./sim');

function getLevel(sim, name, file) {
  const list = file ? require(path.resolve(file)) : sim.LEVELS;
  return list.find(L => L.name === name);
}

if (isMainThread) {
  const [name, file] = process.argv.slice(2);
  const sim = loadSim(), L = getLevel(sim, name, file);
  if (!L) { console.log('Нет уровня', name); process.exit(1); }
  const key = pc => sim.pieceCells(pc).map(c => c.join(',')).sort().join(';');
  const inv = Object.entries(L.inv).flatMap(([t, n]) => Array(n).fill(t));
  const inNear = pc => !L.near || sim.pieceCells(pc).every(([x, y]) => L.near.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d));
  // все места каждой фигуры на пустом уровне
  const w = sim.createWorld(); sim.applyLevel(w, L);
  const spots = t => {
    const seen = new Set(), out = [];
    for (let rot = 0; rot < 4; rot++) for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const pc = { type: t, x, y, rot };
      if (!sim.canPlace(w, pc) || !inNear(pc)) continue;
      const k = key(pc); if (seen.has(k) && sim.TYPES[t].kind !== 'wedge') continue; seen.add(k); out.push(pc);
    }
    return out;
  };
  const S = inv.map(spots);
  // комбинации без пересечений; одинаковые фигуры — без перестановок
  const combos = [];
  const rec = (i, cur, cells, minIdx) => {
    if (i === inv.length) { combos.push(cur.slice()); return; }
    const from = i > 0 && inv[i] === inv[i - 1] ? minIdx : 0;
    for (let j = from; j < S[i].length; j++) {
      const pc = S[i][j], cs = sim.pieceCells(pc).map(c => c.join(','));
      if (cs.some(c => cells.has(c))) continue;
      cs.forEach(c => cells.add(c)); cur.push(pc);
      rec(i + 1, cur, cells, j + 1);
      cur.pop(); cs.forEach(c => cells.delete(c));
    }
  };
  rec(0, [], new Set(), 0);
  const empty = run(sim, L, []);
  console.log(`${L.name}: ветер ${L.wind}, запас ${inv.join(' ')}, вариантов ${combos.length}; пустое поле: ${empty.ok ? 'ПРОХОДИТ' : 'нет (' + empty.fails.join('; ') + ')'}`);
  console.log(fieldMap(sim, L, []).text);
  if (L.solution) { const f = fieldMap(sim, L, L.solution); console.log(`решение уровня: ${f.ok ? 'OK' : 'НЕТ ' + f.fails.join('; ')}, запас ${Math.round(f.worst * 100)}%`); console.log(f.text); }
  const N = require('os').cpus().length, res = []; let done = 0, t0 = Date.now();
  for (let k = 0; k < N; k++) new Worker(__filename, { workerData: { name, file, combos: combos.filter((_, j) => j % N === k) } }).on('message', m => {
    res.push(...m); if (++done < N) return;
    const ok = res.filter(r => r.ok).sort((a, b) => a.worst - b.worst);
    console.log(`\nрешений: ${ok.length} из ${res.length}  (${((Date.now() - t0) / 1000).toFixed(0)} с)`);
    // где стоят фигуры в решениях: сколько решений накрывают клетку (по типам)
    for (const t of [...new Set(inv)]) {
      const cnt = new Map();
      for (const r of ok) for (const pc of r.pcs) if (pc.type === t) for (const [x, y] of sim.pieceCells(pc)) cnt.set(x + ',' + y, (cnt.get(x + ',' + y) || 0) + 1);
      console.log(`\n${sim.TYPES[t].name}: клетки в решениях (% решений)`);
      for (let y = 0; y < 10; y++) {
        let s = String(y).padStart(3) + '  ';
        for (let x = 0; x < 10; x++) { const c = cnt.get(x + ',' + y) || 0; s += (c ? String(Math.round(c / ok.length * 100)) : '.').padStart(4); }
        console.log(s);
      }
    }
    console.log('\nлучшие (по запасу):');
    for (const r of ok.slice(0, 8)) console.log(`  ${Math.round(r.worst * 100)}%  ` + r.pcs.map(p => `${p.type} ${p.x},${p.y} r${p.rot}`).join(' | '));
  });
} else {
  const sim = loadSim(), L = getLevel(sim, workerData.name, workerData.file);
  parentPort.postMessage(workerData.combos.map(pcs => {
    const r = run(sim, L, pcs, { stopOnBreak: true, gatePlan: L.gatePlan });
    return { pcs, ok: r.ok, worst: r.ok ? r.worst : 9 };
  }));
}
