// черновики Гавани (шлюз): ворота закрывают по нажатию, закрытыми держатся gateBudget секунд за прогон
const R = (x, y, t = 'rock', rot = 0) => ({ type: t, x, y, rot });
const dam = [R(3, 3, 'gate'), R(3, 4, 'gate'), R(3, 5, 'gate'), R(3, 2), R(3, 6), R(5, 4, 'hut')];
module.exports = [
  { name: 'G1', mode: 'Управление', wind: 12, dir: [1, 0], duration: 8, mods: { gateBudget: 3 }, gusts: [[3, 4.6, 1.7]],
    fixed: [...dam, R(0, 0, 'tree'), R(8, 8, 'stack'), R(8, 1, 'rock')], inv: {}, gatePlan: [[2.7, 4.9]] },
  { name: 'G2', mode: 'Управление', wind: 13, dir: [1, 0], duration: 9, mods: { gateBudget: 4 }, gusts: [[2.5, 3.7, 1.7], [6, 7.2, 1.7]],
    fixed: [...dam, R(1, 8, 'tree'), R(8, 0, 'stack'), R(6, 3, 'hut'), R(9, 9, 'rock')], inv: {}, gatePlan: [[2.2, 3.95], [5.7, 7.45]] },
];
