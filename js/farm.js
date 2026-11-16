/* A Quinta — decoração comprada com Estrelas (meta-camada estilo aquário) */
const FARM_DECOS = [
  { id: 'bandeirolas', emoji: '🎏', price: 1, x: 50, y: 12 },
  { id: 'arvore',      emoji: '🌳', price: 1, x: 12, y: 30 },
  { id: 'girassois',   emoji: '🌻', price: 1, x: 88, y: 42 },
  { id: 'tractor',     emoji: '🚜', price: 2, x: 22, y: 78 },
  { id: 'fogueira',    emoji: '🔥', price: 2, x: 78, y: 82 },
  { id: 'banco',       emoji: '🪑', price: 1, x: 40, y: 88 },
  { id: 'espantalho',  emoji: '🧑‍🌾', price: 2, x: 90, y: 62 },
  { id: 'palco',       emoji: '🥁', price: 2, x: 10, y: 55 },
  { id: 'celeiro',     emoji: '🏠', price: 3, x: 85, y: 22 },
  { id: 'fonte',       emoji: '⛲', price: 3, x: 30, y: 45 }
];

const Farm = {
  render() {
    const scene = document.getElementById('farm-scene');
    let html = `<div class="farm-cow">${cowHTML(150)}</div>`;
    for (const d of FARM_DECOS) {
      if (S.farmItems.includes(d.id)) {
        html += `<div class="farm-item" style="left:${d.x}%;top:${d.y}%">${d.emoji}</div>`;
      }
    }
    scene.innerHTML = html;

    const shop = document.getElementById('farm-shop');
    shop.innerHTML = '';
    for (const d of FARM_DECOS) {
      const owned = S.farmItems.includes(d.id);
      const card = document.createElement('div');
      card.className = 'card' + (owned ? ' owned' : '');
      card.innerHTML = `<div class="ico">${d.emoji}</div><div class="price">⭐ ${d.price}</div>`;
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = owned ? t('bought') : t('buy');
      btn.disabled = owned || S.stars < d.price;
      btn.addEventListener('click', () => {
        if (S.stars < d.price) return;
        addStars(-d.price);
        S.farmItems.push(d.id);
        saveState();
        Farm.render();
      });
      card.appendChild(btn);
      shop.appendChild(card);
    }
  }
};
