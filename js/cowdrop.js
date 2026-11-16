/* Ronda da Vaca — canvas: apostas nos lotes, pastoreio e o evento final */
const CD = {
  W: 360, H: 460,
  cols: 6, rows: 6, cell: 52,
  phase: 'idle', timeLeft: 0, animT: 0, raf: null, lastTs: 0,
  grid: [], bots: [], playerBets: 0, pot: 0,
  cow: null, digestion: 0,
  items: { couve: 3, chocalho: 2 }, armed: null,
  couves: [], scares: [], botItemTimer: 4,
  poop: null, shake: 0
};

Object.defineProperty(CD, 'gx', { get: () => (CD.W - CD.cols * CD.cell) / 2 });
Object.defineProperty(CD, 'gy', { get: () => 100 });

CD.BOT_NAMES = ['Zé', 'Maria', 'Tonho', 'Rosa', 'Quim'];
CD.BOT_COLORS = ['#e05b4b', '#3ba3d6', '#e05b9b', '#8a6d1a', '#7b52ab'];

CD.start = function () {
  if (S.coins < 50) { CD.offerSubsidy(); return; }
  CD.grid = [];
  for (let r = 0; r < CD.rows; r++) {
    CD.grid[r] = [];
    for (let c = 0; c < CD.cols; c++) CD.grid[r][c] = { owner: null };
  }
  CD.bots = CD.BOT_NAMES.map((name, i) => ({
    name, color: CD.BOT_COLORS[i],
    claims: 1 + Math.floor(Math.random() * 2),
    claimAt: 1 + Math.random() * 7,
    done: false
  }));
  CD.playerBets = 0; CD.pot = 0;
  CD.items = { couve: 3, chocalho: 2 };
  CD.armed = null; CD.couves = []; CD.scares = [];
  CD.digestion = 0; CD.poop = null; CD.shake = 0; CD.animT = 0;
  CD.botItemTimer = 4;
  CD.cow = {
    x: CD.gx + 60 + Math.random() * (CD.cols * CD.cell - 120),
    y: CD.gy + 60 + Math.random() * (CD.rows * CD.cell - 120),
    tx: 0, ty: 0, hasTarget: false, dir: 1, phase: Math.random() * 10
  };
  CD.phase = 'bet';
  CD.timeLeft = 10;
  CD.updateHud();
  showScreen('cowdrop');
  if (!CD.raf) { CD.lastTs = performance.now(); CD.raf = requestAnimationFrame(CD.loop); }
};

CD.stop = function () {
  if (CD.raf) { cancelAnimationFrame(CD.raf); CD.raf = null; }
  CD.phase = 'idle';
};

CD.offerSubsidy = function () {
  showModal({
    emoji: '🪙',
    title: t('need_coins'),
    msg: t('subsidy_msg'),
    buttons: [
      { label: t('claim_subsidy'), primary: true, cb: () => { addCoins(100); CD.start(); } },
      { label: t('cancel'), cb: () => {} }
    ]
  });
};

CD.updateHud = function () {
  const phaseEl = document.getElementById('cd-phase');
  const timerEl = document.getElementById('cd-timer');
  if (CD.phase === 'bet') phaseEl.textContent = '🎯 ' + t('bet_phase');
  else if (CD.phase === 'walk') phaseEl.textContent = '🐮 ' + t('walk_phase');
  else if (CD.phase === 'event') phaseEl.textContent = '💩 ' + t('event_phase');
  else phaseEl.textContent = '—';
  timerEl.textContent = CD.phase === 'bet' || CD.phase === 'walk'
    ? Math.ceil(CD.timeLeft) + 's' : '—';
  document.getElementById('cd-couve-n').textContent = CD.items.couve;
  document.getElementById('cd-chocalho-n').textContent = CD.items.chocalho;
  document.getElementById('cd-pot').textContent = '🪙 ' + t('pot') + ': ' + CD.pot;
  document.getElementById('cd-item-couve').disabled = CD.phase !== 'walk' || CD.items.couve <= 0;
  document.getElementById('cd-item-chocalho').disabled = CD.phase !== 'walk' || CD.items.chocalho <= 0;
};

