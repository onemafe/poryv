// Тексты уровней «Порыва»: достать из исходника Порыв.html и вписать правки обратно.
// Общий код для редактора (Тексты.html в браузере) и для node tools/texts/texts.js. На диск сам не пишет.
// Правки: { levels: { '<название>': { hint: { was, now }, intro: { was: [[кто, текст]…], now: […] }, note } },
//           chapters: { '<остров>': { intro: { was, now } } } }
// «было» нужно, чтобы не затереть текст, который поменяли в игре уже после правки (тогда — конфликт).
(function () {
const FIELDS = ['name', 'hint', 'tip', 'intro', 'outro'];

// ---------- разбор исходника: где начинается и кончается значение ----------
// i — позиция первого символа значения; возвращает позицию сразу за ним
function valueEnd(src, i) {
  let depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`') {
      for (i++; src[i] !== c; i++) if (src[i] === '\\') i++;
      if (depth === 0) return i + 1;
    } else if (c === '[' || c === '{' || c === '(') depth++;
    else if (c === ']' || c === '}' || c === ')') { if (--depth === 0) return i + 1; if (depth < 0) return i; }
    else if (depth === 0 && (c === ',' || c === '\n')) return i;
  }
  return i;
}
// ключ `key:` на верхнем уровне объекта, что начинается в from (позиция «{»); null — нет такого
function findKey(src, from, key) {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`') { for (i++; src[i] !== c; i++) if (src[i] === '\\') i++; continue; }
    if (c === '[' || c === '{' || c === '(') { depth++; continue; }
    if (c === ']' || c === '}' || c === ')') { if (--depth === 0) return null; continue; }
    if (depth === 1 && src.startsWith(key, i) && /[\s{,]/.test(src[i - 1]) && /^\s*:/.test(src.slice(i + key.length, i + key.length + 3))) {
      const v = src.indexOf(':', i + key.length) + 1;
      const start = v + src.slice(v).search(/\S/);
      return { keyAt: i, start, end: valueEnd(src, start) };
    }
  }
  return null;
}
const parse = lit => new Function('return ' + lit)();
const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";
const lit = v => Array.isArray(v) ? '[' + v.map(([w, t]) => `[${q(w)}, ${q(t)}]`).join(', ') + ']' : q(v);

// объекты уровней: «{ name: '…'» внутри const LEVELS = [ … ]
function levelObjects(src) {
  const a = src.indexOf('const LEVELS = [');
  const b = valueEnd(src, src.indexOf('[', a));
  const out = [];
  const re = /\{\s*name:\s*/g;
  re.lastIndex = a;
  let m;
  while ((m = re.exec(src)) && m.index < b) {
    // только объекты верхнего уровня массива (а не { type, name: 'Кузня' } внутри fixed)
    const end = valueEnd(src, m.index);
    const at = findKey(src, m.index, 'name');
    out.push({ at: m.index, end, name: parse(src.slice(at.start, at.end)) });
    re.lastIndex = end;
  }
  return out;
}
function chapterObjects(src) {
  const a = src.indexOf('const THEMES = {');
  const out = [];
  const re = /\n\s+'([^']+)':\s*\{/g;
  re.lastIndex = a;
  const b = valueEnd(src, src.indexOf('{', a));
  let m;
  while ((m = re.exec(src)) && m.index < b) {
    const at = m.index + m[0].length - 1;
    out.push({ at, end: valueEnd(src, at), name: m[1] });
  }
  return out;
}

// ---------- что сейчас в игре ----------
function current(src) {
  const levels = levelObjects(src).map(o => {
    const L = { id: o.name };
    for (const k of [...FIELDS, 'chapter', 'tutorial', 'coach']) { const f = findKey(src, o.at, k); if (f) L[k] = parse(src.slice(f.start, f.end)); }
    return L;
  });
  const used = new Set(levels.map(L => L.chapter));
  const chapters = chapterObjects(src).filter(c => used.has(c.name)).map(c => {
    const f = findKey(src, c.at, 'intro');
    return { id: c.name, intro: f ? parse(src.slice(f.start, f.end)) : '' };
  });
  // персонажи для выбора, кто говорит: строки «  keeper: { name: 'Петрович', role: '…'»
  const chars = {};
  const cs = src.slice(src.indexOf('const CHARS = {'));
  for (const m of cs.slice(0, valueEnd(cs, cs.indexOf('{'))).matchAll(/\n\s+(\w+):\s*\{\s*name:\s*'([^']*)',\s*role:\s*'([^']*)'/g)) chars[m[1]] = { name: m[2], role: m[3] };
  // реплики обучения и уроков: const LESSONS = { first: { wind: '…', … }, trash: {…}, … }
  const la = src.indexOf('const LESSONS = {');
  const lessons = la < 0 ? {} : parse(src.slice(src.indexOf('{', la), valueEnd(src, src.indexOf('{', la))));
  return { levels, chapters, chars, lessons };
}
// начало объекта группы уроков (позиция «{» после «first:»)
function lessonGroupAt(src, g) {
  const la = src.indexOf('{', src.indexOf('const LESSONS = {'));
  const f = findKey(src, la, g);
  return f && f.start;
}

const same = (a, b) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');
const empty = v => v == null || v === '' || (Array.isArray(v) && !v.length);

// одно поле в объекте с началом at: заменить, вставить после hint или убрать
function setField(src, at, key, value) {
  const f = findKey(src, at, key);
  if (empty(value)) {
    if (!f) return src;
    // убираем «key: значение,» вместе с запятой и пробелами после
    const tail = src.slice(f.end).match(/^\s*,[ \t]*\n?[ \t]*|^[ \t]*/)[0];
    return src.slice(0, f.keyAt) + src.slice(f.end + tail.length);
  }
  if (f) return src.slice(0, f.start) + lit(value) + src.slice(f.end);
  const h = findKey(src, at, 'hint');
  return src.slice(0, h.end) + `,\n    ${key}: ${lit(value)}` + src.slice(h.end);
}

// вписать правки в исходник игры. Ничего не пишет на диск: возвращает новый исходник,
// оставшиеся правки (заметки и конфликты) и списки вписанного и невписанного.
function applyEdits(src, edits) {
  const cur = current(src);
  edits = JSON.parse(JSON.stringify(edits || {}));
  edits.levels ||= {}; edits.chapters ||= {}; edits.lessons ||= {};
  const applied = [], conflicts = [], expect = [], renamed = {}; // expect: [что должно быть, как прочитать из игры после правки]
  for (const [id, E] of Object.entries(edits.levels)) {
    const L = cur.levels.find(l => l.id === id);
    if (!L) { if (FIELDS.some(k => E[k])) conflicts.push(`${id}: уровня нет в игре`); continue; }
    let name = id;
    for (const k of FIELDS) {
      if (!E[k]) continue;
      if (same(L[k], E[k].now)) { delete E[k]; continue; } // в игре уже ровно это — правка сделана раньше
      if (!same(L[k], E[k].was)) { conflicts.push(`${id} · ${k}: в игре текст поменялся после правки`); continue; }
      src = setField(src, levelObjects(src).find(o => o.name === name).at, k, E[k].now);
      if (k === 'name') name = renamed[id] = E.name.now; // правки и тексты «в начале» — по названию; звёзды и PAR — по постоянному id уровня
      const n = name;
      expect.push([E[k].now, a => a.levels.find(l => l.id === n)?.[k], `${id} · ${k}`]);
      applied.push(`${id} · ${k}`);
      delete E[k];
    }
    if (name !== id) { edits.levels[name] = E; delete edits.levels[id]; }
  }
  for (const [id, E] of Object.entries(edits.chapters)) {
    if (!E.intro) continue;
    const C = cur.chapters.find(c => c.id === id);
    if (C && same(C.intro, E.intro.now)) { delete E.intro; continue; }
    if (!C || !same(C.intro, E.intro.was)) { conflicts.push(`глава ${id}: в игре текст поменялся после правки`); continue; }
    src = setField(src, chapterObjects(src).find(o => o.name === id).at, 'intro', E.intro.now);
    expect.push([E.intro.now, a => a.chapters.find(c => c.id === id)?.intro, `глава ${id}`]);
    applied.push(`глава ${id}`);
    delete E.intro;
  }
  for (const [g, E] of Object.entries(edits.lessons)) for (const k of Object.keys(E)) {
    if (k === 'note') continue;
    const was = cur.lessons[g]?.[k];
    if (was != null && same(was, E[k].now)) { delete E[k]; continue; }
    if (was == null || !same(was, E[k].was)) { conflicts.push(`урок ${g} · ${k}: в игре текст поменялся после правки`); continue; }
    if (!String(E[k].now).trim()) { conflicts.push(`урок ${g} · ${k}: пустая реплика`); continue; }
    src = setField(src, lessonGroupAt(src, g), k, E[k].now);
    expect.push([E[k].now, a => a.lessons[g]?.[k], `урок ${g} · ${k}`]);
    applied.push(`урок ${g} · ${k}`);
    delete E[k];
  }
  // проверка: игра читает вписанное ровно так, как задумано, и уровней столько же
  const after = current(src);
  if (after.levels.length !== cur.levels.length) throw new Error('после правки изменилось число уровней — ничего не сохраняю');
  for (const [v, read, what] of expect) {
    const got = read(after);
    if (!same(empty(v) ? undefined : v, empty(got) ? undefined : got)) throw new Error(`${what}: вписалось не так — ничего не сохраняю`);
  }
  for (const set of ['levels', 'chapters', 'lessons']) for (const [id, E] of Object.entries(edits[set])) if (!Object.values(E).some(Boolean)) delete edits[set][id];
  return { src, edits, applied, conflicts, renamed };
}
// тексты «в начале» (tools/texts/original.json) — по названию уровня: после переименования ключ переезжает
function renameOriginal(orig, renamed) {
  for (const [a, b] of Object.entries(renamed)) if (orig.levels[a]) { orig.levels[b] = orig.levels[a]; delete orig.levels[a]; }
  return Object.keys(renamed).length > 0;
}

const api = { current, applyEdits, renameOriginal, FIELDS, same, empty };
if (typeof module !== 'undefined') module.exports = api; else window.TextsCore = api;
})();
