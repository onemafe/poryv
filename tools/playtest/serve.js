// Локальный сервер для ИИ-плейтеста: отдаёт Порыв.html по адресу http://127.0.0.1:8790/
// Только для этой машины (127.0.0.1), наружу не слушает.
// Запуск: node tools/playtest/serve.js     → открыть http://127.0.0.1:8790/?agent=sveta
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = +process.env.PORT || 8790;
const GAME = path.join(__dirname, '..', '..', 'Порыв.html');

// /phone?agent=<имя> — игра в рамке телефона 412×860: агент не может сузить развёрнутое окно Chrome,
// а раскладка игры зависит от размера окна. window.agent рамки — это agent игры внутри.
const PHONE = q => `<!doctype html><meta charset="utf-8"><title>Порыв · телефон</title>
<style>html,body{margin:0;height:100%;background:#2b3440;display:flex;align-items:center;justify-content:center}
iframe{width:412px;height:min(860px,calc(100vh - 20px));border:0;border-radius:18px;background:#fff;box-shadow:0 0 0 8px #11161d}</style>
<iframe id="f" src="/${q}"></iframe>
<script>const f = document.getElementById('f'); Object.defineProperty(window, 'agent', { get: () => f.contentWindow.agent });</script>`;

http.createServer((req, res) => {
  const [p, q = ''] = req.url.split('?');
  if (p === '/phone') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(PHONE(q ? '?' + q : '')); return; }
  if (p !== '/') { res.writeHead(404); res.end(); return; }
  // читаем при каждом запросе — правки уровней видны после перезагрузки страницы
  fs.readFile(GAME, (err, data) => {
    if (err) { res.writeHead(500); res.end(String(err)); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Порыв: http://127.0.0.1:${PORT}/?agent=<имя>`));
