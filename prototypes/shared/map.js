// Общий код прототипов карты уровней «Порыва»: главы и уровни, прогресс (звёзды), карточка уровня, ворота главы,
// настройки, панель прототипа. Каждый вариант рисует саму карту в cfg.render(), всё остальное — здесь.
// В прототипе «Играть» сразу засчитывает уровень на 1–3 ★: так видно, как открывается следующий.
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const html = document.documentElement;

  // ---------- иконки 24×24: [разметка, заливка] ----------
  const ICONS = {
    star: ['<path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/>', 1],
    lock: ['<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'],
    shift: ['<path d="M4.5 12a7.5 7.5 0 0 1 13-5.1"/><path d="M18 2.5v4.6h-4.6"/><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1"/><path d="M6 21.5v-4.6h4.6"/>'],
    new: ['<path d="M12 2l2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z"/>', 1],
    energy: ['<path d="M13.5 2L4.5 14h6.5l-1 8 9-12H12.5z"/>', 1],
    snow: ['<path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2L3.8 16.8M9.5 4l2.5 2.5L14.5 4M9.5 20l2.5-2.5 2.5 2.5"/>'],
    cut: ['<path d="M4 20.5l9.5-9.5"/><path d="M11.5 6.5l3.5-3.5 6 6-3.5 3.5c-1.5-.5-2.5-1-3.5-2s-2-2-2.5-4z"/>'],
    storm: ['<path d="M7 16.5a4 4 0 0 1-.4-8 5.6 5.6 0 0 1 10.8-1.3A4.1 4.1 0 0 1 17 16.5"/><path d="M12.5 12l-2.3 4h3.6l-2.3 4.5"/>'],
    wind: ['<path d="M3 8.5h11a3 3 0 1 0-3-3M3 12.5h15a3 3 0 1 1-3 3M3 16.5h6"/>'],
    menu: ['<path d="M4 7h16M4 12h16M4 17h16"/>'],
    sound: ['<path d="M4 9.5v5h3.5L12.5 19V5L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.6 7.6 0 0 1 0 11"/>'],
    mute: ['<path d="M4 9.5v5h3.5L12.5 19V5L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'],
    sandbox: ['<path d="M5 10h14l-1.6 10.5H6.6z"/><path d="M8 10a4 4 0 0 1 8 0"/><path d="M12 10V3.5l4 1.6"/>'],
    back: ['<path d="M15 5l-7 7 7 7"/>'],
    close: ['<path d="M6 6l12 12M18 6L6 18"/>'],
    play: ['<path d="M8 5.5v13l10.5-6.5z"/>', 1],
    flag: ['<path d="M6 21V3.5"/><path d="M6 4h12l-3 4 3 4H6"/>'],
  };
  const icon = (n, cls = '') => {
    const [d, fill] = ICONS[n];
    return `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${d}</svg>`;
  };

  // ---------- главы и уровни ----------
  // tag: new — новая фигура (t — какая), shift — ветер повернёт, energy — ветряки, snow — снег, cut — вырубка, boss — финал главы.
  // Деревня и Город — уровни из Порыв.html; Мыс и Перевал — заглушки названий по плану (4 главы).
  const lv = (n, who, say, ...tags) => ({ n, who, say, tags: tags.map(t => typeof t === 'string' ? { k: t } : t) });
  const CHAPTERS = [
    { key: 'village', name: 'Деревня', place: 'хаты у скал и река', need: 0,
      intro: 'Шторм идёт к острову. Первым делом — деревня у скал: хаты лёгкие, их сдувает первыми.', tint: '#dfe9cc', deep: '#4f8a4b',
      people: ['keeper', 'ilya', 'masha', 'stepa', 'nyura', 'zina', 'fyodor'],
      levels: [
        lv('Первый порыв', 'keeper', 'Видишь хижину деда Ильи? Жми «Ветер!» — посмотрим, что будет.', { k: 'new', t: 'Забор' }),
        lv('Сад', 'masha', 'За моими яблонями тихо, а вторая хата голая стоит. Посади пару деревьев, а?', { k: 'new', t: 'Дерево' }),
        lv('Новый дом', 'stepa', 'Хочу дом поставить. Где тут у вас потише?', { k: 'new', t: 'Хижина' }),
        lv('Соседки', 'nyura', 'Забор мне! — Нет, мне! — Забор один, поставь так, чтобы обеим хватило.'),
        lv('Ветер с реки', 'stepa', 'Я ж забор с запада поставил… а дует с реки!', 'wind'),
        lv('Переменчивый ветер', 'keeper', 'Барометр скачет: через 4.5 секунды ветер повернёт.', 'shift'),
        lv('Плетень', 'ilya', 'У концов забора ветер злее. А плетень сквозь себя пропускает — оттого и не крутит.', { k: 'new', t: 'Плетень' }),
        lv('Крепкий сосед', 'fyodor', 'За кузней всей улице тихо. Но больше 15 м/с она не выдержит.'),
        lv('Перед бурей', 'keeper', 'Шторм крепчает. Теперь сам: плетень, забор, дерево.', 'boss'),
      ] },
    { key: 'city', name: 'Город', place: 'высотки и набережная', need: 18,
      intro: 'Деревня устояла, а шторм ушёл к городу. За высотками тихо, но между ними сквозит.', tint: '#dde3ec', deep: '#41607e',
      people: ['keeper', null, null, null],
      levels: [
        lv('Переулок', null, 'Высотка уже стоит — используй её тень.', { k: 'new', t: 'Высотка' }),
        lv('Квартал у моря', null, 'С моря дует так, что окна дрожат.'),
        lv('Перекрёсток', null, 'Сквозь арку ветер проходит, а не бьёт в стену.', { k: 'new', t: 'Дом-арка' }),
        lv('Набережная', null, 'Круглый дом ветер обтекает.', { k: 'new', t: 'Ротонда' }),
        lv('Котельная', null, 'Труба высокая, но тонкая. Прикрой её.', { k: 'new', t: 'Труба' }),
        lv('Сквозняк', null, 'Ветер в городе крутит между домами.', 'shift'),
        lv('Площадь', null, 'Открытое место — ветру раздолье.'),
        lv('Ночь в городе', null, 'Шторм над городом. Держим все кварталы.', 'boss'),
      ] },
    { key: 'cape', name: 'Мыс', place: 'ветряки и лес', need: 36,
      intro: 'Город выстоял. Дальше мыс: ветряки дают свет, если направить на них ветер. А лес рубить с умом.', tint: '#d6e8e6', deep: '#2f7d77',
      people: ['keeper', null, null],
      levels: [
        lv('Маяк', null, 'На мысу дует со всех сторон.'),
        lv('Первый ветряк', null, 'Направь ветер на лопасти — нужен свет.', { k: 'new', t: 'Ветряк' }, 'energy'),
        lv('Роща', null, 'Лес держит ветер. Сколько деревьев можно срубить?', 'cut'),
        lv('Две мельницы', null, 'Одной мельнице ветер, другой — тишина.', 'energy'),
        lv('Лесопилка', null, 'Брёвна нужны, но и роща нужна.', 'cut'),
        lv('Обрыв', null, 'У края обрыва ветер разгоняется.', 'shift'),
        lv('Ветряная ферма', null, 'Три ветряка, и все должны крутиться.', 'energy'),
        lv('Штормовой мыс', null, 'Шторм идёт к горам. Мыс — последняя преграда.', 'boss'),
      ] },
    { key: 'pass', name: 'Перевал', place: 'снег и приют в горах', need: 54,
      intro: 'Последний рубеж — перевал. Снег, лес и Большой шторм. Всё, чему научился, — сюда.', tint: '#e6ebf1', deep: '#5b6c86',
      people: ['keeper', null, null],
      levels: [
        lv('Снежный перевал', null, 'Ветер несёт снег. Где тихо, там и наметёт.', { k: 'new', t: 'Сугроб' }, 'snow'),
        lv('Сторожка', null, 'Дорогу к сторожке заносит.', 'snow'),
        lv('Просека', null, 'Прорубишь лес — откроешь ветру дорогу.', 'cut'),
        lv('Приют', null, 'В приюте люди. Его не должно занести.', 'snow'),
        lv('Метель', null, 'Метель крутит то с одной стороны, то с другой.', 'shift', 'snow'),
        lv('Хребет', null, 'За хребтом тихо, но не везде.'),
        lv('Лавина', null, 'Снег копится на склоне.', 'snow', 'cut'),
        lv('Большой шторм', 'keeper', 'Вот он, Большой шторм. Всё, чему научился, — сюда.', 'boss'),
      ] },
  ];
  // реплика после победы — outro из Порыв.html; где её нет — смотритель
  const OUT = {
    'Первый порыв': ['keeper', 'Вот так. Пойдём дальше, в посёлке ждут.'],
    'Сад': ['masha', 'Вот теперь и вторая в тени. Спасибо!'],
    'Новый дом': ['stepa', 'Тут и построюсь. Спасибо!'],
    'Соседки': ['zina', 'Ладно, Нюра, мир.'],
    'Ветер с реки': ['stepa', 'Буду теперь на стрелки смотреть.'],
    'Переменчивый ветер': ['ilya', 'Ишь, крутит! А хата стоит.'],
    'Плетень': ['ilya', 'Говорил же — плетень не подведёт.'],
    'Крепкий сосед': ['fyodor', 'Устояла кузня — устояла и улица.'],
    'Перед бурей': ['keeper', 'Деревня цела. Но шторм уходит к городу — нам туда.'],
  };
  const outOf = L => OUT[L.n] || ['keeper', L.tags.some(t => t.k === 'boss') ? 'Устояли! Шторм уходит дальше.' : 'Устояло. Идём дальше.'];
  const LEVELS = [];
  CHAPTERS.forEach((c, ci) => { c.start = LEVELS.length; c.levels.forEach((L, i) => { L.ci = ci; L.i = i; L.gi = LEVELS.length; LEVELS.push(L); }); });
  const MAX_STARS = LEVELS.length * 3;

  const TAGS = {
    new: { icon: 'new', label: t => `Новое: ${t.t.toLowerCase()}` },
    shift: { icon: 'shift', label: () => 'Ветер повернёт' },
    wind: { icon: 'wind', label: () => 'Ветер с другой стороны' },
    energy: { icon: 'energy', label: () => 'Цель — энергия' },
    snow: { icon: 'snow', label: () => 'Снег' },
    cut: { icon: 'cut', label: () => 'Вырубка' },
    boss: { icon: 'storm', label: () => 'Финал главы' },
  };
  // значок на кружке уровня — один, самый важный
  const badgeOf = L => { const order = ['boss', 'new', 'shift', 'energy', 'snow', 'cut', 'wind'];
    for (const k of order) { const t = L.tags.find(x => x.k === k); if (t) return t; } return null; };

  // ---------- прогресс ----------
  const fill = (arr) => { const s = new Array(LEVELS.length).fill(0); arr.forEach((v, i) => { s[i] = v; }); return s; };
  const PRESETS = {
    new: { name: 'Новичок', desc: 'первый запуск', stars: fill([]) },
    mid: { name: 'Середина', desc: 'Деревня, уровень 6', stars: fill([3, 3, 2, 3, 1]) },
    city: { name: 'Город', desc: 'глава 2 открыта', stars: fill([3, 3, 2, 3, 2, 3, 2, 3, 3, 3, 1]) },
    gate: { name: 'Мало ★', desc: 'Деревня пройдена на 13 ★, нужно 18', stars: fill([1, 2, 1, 1, 2, 1, 1, 2, 2]) },
    late: { name: 'Мыс', desc: 'глава 3', stars: fill([3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 3, 2]) },
    done: { name: 'Всё', desc: 'всё пройдено', stars: LEVELS.map((_, i) => (i % 7 === 3 ? 2 : 3)) },
  };
  const st = { preset: 'city', stars: PRESETS.city.stars.slice(), sound: true, music: true, lang: 'ru', justDone: null };

  const total = () => st.stars.reduce((a, b) => a + b, 0);
  const chapterStars = ci => CHAPTERS[ci].levels.reduce((a, L) => a + st.stars[L.gi], 0);
  const chapterDone = ci => CHAPTERS[ci].levels.every(L => st.stars[L.gi] > 0);
  const chapterPassed = ci => CHAPTERS[ci].levels.filter(L => st.stars[L.gi] > 0).length;
  // глава: open — открыта; stars — прошлая пройдена, но звёзд мало; locked — прошлая не пройдена
  const gate = ci => ci === 0 ? 'open' : !chapterDone(ci - 1) ? 'locked' : total() >= CHAPTERS[ci].need ? 'open' : 'stars';
  // уровень: done — пройден, current — следующий к игре, locked — закрыт
  const status = gi => {
    if (st.stars[gi] > 0) return 'done';
    const L = LEVELS[gi];
    if (gate(L.ci) !== 'open') return 'locked';
    return L.i === 0 || st.stars[gi - 1] > 0 ? 'current' : 'locked';
  };
  const current = () => { for (let i = 0; i < LEVELS.length; i++) if (status(i) === 'current') return i; return null; };
  const sandboxOpen = () => chapterDone(0);
  // где добрать звёзд: пройденные уровни меньше чем на 3 ★
  const retry = () => LEVELS.filter(L => st.stars[L.gi] > 0 && st.stars[L.gi] < 3);
  const blockedGate = () => { for (let ci = 1; ci < CHAPTERS.length; ci++) if (gate(ci) === 'stars') return ci; return null; };

  // ---------- мелкие куски разметки ----------
  const UNKNOWN = '<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" fill="#dfe4ea"/><circle cx="21" cy="18" r="8" fill="#b7c0ca"/><path d="M5 42Q21 25 37 42Z" fill="#b7c0ca"/><text x="21" y="22" text-anchor="middle" font-size="10" font-family="Golos Text, sans-serif" font-weight="700" fill="#fff">?</text></svg>';
  const ava = (who, cls = '') => {
    const C = who && window.CHARS[who];
    return `<span class="ava ${cls}" style="--ring:${C ? C.ring : '#b7c0ca'}" title="${C ? C.name : 'Житель — ещё не придуман'}">${C ? C.svg : UNKNOWN}</span>`;
  };
  const starsRow = (n, cls = '') => `<span class="srow ${cls}" aria-label="${n} из 3 звёзд">${[0, 1, 2].map(i => icon('star', i < n ? 'on' : 'off')).join('')}</span>`;
  const whoName = who => who && window.CHARS[who] ? window.CHARS[who].name : 'Житель';

  // ---------- рисунки построек (вид сбоку), ширина PROPW — в px или единицах SVG ----------
  const PROPS = {
    hut: '<svg viewBox="0 0 40 34"><path d="M3 17L20 5l17 12z" fill="#c4553d"/><rect x="7" y="17" width="26" height="16" fill="#f3ead8"/><rect x="17" y="23" width="6" height="10" fill="#8a6240"/><rect x="10" y="20" width="5" height="5" fill="#9fc0dd"/></svg>',
    house: '<svg viewBox="0 0 56 34"><path d="M3 15L14 4h30l9 11z" fill="#5f7fa8"/><rect x="6" y="15" width="44" height="18" fill="#efd9a7"/><rect x="12" y="19" width="6" height="6" fill="#9fc0dd"/><rect x="38" y="19" width="6" height="6" fill="#9fc0dd"/><rect x="25" y="22" width="6" height="11" fill="#8a6240"/></svg>',
    tree: '<svg viewBox="0 0 30 40"><rect x="13" y="25" width="4" height="14" fill="#8a6240"/><circle cx="15" cy="16" r="12" fill="#5f9a5a"/><circle cx="11" cy="12" r="5" fill="#78b072"/></svg>',
    fence: '<svg viewBox="0 0 54 18"><g fill="#b98a5a"><rect x="2" y="2" width="5" height="16"/><rect x="18" y="2" width="5" height="16"/><rect x="34" y="2" width="5" height="16"/><rect x="48" y="2" width="5" height="16"/><rect x="0" y="6" width="54" height="3"/><rect x="0" y="12" width="54" height="3"/></g></svg>',
    tower: '<svg viewBox="0 0 30 70"><rect x="3" y="8" width="24" height="62" fill="#c6d6e3"/><rect x="1" y="3" width="28" height="6" fill="#2f5d73"/><g fill="#7ea6c4">' + Array.from({ length: 8 }, (_, r) => `<rect x="7" y="${14 + r * 7}" width="5" height="4"/><rect x="18" y="${14 + r * 7}" width="5" height="4"/>`).join('') + '</g></svg>',
    block: '<svg viewBox="0 0 46 46"><rect x="2" y="8" width="42" height="38" fill="#d8d2e6"/><rect x="0" y="4" width="46" height="5" fill="#3f4a6b"/><g fill="#9b93b7"><rect x="7" y="14" width="6" height="5"/><rect x="20" y="14" width="6" height="5"/><rect x="33" y="14" width="6" height="5"/><rect x="7" y="25" width="6" height="5"/><rect x="33" y="25" width="6" height="5"/></g><rect x="19" y="32" width="8" height="14" fill="#3f4a6b"/></svg>',
    chimney: '<svg viewBox="0 0 24 70"><path d="M7 70L9 8h6l2 62z" fill="#c9765a"/><rect x="8" y="5" width="8" height="4" fill="#3b3b3b"/><g fill="#aab4bf" opacity=".7"><circle cx="13" cy="2" r="3"/></g></svg>',
    mill: '<svg viewBox="0 0 44 64"><path d="M19 63l1.6-40h2.8l1.6 40z" fill="#f2f0ea" stroke="#c9c4b8"/><g class="spin"><path d="M22 23L20 3h4zM22 23l18 8-2 3.5zM22 23L6 34.5 4 31z" fill="#c4553d"/></g><circle cx="22" cy="23" r="2.6" fill="#3b3b3b"/></svg>',
    light: '<svg viewBox="0 0 30 66"><path d="M8 66l3-46h8l3 46z" fill="#f6f8fa"/><path d="M9.6 54h10.8l.4 6H9.2zM10.4 38h9.2l.4 6H10z" fill="#c4553d"/><rect x="9" y="12" width="12" height="8" fill="#ffd23f"/><path d="M7 12l8-8 8 8z" fill="#3b3b3b"/></svg>',
    pine: '<svg viewBox="0 0 30 46"><rect x="13" y="38" width="4" height="8" fill="#6b5240"/><path d="M15 2L4 22h6L2 38h26l-8-16h6z" fill="#3f6b55"/><path d="M15 2l-5 9h10z" fill="#f6f8fa"/></svg>',
    mount: '<svg viewBox="0 0 90 52"><path d="M0 52L32 6l18 24 10-12 30 34z" fill="#8f9bab"/><path d="M32 6l-10 14 6-2 4 5 4-6 4 4z" fill="#f6f8fa"/><path d="M60 18l-6 7 4-1 3 3 3-4z" fill="#f6f8fa"/></svg>',
    rock: '<svg viewBox="0 0 34 20"><path d="M2 20L8 6l10-5 9 6 5 13z" fill="#9aa0a6"/><path d="M8 6l10-5 9 6-9 2z" fill="#b4b9be"/></svg>',
  };
  const PROPW = { hut: 44, house: 60, tree: 32, fence: 54, tower: 32, block: 50, chimney: 22, mill: 48, light: 30, pine: 34, mount: 110, rock: 34 };

  // сглаженная кривая через точки (Catmull-Rom → кубические Безье)
  function curve(p) {
    if (p.length < 2) return '';
    let d = `M${p[0].x},${p[0].y}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += ` C${b.x + (c.x - a.x) / 6},${b.y + (c.y - a.y) / 6} ${c.x - (e.x - b.x) / 6},${c.y - (e.y - b.y) / 6} ${c.x},${c.y}`;
    }
    return d;
  }

  // ---------- плита главы, как поле в игре: верх цвета главы, синие бока, рисунки по краям ----------
  const PLATE_DECOR = { village: ['hut', 'tree', 'house', 'tree', 'fence', 'rock'], city: ['tower', 'block', 'chimney', 'tower', 'block', 'house'],
    cape: ['mill', 'light', 'mill', 'pine', 'rock', 'mill'], pass: ['mount', 'pine', 'pine', 'mount', 'hut', 'pine'] };
  const PLATE_SPOTS = [[0.5, 0.78], [1.02, 0.76], [0.5, 0.22], [-0.02, 0.24], [0.2, 1.02], [0.8, -0.02]];
  // рисунок постройки, стоящий нижним краем на точке (x, y); k — масштаб относительно плиты карты
  function propAt(name, x, y, k) {
    const w = PROPW[name] * (name === 'mount' ? 0.55 : 0.6) * k, h = w * 1.6, vb = (PROPS[name].match(/viewBox="([^"]+)"/) || [])[1];
    return `<svg x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" viewBox="${vb}" preserveAspectRatio="xMidYMax meet">${PROPS[name].replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
  }
  // (cx, cy) — центр верха, a — полуширина, d — толщина; spots — точки рисунков [u, v]
  function plate(ci, cx, cy, a, d, spots = PLATE_SPOTS) {
    const C = CHAPTERS[ci], list = PLATE_DECOR[C.key], pt = (u, v) => ({ x: cx + (u - v) * a, y: cy + (u + v - 1) * a / 2 });
    let h = `<ellipse cx="${cx}" cy="${cy + d + 6}" rx="${a * 1.05}" ry="${a * 0.36}" fill="rgba(30,50,75,.12)"/>
      <polygon points="${cx - a},${cy} ${cx},${cy + a / 2} ${cx},${cy + a / 2 + d} ${cx - a},${cy + d}" fill="#314a66"/>
      <polygon points="${cx},${cy + a / 2} ${cx + a},${cy} ${cx + a},${cy + d} ${cx},${cy + a / 2 + d}" fill="#4a6685"/>
      <polygon class="ptop" points="${cx},${cy - a / 2} ${cx + a},${cy} ${cx},${cy + a / 2} ${cx - a},${cy}" fill="${C.tint}" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/>`;
    spots.map((s, i) => ({ k: list[i % list.length], p: pt(s[0], s[1]) })).sort((x, y) => x.p.y - y.p.y)
      .forEach(({ k, p }) => { h += propAt(k, p.x, p.y, a / 105); });
    return h;
  }
  // порыв: полосы ветра бегут слева направо
  const gust = (x, y, w, n = 5) => `<g class="gust" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9">${Array.from({ length: n }, (_, i) =>
    `<path d="M${x + (i * 37) % (w / 2)} ${y + i * 14} h${40 + (i * 23) % 50}" style="animation-delay:${(i * 0.37).toFixed(2)}s"/>`).join('')}</g>`;

  // ---------- оболочка: верхняя полоса, кнопка «Играть», карточки ----------
  let cfg, sheetWrap, sheetEl, toastEl, toastT, protoEl, lastFocus, winWrap, winEl, winKind = null, pendingChap = null, resGi = null;

  function topbar() {
    return `<div class="mtop">
      <button type="button" class="rbtn" data-act="settings" aria-label="Настройки">${icon('menu')}</button>
      <div class="brand"><b>Порыв</b><span>${cfg.sub || 'карта шторма'}</span></div>
      <button type="button" class="chip" data-act="stars" aria-label="Звёзды: ${total()} из ${MAX_STARS}">${icon('star', 'on')}<b>${total()}</b><span>/${MAX_STARS}</span></button>
      <button type="button" class="rbtn ${sandboxOpen() ? '' : 'dim'}" data-act="sandbox" aria-label="Песочница">${icon('sandbox')}</button>
      <button type="button" class="rbtn" data-act="sound" aria-label="${st.sound ? 'Выключить звук' : 'Включить звук'}" aria-pressed="${!st.sound}">${icon(st.sound ? 'sound' : 'mute')}</button>
    </div>`;
  }
  // главная кнопка: следующий уровень; если упёрлись в звёзды — «добрать»; если всё пройдено — песочница
  function cta() {
    const gi = current();
    if (gi != null) { const L = LEVELS[gi]; return { act: 'play', gi, big: 'Играть', small: `${cfg.globalNum ? gi + 1 : L.i + 1} · ${L.n}` }; }
    const g = blockedGate();
    if (g != null) return { act: 'gate', ci: g, big: 'Добрать ★', small: `ещё ${CHAPTERS[g].need - total()} до главы «${CHAPTERS[g].name}»` };
    return { act: 'sandbox', big: 'Песочница', small: 'все уровни пройдены' };
  }
  function ctaButton(cls = '') {
    const c = cta();
    return `<button type="button" class="btn go cta ${cls}" data-act="${c.act}" ${c.gi != null ? `data-gi="${c.gi}"` : ''} ${c.ci != null ? `data-ci="${c.ci}"` : ''}>
      ${c.act === 'play' ? icon('play') : ''}<span class="cta-t"><b>${c.big}</b><small>${c.small}</small></span></button>`;
  }

  function openSheet(inner, label) {
    lastFocus = document.activeElement;
    sheetEl.innerHTML = `<button type="button" class="sh-x" data-act="close" aria-label="Закрыть">${icon('close')}</button>${inner}`;
    sheetEl.setAttribute('aria-label', label);
    sheetWrap.hidden = false;
    requestAnimationFrame(() => sheetWrap.classList.add('on'));
    const f = sheetEl.querySelector('.go') || sheetEl.querySelector('button'); f && f.focus({ preventScroll: true });
  }
  function closeSheet() {
    sheetWrap.classList.remove('on'); sheetWrap.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function levelCard(gi) {
    const L = LEVELS[gi], C = CHAPTERS[L.ci], s = st.stars[gi], stt = status(gi);
    const tags = L.tags.map(t => `<span class="tag">${icon(TAGS[t.k].icon)}${TAGS[t.k].label(t)}</span>`).join('');
    const prev = gi > 0 ? LEVELS[gi - 1] : null;
    let foot;
    if (stt === 'locked') {
      foot = gate(L.ci) !== 'open'
        ? `<p class="lock-why">${icon('lock')} Глава «${C.name}» ещё закрыта.</p><button type="button" class="btn wide" data-act="gate" data-ci="${L.ci}">Как открыть главу</button>`
        : `<p class="lock-why">${icon('lock')} Откроется, когда пройдёшь «${prev.n}».</p>`;
    } else {
      foot = `<button type="button" class="btn go" data-act="play" data-gi="${gi}">${icon('play')}${s ? (s < 3 ? `Переиграть · ещё ${3 - s} ★` : 'Переиграть') : 'Играть'}</button>`;
    }
    const crit = ['Все постройки устояли', 'Ни одна не повреждена', 'Фигура осталась в запасе'];
    return `<div class="lc">
      <div class="lc-head">${ava(L.who, 'big')}<div><span class="ch">${C.name} · ${L.i + 1} из ${C.levels.length}</span><h2>${L.n}</h2></div></div>
      ${stt === 'locked' ? '' : `<blockquote class="lc-say"><p>${L.say}</p><cite>— ${whoName(L.who)}</cite></blockquote>`}
      ${tags ? `<div class="tags">${tags}</div>` : ''}
      <ul class="crit">${crit.map((t, i) => `<li class="${i < s ? 'on' : ''}">${icon('star', i < s ? 'on' : 'off')}${t}</li>`).join('')}</ul>
      ${foot}
      <p class="pnote">Критерий звёзд не решён — здесь из плана, этап 2.</p>
    </div>`;
  }
  function gateCard(ci) {
    const C = CHAPTERS[ci], g = gate(ci), have = total(), prevC = CHAPTERS[ci - 1];
    const lastPrev = prevC.levels[prevC.levels.length - 1];
    const r = retry().slice(0, 6);
    return `<div class="lc">
      <div class="lc-head"><span class="gate-ico">${icon('lock')}</span><div><span class="ch">Глава ${ci + 1}</span><h2>${C.name}</h2></div></div>
      <ul class="crit">
        <li class="${chapterDone(ci - 1) ? 'on' : ''}">${icon(chapterDone(ci - 1) ? 'star' : 'flag', 'on')}Пройти «${lastPrev.n}» — финал главы «${prevC.name}»</li>
        <li class="${have >= C.need ? 'on' : ''}">${icon('star', have >= C.need ? 'on' : 'off')}Собрать ${C.need} ★ — сейчас ${have}</li>
      </ul>
      <div class="meter" style="--p:${Math.min(1, have / C.need)}"><span></span></div>
      ${g === 'stars' && r.length ? `<p class="ch">Где добрать</p><div class="retry">${r.map(L => `<button type="button" class="rt" data-act="level" data-gi="${L.gi}">${starsRow(st.stars[L.gi])}<span>${L.n}</span></button>`).join('')}</div>` : ''}
      ${g === 'locked' ? `<p class="lock-why">Сначала пройди главу «${prevC.name}».</p>` : ''}
    </div>`;
  }
  function settingsCard() {
    const seg = (act, cur, opts) => `<span class="seg">${opts.map(([v, t]) => `<button type="button" data-act="${act}" data-v="${v}" aria-pressed="${String(cur) === v}">${t}</button>`).join('')}</span>`;
    return `<div class="lc menu-c"><h2>Настройки</h2>
      <div class="m-row"><span>Звук</span>${seg('set-sound', st.sound, [['true', 'Вкл'], ['false', 'Выкл']])}</div>
      <div class="m-row"><span>Музыка</span>${seg('set-music', st.music, [['true', 'Вкл'], ['false', 'Выкл']])}</div>
      <div class="m-row"><span>Язык</span>${seg('set-lang', st.lang, [['ru', 'Русский'], ['en', 'English']])}</div>
      <button type="button" class="btn wide" data-act="toast" data-t="Здесь заново запустится обучение первого уровня">Как играть — пройти обучение</button>
      <button type="button" class="btn wide" data-act="toast" data-t="Откроется сообщество игры ВКонтакте">Сообщество игры</button>
      <p class="pnote">«Сообщество» — только в сборке VK (обязательный канал поддержки). В Яндексе внешних ссылок нет.</p>
    </div>`;
  }
  function starsCard() {
    return `<div class="lc"><h2>${total()} из ${MAX_STARS} ★</h2>
      <ul class="crit ch-list">${CHAPTERS.map((C, ci) => `<li class="${gate(ci) === 'open' ? 'on' : ''}"><span class="dot" style="background:${C.deep}"></span><b>${C.name}</b><span class="grow"></span>${gate(ci) === 'open' ? `${chapterStars(ci)} / ${C.levels.length * 3} ★` : `${icon('lock')} ${C.need} ★`}</li>`).join('')}</ul>
      <p class="pnote">Звёзды открывают главы. Сколько нужно — подобрать по плейтесту.</p></div>`;
  }

  function toast(t) {
    toastEl.textContent = t; toastEl.hidden = false; clearTimeout(toastT);
    toastT = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

  // ---------- окна: итог уровня, открытие главы, загрузка ----------
  function showWin(inner, kind, label) {
    winKind = kind; winEl.className = `win card w-${kind}`; winEl.innerHTML = inner; winEl.setAttribute('aria-label', label);
    winWrap.hidden = false; winEl.scrollTop = 0;
    const f = winEl.querySelector('.btn.go'); f && f.focus({ preventScroll: true });
  }
  function closeWin() { winWrap.hidden = true; winKind = null; }
  const CRIT = ['Все постройки устояли', 'Ни одна не повреждена', 'Фигура осталась в запасе'];

  // итог уровня; в прототипе исход случайный или задан кнопкой в панели прототипа
  function resultWin(gi, won, got) {
    const L = LEVELS[gi], C = CHAPTERS[L.ci], before = total(), gb = CHAPTERS.map((_, ci) => gate(ci));
    resGi = gi;
    if (won) { st.stars[gi] = Math.max(st.stars[gi], got); st.justDone = gi; st.preset = null; }
    const opened = CHAPTERS.findIndex((_, ci) => gb[ci] !== 'open' && gate(ci) === 'open');
    if (opened >= 0) pendingChap = opened;
    const head = `<span class="ch">${C.name} · ${L.i + 1} из ${C.levels.length} · ${L.n}</span>`;
    const art = `<svg class="w-art" viewBox="0 0 300 170" aria-hidden="true">${plate(L.ci, 150, 92, 110, 20)}${won ? gust(18, 46, 120) : ''}
      ${won ? '' : '<g transform="translate(150 86) rotate(-8)"><rect x="-66" y="-21" width="132" height="42" rx="6" fill="rgba(255,255,255,.88)" stroke="#d63b45" stroke-width="4"/><text y="9" text-anchor="middle" font-family="Rubik Mono One, sans-serif" font-size="22" fill="#d63b45">СДУЛО</text></g>'}</svg>`;
    if (!won) {
      const [bn, lim] = [['Хижина', 14], ['Высотка', 28], ['Ветряк', 18], ['Приют', 16]][L.ci];
      showWin(`<div class="w-a">${art}${head}<h2>Не устояло</h2>
          <p class="w-why">${icon('wind')}${bn} сломалась: ветер &gt; ${lim} м/с</p></div>
        <div class="w-b"><div class="w-say">${ava('keeper')}<p>Ищи синие пятна на поле — там тихо. Прикрой постройку с той стороны, откуда жёлтые стрелки.<cite>— Петрович</cite></p></div>
          <div class="w-acts"><button type="button" class="btn go big" data-act="res-again"><span class="cta-t"><b>Ещё раз</b><small>расстановка сохранится</small></span>${icon('play')}</button>
            <button type="button" class="btn" data-act="res-hint">Подсказка <span class="ad">реклама</span></button>
            <button type="button" class="btn" data-act="res-map">${icon('back')}Карта</button></div>
          <p class="pnote">На кнопке подсказки — слово «реклама» и что даёт (Яндекс 4.5.1). В VK кнопку показываем, только если реклама готова.</p></div>`, 'lose', 'Уровень не пройден');
      return;
    }
    const [who, line] = outOf(L), nextGi = current(), nc = CHAPTERS.findIndex((_, ci) => gate(ci) !== 'open');
    const prog = opened >= 0 ? `<div class="w-prog open">${icon('flag')}<b>Открыта глава «${CHAPTERS[opened].name}»!</b></div>`
      : nc >= 0 ? `<div class="w-prog"><span>${icon('star', 'on')}<b>${total()}</b>${total() > before ? `<em>+${total() - before}</em>` : ''}<span class="grow"></span>глава «${CHAPTERS[nc].name}» — ${CHAPTERS[nc].need} ★</span><div class="meter" style="--p:${Math.min(1, total() / CHAPTERS[nc].need)}"><span></span></div></div>` : '';
    const next = opened >= 0 ? `глава «${CHAPTERS[opened].name}»` : nextGi != null ? `${LEVELS[nextGi].i + 1} · ${LEVELS[nextGi].n}` : 'на карту';
    showWin(`<div class="w-a">${art}${head}<h2>${got === 3 ? 'Ни царапины!' : 'Устояло!'}</h2>
        <div class="bigstars">${[0, 1, 2].map(i => `<span class="bs ${i < got ? 'on' : ''}" style="animation-delay:${(0.25 + i * 0.3).toFixed(2)}s">${icon('star')}</span>`).join('')}</div></div>
      <div class="w-b"><ul class="crit">${CRIT.map((t, i) => `<li class="${i < got ? 'on' : ''}">${icon('star', i < got ? 'on' : 'off')}${t}</li>`).join('')}</ul>
        <div class="w-say">${ava(who)}<p>${line}<cite>— ${whoName(who)}</cite></p></div>
        ${prog}
        <div class="w-acts"><button type="button" class="btn go big" data-act="res-next"><span class="cta-t"><b>Дальше</b><small>${next}</small></span>${icon('play')}</button>
          <button type="button" class="btn" data-act="res-again">${got < 3 ? 'Переиграть за ★★★' : 'Переиграть'}</button>
          <button type="button" class="btn" data-act="res-map">${icon('back')}Карта</button></div>
        <p class="pnote">«Дальше» — место межэкранной рекламы: только по нажатию, не чаще раза в 30 с, не в первые минуты (VK 5.1, Яндекс).</p></div>`, 'win', 'Уровень пройден');
  }

  // открытие главы — один раз, когда глава открылась
  function chapterWin(ci) {
    const C = CHAPTERS[ci], pieces = C.levels.flatMap(L => L.tags.filter(t => t.k === 'new').map(t => t.t));
    showWin(`<div class="w-a"><svg class="w-art" viewBox="0 0 300 180" aria-hidden="true">${plate(ci, 150, 100, 112, 20)}
        <g class="fog-off"><ellipse cx="110" cy="92" rx="70" ry="26" fill="#eef2f6"/><ellipse cx="190" cy="100" rx="66" ry="24" fill="#e4eaf0"/><ellipse cx="150" cy="80" rx="52" ry="24" fill="#f6f8fa"/></g>
        <g class="storm-off"><g transform="translate(236 40)"><path d="M-46 18q-10-16 9-20q3-17 22-14q9-15 29-5q20-4 22 14q16 4 8 25z" fill="#3a4659"/><path d="M4 16l-8 14h7l-5 13 13-18h-7l5-9z" fill="#ffd23f"/></g></g></svg>
        <span class="ch">Глава ${ci + 1} открыта</span><h2>${C.name}</h2><p class="w-place">${C.place}</p></div>
      <div class="w-b"><div class="w-say">${ava('keeper')}<p>${C.intro}<cite>— Петрович</cite></p></div>
        ${pieces.length ? `<div class="w-row"><span class="ch">Новые фигуры</span><div class="tags">${pieces.map(t => `<span class="tag">${icon('new')}${t}</span>`).join('')}</div></div>` : ''}
        <div class="w-row"><span class="ch">Жители</span><div class="folk">${C.people.map(w => ava(w, 'sm')).join('')}</div></div>
        <div class="w-acts"><button type="button" class="btn go big" data-act="chap-go" data-ci="${ci}"><span class="cta-t"><b>Вперёд</b><small>${C.levels.length} уровней · ${C.levels.length * 3} ★</small></span>${icon('play')}</button></div>
        <p class="pnote">Один раз, при первом открытии главы. Тучи над плитой расходятся, шторм уходит дальше.</p></div>`, 'chap', `Глава ${C.name}`);
  }

  // загрузка: нажать ничего нельзя; по готовности сразу карта, без затемнения (Яндекс 1.19)
  const TIPS = ['Синее на поле — тихо, красное — дует.', 'Жёлтые стрелки — откуда ветер.', 'Тапни по своей фигуре — она повернётся.', 'Плетень пропускает ветер и не ломается.', 'У концов забора ветер злее.'];
  function loading(dur = 2600) {
    const w = el('div', 'load');
    w.setAttribute('role', 'progressbar'); w.setAttribute('aria-label', 'Загрузка'); w.setAttribute('aria-valuemin', '0'); w.setAttribute('aria-valuemax', '100');
    w.innerHTML = `<div class="l-in"><svg class="l-art" viewBox="0 0 300 190" aria-hidden="true">${plate(0, 150, 110, 112, 22, [[0.5, 0.78], [0.5, 0.22], [-0.02, 0.24], [0.2, 1.02]])}
        <g transform="translate(212 104)"><rect x="-1.5" y="-78" width="3" height="80" fill="#36506b"/><path class="l-flag" d="M1.5 -76h34l-8 9 8 9h-34z" fill="#f7c21b"/></g>${gust(10, 30, 120, 6)}</svg>
      <h1>Порыв</h1><p class="l-sub">головоломка про ветер</p>
      <div class="lbar"><span></span></div><p class="l-pc">0%</p><p class="l-tip">${TIPS[0]}</p></div>`;
    document.body.appendChild(w);
    const bar = w.querySelector('.lbar span'), pc = w.querySelector('.l-pc'), tip = w.querySelector('.l-tip'), t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), v = Math.round((1 - (1 - k) ** 2) * 100);
      bar.style.width = v + '%'; pc.textContent = v + '%'; w.setAttribute('aria-valuenow', v);
      tip.textContent = TIPS[Math.floor((now - t0) / 1300) % TIPS.length];
      if (k < 1) requestAnimationFrame(step); else w.remove();
    };
    requestAnimationFrame(step);
  }

  // «Играть»: в игре здесь уровень; в прототипе — сразу итог (чаще победа)
  function play(gi, force) {
    closeSheet();
    const won = force ? force !== 'lose' : Math.random() > 0.2;
    resultWin(gi, won, force === 'win3' ? 3 : 1 + Math.floor(Math.random() * 3));
  }
  function afterResult() {
    closeWin(); rerender();
    if (pendingChap != null) { const ci = pendingChap; pendingChap = null; chapterWin(ci); }
  }

  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) { if (e.target === sheetWrap) closeSheet(); return; }
    const a = b.dataset.act, gi = b.dataset.gi != null ? +b.dataset.gi : null, ci = b.dataset.ci != null ? +b.dataset.ci : null;
    switch (a) {
      case 'level': openSheet(levelCard(gi), LEVELS[gi].n); break;
      case 'play': play(gi); break;
      case 'gate': openSheet(gateCard(ci), `Глава ${CHAPTERS[ci].name}`); break;
      case 'close': closeSheet(); break;
      case 'settings': openSheet(settingsCard(), 'Настройки'); break;
      case 'stars': openSheet(starsCard(), 'Звёзды'); break;
      case 'sound': st.sound = !st.sound; rerender(); toast(st.sound ? 'Звук включён' : 'Звук выключен'); break;
      case 'set-sound': st.sound = b.dataset.v === 'true'; openSheet(settingsCard(), 'Настройки'); rerender(); break;
      case 'set-music': st.music = b.dataset.v === 'true'; openSheet(settingsCard(), 'Настройки'); break;
      case 'set-lang': st.lang = b.dataset.v; openSheet(settingsCard(), 'Настройки'); if (st.lang === 'en') toast('Английский — на этапе 6; здесь просто переключатель'); break;
      case 'sandbox': toast(sandboxOpen() ? 'Тут откроется песочница' : 'Песочница откроется после главы «Деревня»'); break;
      case 'toast': toast(b.dataset.t); break;
      case 'res-next': afterResult(); if (winKind == null) toast('Здесь — реклама между уровнями и сразу следующий уровень. В прототипе — карта.'); break;
      case 'res-map': afterResult(); break;
      case 'res-again': play(resGi); break;
      case 'res-hint': toast('Реклама → одна фигура встаёт на своё место'); break;
      case 'chap-go': closeWin(); if (cfg.onChapter) cfg.onChapter(ci); break;
      case 'pwin': protoEl.hidden = true; protoWin(b.dataset.v); break;
      case 'proto': protoEl.hidden = !protoEl.hidden; updateProto(); break;
      case 'preset': st.preset = b.dataset.v; st.stars = PRESETS[b.dataset.v].stars.slice(); st.justDone = null; rerender(); updateProto(); break;
      default: if (cfg.onAct) cfg.onAct(a, b, e);
    }
  }

  function protoWin(v) {
    if (v === 'load') { loading(); return; }
    const gi = current() != null ? current() : LEVELS.length - 1;
    if (v === 'win') play(gi, 'win3');
    else if (v === 'lose') play(gi, 'lose');
    else if (v === 'chap') { const ci = CHAPTERS.findIndex((_, c) => gate(c) !== 'open'); chapterWin(ci > 0 ? ci : 1); }
  }
  function buildProto() {
    const tab = el('button', 'proto-tab', `прототип ${cfg.key}`); tab.type = 'button'; tab.dataset.act = 'proto';
    protoEl = el('div', 'proto'); protoEl.hidden = true;
    protoEl.innerHTML = `<div class="p-head"><b>Карта ${cfg.key} · ${cfg.name}</b></div>
      <p>${cfg.desc}</p>
      <p class="p-now">Окно <b data-p-size></b> · ввод <b data-p-input></b></p>
      <div class="p-row"><span>Прогресс</span></div>
      <div class="p-ph">${Object.entries(PRESETS).map(([k, p]) => `<button type="button" data-act="preset" data-v="${k}" title="${p.desc}">${p.name}</button>`).join('')}</div>
      <div class="p-row"><span>Окна</span><button type="button" data-act="pwin" data-v="load">Загрузка</button><button type="button" data-act="pwin" data-v="win">Победа</button><button type="button" data-act="pwin" data-v="lose">Поражение</button><button type="button" data-act="pwin" data-v="chap">Новая глава</button></div>
      <ul class="p-tip">${(cfg.tips || []).concat([
        '«Играть» в прототипе сразу показывает итог уровня: чаще победа на 1–3 ★, иногда «Сдуло». Финал главы с нужными звёздами открывает следующую — с окном главы.',
        'Тап по пройденному или закрытому уровню — карточка: кто просит, что нового, звёзды.',
        'Главы открываются финалом прошлой главы и звёздами. Попробуй «Мало ★».',
      ]).map(t => `<li>${t}</li>`).join('')}</ul>
      <nav class="p-nav">${VARIANTS.map(v => `<a href="${v.file}"${v.key === cfg.key ? ' aria-current="page"' : ''}>${v.key} · ${v.name}</a>`).join('')}<a href="map.html">Все варианты карты</a><a href="index.html">Экран уровня</a></nav>
      <button type="button" class="p-close" data-act="proto">✕ Закрыть</button>`;
    document.body.append(tab, protoEl);
  }
  function updateProto() {
    if (!protoEl || protoEl.hidden) return;
    protoEl.querySelector('[data-p-size]').textContent = `${innerWidth}×${innerHeight}`;
    protoEl.querySelector('[data-p-input]').textContent = html.dataset.input === 'touch' ? 'палец' : 'мышь';
    for (const b of protoEl.querySelectorAll('[data-act="preset"]')) b.setAttribute('aria-pressed', String(b.dataset.v === st.preset));
  }
  const VARIANTS = [
    { key: 'A', name: 'Тропа', file: 'map-a-trail.html' },
    { key: 'B', name: 'Остров', file: 'map-b-island.html' },
    { key: 'C', name: 'Журнал', file: 'map-c-journal.html' },
  ];

  function rerender() { cfg.render(); updateProto(); st.justDone = null; }

  function init(c) {
    cfg = c;
    const touch = matchMedia('(pointer: coarse)').matches;
    html.dataset.input = touch ? 'touch' : 'mouse';
    sheetWrap = el('div', 'sheet-wrap'); sheetWrap.hidden = true;
    sheetEl = el('div', 'sheet card'); sheetEl.setAttribute('role', 'dialog'); sheetEl.setAttribute('aria-modal', 'true');
    sheetWrap.appendChild(sheetEl);
    toastEl = el('div', 'toast'); toastEl.hidden = true; toastEl.setAttribute('role', 'status');
    winWrap = el('div', 'win-wrap'); winWrap.hidden = true;
    winEl = el('div', 'win card'); winEl.setAttribute('role', 'dialog'); winEl.setAttribute('aria-modal', 'true');
    winWrap.appendChild(winEl);
    document.body.append(sheetWrap, winWrap, toastEl);
    buildProto();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', e => { if (e.code === 'Escape') { if (winKind === 'win' || winKind === 'lose') afterResult(); else if (!sheetWrap.hidden) closeSheet(); else if (!protoEl.hidden) { protoEl.hidden = true; } } });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (cfg.onResize) cfg.onResize(); else cfg.render(); updateProto(); }, 80); });
    cfg.render();
    if (cfg.loading) loading();
  }

  window.MAP = { CHAPTERS, LEVELS, MAX_STARS, st, icon, ava, starsRow, badgeOf, TAGS, total, chapterStars, chapterPassed, chapterDone, gate, status, current,
    sandboxOpen, topbar, PROPS, PROPW, curve, plate, propAt, ctaButton, cta, toast, init, el, $ };
})();
