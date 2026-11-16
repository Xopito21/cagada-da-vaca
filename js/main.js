/* Navegação, ecrã principal e utilitários de UI */
function showScreen(name) {
  if (name !== 'cowdrop') CD.stop();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  if (name === 'home') renderHome();
  if (name === 'farm') Farm.render();
  if (name === 'shop') Shop.render();
  if (name === 'calendar') Calendar.render();
}

function updateTopbar() {
  document.getElementById('res-coins').textContent = S.coins;
  document.getElementById('res-shoes').textContent = S.horseshoes;
  document.getElementById('res-stars').textContent = S.stars;
  document.getElementById('res-lives').textContent = S.lives;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function showModal(opts) {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML =
    (opts.emoji ? `<div class="big-emoji">${opts.emoji}</div>` : '') +
    `<h2>${escapeHtml(opts.title || '')}</h2>` +
    `<div class="msg">${opts.msg || ''}</div>`;
  if (opts.input) {
    const inp = document.createElement('input');
    inp.value = opts.input.value || '';
    inp.maxLength = 16;
    m.appendChild(inp);
  }
  (opts.buttons || [{ label: 'OK', primary: true }]).forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn' + (b.primary ? ' primary' : '');
    btn.textContent = b.label;
    btn.addEventListener('click', () => {
      const val = opts.input ? m.querySelector('input').value.trim() : null;
      hideModal();
      if (b.cb) b.cb(val);
    });
    m.appendChild(btn);
  });
  root.appendChild(m);
  root.classList.add('open');
}

function hideModal() {
  document.getElementById('modal-root').classList.remove('open');
}

function editName(kind) {
  const isPlayer = kind === 'player';
  showModal({
    emoji: isPlayer ? '👤' : '🐮',
    title: isPlayer ? t('edit_player') : t('edit_cow'),
    input: { value: isPlayer ? S.playerName : S.cowName },
    buttons: [
      {
        label: t('save'), primary: true,
        cb: (val) => {
          if (!val) return;
          if (isPlayer) S.playerName = val; else S.cowName = val;
          saveState();
          renderHome();
        }
      },
      { label: t('cancel'), cb: () => {} }
    ]
  });
}

function renderHome() {
  document.getElementById('home-cow').innerHTML = cowSVG(S.equipped.skin, S.equipped);
  document.getElementById('home-player').textContent = '👤 ' + S.playerName;
  document.getElementById('home-cowname').textContent = '🐮 "' + S.cowName + '"';
}

function init() {
  regenLives();
  applyI18n();
  updateTopbar();
  M3.init();
  renderHome();

  document.getElementById('btn-play-cow').addEventListener('click', () => CD.start());
  document.getElementById('btn-play-match3').addEventListener('click', () => { M3.startLevel(); showScreen('match3'); });
  document.getElementById('btn-farm').addEventListener('click', () => showScreen('farm'));
  document.getElementById('btn-shop').addEventListener('click', () => showScreen('shop'));
  document.getElementById('btn-calendar').addEventListener('click', () => showScreen('calendar'));
  document.getElementById('btn-ad').addEventListener('click', () => {
    showModal({
      emoji: '📺',
      title: t('rewarded_ad'),
      msg: t('ad_demo_msg'),
      buttons: [{ label: t('claim'), primary: true, cb: () => addCoins(150) }]
    });
  });
  document.getElementById('btn-lang').addEventListener('click', () => {
    S.lang = S.lang === 'pt-PT' ? 'en' : 'pt-PT';
    saveState();
    applyI18n();
    renderHome();
    if (document.getElementById('screen-shop').classList.contains('active')) Shop.render();
    if (document.getElementById('screen-calendar').classList.contains('active')) Calendar.render();
    if (document.getElementById('screen-farm').classList.contains('active')) Farm.render();
  });
  document.getElementById('home-player').addEventListener('click', () => editName('player'));
  document.getElementById('home-cowname').addEventListener('click', () => editName('cow'));

  document.querySelectorAll('[data-back]').forEach(b => {
    b.addEventListener('click', () => showScreen('home'));
  });

  const cvs = document.getElementById('cd-canvas');
  CD.cvs = cvs;
  CD.ctx = cvs.getContext('2d');
  cvs.addEventListener('click', (e) => {
    const rect = cvs.getBoundingClientRect();
    CD.onClick((e.clientX - rect.left) * CD.W / rect.width, (e.clientY - rect.top) * CD.H / rect.height);
  });
  document.getElementById('cd-item-couve').addEventListener('click', () => {
    CD.armed = CD.armed === 'couve' ? null : 'couve';
    document.getElementById('cd-item-couve').classList.toggle('armed', CD.armed === 'couve');
    document.getElementById('cd-item-chocalho').classList.remove('armed');
  });
  document.getElementById('cd-item-chocalho').addEventListener('click', () => {
    CD.armed = CD.armed === 'chocalho' ? null : 'chocalho';
    document.getElementById('cd-item-chocalho').classList.toggle('armed', CD.armed === 'chocalho');
    document.getElementById('cd-item-couve').classList.remove('armed');
  });
  document.getElementById('tab-skins').textContent = t('tab_skins');
  document.getElementById('tab-acc').textContent = t('tab_acc');
  document.getElementById('tab-skins').addEventListener('click', () => { Shop.tab = 'skins'; Shop.render(); });
  document.getElementById('tab-acc').addEventListener('click', () => { Shop.tab = 'acc'; Shop.render(); });
  document.getElementById('cal-claim').addEventListener('click', () => Calendar.claim());
}

document.addEventListener('DOMContentLoaded', init);
