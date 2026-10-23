// черновики уровней Мыса (ветряки). Проверка: node tools/energy.js «уровень» tools/drafts/cape.js; node tools/solve.js «уровень» tools/drafts/cape.js
const R = (x, y, t = 'rock', rot = 0) => ({ type: t, x, y, rot });
const E = { mode: 'Энергия', wind: 15, dir: [1, 0], duration: 8 };
module.exports = [
  // ветряки не ставь гуськом: второй в следе первого крутится вполсилы
  { name: 'Mb', ...E, target: 300,
    fixed: [R(0, 0), R(0, 1, 'stack'), R(0, 2), R(0, 7), R(0, 8, 'stack'), R(0, 9), R(5, 1, 'hut'), R(5, 8, 'hut'), R(4, 1, 'tree'), R(4, 8, 'tree')],
    inv: { mill: 2 } },
  // хата — в тень, ветряк — на ветер
  { name: 'Md', ...E, target: 60,
    fixed: [R(2, 2), R(2, 3), R(2, 4, 'stack'), R(7, 7, 'tree'), R(8, 0, 'stack'), R(0, 9, 'tree'), R(6, 6, 'hut')],
    inv: { hut: 1, mill: 1 } },
  // дерево — хате, но не ветряку
  { name: 'Mg', ...E, target: 60,
    fixed: [R(6, 4, 'hut'), R(5, 4, 'tree'), R(1, 1, 'stack'), R(8, 8, 'rock'), R(0, 8, 'tree')],
    inv: { tree: 1, mill: 1 } },
  // ветер повернёт: ветряк должен крутиться и с запада, и с севера
  { name: 'Me', ...E, duration: 10, shift: { at: 4.5, dir: [0, 1] }, target: 80,
    fixed: [R(3, 3, 'slab', 1), R(6, 6, 'hut'), R(5, 6, 'wall'), R(6, 5, 'wall'), R(1, 8, 'tree'), R(8, 1, 'stack')],
    inv: { mill: 1 } },
  // ветряк в щели гасит струю, которая бьёт в хату
  { name: 'Mc', ...E, wind: 16, target: 150,
    fixed: [R(3, 1, 'slab', 1), R(3, 5, 'slab', 1), R(7, 4, 'hut'), R(1, 8, 'stack'), R(8, 8, 'rock'), R(8, 0, 'tree')],
    inv: { mill: 1 } },
];
module.exports.push(
  // высотка прикрывает хаты, а у её угла ветер злее всего — там место ветряку
  { name: 'Mh', ...E, wind: 17, target: 200, near: [[0, 0, 5, 9]],
    fixed: [R(6, 4, 'hut'), R(6, 5, 'hut'), R(8, 4, 'hut'), R(1, 9, 'tree'), R(9, 0, 'stack'), R(0, 0, 'rock'), R(9, 9, 'stack')],
    inv: { slab: 1, mill: 1 } },
  // две щели, две струи — по ветряку в каждую
  { name: 'Mi', ...E, wind: 16, target: 300,
    fixed: [R(3, 0, 'slab', 1), R(3, 3, 'slab', 1), R(3, 6, 'slab', 1), R(7, 2, 'hut'), R(7, 5, 'hut'), R(0, 9, 'stack'), R(9, 9, 'rock')],
    inv: { mill: 2 } },
  // финал: щель, открытая хата, забор и два ветряка
  { name: 'Mf', ...E, target: 400,
    fixed: [R(3, 1, 'slab', 1), R(3, 4, 'slab', 1), R(7, 3, 'hut'), R(6, 7, 'hut'), R(0, 9, 'stack'), R(9, 0, 'tree'), R(9, 9, 'rock')],
    inv: { mill: 2, fence: 1 },
    solution: [R(4, 3, 'mill'), R(4, 6, 'fence', 1), R(4, 9, 'mill')] },
);
module.exports.push(
  { name: 'Mi2', ...E, wind: 16, target: 300,
    fixed: [R(3, 0, 'slab', 1), R(3, 4, 'slab', 1), R(3, 8, 'slab', 1), R(7, 3, 'hut'), R(7, 6, 'hut'), R(0, 9, 'stack'), R(9, 9, 'rock'), R(9, 0, 'tree')],
    inv: { mill: 2 } },
);
module.exports.push(
  { name: 'Mf2', ...E, wind: 16, target: 450,
    fixed: [R(3, 0, 'slab', 1), R(3, 4, 'slab', 1), R(3, 8, 'slab', 1), R(7, 3, 'hut'), R(7, 6, 'hut'), R(0, 9, 'stack'), R(9, 9, 'rock'), R(9, 0, 'tree')],
    inv: { mill: 3 }, solution: [R(4, 3, 'mill'), R(4, 7, 'mill'), R(2, 9, 'mill')] },
);
module.exports.push(
  { name: 'Mh2', ...E, wind: 19, target: 200, near: [[1, 0, 9, 9]],
    fixed: [R(7, 4, 'hut'), R(7, 5, 'hut'), R(1, 9, 'tree'), R(9, 0, 'stack'), R(0, 0, 'rock'), R(9, 9, 'stack')],
    inv: { slab: 1, mill: 1 } },
);
module.exports.push(
  // ветер повернёт: ветряку нужно место, открытое и западному, и северному ветру
  { name: 'Ms', ...E, duration: 10, shift: { at: 4.5, dir: [0, 1] }, target: 100,
    fixed: [R(1, 4, 'stack'), R(1, 5, 'rock'), R(1, 6, 'stack'), R(1, 7, 'rock'), R(4, 1, 'stack'), R(5, 1, 'rock'), R(6, 1, 'stack'), R(7, 1, 'rock'), R(6, 6, 'hut'), R(9, 9, 'tree')],
    inv: { mill: 1 } },
);
