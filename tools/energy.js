// Энергия одного ветряка в каждой клетке уровня (остальное — как в уровне + фигуры из JSON).
// Запуск: node tools/energy.js «Название» [файл.js] [фигуры JSON]
const path = require('path');
const { loadSim, run } = require('./sim');
const [name, file, extra] = process.argv.slice(2);
const sim = loadSim(), list = file && file !== '-' ? require(path.resolve(file)) : sim.LEVELS, L0 = list.find(l => l.name === name);
const base = extra ? JSON.parse(extra) : [];
const L = { ...L0, target: 0 };
console.log(`${name}: энергия ветряка по клеткам (цель уровня ${L0.target}); x — нельзя, ! — что-то сломалось`);
for (let y = 0; y < 10; y++) {
  let s = String(y).padStart(3) + '  ';
  for (let x = 0; x < 10; x++) {
    const w = sim.createWorld(); sim.applyLevel(w, L); for (const p of base) w.pieces.push({ ...p });
    if (!sim.canPlace(w, { type: 'mill', x, y, rot: 0 })) { s += '   x'; continue; }
    const r = run(sim, L, [...base, { type: 'mill', x, y, rot: 0 }]);
    s += (Math.round(r.w.energy) + (r.ok ? '' : '!')).padStart(4);
  }
  console.log(s);
}
