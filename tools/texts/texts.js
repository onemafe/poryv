// Тексты уровней из командной строки. Править удобнее в Тексты.html (корень проекта).
// В tools/texts/edits.json — заметки к уровням и правки, которые не удалось вписать (конфликты).
// Запуск: node tools/texts/texts.js          — заметки и невписанные правки
//         node tools/texts/texts.js apply    — вписать правки из edits.json в Порыв.html
const fs = require('fs');
const path = require('path');
const { applyEdits, renameOriginal, FIELDS } = require('./core.js');

const GAME = path.join(__dirname, '..', '..', 'Порыв.html');
const EDITS = path.join(__dirname, 'edits.json');
const ORIG = path.join(__dirname, 'original.json'); // тексты «в начале» — левый столбец редактора, сами не меняются
const edits = (() => { try { return JSON.parse(fs.readFileSync(EDITS, 'utf8')); } catch { return { levels: {}, chapters: {} }; } })();

if (process.argv[2] === 'apply') {
  const r = applyEdits(fs.readFileSync(GAME, 'utf8'), edits);
  fs.writeFileSync(GAME, r.src);
  fs.writeFileSync(EDITS, JSON.stringify(r.edits, null, 2) + '\n');
  const orig = (() => { try { return JSON.parse(fs.readFileSync(ORIG, 'utf8')); } catch { return null; } })();
  if (orig && renameOriginal(orig, r.renamed)) fs.writeFileSync(ORIG, JSON.stringify(orig, null, 2) + '\n');
  console.log(r.applied.length ? 'Вписано:\n  ' + r.applied.join('\n  ') : 'Вписывать нечего.');
  if (r.conflicts.length) { console.log('Не вписано:\n  ' + r.conflicts.join('\n  ')); process.exitCode = 1; }
} else {
  for (const [id, E] of Object.entries(edits.levels || {})) {
    if (E.note) console.log(`${id} — заметка: ${E.note}`);
    for (const k of FIELDS) if (E[k]) console.log(`${id} · ${k}: ждёт переноса`);
  }
  for (const [id, E] of Object.entries(edits.chapters || {})) if (E.intro) console.log(`остров ${id}: ждёт переноса`);
}
