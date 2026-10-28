// черновики объединённого Города (2026-10-28, после прохождения): «Новый квартал» с хатой сбоку — дерево нужно ей
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const { LEVELS } = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS };')();
const base = n => JSON.parse(JSON.stringify(LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
const nk = base('Новый квартал');
module.exports = [
  v('Новый квартал', 'Квартал-6,6', { fixed: [...nk.fixed, { type: 'hut', x: 6, y: 6, rot: 0 }], solution: [{ type: 'house', x: 3, y: 3, rot: 0 }, { type: 'tree', x: 4, y: 6, rot: 0 }] }),
  v('Новый квартал', 'Квартал-7,6', { fixed: [...nk.fixed, { type: 'hut', x: 7, y: 6, rot: 0 }], solution: [{ type: 'house', x: 3, y: 3, rot: 0 }, { type: 'tree', x: 4, y: 6, rot: 0 }] }),
];
