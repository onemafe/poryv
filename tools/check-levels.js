// Проверка уровней без браузера: для каждого уровня из Порыв.html
//   — проверенное решение (solution) проходит;
//   — пустое поле (ничего не поставлено) не проходит;
//   — запас: решение держится и при вдвое более долгом ветре (поток успевает установиться).
//   — звёзды: решение даёт ★★★, а запас прочности решения совпадает с PAR (иначе — обновить PAR в Порыв.html).
//     Если нет — уровень проходится только потому, что прогон кончился раньше вихря.
// Запуск: node tools/check-levels.js            — все уровни
//         node tools/check-levels.js Деревня    — только глава
//         node tools/check-levels.js --fix      — заодно переписать PAR в Порыв.html по проверенным решениям
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'Порыв.html'), 'utf8');
const script = html.split('<script>')[1].split('// ===== Игра: ввод')[0]; // ядро симуляции — без DOM
const sim = new Function(script + ';return { createWorld, applyLevel, beginRun, runStep, evaluate, rebuild, worstLoad, starsFor, PAR, LEVELS };')();

function run(L, placed, durMul = 1) {
  const w = sim.createWorld();
  sim.applyLevel(w, L);
  w.duration *= durMul;
  if (placed === L.solution) w.pieces = w.pieces.filter(p => !(p.cut && (L.solutionCuts || []).some(([x, y]) => p.x === x && p.y === y))); // вырубка решения
  for (const p of placed) w.pieces.push({ ...p, broken: false, load: 0, hp: 1 });
  sim.rebuild(w); sim.beginRun(w);
  while (w.running) sim.runStep(w, 1 / 60);
  const ev = sim.evaluate(w);
  return { ok: ev.ok, fails: ev.fails.map(f => f.text), worst: sim.worstLoad(w).r, stars: ev.ok ? sim.starsFor(w, L) : 0 };
}

const fix = process.argv.includes('--fix'), only = process.argv.slice(2).find(a => a !== '--fix');
const par = {}; // PAR только по уровням, что есть в игре
for (const L of sim.LEVELS) if (L.id in sim.PAR) par[L.id] = sim.PAR[L.id];
let bad = 0;
// id — постоянный ключ звёзд и PAR: у каждого уровня свой
const seen = new Set();
for (const L of sim.LEVELS) {
  if (!Number.isInteger(L.id) || L.id <= 0) { console.log(`${L.name}: нет постоянного id`); bad++; }
  else if (seen.has(L.id)) { console.log(`${L.name}: id ${L.id} уже занят`); bad++; }
  seen.add(L.id);
}
sim.LEVELS.forEach((L, i) => {
  if (only && L.chapter !== only) return;
  const sol = run(L, L.solution || []);
  const empty = run(L, []);
  const long = run(L, L.solution || [], 2);
  const placesHouse = Object.keys(L.inv).some(t => ['hut', 'house', 'corner', 'slab'].includes(t));
  // уровни «поставь свой дом»: пустое поле проходит в симуляции, но игра не засчитает без всех фигур
  const emptyBad = empty.ok && !placesHouse;
  const parOff = sol.ok && Math.abs(sol.worst - (sim.PAR[L.id] || 0)) > 0.02;
  if (sol.ok) par[L.id] = +sol.worst.toFixed(2);
  if (!sol.ok || emptyBad || sol.stars !== 3 || parOff) bad++;
  console.log(`${String(i + 1).padStart(2)} ${L.name.padEnd(18)} решение: ${sol.ok ? 'OK' : 'НЕ ПРОХОДИТ (' + sol.fails.join('; ') + ')'}`
    + ` | пустое поле: ${empty.ok ? (emptyBad ? 'ПРОХОДИТ — слишком легко' : 'проходит (свой дом — норм)') : 'не проходит'}`
    + (sol.ok && !long.ok ? ` | ⚠ при долгом ветре ломается (${long.fails.join('; ')})` : '')
    + (sol.ok ? ` | ${'★'.repeat(sol.stars)}, запас ${Math.round(sol.worst * 100)}%` + (parOff ? ` — ПОПРАВИТЬ PAR на ${sol.worst.toFixed(2)}` : '') : ''));
});
if (fix) {
  const file = path.join(__dirname, '..', 'Порыв.html'), src = fs.readFileSync(file, 'utf8');
  const keys = Object.keys(par), lines = [];
  for (let i = 0; i < keys.length; i += 12) lines.push(keys.slice(i, i + 12).map(k => `${k}: ${par[k]}`).join(', '));
  fs.writeFileSync(file, src.replace(/const PAR = \{[\s\S]*?\};/, `const PAR = { ${lines.join(',\n  ')} };`));
  console.log('\nPAR переписан в Порыв.html — запусти проверку ещё раз.');
}
console.log(bad ? `\nПроблемных уровней: ${bad}` : '\nВсе уровни в порядке.');
process.exit(bad ? 1 : 0);
