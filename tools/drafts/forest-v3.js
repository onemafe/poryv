// черновики Леса после ИИ-плейтеста 2026-10-25
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'Порыв.html'), 'utf8');
const { LEVELS } = new Function(html.split('<script>')[1].split('// ===== Игра: ввод')[0] + ';return { LEVELS };')();
const base = n => JSON.parse(JSON.stringify(LEVELS.find(L => L.name === n)));
const v = (n, name, ch) => Object.assign(base(n), { name }, ch);
module.exports = [
  v('Проредить рощу', 'ПР-27', { wind: 27 }),
  v('Проредить рощу', 'ПР-28', { wind: 28 }),
  v('Проредить рощу', 'ПР-30', { wind: 30 }),
  v('Вырубка', 'В-25', { wind: 25 }),
  v('Вырубка', 'В-26', { wind: 26 }),
];
