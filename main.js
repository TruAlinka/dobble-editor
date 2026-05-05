// Честная добль-генерация!
function generateClassicDobbleDeck(symbols, k) {
  const n = symbols.length;
  const maxN = k * (k - 1) + 1;
  if (n !== maxN) throw new Error(`Вам нужно поставить ровно ${maxN} уникальных слов или картинок для ${k} элементов на карточке!`);
  let cards = [];
  for (let i = 0; i < k; i++) {
    let card = [symbols[0]];
    for (let j = 1; j < k; j++) {
      card.push(symbols[1 + (k - 1) * i + (j - 1)]);
    }
    cards.push(card);
  }
  for (let a = 1; a < k; a++) {
    for (let b = 1; b < k; b++) {
      let card = [symbols[a]];
      for (let c = 1; c < k; c++) {
        let index = 1 + (k - 1) * (c - 1) + ((a * (c - 1) + b - 1) % (k - 1));
        card.push(symbols[index]);
      }
      cards.push(card);
    }
  }
  return cards;
}

function renderCardCircleV2(card, bgcolor, highlightWord) {
  const n = card.length;
  const angleStep = 360 / n;
  let elements = card.map((sym, i) => {
    const angle = angleStep * i - 90 + (Math.random()*28-12);
    const r = 105;
    const cx = 150 + r * Math.cos((angle) * Math.PI / 180);
    const cy = 150 + r * Math.sin((angle) * Math.PI / 180);
    const rotate = `rotate(${angle+90},${cx},${cy})`;
    if(/^https?:/.test(sym)) {
      return `
        <g transform="${rotate}">
          <image href="${sym}" x="${cx-36}" y="${cy-22}" width="70" height="45" 
          style="filter: drop-shadow(2px 3px 7px #cab7ff);${sym===highlightWord?'outline:4px solid #b437d9;':''}">
          </image>
        </g>
      `;
    }
    let extra = (sym===highlightWord) 
      ? 'filter: drop-shadow(0 0 18px #fff7) drop-shadow(0 0 11px #ae2d2d);'
      : '';
    return `
      <g transform="${rotate}">
        <text x="${cx}" y="${cy+11}"
         font-size="32" font-family="Montserrat,sans-serif"
         fill="#fff" stroke="#b8a1ee" stroke-width="5"
         font-weight="bold"
         text-anchor="middle"
         style="filter: drop-shadow(0 1px 4px #cab7ff);${extra}">${sym}</text>
        <text x="${cx}" y="${cy+11}"
         font-size="32" font-family="Montserrat,sans-serif"
         fill="#7956f7" stroke="#fff" stroke-width="0"
         font-weight="bold"
         text-anchor="middle"
         style="filter: drop-shadow(0 1px 4px #fff);${extra}">${sym}</text>
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

function findCommonSymbol(card1, card2) {
  return card1.find(x => card2.includes(x));
}

function shuffle(arr) {
  let out = arr.slice();
  for(let i=out.length-1;i>0;i--) {
    let j = Math.floor(Math.random()*(i+1));
    [out[i],out[j]] = [out[j],out[i]];
  }
  return out;
}

// Игровой цикл добль
function playDobble(deck, bgcolor) {
  let score = 0;
  let curr = 0;
  let pairs = [];

  // Соберём все уникальные пары, где у карточек 1 общее слово
  for (let i = 0; i < deck.length; i++) {
    for (let j = i + 1; j < deck.length; j++) {
      let common = findCommonSymbol(deck[i], deck[j]);
      if (common) pairs.push({ a: i, b: j, common });
    }
  }
  pairs = shuffle(pairs).slice(0, Math.min(20, pairs.length));

  draw();

  function draw() {
    if(curr >= pairs.length) {
      document.body.innerHTML = `<div style="color:#6a5bf5;font-size:54px;margin-top:140px;font-family:Montserrat,sans-serif;text-align:center;">
      Игра окончена!<br>Ваш счёт: ${score} / ${pairs.length}</div>`;
      return;
    }
    let { a, b, common } = pairs[curr];

    // Подписываем функцию для SVG
    window.onCardItemClick = function(word) {
      if(word===pairs[curr].common) {
        score++;
        curr++;
        draw();
      }
    };

    document.body.innerHTML = `
      <div style="background:#cfc8f7;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="font-size:54px;font-family:Montserrat,sans-serif;color:#7956f7;margin-top:18px;text-align:center;letter-spacing:7px;text-shadow:2px 2px 8px #fff7,0 1px 8px #cfc8f7;">
          ${curr+1} / ${pairs.length}
        </div>
        <div style="display:flex;gap:60px;justify-content:center;align-items:center;margin-top:24px;">
          <div>${renderCardInteractive(deck[a], common, bgcolor)}</div>
          <div>${renderCardInteractive(deck[b], common, bgcolor)}</div>
        </div>
        <div style="color:#7956f7;margin-top:20px;font-size:1.1rem;font-family:Montserrat,sans-serif;opacity:0.74;">Найдите совпадающий элемент!</div>
      </div>
    `;
  }
}

// Кликабельные карточки
function renderCardInteractive(card, common, bgcolor) {
  const n = card.length;
  const angleStep = 360 / n;
  let elements = card.map((sym, i) => {
    const angle = angleStep * i - 90 + (Math.random() * 28 - 12);
    const r = 105;
    const cx = 150 + r * Math.cos(angle * Math.PI / 180);
    const cy = 150 + r * Math.sin(angle * Math.PI / 180);
    const rotate = `rotate(${angle + 90},${cx},${cy})`;
    if (/^https?:/.test(sym)) {
      return `
        <g transform="${rotate}">
          <image href="${sym}" x="${cx - 36}" y="${cy - 22}" width="70" height="45" 
            style="filter: drop-shadow(2px 3px 7px #cab7ff);cursor:${sym === common ? 'pointer' : 'default'};"
            onclick="${sym === common ? `onCardItemClick('${sym.replace(/'/g, "\\'")}')` : ''}"
            />
        </g>
      `;
    }
    let active = sym === common ? 'cursor:pointer;filter: drop-shadow(0 0 18px #fff7) drop-shadow(0 0 11px #875efc);' : 'cursor:default;';
    return `
      <g transform="${rotate}">
        <text x="${cx}" y="${cy + 11}" 
         font-size="32" font-family="Montserrat,sans-serif"
         fill="#fff" stroke="#b8a1ee" stroke-width="5"
         font-weight="bold"
         text-anchor="middle"
         style="filter: drop-shadow(0 1px 4px #cab7ff);${active}"
         onclick="${sym === common ? `onCardItemClick('${sym.replace(/'/g, "\\'")}')` : ''}"
         >${sym}</text>
        <text x="${cx}" y="${cy + 11}"
         font-size="32" font-family="Montserrat,sans-serif"
         fill="#7956f7" stroke="#fff" stroke-width="0"
         font-weight="bold"
         text-anchor="middle"
         style="filter: drop-shadow(0 1px 4px #fff);${active}"
         onclick="${sym === common ? `onCardItemClick('${sym.replace(/'/g, "\\'")}')` : ''}"
         >${sym}</text>
      </g>
    `;
  }).join('\n');
  return `
    <svg width="300" height="300" style="margin:12px 20px;border-radius:50%;box-shadow:0 2px 14px #7956f733;" viewBox="0 0 300 300">
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

document.getElementById('generate').addEventListener('click', function() {
  const wordsInput = document.getElementById('words').value;
  const lang = document.getElementById('lang').value;
  const bgcolor = document.getElementById('transparent').checked ? 'rgba(255,255,255,0.0)' : document.getElementById('bgcolor').value;
  const k = parseInt(document.getElementById('numOnCard').value, 10);

  let words = wordsInput.split(',').map(w => w.trim()).filter(w => w.length > 0);
  words = Array.from(new Set(words));

  // Проверка правильного количества!
  const maxN = k * (k - 1) + 1;
  if(words.length !== maxN) {
    document.getElementById('gameContainer').innerHTML = `<div style="color:#ae2d2d;font-size:18px;">Для настоящей Dobble требуется ровно <b>${maxN}</b> уникальных слов/картинок для ${k} элементов на карточке!</div>`;
    document.getElementById('iframeCodeContainer').style.display = 'none';
    document.getElementById('startGame').style.display = 'none';
    return;
  }

  // Генерация добль-колоды
  const deck = generateClassicDobbleDeck(words, k);
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

  // Iframe для Genially
  const params = encodeURIComponent(JSON.stringify({words, lang, bgcolor, k}));
  const iframeUrl = `${window.location.origin + window.location.pathname}?data=${params}`;
  document.getElementById('iframeCode').value = `<iframe src="${iframeUrl}" width="960" height="780"></iframe>`;
  document.getElementById('iframeCodeContainer').style.display = 'block';
  document.getElementById('startGame').style.display = 'inline-block';

  document.getElementById('startGame').onclick = function() { window.location.href = iframeUrl; };
});

// Играем если зашли по ссылке с ?data
window.addEventListener('DOMContentLoaded', function() {
  const m = location.search.match(/data=([^&]*)/);
  if(m) {
    try {
      const obj = JSON.parse(decodeURIComponent(m[1]));
      const deck = generateClassicDobbleDeck(obj.words, obj.k);
      playDobble(deck, obj.bgcolor || "#e2d9fd");
    } catch(e) {
      document.body.innerHTML = `<p style="color:red;font-size:1.4rem;">Ошибка данных: ${e.message}</p>`;
    }
  }
});