CD.cellAt = function (x, y) {
  const c = Math.floor((x - CD.gx) / CD.cell);
  const r = Math.floor((y - CD.gy) / CD.cell);
  if (r < 0 || r >= CD.rows || c < 0 || c >= CD.cols) return null;
  return { r, c };
};

CD.cellCenter = function (r, c) {
  return { x: CD.gx + c * CD.cell + CD.cell / 2, y: CD.gy + r * CD.cell + CD.cell / 2 };
};

CD.onClick = function (x, y) {
  if (CD.phase === 'bet') {
    const cell = CD.cellAt(x, y);
    if (!cell || CD.grid[cell.r][cell.c].owner !== null) return;
    if (CD.playerBets >= 2) return;
    if (S.coins < 50) return;
    addCoins(-50);
    CD.grid[cell.r][cell.c].owner = 'player';
    CD.playerBets++;
    CD.pot += 50;
    CD.updateHud();
  } else if (CD.phase === 'walk' && CD.armed) {
    if (CD.armed === 'couve' && CD.items.couve > 0) {
      const cell = CD.cellAt(x, y) || { r: 0, c: 0 };
      const p = CD.cellCenter(cell.r, cell.c);
      CD.couves.push({ x: p.x, y: p.y, ttl: 4 });
      CD.items.couve--;
    } else if (CD.armed === 'chocalho' && CD.items.chocalho > 0) {
      CD.scares.push({ x, y, ttl: 2 });
      CD.items.chocalho--;
    }
    CD.armed = null;
    document.getElementById('cd-item-couve').classList.remove('armed');
    document.getElementById('cd-item-chocalho').classList.remove('armed');
    CD.updateHud();
  }
};

CD.startWalk = function () {
  CD.phase = 'walk';
  CD.timeLeft = 30;
  CD.updateHud();
};

CD.startEvent = function () {
  CD.phase = 'event';
  CD.animT = 0;
  CD.updateHud();
};

CD.finish = function () {
  const c = Math.min(CD.cols - 1, Math.max(0, Math.floor((CD.cow.x - CD.gx) / CD.cell)));
  const r = Math.min(CD.rows - 1, Math.max(0, Math.floor((CD.cow.y - CD.gy) / CD.cell)));
  const owner = CD.grid[r][c].owner;
  CD.phase = 'result';
  let msg;
  if (owner === 'player') {
    addCoins(CD.pot);
    msg = `💩 ${t('you_win_pot')}<br>🪙 +${CD.pot}`;
    showModal({ emoji: '🏆', title: t('win'), msg, buttons: CD.resultButtons() });
  } else {
    addCoins(10);
    const who = owner !== null ? CD.bots[owner].name : '—';
    msg = `💩 ${t('you_lost')}<br><b>${who}</b><br>${t('consolation')}`;
    showModal({ emoji: '🐮', title: t('result_phase'), msg, buttons: CD.resultButtons() });
  }
  CD.updateHud();
};

CD.resultButtons = function () {
  return [
    { label: t('play_again'), primary: true, cb: () => { CD.start(); } },
    { label: t('back_home'), cb: () => { CD.stop(); showScreen('home'); } }
  ];
};

CD.loop = function (ts) {
  const dt = Math.min(0.05, (ts - CD.lastTs) / 1000);
  CD.lastTs = ts;
  CD.update(dt);
  CD.draw(ts / 1000);
  if (CD.phase !== 'idle' && CD.phase !== 'result') {
    CD.raf = requestAnimationFrame(CD.loop);
  } else {
    CD.raf = null;
  }
};

