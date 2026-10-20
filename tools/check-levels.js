// Проверка уровней без браузера: для каждого уровня из Порыв.html
//   — проверенное решение (solution) проходит;
//   — пустое поле (ничего не поставлено) не проходит.
// Запуск: node tools/check-levels.js            — все уровни
//         node tools/check-levels.js Деревня    — только глава
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'Порыв.html'), 'utf8');
const script = html.split('<script>')[1].split('// ===== Игра: ввод')[0]; // ядро симуляции — без DOM
const sim = new Function(script + ';return { createWorld, applyLevel, beginRun, runStep, evaluate, rebuild, LEVELS };')();

function run(L, placed) {
  const w = sim.createWorld();
  sim.applyLevel(w, L);
  for (const p of placed) w.pieces.push({ ...p, broken: false, load: 0, hp: 1 });
  sim.rebuild(w); sim.beginRun(w);
  while (w.running) sim.runStep(w, 1 / 60);
  const ev = sim.evaluate(w);
  return { ok: ev.ok, fails: ev.fails.map(f => f.text) };
}

const only = process.argv[2];
let bad = 0;
sim.LEVELS.forEach((L, i) => {
  if (only && L.chapter !== only) return;
  const sol = run(L, L.solution || []);
  const empty = run(L, []);
  const placesHouse = Object.keys(L.inv).some(t => ['hut', 'house', 'corner', 'tower', 'slab'].includes(t));
  // уровни «поставь свой дом»: пустое поле проходит в симуляции, но игра не засчитает без всех фигур
  const emptyBad = empty.ok && !placesHouse;
  if (!sol.ok || emptyBad) bad++;
  console.log(`${String(i + 1).padStart(2)} ${L.name.padEnd(18)} решение: ${sol.ok ? 'OK' : 'НЕ ПРОХОДИТ (' + sol.fails.join('; ') + ')'}`
    + ` | пустое поле: ${empty.ok ? (emptyBad ? 'ПРОХОДИТ — слишком легко' : 'проходит (свой дом — норм)') : 'не проходит'}`);
});
console.log(bad ? `\nПроблемных уровней: ${bad}` : '\nВсе уровни в порядке.');
process.exit(bad ? 1 : 0);
