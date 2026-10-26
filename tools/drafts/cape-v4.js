// черновики Мыса после плейтеста пользователя 2026-10-26: «Первый ветряк» без хат; «Забор и ветряк» — коридор из двух заборов
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const { LEVELS } = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS };')();
const base = n => JSON.parse(JSON.stringify(LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
module.exports = [
  v('Первый ветряк', 'ПВ-1', {
    fixed: [{ type: 'rock', x: 4, y: 3, rot: 0 }, { type: 'rock', x: 4, y: 2, rot: 0 }, { type: 'tree', x: 3, y: 7, rot: 0 }, { type: 'tree', x: 2, y: 7, rot: 0 }, { type: 'tree', x: 4, y: 7, rot: 0 },
            { type: 'stack', x: 8, y: 0, rot: 0 }, { type: 'stack', x: 0, y: 9, rot: 0 }],
    target: 40 }),
  v('Забор и ветряк', 'ЗВ-2', {
    fixed: [{ type: 'hut', x: 6, y: 2, rot: 0 }, { type: 'stack', x: 2, y: 0, rot: 0 }, { type: 'tree', x: 0, y: 9, rot: 0 }, { type: 'rock', x: 9, y: 1, rot: 0 }, { type: 'stack', x: 9, y: 8, rot: 0 }, { type: 'tree', x: 7, y: 8, rot: 0 }],
    inv: { fence: 2, mill: 1 }, target: 300,
    solution: [{ type: 'fence', x: 3, y: 1, rot: 1 }, { type: 'fence', x: 3, y: 5, rot: 1 }, { type: 'mill', x: 4, y: 4, rot: 0 }] }),
];
module.exports.push(
  // хата не в струе: струя только для ветряка, хата за высоткой
  v('Струя для ветряка', 'СВ-2', {
    fixed: [{ type: 'slab', x: 3, y: 1, rot: 1 }, { type: 'slab', x: 3, y: 4, rot: 1 }, { type: 'hut', x: 5, y: 5, rot: 0 }, { type: 'hut', x: 6, y: 1, rot: 0 }, { type: 'stack', x: 1, y: 8, rot: 0 }, { type: 'rock', x: 8, y: 8, rot: 0 }] }),
  v('Два ветряка', 'ДВ-2', {
    fixed: [{ type: 'slab', x: 3, y: 2, rot: 1 }, { type: 'slab', x: 3, y: 5, rot: 1 }, { type: 'hut', x: 5, y: 6, rot: 0 }, { type: 'hut', x: 6, y: 2, rot: 0 }, { type: 'tree', x: 1, y: 0, rot: 0 }, { type: 'rock', x: 0, y: 9, rot: 0 }, { type: 'stack', x: 8, y: 8, rot: 0 }] }),
  // финал: струю закрыть ветряком, хату в поле — забором, второй ветряк — где ветер огибает
  v('Ветряная ферма', 'ВФ-2', { wind: 17,
    fixed: [{ type: 'slab', x: 3, y: 1, rot: 1 }, { type: 'slab', x: 3, y: 4, rot: 1 }, { type: 'hut', x: 5, y: 3, rot: 0 }, { type: 'hut', x: 7, y: 7, rot: 0 }, { type: 'stack', x: 0, y: 9, rot: 0 }, { type: 'rock', x: 9, y: 9, rot: 0 }, { type: 'tree', x: 9, y: 0, rot: 0 }],
    inv: { mill: 2, fence: 1 }, target: 450,
    solution: [{ type: 'mill', x: 4, y: 3, rot: 0 }, { type: 'fence', x: 6, y: 6, rot: 1 }, { type: 'mill', x: 3, y: 0, rot: 0 }] }),
);
// проверка: одним забором 250 не набрать (коридор обязателен)
module.exports.push(v('Забор и ветряк', 'ЗВ-1забор', {
  fixed: module.exports.find(l => l.name === 'ЗВ-2').fixed, inv: { fence: 1, mill: 1 }, target: 250, wind: 17, solution: null }));
// хата на (4,1): без забора сдувает
const zv3 = { fixed: [{ type: 'hut', x: 4, y: 1, rot: 0 }, { type: 'stack', x: 2, y: 0, rot: 0 }, { type: 'tree', x: 0, y: 9, rot: 0 }, { type: 'rock', x: 9, y: 1, rot: 0 }, { type: 'stack', x: 9, y: 8, rot: 0 }, { type: 'tree', x: 7, y: 8, rot: 0 }] };
module.exports.push(
  v('Забор и ветряк', 'ЗВ-3', { ...zv3, target: 250 }),
  v('Забор и ветряк', 'ЗВ-3-1забор', { ...zv3, target: 250, inv: { fence: 1, mill: 1 }, solution: null }),
);