CD.update = function (dt) {
  CD.animT += dt;

  if (CD.phase === 'bet') {
    CD.timeLeft -= dt;
    for (const bot of CD.bots) {
      if (!bot.done && (10 - CD.timeLeft) >= bot.claimAt) {
        const free = [];
        for (let r = 0; r < CD.rows; r++) for (let c = 0; c < CD.cols; c++) {
          if (CD.grid[r][c].owner === null) free.push({ r, c });
        }
        if (free.length && bot.claims > 0) {
          const cell = free[Math.floor(Math.random() * free.length)];
          CD.grid[cell.r][cell.c].owner = CD.bots.indexOf(bot);
          bot.claims--;
          CD.pot += 50;
          if (bot.claims <= 0) bot.done = true;
        } else bot.done = true;
      }
    }
    if (CD.timeLeft <= 0) CD.startWalk();
  } else if (CD.phase === 'walk') {
    CD.timeLeft -= dt;
    CD.digestion = Math.min(1, 1 - CD.timeLeft / 30);

    for (const cv of CD.couves) cv.ttl -= dt;
    CD.couves = CD.couves.filter(cv => cv.ttl > 0);
    for (const sc of CD.scares) sc.ttl -= dt;
    CD.scares = CD.scares.filter(sc => sc.ttl > 0);

    CD.botItemTimer -= dt;
    if (CD.botItemTimer <= 0) {
      CD.botItemTimer = 3 + Math.random() * 3;
      const cell = { r: Math.floor(Math.random() * CD.rows), c: Math.floor(Math.random() * CD.cols) };
      const p = CD.cellCenter(cell.r, cell.c);
      if (Math.random() < 0.5) CD.couves.push({ x: p.x, y: p.y, ttl: 4 });
      else CD.scares.push({ x: p.x, y: p.y, ttl: 2 });
    }

    CD.moveCow(dt);
    if (CD.timeLeft <= 0) CD.startEvent();
  } else if (CD.phase === 'event') {
    CD.shake = Math.min(6, CD.animT * 4);
    if (CD.animT >= 2.2 && !CD.poop) {
      CD.poop = { x: CD.cow.x, y: CD.cow.y + 18 };
    }
    if (CD.animT >= 3.4) CD.finish();
  }

  const timerEl = document.getElementById('cd-timer');
  if (timerEl && (CD.phase === 'bet' || CD.phase === 'walk')) {
    timerEl.textContent = Math.max(0, Math.ceil(CD.timeLeft)) + 's';
  }
};

CD.moveCow = function (dt) {
  const cow = CD.cow;
  const minX = CD.gx + 30, maxX = CD.gx + CD.cols * CD.cell - 30;
  const minY = CD.gy + 30, maxY = CD.gy + CD.rows * CD.cell - 30;

  let speed = 46;
  /* couve atrai */
  let attractor = null, bestD = 170;
  for (const cv of CD.couves) {
    const d = Math.hypot(cv.x - cow.x, cv.y - cow.y);
    if (d < bestD) { bestD = d; attractor = cv; }
  }
  /* chocalho espanta */
  let flee = null;
  for (const sc of CD.scares) {
    if (Math.hypot(sc.x - cow.x, sc.y - cow.y) < 130) flee = sc;
  }

  if (flee) {
    const dx = cow.x - flee.x, dy = cow.y - flee.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    cow.tx = Math.min(maxX, Math.max(minX, cow.x + (dx / len) * 90));
    cow.ty = Math.min(maxY, Math.max(minY, cow.y + (dy / len) * 90));
    cow.hasTarget = true;
    speed = 80;
  } else if (attractor) {
    cow.tx = attractor.x; cow.ty = attractor.y;
    cow.hasTarget = true;
    speed = 62;
  } else if (!cow.hasTarget ||
    Math.hypot(cow.tx - cow.x, cow.ty - cow.y) < 6) {
    cow.tx = minX + Math.random() * (maxX - minX);
    cow.ty = minY + Math.random() * (maxY - minY);
    cow.hasTarget = true;
  }

  const dx = cow.tx - cow.x, dy = cow.ty - cow.y;
  const d = Math.hypot(dx, dy);
  if (d > 2) {
    cow.x += (dx / d) * speed * dt;
    cow.y += (dy / d) * speed * dt;
    if (Math.abs(dx) > 4) cow.dir = dx > 0 ? 1 : -1;
    cow.phase += dt * 9;
  }
};

