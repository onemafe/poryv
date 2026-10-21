// Аватары жителей — копия CHARS и woman() из Порыв.html (строки 1601–1621). Только для прототипов карты.
const CHARS = {
  keeper: { name: 'Петрович', role: 'смотритель метеостанции', ring: '#f7c21b',
    svg: '<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" fill="#c6d3df"/><path d="M5 42Q21 30 37 42Z" fill="#f7c21b"/><circle cx="21" cy="23" r="9.5" fill="#f1c9a5"/><path d="M8 17.5Q21 21 34 17.5Q33 15 30 14.5Q28 5 21 5Q14 5 12 14.5Q9 15 8 17.5Z" fill="#f7c21b"/><g fill="none" stroke="#36506b" stroke-width="1"><circle cx="17.5" cy="23.5" r="2.6"/><circle cx="24.5" cy="23.5" r="2.6"/><path d="M20.1 23.5h1.8"/></g><circle cx="17.5" cy="23.5" r="1.1" fill="#17212c"/><circle cx="24.5" cy="23.5" r="1.1" fill="#17212c"/><path d="M15.5 28.3Q21 25.8 26.5 28.3Q21 30.2 15.5 28.3Z" fill="#8a8f96"/></svg>' },
  ilya: { name: 'Дед Илья', role: 'хижина у скал', ring: '#c4553d',
    svg: '<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" fill="#ece5d3"/><path d="M5 42Q21 30 37 42Z" fill="#8a6240"/><circle cx="21" cy="22" r="9.5" fill="#eec39c"/><path d="M11 21Q11 37 21 37Q31 37 31 21Q27 28 21 28Q15 28 11 21Z" fill="#f3f1ea"/><path d="M11 17Q12 8 21 8Q30 8 31 17Z" fill="#c4553d"/><rect x="9.5" y="16" width="23" height="3" rx="1.5" fill="#9a3f2c"/><circle cx="17.5" cy="22" r="1.3" fill="#17212c"/><circle cx="24.5" cy="22" r="1.3" fill="#17212c"/><path d="M16 19.8h3M23 19.8h3" stroke="#f3f1ea" stroke-width="1.3"/></svg>' },
  masha: { name: 'Тётя Маша', role: 'садовница', ring: '#5f9a5a', svg: woman('#e9f0dc', '#5f9a5a', '#3f7a45', '#c96f5a') },
  stepa: { name: 'Стёпа', role: 'молодой рыбак', ring: '#3d7fb8',
    svg: '<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" fill="#d9e6ef"/><path d="M5 42Q21 30 37 42Z" fill="#f6f8fa"/><path d="M8 39.5Q21 32 34 39.5M6.5 41.5Q21 34 35.5 41.5" stroke="#3d7fb8" stroke-width="1.6" fill="none"/><circle cx="21" cy="23" r="9" fill="#f1c9a5"/><path d="M11.5 19Q12 7 21 7Q30 7 30.5 19Z" fill="#3d7fb8"/><rect x="11" y="17" width="20" height="3.2" rx="1.6" fill="#2f5d8a"/><circle cx="17.5" cy="23.5" r="1.3" fill="#17212c"/><circle cx="24.5" cy="23.5" r="1.3" fill="#17212c"/><g fill="#c98a5a"><circle cx="15.5" cy="26.5" r=".7"/><circle cx="17" cy="27.3" r=".7"/><circle cx="25" cy="27.3" r=".7"/><circle cx="26.5" cy="26.5" r=".7"/></g><path d="M18.5 28.5Q21 30.2 23.5 28.5" stroke="#9a5440" stroke-width="1" fill="none"/></svg>' },
  nyura: { name: 'Баба Нюра', role: 'соседка', ring: '#7a5c8e', svg: woman('#efe3ea', '#7a5c8e', '#5d4370', '#d98a8a', true) },
  zina: { name: 'Баба Зина', role: 'другая соседка', ring: '#e9a23b', svg: woman('#f6ecd8', '#e9a23b', '#b9781f', '#d98a8a', true) },
  fyodor: { name: 'Кузнец Фёдор', role: 'кузня на краю', ring: '#5a4636',
    svg: '<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" fill="#e2dac6"/><path d="M3 42Q21 28 39 42Z" fill="#6b5240"/><path d="M15 42V35h12v7" fill="#8a6240"/><circle cx="21" cy="21" r="10" fill="#e3b08a"/><path d="M11 17Q12 9 21 9Q30 9 31 17Q27 13 21 13Q15 13 11 17Z" fill="#3b2a20"/><path d="M11 21Q11 36 21 36Q31 36 31 21Q27 27.5 21 27.5Q15 27.5 11 21Z" fill="#3b2a20"/><path d="M15 19.5h4M23 19.5h4" stroke="#3b2a20" stroke-width="1.8"/><circle cx="17" cy="22" r="1.3" fill="#17212c"/><circle cx="25" cy="22" r="1.3" fill="#17212c"/></svg>' },
};
// женщина в платке: фон, платок, тень платка, румянец, седые пряди (бабушки)
function woman(bg, scarf, dark, cheek, grey) {
  return `<svg viewBox="0 0 42 42" aria-hidden="true"><rect width="42" height="42" fill="${bg}"/><path d="M5 42Q21 30 37 42Z" fill="${dark}"/><circle cx="21" cy="20" r="12.5" fill="${scarf}"/>` +
    `<path d="M18 31L21 37L24 31Z" fill="${dark}"/><circle cx="21" cy="23" r="8.2" fill="#f1c9a5"/>` +
    (grey ? '<path d="M13.5 19.5Q21 14.5 28.5 19.5Q21 17.5 13.5 19.5Z" fill="#e4e1da"/>' : '') +
    `<circle cx="18" cy="23.5" r="1.2" fill="#17212c"/><circle cx="24" cy="23.5" r="1.2" fill="#17212c"/><circle cx="16.3" cy="26.3" r="1.5" fill="${cheek}" opacity=".55"/><circle cx="25.7" cy="26.3" r="1.5" fill="${cheek}" opacity=".55"/>` +
    `<path d="M19 28.2Q21 29.6 23 28.2" stroke="#9a5440" stroke-width="1" fill="none"/>${grey ? '<g fill="none" stroke="#5a6979" stroke-width=".9"><circle cx="18" cy="23.5" r="2.4"/><circle cx="24" cy="23.5" r="2.4"/><path d="M20.4 23.5h1.2"/></g>' : ''}</svg>`;
}
window.CHARS = CHARS;
