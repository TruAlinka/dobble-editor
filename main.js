function generateDobbleDeck(symbols, k) {
  // Генерация набора карточек, где любая пара карточек имеет 1 общий элемент
  const n = symbols.length;
  const maxN = k * (k - 1) + 1;
  if (k < 2) throw new Error('На карточке должно быть как минимум 2 элемента.');
  if (n < k) throw new Error(`Введите минимум ${k} символов.`);
  if (n > maxN) throw new Error(`Максимум символов для ${k} элементов на карточке: ${maxN}.`);
  let cards = [];
  // 1. Первая серия
  for (let i = 0; i < k; i++) {
    let card = [symbols[0]];
    for (let j = 1; j < k; j++) {
      card.push(symbols[1 + (k - 1) * i + (j - 1)]);
    }
    cards.push(card);
  }
  // 2. Остальные карточки
  for (let a = 1; a < k; a++) {
    for (let b = 1; b < k; b++) {
      let card = [symbols[a]];
      for (let c = 1; c < k; c++) {
        let idx = 1 + (k - 1) * (c - 1) + ((a * (c - 1) + b - 1) % (k - 1));
        card.push(symbols[idx]);
      }
      cards.push(card);
    }
  }
  return cards;
}

function renderCard(card, bgcolor) {
  return `
    <div class="dobble-card" style="background:${bgcolor};">
      ${card.map(w => renderSymbol(w)).join(' ')}
    </div>
  `;
}
// Проверка: ссылка — это изображение
function renderSymbol(sym) {
  // очень простой тест — начинается с http
  if(/^https?:/.test(sym)) {
    return `<img src="${sym}" style="width:34px;height:34px;vertical-align:middle;border-radius:4px;" loading="lazy"/>`;
  }
  return `<span>${sym}</span>`;
}

document.getElementById('generate').addEventListener('click', function() {
  const wordsInput = document.getElementById('words').value;
  const lang = document.getElementById('lang').value;
  const bgcolor = document.getElementById('transparent').checked ? 'transparent' : document.getElementById('bgcolor').value;
  const k = parseInt(document.getElementById('numOnCard').value, 10);

  const words = wordsInput.split(',').map(w => w.trim()).filter(w => w.length > 0);

  try {
    const deck = generateDobbleDeck(words, k);

    // Показываем превью первых 12 карточек
    document.getElementById('gameContainer').innerHTML = `
      <div style="background:${bgcolor};padding:12px;border-radius:14px;text-align:center;">
        <h2>Dobble (${lang.toUpperCase()}) – ${deck.length} карточек</h2>
        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;">
        ${deck.slice(0, 12).map(card => renderCard(card, bgcolor)).join('')}
        </div>
        <p style="margin-top:8px;color:#677;">Это превью. Для игры используйте <b>iframe</b> ниже.</p>
      </div>
    `;

    // КОД iframe для вставки в Genially
    const params = encodeURIComponent(JSON.stringify({words, lang, bgcolor, k}));
    const iframeUrl = `${window.location.origin + window.location.pathname}?data=${params}`;
    document.getElementById('iframeCode').value = `<iframe src="${iframeUrl}" width="800" height="600"></iframe>`;
    document.getElementById('iframeCodeContainer').style.display = 'block';
    document.getElementById('startGame').style.display = 'inline-block';

    // Переход на play-страницу
    document.getElementById('startGame').onclick = function() { window.location.href = iframeUrl; };

  } catch (e) {
    document.getElementById('gameContainer').innerHTML = `<div style="color:red">${e.message}</div>`;
    document.getElementById('iframeCodeContainer').style.display = 'none';
    document.getElementById('startGame').style.display = 'none';
  }
});

// Автоматический парсер: если зашли по ссылке типа ?data=...
window.addEventListener('DOMContentLoaded', function() {
  const m = location.search.match(/data=([^&]*)/);
  if(m) {
    try {
      const obj = JSON.parse(decodeURIComponent(m[1]));
      const deck = generateDobbleDeck(obj.words, obj.k);
      // Можно добавить сюда логику самой игры!
      // Сейчас — просто просмотр всех карточек
      document.body.innerHTML = `
        <h2 style="text-align:center;">Dobble Game</h2>
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
          ${deck.map(card => renderCard(card, obj.bgcolor || "#fff")).join('')}
        </div>
        <p style="text-align:center;">Используйте редактор для новой игры.</p>
      `;
    } catch(e) {
      document.body.innerHTML = `<p style="color:red">Ошибка данных: ${e.message}</p>`;
    }
  }
});
