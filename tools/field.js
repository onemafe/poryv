// Поле ветра уровня текстом: буквы — постройки, числа — самый сильный ветер в клетке за прогон (м/с), «=» — дорога.
// Запуск: node tools/field.js «Название» [файл.js] [фигуры JSON]
const path = require('path');
const { loadSim, fieldMap } = require('./sim');
const [name, file, extra] = process.argv.slice(2);
const sim = loadSim(), list = file && file !== '-' ? require(path.resolve(file)) : sim.LEVELS, L = list.find(l => l.name === name);
const placed = extra ? JSON.parse(extra) : [];
const f = fieldMap(sim, L, placed, { gatePlan: L.gatePlan });
console.log(`${L.name}: ${f.ok ? 'устояло' : 'НЕ устояло: ' + f.fails.join('; ')}, запас ${Math.round(f.worst * 100)}%`);
console.log(f.text);
