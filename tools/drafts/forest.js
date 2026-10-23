// черновики Леса (вырубка): дерево → бревно, плетень 2 бревна, забор 3. Деревьев мало — ровно чтобы хватило,
// и часть из них укрывает дома: срубишь не то — сдует соседа. Проверка: node tools/forest.js «уровень» tools/drafts/forest.js
// Ветер 24: две яблони поперёк ветра перед хатой — на грани, срубишь любую — хату сдует.
const R = (x, y, t = 'rock', rot = 0) => ({ type: t, x, y, rot });
const shop = { cost: { wattle: 2, fence: 3 }, shop: ['wattle', 'fence'], logs: 0, mode: 'Вырубка', duration: 8 };
const F = cells => { const g = Array.from({ length: 10 }, () => Array(10).fill('0')); for (const [x, y] of cells) g[y][x] = '1'; return g.map(r => r.join('')); };
module.exports = [
  // 1: две яблони укрывают хату, две — ничьи; плетень — открытой хате
  { name: 'F1', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 2], [5, 3], [1, 9], [2, 9]]),
    fixed: [R(6, 2, 'hut'), R(6, 7, 'hut'), R(9, 9, 'stack'), R(0, 0, 'rock'), R(9, 0, 'stack')],
    solution: [R(4, 6, 'wattle', 1)], solutionCuts: [[1, 9], [2, 9]] },
  // 2: деревья, которые укрывают, — только перед хатами; рубить нечего, кроме них: срубил — поставь плетень на их место, он прикроет больше
  { name: 'F3', ...shop, wind: 22, dir: [1, 0],
    forest: F([[5, 3], [5, 4]]),
    fixed: [R(6, 3, 'hut'), R(6, 4, 'hut'), R(6, 5, 'hut'), R(9, 9, 'stack'), R(0, 9, 'rock'), R(1, 0, 'stack')],
    solution: [R(4, 3, 'wattle', 1)], solutionCuts: [[5, 3], [5, 4]] },
  // 3: стена из камней и дерева; дерево закрывает щель — срубишь, будет струя
  { name: 'F4', ...shop, wind: 23, dir: [1, 0],
    forest: F([[3, 4], [8, 0], [9, 0], [0, 9]]),
    fixed: [R(3, 3), R(3, 5), R(6, 4, 'hut'), R(6, 8, 'hut'), R(9, 9, 'stack'), R(0, 1, 'stack')],
    solution: [R(4, 7, 'wattle', 1)], solutionCuts: [[8, 0], [9, 0]] },
  // 4: ряд деревьев поперёк ветра прикрывает две хаты; рубить с края, где за деревьями пусто
  { name: 'F7', ...shop, wind: 24, dir: [1, 0],
    forest: F([[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]]),
    fixed: [R(6, 2, 'hut'), R(6, 3, 'hut'), R(6, 8, 'hut'), R(9, 6, 'stack'), R(0, 9, 'rock')],
    solution: [R(4, 7, 'wattle', 1)], solutionCuts: [[4, 0], [4, 1]] },
  // 5: два плетня — 4 бревна; шесть деревьев, два из них укрывают
  { name: 'F5', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 4], [5, 5], [0, 0], [1, 0], [8, 9], [9, 9]]),
    fixed: [R(6, 4, 'hut'), R(6, 1, 'hut'), R(6, 8, 'hut'), R(9, 5, 'stack'), R(0, 5, 'rock')],
    solution: [R(3, 2, 'wattle', 1), R(3, 7, 'wattle', 1)], solutionCuts: [[0, 0], [1, 0], [8, 9], [9, 9]], near: [[2, 0, 5, 9]] },
  // 6: улица за рощей: роща прикрывает первую хату, первая — вторую; срубишь рощу — повалится вся улица
  { name: 'F2', ...shop, wind: 22, dir: [1, 0],
    forest: F([[3, 6], [3, 7], [8, 0], [9, 0]]),
    fixed: [R(4, 6, 'hut'), R(6, 6, 'hut'), R(8, 6, 'hut'), R(6, 1, 'hut'), R(0, 4, 'stack'), R(9, 9, 'rock'), R(0, 9, 'stack')],
    solution: [R(4, 0, 'wattle', 1)], solutionCuts: [[8, 0], [9, 0]] },
  // 7: ветер повернёт с севера: яблони над хатой прикроют от второго ветра, с запада — плетень
  { name: 'F6', ...shop, wind: 24, dir: [1, 0], duration: 10, shift: { at: 4.5, dir: [0, 1] },
    forest: F([[6, 5], [7, 5], [0, 9], [1, 9]]),
    fixed: [R(6, 6, 'hut'), R(1, 1, 'stack'), R(9, 9, 'rock'), R(9, 0, 'stack')],
    solution: [R(3, 5, 'wattle', 0)], solutionCuts: [[0, 9], [1, 9]] },
  // 8: опушка в два ряда прикрывает три хаты; можно взять по дереву, но не два из одного места
  { name: 'F9', ...shop, wind: 26, dir: [1, 0],
    forest: F([[4, 2], [5, 2], [4, 3], [5, 3]]),
    fixed: [R(6, 2, 'hut'), R(6, 7, 'hut'), R(9, 9, 'stack'), R(0, 0, 'rock'), R(9, 0, 'stack'), R(1, 6, 'stack')],
    solution: [R(4, 6, 'wattle', 1)], solutionCuts: [[4, 2], [4, 3]] },
  // 10: финал: хаты и дом, рощи, щель в заслоне, два плетня
  { name: 'F10', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 1], [5, 2], [3, 5], [0, 0], [9, 0], [9, 9], [8, 9], [1, 9]]),
    fixed: [R(6, 1, 'hut'), R(6, 5, 'house', 1), R(3, 4), R(3, 6), R(6, 8, 'hut'), R(8, 3, 'hut'), R(0, 4, 'stack')],
    solution: [R(4, 7, 'wattle', 1), R(6, 2, 'wattle', 0)], solutionCuts: [[0, 0], [9, 0], [9, 9], [8, 9]], near: [[1, 0, 9, 9]] },
];
module.exports.push(
  { name: 'F10b', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 1], [5, 2], [3, 5], [0, 0], [1, 0], [8, 9], [9, 9]]),
    fixed: [R(6, 1, 'hut'), R(8, 1, 'hut'), R(6, 5, 'house', 1), R(3, 4), R(3, 6), R(6, 8, 'hut'), R(9, 4, 'stack'), R(0, 9, 'rock')],
    solution: [R(4, 7, 'wattle', 1)], solutionCuts: [[0, 0], [1, 0]] },
);
module.exports.push(
  { name: 'F10c', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 1], [5, 2], [3, 4], [0, 0], [1, 0], [8, 9], [9, 9]]),
    fixed: [R(6, 1, 'hut'), R(8, 1, 'hut'), R(6, 4, 'house', 1), R(3, 3), R(3, 5), R(7, 8, 'hut'), R(9, 6, 'stack'), R(0, 9, 'rock')],
    solution: [R(4, 7, 'wattle', 1)], solutionCuts: [[0, 0], [1, 0]], near: [[0, 5, 9, 9]] },
  { name: 'F10d', ...shop, wind: 23, dir: [1, 0],
    forest: F([[5, 1], [5, 2], [3, 5], [0, 0], [1, 0], [8, 9], [9, 9]]),
    fixed: [R(6, 1, 'hut'), R(8, 1, 'hut'), R(6, 5, 'house', 1), R(3, 4), R(3, 6), R(6, 8, 'hut'), R(9, 4, 'stack'), R(0, 9, 'rock')],
    solution: [R(4, 7, 'wattle', 1)], solutionCuts: [[0, 0], [1, 0]], near: [[0, 5, 9, 9]] },
  { name: 'F10e', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 1], [5, 2], [4, 5], [0, 0], [1, 0], [8, 9], [9, 9]]),
    fixed: [R(6, 1, 'hut'), R(8, 1, 'hut'), R(7, 5, 'house', 1), R(4, 4), R(4, 6), R(6, 9, 'hut'), R(9, 3, 'stack'), R(0, 8, 'rock')],
    solution: [R(4, 8, 'wattle', 0)], solutionCuts: [[0, 0], [1, 0]], near: [[0, 5, 9, 9]] },
);
module.exports.push(
  { name: 'F10f', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 1], [5, 2], [4, 4], [4, 5], [4, 6], [0, 0], [1, 0], [8, 9], [9, 9]]),
    fixed: [R(6, 1, 'hut'), R(8, 1, 'hut'), R(6, 5, 'house', 1), R(6, 9, 'hut'), R(9, 4, 'stack'), R(0, 7, 'rock')],
    solution: [R(4, 8, 'wattle', 0)], solutionCuts: [[0, 0], [1, 0]], near: [[0, 6, 9, 9]] },
  { name: 'F10g', ...shop, wind: 24, dir: [1, 0],
    forest: F([[5, 1], [5, 2], [4, 4], [4, 5], [0, 0], [1, 0], [8, 9], [9, 9]]),
    fixed: [R(6, 1, 'hut'), R(8, 1, 'hut'), R(6, 4, 'house', 1), R(6, 8, 'hut'), R(9, 5, 'stack'), R(0, 9, 'rock')],
    solution: [R(4, 7, 'wattle', 1)], solutionCuts: [[0, 0], [1, 0]], near: [[0, 6, 9, 9]] },
);
module.exports.push(
  { name: 'F8', ...shop, shop: ['fence'], wind: 22, dir: [1, 0],
    forest: F([[5, 7], [5, 8], [0, 0], [1, 0], [2, 0]]),
    fixed: [R(6, 7, 'hut'), R(6, 3, 'hut'), R(9, 9, 'stack'), R(0, 9, 'rock'), R(9, 0, 'stack'), R(8, 5, 'rock')],
    solution: [R(4, 2, 'fence', 1)], solutionCuts: [[0, 0], [1, 0], [2, 0]] },
);
