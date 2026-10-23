// черновики Перевала (снег). Сугроб ложится примерно в трёх клетках за преградой; забор вплотную перед дорогой перекидывает его за дорогу.
// Проверка: node tools/solve.js «уровень» tools/drafts/pass.js; node tools/snow.js «уровень» tools/drafts/pass.js '[фигуры]'
const R = (x, y, t = 'rock', rot = 0) => ({ type: t, x, y, rot });
const snow = { mode: 'Занос', duration: 10, mods: { drift: 'snow' }, wind: 12, dir: [1, 0] };
module.exports = [
  // сугроб от скал ложится на дорогу — забор вплотную перед дорогой перекинет его дальше
  { name: 'P3', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(3, 2), R(3, 3), R(8, 7, 'hut'), R(0, 8, 'stack'), R(9, 0, 'rock'), R(1, 5, 'tree')],
    inv: { fence: 1 }, solution: [R(5, 1, 'fence', 1)] },
  // хата у дороги: за хатой тоже ляжет сугроб — не ставь её прямо перед дорогой
  { name: 'P4', ...snow, roads: [[[5, 0], [5, 9]]],
    fixed: [R(1, 2), R(1, 3), R(8, 1, 'tree'), R(9, 8, 'stack'), R(0, 8, 'rock')],
    inv: { hut: 2 }, solution: [R(7, 5, 'hut'), R(2, 7, 'hut')] },
  // два сугроба на дороге — два забора
  { name: 'P6', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(3, 1), R(3, 2), R(3, 6, 'stack'), R(3, 7, 'stack'), R(8, 4, 'hut'), R(0, 4, 'tree'), R(9, 9, 'rock')],
    inv: { fence: 2 }, solution: [R(5, 0, 'fence', 1), R(5, 6, 'fence', 1)], near: [[4, 0, 5, 9]] },
  // ветер с севера, дорога поперёк — то же правило, только повернуть голову
  { name: 'P9', ...snow, dir: [0, 1], roads: [[[0, 6], [9, 6]]],
    fixed: [R(2, 3), R(3, 3), R(7, 8, 'hut'), R(8, 0, 'stack'), R(0, 9, 'rock'), R(5, 1, 'tree')],
    inv: { fence: 1 }, solution: [R(1, 5, 'fence', 0)] },
];
module.exports.push(
  // дорога вдоль ветра: сугроб от хаты у обочины ложится на дорогу
  { name: 'P5', ...snow, roads: [[[0, 5], [9, 5]]],
    fixed: [R(2, 4, 'hut'), R(3, 4, 'hut'), R(6, 1, 'tree'), R(8, 8, 'stack'), R(0, 0, 'rock'), R(1, 8, 'tree')],
    inv: { fence: 1 } },
  // хата и забор: сугроб от скал на дороге, хату — где не заметёт
  { name: 'P7', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(2, 5), R(2, 6), R(2, 7), R(8, 2, 'hut'), R(0, 1, 'stack'), R(9, 9, 'rock')],
    inv: { fence: 1, hut: 1 }, near: [[3, 2, 9, 9]] },
  // финал: дорога, хаты и дом, два забора
  { name: 'P10', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(4, 2, 'hut'), R(3, 6, 'house'), R(8, 4, 'hut'), R(8, 8, 'house', 1), R(0, 0, 'stack'), R(0, 9, 'rock')],
    inv: { fence: 2 }, solution: [R(5, 0, 'fence', 1), R(5, 6, 'fence', 1)], near: [[0, 0, 5, 9]] },
);
module.exports.push(
  // хату заносит: она в трёх клетках за скалами. Забор вплотную перед ней — сугроб перелетит
  { name: 'P8', ...snow, roads: [[[8, 0], [8, 9]]],
    fixed: [R(2, 4), R(2, 5), R(5, 4, 'hut'), R(0, 0, 'stack'), R(9, 9, 'rock'), R(5, 8, 'tree')],
    inv: { fence: 1 }, solution: [R(4, 3, 'fence', 1)] },
  // ёлки у дороги: за деревьями ветер стихает — и на дороге сугроб
  { name: 'P12', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(3, 5, 'tree'), R(3, 6, 'tree'), R(2, 5, 'tree'), R(2, 6, 'tree'), R(8, 2, 'hut'), R(0, 0, 'rock'), R(9, 9, 'stack')],
    inv: { fence: 1 }, solution: [R(5, 4, 'fence', 1)] },
  // два забора: один — дороге, другой — хате
  { name: 'P11', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(3, 1), R(3, 2), R(1, 6), R(1, 7), R(4, 6, 'hut'), R(9, 0, 'stack'), R(8, 8, 'rock')],
    inv: { fence: 2 }, solution: [R(5, 0, 'fence', 1), R(3, 5, 'fence', 1)], near: [[2, 0, 5, 9]] },
);
module.exports.push(
  { name: 'P8b', ...snow, roads: [[[0, 9], [9, 9]]],
    fixed: [R(2, 4), R(2, 5), R(5, 4, 'hut'), R(0, 0, 'stack'), R(9, 1, 'rock'), R(8, 6, 'tree')],
    inv: { fence: 1 }, solution: [R(4, 3, 'fence', 1)] },
);
module.exports.push(
  { name: 'P13', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(3, 1), R(3, 2), R(3, 6, 'stack'), R(3, 7, 'stack'), R(5, 4), R(5, 5), R(8, 4, 'hut'), R(0, 4, 'tree'), R(9, 9, 'rock')],
    inv: { fence: 2 }, solution: [R(5, 1, 'fence', 1), R(5, 6, 'fence', 1)] },
);
module.exports.push(
  { name: 'P14', ...snow, roads: [[[0, 9], [9, 9]]],
    fixed: [R(2, 3), R(2, 4, 'stack'), R(2, 5), R(5, 3, 'house', 0), R(8, 1, 'hut'), R(0, 0, 'rock'), R(8, 7, 'tree')],
    inv: { fence: 1 }, solution: [R(4, 3, 'fence', 1)] },
);
module.exports.push(
  // хата у дороги: за новой хатой тоже ляжет сугроб — не ставь её в паре клеток перед дорогой
  { name: 'P4b', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(0, 2), R(0, 3), R(8, 1, 'tree'), R(9, 8, 'stack'), R(0, 8, 'rock'), R(8, 5, 'hut')],
    inv: { hut: 1 } },
);
module.exports.push(
  // ступенька к финалу: та же раскладка, плетень и ёлки уже стоят — игрок ставит только два забора
  { name: 'P15', ...snow, roads: [[[6, 0], [6, 9]]],
    fixed: [R(4, 2, 'hut'), R(3, 6, 'house'), R(8, 4, 'hut'), R(8, 8, 'house', 1), R(1, 2, 'wattle', 1), R(0, 1, 'tree', 2), R(2, 1, 'tree', 2)],
    inv: { fence: 2 }, solution: [R(2, 2, 'fence', 3), R(1, 9, 'fence', 2)] },
);
