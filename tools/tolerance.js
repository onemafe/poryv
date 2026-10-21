// Допуск уровня: для каждой фигуры решения — в скольких местах она может стоять, если остальные стоят по решению.
// 1–3 места — игроку придётся подбирать до клетки; 6+ — решение читается по полю ветра.
// Запуск: node tools/tolerance.js «Название уровня»   — один уровень (≈10–30 с)
//         node tools/tolerance.js Деревня              — вся глава
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

function loadSim() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'Порыв.html'), 'utf8');
  const script = html.split('<script>')[1].split('// ===== Игра: ввод')[0];
  return new Function(script + ';return { createWorld, applyLevel, beginRun, runStep, evaluate, rebuild, canPlace, pieceCells, LEVELS };')();
}
function run(sim, L, placed) {
  const w = sim.createWorld();
  sim.applyLevel(w, L);
  for (const p of placed) w.pieces.push({ ...p, broken: false, load: 0, hp: 1 });
  sim.rebuild(w); sim.beginRun(w);
  while (w.running) {
    const broke = sim.runStep(w, 1 / 60);
    if (broke && broke.length && w.mode === 'threshold') return false; // что-то сломалось — дальше можно не считать
  }
  return sim.evaluate(w).ok;
}

if (isMainThread) {
  const sim = loadSim(), arg = process.argv[2];
  const levels = sim.LEVELS.filter(L => (L.solution || []).length && (!arg || L.name === arg || L.chapter === arg));
  if (!levels.length) { console.log('Нет уровней с решением' + (arg ? ` для «${arg}»` : '')); process.exit(1); }
  const key = pc => sim.pieceCells(pc).map(c => c.join(',')).sort().join(';');
  const jobs = [];
  for (const L of levels) L.solution.forEach((s, i) => {
    const others = L.solution.filter((_, j) => j !== i), seen = new Set();
    const w = sim.createWorld(); sim.applyLevel(w, L);
    for (const p of others) w.pieces.push({ ...p });
    for (let rot = 0; rot < 4; rot++) for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const pc = { type: s.type, x, y, rot };
      if (!sim.canPlace(w, pc)) continue;
      const k = key(pc); if (seen.has(k)) continue; seen.add(k); // повёрнутая на 180° фигура занимает те же клетки
      jobs.push({ L: L.name, i, pc, pcs: [...others, pc] });
    }
  });
  const N = require('os').cpus().length, res = []; let done = 0;
  for (let k = 0; k < N; k++) new Worker(__filename, { workerData: jobs.filter((_, j) => j % N === k) }).on('message', m => {
    res.push(...m); if (++done < N) return;
    for (const L of levels) {
      console.log(L.name);
      L.solution.forEach((s, i) => {
        const all = res.filter(r => r.L === L.name && r.i === i), ok = all.filter(r => r.ok);
        const spots = ok.map(r => `${r.pc.x},${r.pc.y}${r.pc.rot % 2 ? '|' : '-'}`).join(' ');
        console.log(`  ${s.type.padEnd(7)} ${String(ok.length).padStart(3)} из ${all.length}${ok.length <= 3 ? '  ⚠ до клетки' : ''}  ${spots}`);
      });
    }
  });
} else {
  const sim = loadSim();
  parentPort.postMessage(workerData.map(j => ({ L: j.L, i: j.i, pc: j.pc, ok: run(sim, sim.LEVELS.find(L => L.name === j.L), j.pcs) })));
}
