/* Loja — skins e acessórios da vaca (moedas virtuais) */
const Shop = {
  tab: 'skins',

  render() {
    const preview = document.getElementById('shop-preview');
    preview.innerHTML = cowSVG(S.equipped.skin, S.equipped);

    const list = document.getElementById('shop-list');
    list.innerHTML = '';
    document.querySelectorAll('.shop-tabs .btn').forEach(b => {
      b.classList.toggle('tab-on', b.dataset.tab === Shop.tab);
    });

    if (Shop.tab === 'skins') {
      for (const id of Object.keys(COW_SKINS)) {
        const skin = COW_SKINS[id];
        const owned = S.ownedSkins.includes(id);
        const equipped = S.equipped.skin === id;
        const calendarOnly = id === 'campea';
        const card = document.createElement('div');
        card.className = 'card' + (equipped ? ' equipped' : owned ? ' owned' : '');
        card.innerHTML = `<div class="ico">🐮</div><div><b>${skin.name}</b></div>
          <div class="price">${calendarOnly ? '📅 ' + t('day') + ' 30' : '🪙 ' + skin.price}</div>`;
        const btn = document.createElement('button');
        btn.className = 'btn';
        if (calendarOnly) {
          btn.textContent = owned ? t('equip') : '📅';
          btn.disabled = !owned || equipped;
        } else {
          btn.textContent = equipped ? t('equipped') : owned ? t('equip') : t('buy');
          btn.disabled = equipped || (!owned && S.coins < skin.price);
        }
        btn.addEventListener('click', () => Shop.onItem('skin', id, calendarOnly ? null : skin.price));
        card.appendChild(btn);
        list.appendChild(card);
      }
    } else {
      for (const slot of Object.keys(COW_ACC)) {
        for (const id of Object.keys(COW_ACC[slot])) {
          const acc = COW_ACC[slot][id];
          const owned = S.ownedAcc.includes(id);
          const equipped = S.equipped[slot] === id;
          const card = document.createElement('div');
          card.className = 'card' + (equipped ? ' equipped' : owned ? ' owned' : '');
          card.innerHTML = `<div class="ico">${acc.emoji}</div><div><b>${acc.name || id}</b></div>
            <div class="price">🪙 ${acc.price}</div>`;
          const btn = document.createElement('button');
          btn.className = 'btn';
          btn.textContent = equipped ? t('equipped') : owned ? t('equip') : t('buy');
          btn.disabled = equipped || (!owned && S.coins < acc.price);
          btn.addEventListener('click', () => Shop.onItem(slot, id, acc.price));
          card.appendChild(btn);
          list.appendChild(card);
        }
      }
    }
  },

  onItem(slot, id, price) {
    const owned = slot === 'skin' ? S.ownedSkins.includes(id) : S.ownedAcc.includes(id);
    if (!owned) {
      if (price === null || S.coins < price) { showModal({ emoji: '🪙', title: t('not_enough'), buttons: [{ label: 'OK', primary: true }] }); return; }
      addCoins(-price);
      if (slot === 'skin') S.ownedSkins.push(id); else S.ownedAcc.push(id);
    }
    if (slot === 'skin') S.equipped.skin = id; else S.equipped[slot] = id;
    saveState();
    Shop.render();
    renderHome();
  }
};
