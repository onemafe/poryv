// черновики Мыса после ИИ-плейтеста 2026-10-25: честнее «Хата и ветряк», «Забор и ветряк»; 7–9 — не одной схемой
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const { LEVELS } = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS };')();
const base = n => JSON.parse(JSON.stringify(LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
module.exports = [
  v('Хата и ветряк', 'ХВ-100', { target: 100 }),
  v('Хата и ветряк', 'ХВ-120', { target: 120 }),
  v('Забор и ветряк', 'ЗВ-50', { target: 50 }),
  v('Забор и ветряк', 'ЗВ-60', { target: 60 }),
  v('Хата и ветряк', 'ХВ-90', { target: 90 }),
  v('Ветер с двух сторон', 'ДС-200', { target: 200 }),
  v('Ветер с двух сторон', 'ДС-250', { target: 250 }),
  v('Две струи', 'ДСт-320', { target: 320 }),
  v('Две струи', 'ДСт-380', { target: 380 }),
];
