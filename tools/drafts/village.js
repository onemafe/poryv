// черновики новых уровней Деревни
const R = (x, y, t = 'rock', rot = 0) => ({ type: t, x, y, rot });
module.exports = [
  { name: 'Новоселье', wind: 22, dir: [1, 0],
    fixed: [R(2, 2, 'stack'), R(2, 3, 'stack'), R(3, 7, 'rock'), R(3, 6, 'rock'), R(7, 0, 'tree'), R(8, 9, 'tree'), R(0, 5, 'stack')],
    inv: { hut: 2 } },
  { name: 'Два забора', wind: 22, dir: [1, 0],
    fixed: [R(6, 2, 'hut'), R(6, 7, 'hut'), R(1, 0, 'tree'), R(8, 5, 'stack'), R(0, 9, 'rock'), R(9, 0, 'stack')],
    inv: { fence: 2 } },
  { name: 'Хаты в ряд', wind: 21, dir: [1, 0],
    fixed: [R(4, 5, 'hut'), R(6, 5, 'hut'), R(8, 5, 'hut'), R(1, 1, 'stack'), R(8, 1, 'tree'), R(2, 9, 'rock'), R(9, 8, 'stack')],
    inv: { fence: 1 } },
];
