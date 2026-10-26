// черновики «Бури» (2026-10-26): третья хата между двумя, деревья впереди должны работать
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const { LEVELS } = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS };')();
const base = n => JSON.parse(JSON.stringify(LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
const B = base('Буря'), rest = B.fixed.filter(p => p.type !== 'hut' && p.type !== 'tree');
const P = (type, x, y) => ({ type, x, y, rot: 0 });
const huts = ys => ys.map(y => P('hut', 6, y)), trees = cs => cs.map(([x, y]) => P('tree', x, y));
module.exports = [
  v('Буря', 'Б-хата5', { fixed: [...B.fixed, P('hut', 6, 5)] }),
  v('Буря', 'Б-258', { fixed: [...rest, ...huts([2, 5, 8]), ...trees([[1, 6], [1, 7], [1, 8]])] }),
  v('Буря', 'Б-258-роща', { fixed: [...rest, ...huts([2, 5, 8]), ...trees([[2, 6], [2, 7], [2, 8], [1, 7]])] }),
  v('Буря', 'Б-роща-25', { wind: 25, fixed: [...rest, ...huts([2, 5, 8]), ...trees([[2, 6], [2, 7], [2, 8], [1, 7]])] }),
  v('Буря', 'Б-257-25', { wind: 25, fixed: [...B.fixed, P('hut', 6, 5)] }),
];
