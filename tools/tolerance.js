// Допуск уровня: для каждой фигуры решения — в скольких местах она может стоять, если остальные стоят по решению.
// 1–3 места — игроку придётся подбирать до клетки; 6+ — решение читается по полю ветра.
// Запуск: node tools/tolerance.js «Название уровня»   — один уровень (≈10–30 с)
//         node tools/tolerance.js Деревня              — вся глава
//         node tools/tolerance.js «Название» черновик.js — уровень из черновика (module.exports = [уровни])
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const { loadSim, run } = require('./sim');

const levelsOf = (sim, file) => (file ? require(path.resolve(file)) : sim.LEVELS);
function ok(sim, L, placed) {
  return run(sim, L, placed, { stopOnBreak: true, gatePlan: L.gatePlan, cuts: L.solutionCuts || [] }).ok;
}

if (isMainThread) {
  const sim = loadSim(), [arg, file] = process.argv.slice(2);
  const levels = levelsOf(sim, file).filter(L => (L.solution || []).length && (!arg || L.name === arg || L.chapter === arg));
  if (!levels.length) { console.log('Нет уровней с решением' + (arg ? ` для «${arg}»` : '')); process.exit(1); }
  const key = pc => sim.pieceCells(pc).map(c => c.join(',')).sort().join(';');
  const jobs = [];
  for (const L of levels) L.solution.forEach((s, i) => {
    const others = L.solution.filter((_, j) => j !== i), seen = new Set();
    const w = sim.createWorld(); sim.applyLevel(w, L);
    w.pieces = w.pieces.filter(p => !(p.cut && (L.solutionCuts || []).some(([x, y]) => p.x === x && p.y === y)));
    for (const p of others) w.pieces.push({ ...p });
    for (let rot = 0; rot < 4; rot++) for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const pc = { type: s.type, x, y, rot };
      if (!sim.canPlace(w, pc)) continue;
      const k = key(pc); if (seen.has(k)) continue; seen.add(k); // повёрнутая на 180° фигура занимает те же клетки
      jobs.push({ L: L.name, i, pc, pcs: [...others, pc] });
    }
  });
  const N = require('os').cpus().length, res = []; let done = 0;
  for (let k = 0; k < N; k++) new Worker(__filename, { workerData: { file, jobs: jobs.filter((_, j) => j % N === k) } }).on('message', m => {
    res.push(...m); if (++done < N) return;
    for (const L of levels) {
      console.log(L.name);
      L.solution.forEach((s, i) => {
        const all = res.filter(r => r.L === L.name && r.i === i), good = all.filter(r => r.ok);
        const spots = good.map(r => `${r.pc.x},${r.pc.y}${r.pc.rot % 2 ? '|' : '-'}`).join(' ');
        console.log(`  ${s.type.padEnd(7)} ${String(good.length).padStart(3)} из ${all.length}${good.length <= 3 ? '  ⚠ до клетки' : ''}  ${spots}`);
      });
    }
  });
} else {
  const sim = loadSim(), list = levelsOf(sim, workerData.file);
  parentPort.postMessage(workerData.jobs.map(j => ({ L: j.L, i: j.i, pc: j.pc, ok: ok(sim, list.find(L => L.name === j.L), j.pcs) })));
}
