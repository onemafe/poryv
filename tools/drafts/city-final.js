// черновики финала Города: смена ветра, нужны все приёмы острова — дерево на струю, стена из высоток, угловой дом
const R = (type, x, y, rot = 0) => ({ type, x, y, rot });
const base = { chapter: 'Город', dir: [1, 0], duration: 10, shift: { at: 4.5, dir: [0, 1] }, roads: [[[0, 9], [9, 9]]] };
const list = [
  { ...base, name: 'Ф5', wind: 16,
    fixed: [R('slab', 2, 1, 1), R('slab', 2, 4, 1), R('hut', 5, 3), R('hut', 5, 7), R('hut', 6, 7), R('hut', 8, 2),
            R('kiosk', 5, 1), R('stack', 6, 5), R('tree', 0, 8), R('kiosk', 9, 6)],
    inv: { tree: 1, slab: 1, corner: 1 } },
  { ...base, name: 'Ф6', wind: 16,
    fixed: [R('slab', 2, 1, 1), R('slab', 2, 4, 1), R('hut', 6, 3), R('hut', 6, 7), R('hut', 7, 7), R('hut', 8, 1),
            R('kiosk', 6, 1), R('stack', 7, 5), R('tree', 0, 8), R('kiosk', 9, 5)],
    inv: { tree: 1, slab: 1, corner: 1 } },
  { ...base, name: 'Ф7', wind: 16,
    fixed: [R('slab', 2, 1, 1), R('slab', 2, 4, 1), R('hut', 6, 3), R('hut', 6, 6), R('hut', 6, 7), R('hut', 8, 1),
            R('kiosk', 6, 1), R('tree', 0, 8), R('kiosk', 9, 5), R('stack', 9, 8)],
    inv: { tree: 1, slab: 1, corner: 1 } },
];
list.push({ ...base, name: 'Ф8', wind: 15,
  fixed: [R('slab', 2, 1, 1), R('slab', 2, 4, 1), R('hut', 7, 3), R('hut', 7, 6), R('hut', 7, 7), R('hut', 9, 1),
          R('kiosk', 7, 1), R('tree', 0, 8), R('stack', 4, 0), R('kiosk', 9, 9)],
  inv: { tree: 1, slab: 1, corner: 1 } });
list.push({ ...list[list.length - 1], name: 'Ф8-16', wind: 16 });
const by = n => list.find(L => L.name === n);
for (const [n, w] of [['Ф7', 14], ['Ф7', 15], ['Ф6', 14], ['Ф6', 15]]) list.push({ ...by(n), name: n + '-' + w, wind: w });
list.push({ ...by('Ф7'), name: 'Ф7-14s', wind: 14,
  solution: [R('tree', 1, 3), R('slab', 1, 6, 1), R('corner', 7, 2, 2)] });
list.push({ ...by('Ф7-14s'), name: 'Ф7-14.5s', wind: 14.5 });
list.push({ ...by('Ф7'), name: 'Ф7-15s', wind: 15, solution: [R('tree', 1, 3), R('slab', 1, 6, 1), R('corner', 6, 2, 1)] });
list.push({ ...by('Ф8'), name: 'Ф8s', solution: [R('tree', 1, 3), R('slab', 1, 6, 1), R('corner', 7, 2, 1)] });
list.push({ ...by('Ф8s'), name: 'Ф8s-15.5', wind: 15.5 });
// Ф9: высотки лежат поперёк северного ветра — струя из щели бьёт после поворота
list.push({ ...base, name: 'Ф9', wind: 16,
  fixed: [R('slab', 1, 1), R('slab', 4, 1), R('hut', 3, 4), R('hut', 4, 4), R('hut', 7, 6),
          R('kiosk', 8, 1), R('tree', 0, 8), R('stack', 9, 3), R('kiosk', 4, 8)],
  inv: { tree: 1, slab: 1, corner: 1 } });
list.push({ ...by('Ф9'), name: 'Ф9s', solution: [R('tree', 3, 2), R('slab', 1, 3, 1), R('corner', 6, 5)] });
for (const w of [18, 19]) list.push({ ...by('Ф9s'), name: 'Ф9s-' + w, wind: w });
// Ф10: ряд хат ниже — на открытом месте, от западного ветра нужна стена
for (const w of [16, 17, 18]) list.push({ ...base, name: 'Ф10-' + w, wind: w,
  fixed: [R('slab', 1, 1), R('slab', 4, 1), R('hut', 3, 5), R('hut', 4, 5), R('hut', 7, 6),
          R('kiosk', 8, 1), R('tree', 0, 8), R('stack', 9, 3), R('kiosk', 4, 8)],
  inv: { tree: 1, slab: 1, corner: 1 }, solution: [R('tree', 3, 2), R('slab', 1, 5, 1), R('corner', 6, 5)] });
for (const w of [16, 17, 18]) list.push({ ...by('Ф10-' + w), name: 'Ф10s-' + w, solution: [R('tree', 2, 3), R('slab', 2, 4, 1), R('corner', 5, 4, 2)] });
module.exports = list;
