// Перебор уровня вырубки: какие деревья срубить (ровно столько брёвен, сколько стоит решение) и куда поставить постройки решения.
// Показывает, сколько решений, какие деревья рубить опасно (срубишь — ломается дом) и где стоят постройки в решениях.
// Запуск: node tools/forest.js «Название уровня» [черновик.js]
// Для двух построек перебор долгий: ограничь клетки полем near: [[x0, y0, x1, y1]] в уровне.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const { loadSim, run, fieldMap } = require('./sim');

function getLevel(sim, name, file) {
  const list = file ? require(path.resolve(file)) : sim.LEVELS;
  return list.find(L => L.name === name);
}
const subsets = (arr, k) => k === 0 ? [[]] : arr.flatMap((a, i) => subsets(arr.slice(i + 1), k - 1).map(s => [a, ...s]));

if (isMainThread) {
  const [name, file] = process.argv.slice(2);
  const sim = loadSim(), L = getLevel(sim, name, file);
  if (!L) { console.log('Нет уровня', name); process.exit(1); }
  const w = sim.createWorld(); sim.applyLevel(w, L);
  const trees = w.pieces.filter(p => p.cut).map(p => [p.x, p.y]);
  const build = (L.solution || []).map(p => p.type), need = build.reduce((a, t) => a + L.cost[t], 0);
  const key = pc => sim.pieceCells(pc).map(c => c.join(',')).sort().join(';');
  const inNear = pc => !L.near || sim.pieceCells(pc).every(([x, y]) => L.near.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d));
  console.log(`${L.name}: ветер ${L.wind}, деревьев ${trees.length}, строим ${build.join(' + ')} = ${need} бр.`);
  // какие деревья опасно рубить: срубить одно — без построек — и посмотреть, что ломается (и что было до)
  const base = run(sim, L, [], { cuts: [] });
  console.log(`ничего не рубить и не строить: ${base.ok ? 'устояло' : base.fails.join('; ')}`);
  console.log(fieldMap(sim, L, [], { cuts: [] }).text);
  if (L.solution) {
    const f = fieldMap(sim, L, L.solution, { cuts: L.solutionCuts });
    console.log(`решение уровня: ${f.ok ? 'OK' : 'НЕТ ' + f.fails.join('; ')}, запас ${Math.round(f.worst * 100)}%`);
    console.log(f.text);
  }
  const cutSets = subsets(trees, need);
  // места построек на поле после вырубки — для простоты считаем на поле без всех деревьев из набора
  const jobs = [];
  for (const cuts of cutSets) {
    const ww = sim.createWorld(); sim.applyLevel(ww, L);
    ww.pieces = ww.pieces.filter(p => !(p.cut && cuts.some(([x, y]) => p.x === x && p.y === y)));
    const spots = t => {
      const seen = new Set(), out = [];
      for (let rot = 0; rot < 2; rot++) for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
        const pc = { type: t, x, y, rot }; if (!sim.canPlace(ww, pc) || !inNear(pc)) continue;
        const k = key(pc); if (seen.has(k)) continue; seen.add(k); out.push(pc);
      }
      return out;
    };
    const S = build.map(spots);
    const rec = (i, cur, cells) => {
      if (i === build.length) { jobs.push({ cuts, pcs: cur.slice() }); return; }
      for (const pc of S[i]) {
        const cs = sim.pieceCells(pc).map(c => c.join(','));
        if (cs.some(c => cells.has(c))) continue;
        if (i > 0 && build[i] === build[i - 1] && key(pc) <= key(cur[i - 1])) continue;
        cs.forEach(c => cells.add(c)); cur.push(pc); rec(i + 1, cur, cells); cur.pop(); cs.forEach(c => cells.delete(c));
      }
    };
    rec(0, [], new Set());
  }
  console.log(`наборов вырубки ${cutSets.length}, вариантов всего ${jobs.length}`);
  const N = require('os').cpus().length, res = []; let done = 0, t0 = Date.now();
  // одиночные вырубки (без построек): что ломается
  const single = trees.map(c => ({ c, r: run(sim, L, [], { cuts: [c] }) }));
  for (let k = 0; k < N; k++) new Worker(__filename, { workerData: { name, file, jobs: jobs.filter((_, j) => j % N === k) } }).on('message', m => {
    res.push(...m); if (++done < N) return;
    const ok = res.filter(r => r.ok).sort((a, b) => a.worst - b.worst);
    console.log(`\nрешений: ${ok.length} из ${res.length}  (${((Date.now() - t0) / 1000).toFixed(0)} с)`);
    const okSets = new Map();
    for (const r of ok) { const k = r.cuts.map(c => c.join(',')).join(' '); okSets.set(k, (okSets.get(k) || 0) + 1); }
    console.log(`рабочих наборов вырубки: ${okSets.size} из ${cutSets.length}`);
    for (const [k, n] of [...okSets].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  руби ${k}: мест для построек ${n}`);
    // дерево: в скольких % решений его рубят; одиночная вырубка — что ломается без построек
    const grid = new Map(trees.map(([x, y]) => [x + ',' + y, 0]));
    for (const r of ok) for (const [x, y] of r.cuts) grid.set(x + ',' + y, grid.get(x + ',' + y) + 1);
    console.log('\nдеревья: % решений, где дерево срублено (X — ни в одном)');
    for (let y = 0; y < 10; y++) {
      let s = String(y).padStart(3) + '  ';
      for (let x = 0; x < 10; x++) { const k = x + ',' + y; s += (grid.has(k) ? (ok.length ? (grid.get(k) ? String(Math.round(grid.get(k) / ok.length * 100)) : 'X') : '?') : '.').padStart(4); }
      console.log(s);
    }
    const hurt = single.filter(s => s.r.fails.length > base.fails.length).map(s => s.c.join(','));
    console.log(`срубишь одно — ломается больше, чем без вырубки: ${hurt.join(' ') || 'нет'}`);
    for (const t of [...new Set(build)]) {
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
    for (const r of ok.slice(0, 8)) console.log(`  ${Math.round(r.worst * 100)}%  руби ${r.cuts.map(c => c.join(',')).join(' ')} | ` + r.pcs.map(p => `${p.type} ${p.x},${p.y} r${p.rot}`).join(' | '));
  });
} else {
  const sim = loadSim(), L = getLevel(sim, workerData.name, workerData.file);
  parentPort.postMessage(workerData.jobs.map(j => {
    const r = run(sim, L, j.pcs, { stopOnBreak: true, cuts: j.cuts });
    return { cuts: j.cuts, pcs: j.pcs, ok: r.ok, worst: r.ok ? r.worst : 9 };
  }));
}
