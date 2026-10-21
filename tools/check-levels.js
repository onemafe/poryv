// Проверка уровней без браузера: для каждого уровня из Порыв.html
//   — проверенное решение (solution) проходит;
//   — пустое поле (ничего не поставлено) не проходит;
//   — запас: решение держится и при вдвое более долгом ветре (поток успевает установиться).
//   — звёзды: решение даёт ★★★, а запас прочности решения совпадает с PAR (иначе — обновить PAR в Порыв.html).
//     Если нет — уровень проходится только потому, что прогон кончился раньше вихря.
// Запуск: node tools/check-levels.js            — все уровни
//         node tools/check-levels.js Деревня    — только глава
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'Порыв.html'), 'utf8');
const script = html.split('<script>')[1].split('// ===== Игра: ввод')[0]; // ядро симуляции — без DOM
const sim = new Function(script + ';return { createWorld, applyLevel, beginRun, runStep, evaluate, rebuild, worstLoad, starsFor, PAR, LEVELS };')();

// gatePlan — интервалы, когда ворота закрыты (как st.autoGate в игре); без плана ворота всё время открыты
function run(L, placed, durMul = 1, gatePlan = null) {
  const w = sim.createWorld();
  sim.applyLevel(w, L);
  w.duration *= durMul;
  for (const p of placed) w.pieces.push({ ...p, broken: false, load: 0, hp: 1 });
  sim.rebuild(w); sim.beginRun(w);
  while (w.running) {
    if (gatePlan) for (const g of w.pieces) if (g.type === 'gate' && !g.jammed) {
      const shut = gatePlan.some(([a, b]) => w.t >= a && w.t < b);
      if (g.open === shut) { g.open = !shut; sim.rebuild(w); }
    }
    sim.runStep(w, 1 / 60);
  }
  const ev = sim.evaluate(w);
  return { ok: ev.ok, fails: ev.fails.map(f => f.text), worst: sim.worstLoad(w).r, stars: ev.ok ? sim.starsFor(w, L) : 0 };
}

const only = process.argv[2];
let bad = 0;
sim.LEVELS.forEach((L, i) => {
  if (only && L.chapter !== only) return;
  const sol = run(L, L.solution || [], 1, L.gatePlan);
  const empty = run(L, []);
  const long = run(L, L.solution || [], 2, L.gatePlan);
  const placesHouse = Object.keys(L.inv).some(t => ['hut', 'house', 'corner', 'tower', 'slab'].includes(t));
  // уровни «поставь свой дом»: пустое поле проходит в симуляции, но игра не засчитает без всех фигур
  const emptyBad = empty.ok && !placesHouse;
  const parOff = sol.ok && Math.abs(sol.worst - (sim.PAR[L.name] || 0)) > 0.02;
  if (!sol.ok || emptyBad || sol.stars !== 3 || parOff) bad++;
  console.log(`${String(i + 1).padStart(2)} ${L.name.padEnd(18)} решение: ${sol.ok ? 'OK' : 'НЕ ПРОХОДИТ (' + sol.fails.join('; ') + ')'}`
    + ` | пустое поле: ${empty.ok ? (emptyBad ? 'ПРОХОДИТ — слишком легко' : 'проходит (свой дом — норм)') : 'не проходит'}`
    + (sol.ok && !long.ok ? ` | ⚠ при долгом ветре ломается (${long.fails.join('; ')})` : '')
    + (sol.ok ? ` | ${'★'.repeat(sol.stars)}, запас ${Math.round(sol.worst * 100)}%` + (parOff ? ` — ПОПРАВИТЬ PAR на ${sol.worst.toFixed(2)}` : '') : ''));
});
console.log(bad ? `\nПроблемных уровней: ${bad}` : '\nВсе уровни в порядке.');
process.exit(bad ? 1 : 0);
