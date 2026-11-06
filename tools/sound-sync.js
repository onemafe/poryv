// Переносит движок звука из Звуки.html (там его подбирают на слух) в Порыв.html.
// Настройки — из tools/sound.json (кнопка «Сохранить» в Звуки.html); чего в файле нет, берётся из настроек лаборатории.
// В Порыв.html заменяется кусок между метками «движок звука: начало / конец», остальное не трогается.
// Запуск: node tools/sound-sync.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const LAB = path.join(ROOT, 'Звуки.html'), GAME = path.join(ROOT, 'Порыв.html'), CFG = path.join(ROOT, 'tools', 'sound.json');
const START = '// ==================== движок звука: начало ====================';
const END = '// ==================== движок звука: конец ====================';

function fail(msg) { console.error('ЗВУК НЕ ПЕРЕНЕСЁН: ' + msg); process.exit(1); }
function block(src, name) {
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a < 0 || b < a) fail(`в ${name} нет меток движка звука`);
  return [a, b + END.length];
}

const lab = fs.readFileSync(LAB, 'utf8'), game = fs.readFileSync(GAME, 'utf8');
const [la, lb] = block(lab, 'Звуки.html'), [ga, gb] = block(game, 'Порыв.html');
let engine = lab.slice(la, lb);

// настройки лаборатории по умолчанию + сохранённые; разделы сливаются по ключам
const d0 = engine.indexOf('  const DEFAULTS = {'), d1 = engine.indexOf('\n  };', d0);
if (d0 < 0 || d1 < 0) fail('в движке не найден DEFAULTS');
const defaults = vm.runInNewContext('(' + engine.slice(d0 + '  const DEFAULTS = '.length, d1 + 4) + ')');
let saved;
try { saved = JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch (e) { fail('не читается tools/sound.json: ' + e.message); }
const cfg = {};
for (const k of Object.keys(defaults)) {
  const d = defaults[k], s = saved[k];
  cfg[k] = d && typeof d === 'object' ? { ...d, ...(s && typeof s === 'object' ? s : {}) } : (typeof s === typeof d ? s : d);
}
const extra = Object.keys(saved).filter(k => !(k in defaults));
if (extra.length) console.warn('в tools/sound.json есть неизвестные настройки, пропущены: ' + extra.join(', '));

const body = Object.entries(cfg).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
engine = engine.slice(0, d0) + `  // настройки из tools/sound.json (подобраны в Звуки.html, перенесены tools/sound-sync.js)\n  const DEFAULTS = {\n${body}\n  };` + engine.slice(d1 + 5);   // + 5 — вместе с «\n  };»
try { new vm.Script(engine); } catch (e) { fail('движок не разбирается: ' + e.message); }

const out = game.slice(0, ga) + engine + game.slice(gb);
if (out === game) { console.log('Звук в Порыв.html уже совпадает с Звуки.html и tools/sound.json.'); process.exit(0); }
fs.writeFileSync(GAME, out);
console.log('Звук перенесён в Порыв.html: движок из Звуки.html, настройки из tools/sound.json.');
