// черновики Мыса v5 (2026-10-28): заборы и прикрывают дома, и делают коридор для ветряка.
// traps — очевидные расстановки, которые должны проваливаться (по энергии или по сломанной хате).
const C = 'Мыс';
const P = (type, x, y, rot = 0) => ({ type, x, y, rot });
const E = { chapter: C, mode: 'Энергия', dir: [1, 0], duration: 8 };
module.exports = [
  // два забора — две хаты за ними, проём между заборами — коридор для ветряка
  { ...E, name: 'Коридор на двоих', wind: 17, target: 200,
    fixed: [P('hut', 6, 2), P('hut', 6, 6), P('stack', 0, 0), P('rock', 0, 9), P('tree', 9, 9), P('stack', 9, 0)],
    inv: { fence: 2, mill: 1 },
    solution: [P('fence', 4, 1, 1), P('fence', 4, 5, 1), P('mill', 5, 4)],
    traps: [['ветряк в поле', [P('fence', 4, 1, 1), P('fence', 4, 5, 1), P('mill', 1, 4)]], ['заборы сомкнуты', [P('fence', 4, 1, 1), P('fence', 4, 4, 1), P('mill', 2, 8)]]] },
  // скалы с одной стороны, забор с другой: проём между ними
  { ...E, name: 'Забор у скал', wind: 16, target: 180,
    fixed: [P('rock', 3, 0), P('rock', 3, 1), P('rock', 3, 2), P('rock', 3, 3), P('hut', 6, 6), P('stack', 0, 8), P('tree', 9, 0), P('stack', 9, 9)],
    inv: { fence: 1, mill: 1 },
    solution: [P('fence', 3, 5, 1), P('mill', 4, 4)],
    traps: [['забор вплотную к хате', [P('fence', 5, 5, 1), P('mill', 4, 4)]]] },
  // за проёмом — третья хата: ветряк в проёме и энергию берёт, и струю гасит
  { ...E, name: 'Коридор и сосед', wind: 17, target: 180,
    fixed: [P('hut', 6, 2), P('hut', 6, 6), P('hut', 8, 4), P('stack', 0, 0), P('rock', 0, 9), P('stack', 9, 9)],
    inv: { fence: 2, mill: 1 },
    solution: [P('fence', 4, 1, 1), P('fence', 4, 5, 1), P('mill', 5, 4)],
    traps: [['ветряк у края', [P('fence', 4, 1, 1), P('fence', 4, 5, 1), P('mill', 4, 0)]], ['ветряк за хатой', [P('fence', 4, 1, 1), P('fence', 4, 5, 1), P('mill', 7, 4)]]] },
  // два забора и скалы — два проёма, два ветряка, три хаты
  { ...E, name: 'Два коридора', wind: 16, target: 250,
    fixed: [P('hut', 6, 1), P('hut', 6, 5), P('hut', 6, 9), P('rock', 4, 8), P('rock', 4, 9), P('stack', 0, 0), P('tree', 9, 3), P('stack', 9, 7)],
    inv: { fence: 2, mill: 2 },
    solution: [P('fence', 4, 0, 1), P('fence', 4, 4, 1), P('mill', 5, 3), P('mill', 5, 7)],
    traps: [['один ветряк в проёме', [P('fence', 4, 0, 1), P('fence', 4, 4, 1), P('mill', 5, 3), P('mill', 1, 5)]]] },
  // ветер повернёт: коридор от первого ветра, хату прикрыть и от второго
  { ...E, name: 'Коридор на два ветра', wind: 15, duration: 10, shift: { at: 4.5, dir: [0, 1] }, target: 80,
    fixed: [P('hut', 6, 6), P('rock', 3, 2), P('rock', 3, 3), P('stack', 0, 9), P('tree', 9, 0)],
    inv: { fence: 1, mill: 1 },
    solution: [P('fence', 3, 5, 1), P('mill', 4, 4)],
    traps: [['ветряк в поле', [P('fence', 3, 5, 1), P('mill', 1, 6)]], ['забор вплотную', [P('fence', 5, 5, 1), P('mill', 4, 4)]]] },
];
