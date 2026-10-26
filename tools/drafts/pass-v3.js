// черновики Перевала после ИИ-плейтеста 2026-10-25
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const sim = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS, pieceCells };')();
const base = n => JSON.parse(JSON.stringify(sim.LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
// отражение сверху вниз: та же фигура, клетки (x, 9 − y)
const key = cs => cs.map(String).sort().join(';');
const flip = p => { const want = key(sim.pieceCells(p).map(([x, y]) => [x, 9 - y]));
  for (let rot = 0; rot < 4; rot++) for (let y = -2; y < 10; y++) for (let x = -2; x < 10; x++) { const q = { ...p, x, y, rot }; if (key(sim.pieceCells(q)) === want) return q; }
  throw new Error('нет отражения ' + JSON.stringify(p)); };
const mirror = (n, name) => { const L = base(n);
  return Object.assign(L, { name, fixed: L.fixed.map(flip), solution: L.solution.map(flip), roads: L.roads.map(r => r.map(([x, y]) => [x, 9 - y])) }); };
module.exports = [
  mirror('Перед перевалом', 'ПП-зеркало'),
  v('Хата в сугробе', 'ХС-13', { wind: 13 }),
  v('Хата в сугробе', 'ХС-14', { wind: 14 }),
  ...[[4, 4], [4, 5], [5, 5], [6, 4]].map(([x, y]) => { const L = v('Хата в сугробе', `ХС-${x}${y}`, {});
    L.fixed = L.fixed.map(p => p.type === 'hut' ? { ...p, x, y } : p); L.solution = [{ type: 'fence', x: x - 1, y: y - 1, rot: 1 }]; return L; }),
  (() => { const L = v('Хата в сугробе', 'ХС-3камня', {}); L.fixed.push({ type: 'rock', x: 2, y: 3, rot: 0 }); return L; })(),
];