/* ---------- desenho ---------- */
CD.draw = function (time) {
  const ctx = CD.ctx;
  const gx = CD.gx, gy = CD.gy;
  ctx.clearRect(0, 0, CD.W, CD.H);

  /* céu e sol */
  ctx.fillStyle = '#8ed6f5';
  ctx.fillRect(0, 0, CD.W, gy);
  ctx.fillStyle = '#ffd977';
  ctx.beginPath(); ctx.arc(320, 34, 22, 0, Math.PI * 2); ctx.fill();
  /* relva */
  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, gy - 14, CD.W, CD.H - gy + 14);
  ctx.fillStyle = '#6cb844';
  ctx.fillRect(0, gy - 14, CD.W, 8);

  /* lotes */
  ctx.font = '10px sans-serif';
  for (let r = 0; r < CD.rows; r++) {
    for (let c = 0; c < CD.cols; c++) {
      const x = gx + c * CD.cell, y = gy + r * CD.cell;
      const cell = CD.grid[r] ? CD.grid[r][c] : null;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x + 1, y + 1, CD.cell - 2, CD.cell - 2);
      if (cell && cell.owner !== null) {
        ctx.fillStyle = cell.owner === 'player'
          ? 'rgba(63,122,31,0.55)'
          : CD.hexA(CD.BOT_COLORS[cell.owner], 0.45);
        ctx.fillRect(x + 1, y + 1, CD.cell - 2, CD.cell - 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        const label = cell.owner === 'player' ? 'TU' : CD.BOT_NAMES[cell.owner];
        ctx.fillText(label, x + 6, y + 15);
      }
      ctx.strokeStyle = 'rgba(63,58,34,0.35)';
      ctx.strokeRect(x + 1, y + 1, CD.cell - 2, CD.cell - 2);
      ctx.fillStyle = 'rgba(58,44,30,0.5)';
      ctx.font = '9px sans-serif';
      ctx.fillText(String(r * CD.cols + c + 1), x + CD.cell - 12, y + CD.cell - 4);
    }
  }

  /* couves e chocalhos */
  ctx.font = '24px sans-serif';
  for (const cv of CD.couves) {
    ctx.globalAlpha = Math.min(1, cv.ttl);
    ctx.fillText('🥬', cv.x - 12, cv.y + 8);
    ctx.globalAlpha = 1;
  }
  for (const sc of CD.scares) {
    ctx.globalAlpha = Math.min(1, sc.ttl);
    ctx.strokeStyle = 'rgba(224,91,75,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(sc.x, sc.y, 130 * (1 - sc.ttl / 2), 0, Math.PI * 2); ctx.stroke();
    ctx.font = '22px sans-serif';
    ctx.fillText('🔔', sc.x - 11, sc.y + 8);
    ctx.globalAlpha = 1;
  }

  /* vaca */
  if (CD.cow) {
    let sx = 0, sy = 0;
    if (CD.phase === 'event') {
      sx = (Math.random() - 0.5) * CD.shake;
      sy = (Math.random() - 0.5) * CD.shake;
    }
    const bob = CD.phase === 'walk' ? Math.sin(time * 9) * 2 : 0;
    CD.drawCow(ctx, CD.cow.x + sx, CD.cow.y + sy + bob, time);
  }

  /* 💩 final */
  if (CD.poop) {
    ctx.font = '34px sans-serif';
    ctx.fillText('💩', CD.poop.x - 17, CD.poop.y + 10);
  }

  /* barra de digestão */
  const bw = 220, bx = (CD.W - bw) / 2, by = 12;
  ctx.fillStyle = 'rgba(58,44,30,0.75)';
  CD.roundRect(ctx, bx - 6, by - 4, bw + 12, 22, 11); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  CD.roundRect(ctx, bx, by, bw, 14, 7); ctx.fill();
  ctx.fillStyle = CD.digestion > 0.8 ? '#e05b4b' : '#8fd45f';
  if (CD.digestion > 0) {
    CD.roundRect(ctx, bx, by, bw * CD.digestion, 14, 7); ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('🌾 ' + Math.round(CD.digestion * 100) + '%', bx + bw + 8, by + 11);
};

