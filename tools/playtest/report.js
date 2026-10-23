// Сводит журналы ИИ-плейтеста в данные для кривой сложности.
// Запуск: node tools/playtest/report.js tools/playtest/runs/<прогон>
//   → печатает таблицу и пишет <прогон>/data.json (вход для страницы отчёта).
// В папке прогона: <портрет>/<NN>-<уровень>.json (журналы агентов) и, если есть, tolerance.txt
// (вывод node tools/tolerance.js <глава>) — объективный допуск: в скольких местах может стоять фигура решения.
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.log('Укажи папку прогона: node tools/playtest/report.js tools/playtest/runs/<прогон>'); process.exit(1); }

// допуск: «Уровень» на своей строке, ниже «  тип  k из N …» по фигуре решения
function readTolerance(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  let level = null;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s+(\S+)\s+(\d+) из (\d+)/);
    if (m && level) out[level].push({ type: m[1], ok: +m[2], of: +m[3] });
    else if (line.trim() && !/^\s/.test(line)) { level = line.trim(); out[level] = []; }
  }
  return out;
}

// метрики одного уровня одного портрета
function levelMetrics(j) {
  let att = j.attempts || [];
  // обучение первого уровня: первый «Ветер!» по пустому полю — по сценарию, не попытка
  if (j.n === 1 && att.length && !(att[0].moves || []).length && att[0].result === 'fail') att = att.slice(1);
  const firstWin = att.findIndex(a => a.result === 'win');
  const fails = att.slice(0, firstWin < 0 ? att.length : firstWin).filter(a => a.result !== 'win');
  const und = fails.map(a => a.understood);
  return {
    n: j.n, level: j.level,
    runsToWin: firstWin < 0 ? null : firstWin + 1,      // с какой попытки первая победа
    runs: att.length,                                   // всего попыток (с переигровками за звёзды)
    failsBeforeWin: fails.length,
    understood: und.length ? und.filter(u => u === 'yes').length / und.length : null, // доля понятых провалов до победы
    hints: j.hints || 0, stars: j.stars || 0, solvedBy: j.solvedBy,
    quit: !!j.quit, quitReason: j.quitReason || null, afterQuit: !!j.afterQuit,
    // скука — только до первой победы включительно: усталость от переигровок за звёзды — не «слишком легко»
    moods: att.map(a => a.mood), bored: att.slice(0, firstWin < 0 ? att.length : firstWin + 1).some(a => /скука/.test(a.mood || '')),
    feel: j.levelFeel || '', note: j.designerNote || '', ui: j.uiTrouble || [],
  };
}

const personas = fs.readdirSync(dir).filter(p => fs.statSync(path.join(dir, p)).isDirectory()).sort();
const data = { run: path.basename(dir), levels: [], personas: {}, tolerance: readTolerance(path.join(dir, 'tolerance.txt')) };
for (const p of personas) {
  const files = fs.readdirSync(path.join(dir, p)).filter(f => /^\d+-.*\.json$/.test(f)).sort();
  data.personas[p] = files.map(f => levelMetrics(JSON.parse(fs.readFileSync(path.join(dir, p, f), 'utf8'))));
  for (const m of data.personas[p]) if (!data.levels[m.n - 1]) data.levels[m.n - 1] = m.level;
}
fs.writeFileSync(path.join(dir, 'data.json'), JSON.stringify(data, null, 1));

// таблица: попытки до победы (+ подсказки, ушёл, скука) по уровням и портретам
const cell = m => !m ? '·' : (m.runsToWin == null ? '✗' : String(m.runsToWin)) + (m.hints ? `+${m.hints}п` : '') + (m.quit ? ' УШЁЛ' : '') + (m.bored ? ' скука' : '');
const tol = L => (data.tolerance[L] || []).map(t => `${t.ok}/${t.of}`).join(' ');
console.log(['#', 'уровень'.padEnd(20), ...personas.map(p => p.padEnd(10)), 'допуск'].join(' '));
data.levels.forEach((L, i) => console.log([String(i + 1).padStart(2), L.padEnd(20), ...personas.map(p => cell(data.personas[p].find(m => m.n === i + 1)).padEnd(10)), tol(L)].join(' ')));
console.log(`\nДанные: ${path.join(dir, 'data.json')}`);
