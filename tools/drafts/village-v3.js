// черновики Деревни, пила v3 (после ИИ-плейтеста 2026-10-25): варианты «Бури», «Хат в ряд», «Новоселья»
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const { LEVELS } = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS };')();
const base = n => JSON.parse(JSON.stringify(LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
module.exports = [
  v('Буря', 'Буря-28', { wind: 28 }),
  v('Буря', 'Буря-27', { wind: 27 }),
  v('Хаты в ряд', 'Ряд-23', { wind: 23 }),
  v('Хаты в ряд', 'Ряд-24', { wind: 24 }),
  v('Новоселье', 'Новоселье-24', { wind: 24 }),
  v('Новоселье', 'Новоселье-26', { wind: 26 }),
  v('Хаты в ряд', 'Ряд-1дерево', { inv: { fence: 1, tree: 1 }, solution: [{ type: 'fence', x: 2, y: 5, rot: 1 }, { type: 'tree', x: 3, y: 2, rot: 0 }] }),
  v('Соседки', 'Соседки-раздвинуть', { fixed: base('Соседки').fixed.map(p => p.type === 'hut' && p.y === 4 ? { ...p, y: 3 } : p) }),
  v('Соседки', 'Соседки-шире', { fixed: base('Соседки').fixed.map(p => p.type === 'hut' && p.y === 4 ? { ...p, y: 3 } : p.type === 'hut' ? { ...p, y: 7 } : p) }),
];
