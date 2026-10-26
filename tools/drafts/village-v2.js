// черновики переделки Деревни по ИИ-плейтесту 2026-10-23
const R = (x, y, t = 'rock', rot = 0) => ({ type: t, x, y, rot });
const rows = w => ({ name: 'Хаты в ряд ' + w, wind: w, dir: [1, 0],
  fixed: [R(4, 6, 'hut'), R(6, 6, 'hut'), R(8, 6, 'hut'), R(6, 2, 'hut'), R(3, 2, 'tree'), R(1, 4, 'stack'), R(9, 9, 'stack'), R(1, 9, 'rock'), R(9, 4, 'tree')],
  inv: { fence: 1, tree: 2 }, solution: [{ type: 'fence', x: 2, y: 5, rot: 1 }, R(4, 2, 'tree'), R(5, 2, 'tree')] });
module.exports = [rows(21), rows(22)];
