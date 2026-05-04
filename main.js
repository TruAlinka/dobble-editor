// Получить случайные элементы массива
function getRandomSubarray(arr, size) {
  let shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

// Карточки: простой вариант — каждая карточка содержит k уникальных слов/флагов
function generateSimpleDobbleDeck(symbols, k) {
  const n = symbols.length;
  let cards = [];
  for (let i = 0; i < n; i++) {
    let arr = [symbols[i]];
    let pool = symbols.filter((s, idx) => idx !== i);
    arr = arr.concat(getRandomSubarray(pool, Math.min(k - 1, pool.length)));
    cards.push(arr);
  }
  return cards;
}

// SVG-карта: элементы по кругу, с разным углом
function renderCardCircleV2(card, bgcolor) {
  const n = card.length;
  const angleStep = 360 / n;
  let elements = card.map((sym, i) => {
    const angle = angleStep * i - 90 + (Math.random()*28-12);
    const r = 105;
    const cx = 150 + r * Math.cos((angle) * Math.PI / 180);
    const cy = 150 + r * Math.sin((angle) * Math.PI / 180);
    const rotate = `rotate(${angle+90},${cx},${cy})`;
    if(/^https?:/.test(sym)) {
      // вставлять изображение как "флаг"
      return `
        <g transform="${rotate}">
          <image href="${sym}" x="${cx-36}" y="${cy-22}" width="70" height="45" style="filter: drop-shadow(2px 3px 6px #cab7ff);" />
        </g>
      `;
    }
    // слово с тенью
    return `
      <g transform="${rotate}">
        <text x="${cx}" y="${cy+11}"
         font-size="32" font-family="Montserrat,sans-serif"
         fill="#fff" stroke="#b8a1ee" stroke-width="5"
         font-weight="bold"
         text-anchor="middle"
         style="filter: drop-shadow(0 1px 4px #cab7ff);">${sym}</text>
        <text x="${cx}" y="${cy+11}"
         font-size="32" font-family="Montserrat,sans-serif"
         fill="#7956f7" stroke="#fff" stroke-width="0"
         font-weight="bold"
         text-anchor="middle"
         style="filter: drop-shadow(0 1px 4px #fff);">${sym}</text>
      </g>
    `;
  }).join('\n');
  return `
    <svg width="300" height="300" style="margin:12px 20px;border-radius:50%;" viewBox="0 0 300 300">
      <defs>
        <filter id="ds">
          <feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#b2a0ff"/>
        </filter>
      </defs>
      <circle cx="150" cy="150" r="135" fill="${bgcolor}" filter="url(#ds)"/>
      ${elements}
    </svg>
  `;
}
function shuffleDeck(deck) {
  let arr = deck.slice();
  for(let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

document.getElementById('generate').addEventListener('click', function() {
  const wordsInput = document.getElementById('words').value;
  const lang = document.getElementById('lang').value;
  const bgcolor = document.getElementById('transparent').checked ? 'rgba(255,255,255,0.0)' : document.getElementById('bgcolor').value;
  const k = parseInt(document.getElementById('numOnCard').value, 10);

  let words = wordsInput.split(',').map(w => w.trim()).filter(w => w.length > 0);
  words = Array.from(new Set(words)); // Уникальные

  if(words.length < k) {
    document.getElementById('gameContainer').innerHTML = `<div style="color:#ae2d2d;font-size:18px;">Слов должно быть не меньше, чем элементов на карточке!</div>`;
    document.getElementById('iframeCodeContainer').style.display = 'none';
    document.getElementById('startGame').style.display = 'none';
    return;
  }

  const deck = generateSimpleDobbleDeck(words, k);

  // Фиолетовая надпись + крупные карточки
  document.getElementById('gameContainer').innerHTML = `
    <div style="padding:10px 0;margin-bottom:10px;">
      <div style="color:#7956f7;font-size:2.2rem;font-family:Montserrat,sans-serif;text-align:center;margin-bottom:10px;letter-spacing:2px;">
        Dobble – ${deck.length} карточек
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;">
        ${deck.slice(0, 3).map(card => renderCardCircleV2(card, bgcolor)).join('')}
      </div>
      <p style="color:#8674fa;text-align:center;">Это предпросмотр стиля карточек.<br> Для игры используйте <b>iframe</b> ниже.</p>
    </div>
  `;

  // Iframe для вставки
  const params = encodeURIComponent(JSON.stringify({words, lang, bgcolor, k}));
  const iframeUrl = `${window.location.origin + window.location.pathname}?data=${params}`;
  document.getElementById('iframeCode').value = `<iframe src="${iframeUrl}" width="900" height="700"></iframe>`;
  document.getElementById('iframeCodeContainer').style.display = 'block';
  document.getElementById('startGame').style.display = 'inline-block';
  document.getElementById('startGame').onclick = function() { window.location.href = iframeUrl; };
});

// Авто-просмотр колоды по ?data=
window.addEventListener('DOMContentLoaded', function() {
  const m = location.search.match(/data=([^&]*)/);
  if(m) {
    try {
      const obj = JSON.parse(decodeURIComponent(m[1]));
      const deck = shuffleDeck(generateSimpleDobbleDeck(obj.words, obj.k));
      // Показываем 2 карточки, как в dobble vs-стиле
      document.body.innerHTML = `
        <div style="background:#cfc8f7;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="
            font-size:54px;
            font-family:Montserrat,sans-serif;
            color:#7956f7;
            margin-top:18px;
            text-align:center;
            letter-spacing:7px;
            text-shadow:2px 2px 8px #fff7,
              0 1px 8px #cfc8f7;">
            00:10
          </div>
          <div style="display:flex;gap:60px;justify-content:center;align-items:center;margin-top:24px;">
            <div>${renderCardCircleV2(deck[0], obj.bgcolor || "#e2d9fd")}</div>
            <div>${renderCardCircleV2(deck[1], obj.bgcolor || "#e2d9fd")}</div>
          </div>
          <div style="color:#7956f7;margin-top:20px;font-size:1.1rem;font-family:Montserrat,sans-serif;opacity:0.74;">Найдите совпадение!</div>
        </div>
      `;
    } catch(e) {
      document.body.innerHTML = `<p style="color:red;font-size:1.4rem;">Ошибка данных: ${e.message}</p>`;
    }
  }
});
