// черновики Города после ИИ-плейтеста 2026-10-25: финал труднее
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const { LEVELS } = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS };')();
const base = n => JSON.parse(JSON.stringify(LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
const list = [
  v('Буря над городом', 'БГ-17', { wind: 17 }),
  v('Буря над городом', 'БГ-18', { wind: 18 }),
  v('Буря над городом', 'БГ-19', { wind: 19 }),
  v('Буря над городом', 'БГ-смена', { duration: 10, shift: { at: 4.5, dir: [0, 1] } }),
  v('Буря над городом', 'БГ-смена-юг', { duration: 10, shift: { at: 4.5, dir: [0, -1] } }),
  v('Буря над городом', 'БГ-смена-угол', { duration: 10, shift: { at: 4.5, dir: [0, 1] }, inv: { tree: 1, slab: 1, corner: 1 } }),
  // финал v3: ветер 15, через 4.5 с поворачивает с севера; в запасе дерево, высотка, угловой дом
  v('Буря над городом', 'БГ-v3', { wind: 15, duration: 10, shift: { at: 4.5, dir: [0, 1] }, inv: { tree: 1, slab: 1, corner: 1 },
    solution: [{ type: 'tree', x: 1, y: 3, rot: 0 }, { type: 'slab', x: 2, y: 6, rot: 1 }, { type: 'corner', x: 3, y: 5, rot: 0 }] }),
];
const v3 = list.find(L => L.name === 'БГ-v3');
for (const w of [15.5, 16]) list.push({ ...JSON.parse(JSON.stringify(v3)), name: 'БГ-v3-' + w, wind: w });
list.push({ ...JSON.parse(JSON.stringify(v3)), name: 'БГ-v4', inv: { tree: 1, corner: 1 },
  solution: [{ type: 'tree', x: 1, y: 3, rot: 0 }, { type: 'corner', x: 3, y: 5, rot: 0 }] });
module.exports = list;
