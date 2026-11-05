// Сборка архива для Яндекс Игр: dist/yandex/ (распакованная игра, для sdk-dev-proxy) и dist/poryv-yandex.zip.
// Берёт Порыв.html, вырезает всё, что только для разработки, подключает SDK, кладёт шрифты. Исходник не меняет.
// Что вырезается (метки в Порыв.html; в исходнике всё остаётся — на этом работают Тексты.html и режим агента):
//   строки, которые кончаются на «// @dev», «/* @dev */» или «<!-- @dev -->»;
//   куски между «@dev-start» и «@dev-end» (теми же тремя видами комментариев).
// Сборка падает, если в архив попало служебное или нарушены требования к архиву (Яндекс, пп. 1.21, 1.22).
// Запуск: node tools/build.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist', 'yandex');
const ZIP = path.join(ROOT, 'dist', 'poryv-yandex.zip');
const MAX_ZIP = 100 * 1024 * 1024;

function fail(msg) { console.error('СБОРКА НЕ УДАЛАСЬ: ' + msg); process.exit(1); }

// ---------- вырезание ----------
const START = /^\s*(\/\/|\/\*|<!--) @dev-start( \*\/| -->)?\s*$/, END = /^\s*(\/\/|\/\*|<!--) @dev-end( \*\/| -->)?\s*$/;
const ONE = /(\/\/ @dev|\/\* @dev \*\/|<!-- @dev -->)\s*$/;
function strip(src) {
  const kept = [], removed = [];
  let from = 0;
  src.split(/\r?\n/).forEach((line, i) => {
    if (START.test(line)) { if (from) fail(`строка ${i + 1}: @dev-start внутри другого куска (начат в строке ${from})`); from = i + 1; return; }
    if (END.test(line)) { if (!from) fail(`строка ${i + 1}: @dev-end без @dev-start`); from = 0; return; }
    if (from || ONE.test(line)) removed.push(line); else kept.push(line);
  });
  if (from) fail(`@dev-start в строке ${from} не закрыт`);
  return { html: kept.join('\n'), removed: removed.join('\n') };
}

// ---------- проверки ----------
function checkHtml(html, removed) {
  const bad = [];
  // адрес не должен ни на что влиять, служебное не должно остаться
  for (const [re, what] of [
    [/location\.search/, 'чтение параметров адреса'],
    [/[?&](dev|agent|level|banner)\b/, 'параметр разработчика'],
    [/window\.agent/, 'window.agent'],
    [/@dev/, 'метка @dev'],
    [/\.googleapis\.|\.gstatic\./, 'внешние шрифты'],
    [/adTest|ad-test/, 'тестовый баннер'],
  ]) for (const m of html.matchAll(new RegExp(re, 'g'))) bad.push(`${what}: «${m[0]}»${around(html, m.index)}`);
  // внешних запросов нет: адреса — только пространства имён в SVG
  for (const m of html.matchAll(/https?:\/\/[^\s"'`)<]+/g)) if (!m[0].startsWith('http://www.w3.org/')) bad.push(`внешний адрес: ${m[0]}${around(html, m.index)}`);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]), js = scripts.join('\n');
  // что объявлено на верхнем уровне вырезанного, снаружи звать нельзя: в игре это была бы ошибка во время работы, а не при сборке
  for (const m of removed.matchAll(/^(?:function|const|let)\s+([A-Za-z_$][\w$]*)/gm)) {
    const hit = js.match(new RegExp(`(^|[^\\w$.])${m[1].replace(/\$/g, '\\$')}\\b`));
    if (hit) bad.push(`осталось обращение к вырезанному «${m[1]}»${around(js, hit.index)}`);
  }
  for (const m of removed.matchAll(/\bid="(\w+)"/g)) if (js.includes(`$('#${m[1]}')`)) bad.push(`обращение к вырезанной кнопке #${m[1]}`);
  // страница должна разбираться как код
  if (scripts.length !== 1) bad.push(`скриптов в странице ${scripts.length}, ждали 1`);
  for (const code of scripts) try { new vm.Script(code); } catch (e) { bad.push('скрипт не разбирается: ' + e.message); }
  if (bad.length) fail('\n  ' + bad.join('\n  '));
}
function around(s, i) { return `\n      …${s.slice(Math.max(0, i - 40), i + 60).replace(/\s+/g, ' ')}…`; }
function checkFiles(files, zipSize) {
  if (!files.some(f => f.name === 'index.html')) fail('нет index.html в корне');
  for (const { name } of files) if (!/^[A-Za-z0-9._/-]+$/.test(name)) fail(`в имени файла только латиница, цифры и «._-»: ${name}`);
  if (zipSize > MAX_ZIP) fail(`архив ${zipSize} байт — больше 100 МБ`);
}

// ---------- ZIP без библиотек ----------
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function zip(files) {
  const parts = [], central = [];
  let offset = 0;
  for (const { name, data } of files) {
    const raw = zlib.deflateRawSync(data, { level: 9 }), n = Buffer.from(name), crc = crc32(data);
    const common = b => { // общая часть локального и центрального заголовков; дата постоянная, чтобы архив от тех же файлов был тем же
      b.writeUInt16LE(20, 0); b.writeUInt16LE(0, 2); b.writeUInt16LE(8, 4); b.writeUInt16LE(0, 6); b.writeUInt16LE(0x21, 8);
      b.writeUInt32LE(crc, 10); b.writeUInt32LE(raw.length, 14); b.writeUInt32LE(data.length, 18); b.writeUInt16LE(n.length, 22); b.writeUInt16LE(0, 24);
      return b;
    };
    const head = Buffer.alloc(30); head.writeUInt32LE(0x04034b50, 0); common(head.subarray(4));
    parts.push(head, n, raw);
    const cen = Buffer.alloc(46); cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); common(cen.subarray(6)); cen.writeUInt32LE(offset, 42);
    central.push(cen, n);
    offset += head.length + n.length + raw.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}

// ---------- сборка ----------
const { html, removed } = strip(fs.readFileSync(path.join(ROOT, 'Порыв.html'), 'utf8'));
checkHtml(html, removed);
// async: зависший SDK не должен держать страницу, игра подождёт его сама и пойдёт дальше без него
const SDK = '<script src="/sdk.js" async></script>\n';
if (html.split('</head>').length !== 2) fail('не нашлось место для подключения SDK');
const page = html.replace('</head>', () => SDK + '</head>');

const fontsDir = path.join(ROOT, 'fonts');
const fontNames = fs.readdirSync(fontsDir).sort();
for (const m of page.matchAll(/url\("(fonts\/[^"]+)"\)/g)) if (!fontNames.includes(m[1].slice(6))) fail(`нет файла шрифта ${m[1]}`);
const files = [{ name: 'index.html', data: Buffer.from(page) }, ...fontNames.map(f => ({ name: 'fonts/' + f, data: fs.readFileSync(path.join(fontsDir, f)) }))];
const archive = zip(files);
checkFiles(files, archive.length);
// проверка уровней — самая долгая, поэтому после остальных
try { execFileSync(process.execPath, [path.join(__dirname, 'check-levels.js')], { stdio: 'pipe' }); }
catch (e) { fail('уровни не прошли проверку — запусти node tools/check-levels.js'); }

fs.rmSync(OUT, { recursive: true, force: true });
for (const { name, data } of files) { const p = path.join(OUT, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); }
fs.writeFileSync(ZIP, archive);
console.log(`Готово: ${path.relative(ROOT, ZIP)} — ${(archive.length / 1024).toFixed(0)} КБ, файлов ${files.length}; распакованная — ${path.relative(ROOT, OUT)}`);
