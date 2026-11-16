/* Calendário diário — progressão de 30 dias com marcos (estilo Fishdom) */
const CAL_REWARDS = [
  { coins: 50 }, { coins: 75 }, { coins: 100 }, { coins: 125 }, { coins: 150 }, { coins: 200 },
  { coins: 300, acc: 'oculos' },
  { coins: 100 }, { coins: 120 }, { coins: 140 }, { coins: 160 }, { coins: 180 }, { coins: 200 },
  { coins: 100, shoes: 1 },
  { coins: 150 }, { coins: 170 }, { coins: 190 }, { coins: 210 }, { coins: 230 }, { coins: 250 }, { coins: 270 },
  { coins: 150, acc: 'sino' },
  { coins: 200 }, { coins: 220 }, { coins: 240 }, { coins: 260 }, { coins: 280 }, { coins: 300 }, { coins: 350 },
  { coins: 500, skin: 'campea' }
];

const Calendar = {
  todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  yesterdayStr() {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  canClaim() {
    return S.calendar.lastClaim !== Calendar.todayStr() && S.calendar.day < 30;
  },
  nextDay() {
    if (S.calendar.lastClaim === Calendar.yesterdayStr() || S.calendar.lastClaim === null) {
      return Math.min(30, S.calendar.day + 1);
    }
    return 1;
  },
  rewardText(rw) {
    const parts = [];
    if (rw.coins) parts.push('🪙 ' + rw.coins);
    if (rw.shoes) parts.push('🧲 ' + rw.shoes);
    if (rw.acc) parts.push(COW_ACC.hat[rw.acc]?.emoji || COW_ACC.glasses[rw.acc]?.emoji || COW_ACC.neck[rw.acc]?.emoji || '🎁');
    if (rw.skin) parts.push('🐮 ' + COW_SKINS[rw.skin].name);
    return parts.join(' ');
  },
  render() {
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';
    const next = Calendar.nextDay();
    for (let d = 1; d <= 30; d++) {
      const div = document.createElement('div');
      div.className = 'cal-day';
      if (d <= S.calendar.day) div.classList.add('done');
      if (d === next && Calendar.canClaim()) div.classList.add('today');
      div.innerHTML = `<div>${t('day')} ${d}</div><div class="r">${Calendar.rewardText(CAL_REWARDS[d - 1])}</div>`;
      grid.appendChild(div);
    }
    const btn = document.getElementById('cal-claim');
    if (Calendar.canClaim()) {
      btn.disabled = false;
      btn.querySelector('span').textContent = t('cal_claim');
    } else {
      btn.disabled = true;
      btn.querySelector('span').textContent = t('cal_already');
    }
  },
  claim() {
    if (!Calendar.canClaim()) return;
    const day = Calendar.nextDay();
    const rw = CAL_REWARDS[day - 1];
    S.calendar.day = day;
    S.calendar.lastClaim = Calendar.todayStr();
    if (rw.coins) addCoins(rw.coins);
    if (rw.shoes) addHorseshoes(rw.shoes);
    if (rw.acc && !S.ownedAcc.includes(rw.acc)) S.ownedAcc.push(rw.acc);
    if (rw.skin && !S.ownedSkins.includes(rw.skin)) S.ownedSkins.push(rw.skin);
    saveState();
    Calendar.render();
    renderHome();
    showModal({
      emoji: '🎁',
      title: t('day') + ' ' + day,
      msg: Calendar.rewardText(rw),
      buttons: [{ label: 'OK', primary: true }]
    });
  }
};