CD.roundRect = function (ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

CD.hexA = function (hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

CD.drawCow = function (ctx, x, y, time) {
  const skin = COW_SKINS[S.equipped.skin] || COW_SKINS.frisia;
  const eq = S.equipped;
  const dir = CD.cow.dir;
  const legSwing = CD.phase === 'walk' ? Math.sin(time * 11) * 5 : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  /* pernas */
  ctx.fillStyle = skin.body;
  const legs = [[-20, legSwing], [-8, -legSwing], [8, legSwing], [20, -legSwing]];
  for (const [lx, off] of legs) {
    ctx.fillRect(lx - 4, 8, 8, 22 + off * 0.3);
  }
  /* cauda */
  ctx.strokeStyle = skin.spots;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(30, -6);
  ctx.quadraticCurveTo(46, 0, 44 + Math.sin(time * 6) * 4, 16);
  ctx.stroke();
  /* corpo */
  ctx.fillStyle = skin.body;
  ctx.beginPath(); ctx.ellipse(0, -6, 34, 22, 0, 0, Math.PI * 2); ctx.fill();
  /* manchas */
  ctx.fillStyle = skin.spots;
  ctx.beginPath(); ctx.ellipse(-12, -12, 9, 6, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(12, 0, 7, 5, 0.4, 0, Math.PI * 2); ctx.fill();
  /* cabeça */
  ctx.fillStyle = skin.body;
  ctx.beginPath(); ctx.arc(-34, -14, 15, 0, Math.PI * 2); ctx.fill();
  /* chifres */
  ctx.strokeStyle = '#e9dcc0';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-42, -26); ctx.quadraticCurveTo(-46, -34, -38, -36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-28, -27); ctx.quadraticCurveTo(-24, -35, -32, -37); ctx.stroke();
  /* orelha */
  ctx.fillStyle = skin.body;
  ctx.beginPath(); ctx.ellipse(-22, -18, 6, 4, 0.6, 0, Math.PI * 2); ctx.fill();
  /* focinho */
  ctx.fillStyle = skin.muzzle;
  ctx.beginPath(); ctx.ellipse(-42, -9, 9, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a4a44';
  ctx.beginPath(); ctx.arc(-45, -10, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-40, -10, 1.4, 0, Math.PI * 2); ctx.fill();
  /* olhos / óculos */
  if (eq.glasses) {
    ctx.fillStyle = '#222';
    ctx.fillRect(-44, -22, 18, 6);
  } else {
    ctx.fillStyle = '#2c2c2c';
    ctx.beginPath(); ctx.arc(-38, -18, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  /* colar */
  if (eq.neck) {
    ctx.strokeStyle = eq.neck === 'sino' ? '#c0392b' : '#e05b9b';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-28, 0); ctx.quadraticCurveTo(-22, 6, -16, 0); ctx.stroke();
    ctx.fillStyle = eq.neck === 'sino' ? '#f2b632' : '#e05b9b';
    ctx.beginPath(); ctx.arc(-22, 7, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  /* chapéu (sem flip, para não inverter o emoji) */
  if (eq.hat) {
    const emoji = { palha: '👒', bone: '🧢', boina: '🎩' }[eq.hat] || '👒';
    ctx.font = '20px sans-serif';
    ctx.fillText(emoji, x + dir * -34 - 10, y - 40);
  }
};
