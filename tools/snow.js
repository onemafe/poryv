// Снег по клеткам после прогона (×100; дорога заметена, если > 35; дом — если у стен > 45).
// Запуск: node tools/snow.js «Название» [файл.js] [фигуры JSON]
const path = require('path');
const { loadSim, fieldMap } = require('./sim');
const [name, file, extra] = process.argv.slice(2);
const sim = loadSim(), list = file && file !== '-' ? require(path.resolve(file)) : sim.LEVELS, L = list.find(l => l.name === name);
const f = fieldMap(sim, L, extra ? JSON.parse(extra) : []);
console.log(`${name}: ${f.ok ? 'устояло' : 'НЕТ: ' + f.fails.join('; ')}`);
const s = f.w.sim, occ = new Map();
for (const p of f.w.pieces) for (const [x, y] of sim.pieceCells(p)) occ.set(x + ',' + y, p.type[0]);
for (let y = 0; y < 10; y++) {
  let r = String(y).padStart(3) + '  ';
  for (let x = 0; x < 10; x++) { const k = x + ',' + y; r += occ.has(k) ? occ.get(k).padStart(4) : (Math.round(sim.cellMean(f.w, x, y, s.dep) * 100) + (f.w.roads.has(k) ? '=' : '')).padStart(4); }
  console.log(r);
}
