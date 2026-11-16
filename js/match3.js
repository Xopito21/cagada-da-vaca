/* Match-3 da Quinta — níveis progressivos, especiais e cascatas */
const M3 = {
  rows: 7, cols: 7,
  TYPES: ['🥬', '🌽', '🥛', '🥕', '🍎'],
  board: [], level: 1, moves: 0, score: 0, goal: 0,
  busy: false, selected: null, lastSwap: null, cellEls: []
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const m3key = (r, c) => r * M3.cols + c;

M3.init = function () {
  const boardEl = document.getElementById('m3-board');
  boardEl.innerHTML = '';
  M3.cellEls = [];
  for (let r = 0; r < M3.rows; r++) {
    for (let c = 0; c < M3.cols; c++) {
      const d = document.createElement('div');
      d.className = 'm3-cell';
      d.addEventListener('click', () => M3.onCell(r, c));
      boardEl.appendChild(d);
      M3.cellEls.push(d);
    }
  }
};

M3.startLevel = function () {
  M3.level = S.match3Progress + 1;
  M3.goal = 1000 + (M3.level - 1) * 400;
  M3.moves = Math.max(12, 22 - Math.floor((M3.level - 1) / 3));
  M3.score = 0;
  M3.selected = null;
  M3.busy = false;
  M3.board = M3.makeBoard();
  M3.render();
  M3.updateHUD();
};

M3.makeBoard = function () {
  const b = [];
  for (let r = 0; r < M3.rows; r++) {
    b[r] = [];
    for (let c = 0; c < M3.cols; c++) {
      let type;
      do {
        type = Math.floor(Math.random() * M3.TYPES.length);
      } while (
        (c >= 2 && b[r][c - 1].type === type && b[r][c - 2].type === type) ||
        (r >= 2 && b[r - 1][c].type === type && b[r - 2][c].type === type)
      );
      b[r][c] = { type, special: null };
    }
  }
  return b;
};

M3.render = function () {
  for (let r = 0; r < M3.rows; r++) {
    for (let c = 0; c < M3.cols; c++) {
      const el = M3.cellEls[m3key(r, c)];
      const cell = M3.board[r][c];
      el.classList.remove('sel', 'pop');
      if (!cell) { el.innerHTML = ''; continue; }
      let badge = '';
      if (cell.special === 'row') badge = '<span class="fx">↔</span>';
      if (cell.special === 'col') badge = '<span class="fx">↕</span>';
      if (cell.special === 'bomb') badge = '<span class="fx">💥</span>';
      if (cell.special === 'rainbow') badge = '<span class="fx">🌈</span>';
      el.innerHTML = M3.TYPES[cell.type] + badge;
      if (M3.selected && M3.selected.r === r && M3.selected.c === c) el.classList.add('sel');
    }
  }
};

M3.updateHUD = function () {
  document.getElementById('m3-level').textContent = M3.level;
  document.getElementById('m3-moves').textContent = M3.moves;
  document.getElementById('m3-score').textContent = M3.score;
  document.getElementById('m3-goal').textContent = M3.goal;
  const pct = Math.min(100, (M3.score / M3.goal) * 100);
  document.getElementById('m3-progress-fill').style.width = pct + '%';
};

M3.onCell = function (r, c) {
  if (M3.busy || !M3.board[r][c]) return;
  if (!M3.selected) { M3.selected = { r, c }; M3.render(); return; }
  const s = M3.selected;
  if (s.r === r && s.c === c) { M3.selected = null; M3.render(); return; }
  if (Math.abs(s.r - r) + Math.abs(s.c - c) === 1) {
    M3.selected = null;
    M3.trySwap(s, { r, c });
  } else {
    M3.selected = { r, c };
    M3.render();
  }
};

M3.trySwap = async function (a, b) {
  M3.busy = true;
  const A = M3.board[a.r][a.c], B = M3.board[b.r][b.c];
  M3.board[a.r][a.c] = B; M3.board[b.r][b.c] = A;
  M3.render();
  await sleep(120);

  const rainbow = A.special === 'rainbow' || B.special === 'rainbow';
  if (!rainbow && !M3.findMatches().length) {
    M3.board[a.r][a.c] = A; M3.board[b.r][b.c] = B;
    M3.render();
    M3.busy = false;
    return;
  }

  M3.moves--;
  M3.updateHUD();
  if (rainbow) {
    const rem = new Set();
    rem.add(m3key(a.r, a.c));
    rem.add(m3key(b.r, b.c));
    const other = A.special === 'rainbow' ? B : A;
    if (other.special === 'rainbow') {
      for (let r = 0; r < M3.rows; r++) for (let c = 0; c < M3.cols; c++) rem.add(m3key(r, c));
    } else {
      for (let r = 0; r < M3.rows; r++) for (let c = 0; c < M3.cols; c++) {
        if (M3.board[r][c] && M3.board[r][c].type === other.type) rem.add(m3key(r, c));
      }
    }
    M3.score += rem.size * 60;
    for (const k of rem) M3.cellEls[k].classList.add('pop');
    await sleep(180);
    for (const k of rem) {
      const r = Math.floor(k / M3.cols), c = k % M3.cols;
      M3.board[r][c] = null;
    }
    M3.render();
    M3.updateHUD();
    await sleep(200);
    M3.gravity();
    M3.render();
    await sleep(220);
    await M3.cascadeLoop();
  } else {
    M3.lastSwap = { a, b };
    await M3.cascadeLoop();
  }
  M3.endTurn();
};

M3.cascadeLoop = async function () {
  let cascade = 0;
  while (true) {
    const runs = M3.findMatches();
    if (!runs.length) break;
    await M3.removeRuns(runs, cascade);
    M3.lastSwap = null;
    await sleep(100);
    M3.gravity();
    M3.render();
    M3.updateHUD();
    await sleep(220);
    cascade++;
  }
};

M3.findMatches = function () {
  const runs = [];
  for (let r = 0; r < M3.rows; r++) {
    let runLen = 1;
    for (let c = 1; c <= M3.cols; c++) {
      const cur = c < M3.cols ? M3.board[r][c] : null;
      const prev = M3.board[r][c - 1];
      if (cur && prev && cur.type === prev.type) runLen++;
      else {
        if (runLen >= 3 && prev) {
          const cells = [];
          for (let i = c - runLen; i < c; i++) cells.push({ r, c: i });
          runs.push({ dir: 'h', cells });
        }
        runLen = 1;
      }
    }
  }
  for (let c = 0; c < M3.cols; c++) {
    let runLen = 1;
    for (let r = 1; r <= M3.rows; r++) {
      const cur = r < M3.rows ? M3.board[r][c] : null;
      const prev = M3.board[r - 1][c];
      if (cur && prev && cur.type === prev.type) runLen++;
      else {
        if (runLen >= 3 && prev) {
          const cells = [];
          for (let i = r - runLen; i < r; i++) cells.push({ r: i, c });
          runs.push({ dir: 'v', cells });
        }
        runLen = 1;
      }
    }
  }
  return runs;
};

M3.removeRuns = async function (runs, cascade) {
  const clusters = [];
  for (const run of runs) {
    let target = null;
    for (const cl of clusters) {
      if (run.cells.some(cell => cl.keys.has(m3key(cell.r, cell.c)))) { target = cl; break; }
    }
    if (target) {
      target.runs.push(run);
      run.cells.forEach(cell => target.keys.add(m3key(cell.r, cell.c)));
    } else {
      clusters.push({ runs: [run], keys: new Set(run.cells.map(c => m3key(c.r, c.c))) });
    }
  }

  const removals = new Set();
  for (const cl of clusters) {
    const maxRun = cl.runs.reduce((m, run) => Math.max(m, run.cells.length), 0);
    const hasH = cl.runs.some(run => run.dir === 'h');
    const hasV = cl.runs.some(run => run.dir === 'v');
    let specialType = null;
    if (maxRun >= 5) specialType = 'rainbow';
    else if (hasH && hasV) specialType = 'bomb';
    else if (maxRun === 4) specialType = cl.runs.find(run => run.cells.length === 4).dir === 'h' ? 'row' : 'col';

    let specialPos = null;
    if (specialType) {
      if (M3.lastSwap) {
        const ka = m3key(M3.lastSwap.a.r, M3.lastSwap.a.c);
        const kb = m3key(M3.lastSwap.b.r, M3.lastSwap.b.c);
        if (cl.keys.has(ka)) specialPos = ka;
        else if (cl.keys.has(kb)) specialPos = kb;
      }
      if (specialPos === null) {
        const longest = cl.runs.reduce((m, run) => run.cells.length > m.cells.length ? run : m, cl.runs[0]);
        const mid = longest.cells[Math.floor(longest.cells.length / 2)];
        specialPos = m3key(mid.r, mid.c);
      }
    }

    for (const k of cl.keys) {
      if (k !== specialPos) removals.add(k);
    }
    if (specialPos !== null) {
      const r = Math.floor(specialPos / M3.cols), c = specialPos % M3.cols;
      M3.board[r][c] = { type: M3.board[r][c].type, special: specialType };
    }
  }

  /* reação em cadeia de especiais já existentes */
  const queue = [...removals];
  while (queue.length) {
    const k = queue.pop();
    const r = Math.floor(k / M3.cols), c = k % M3.cols;
    const cell = M3.board[r][c];
    if (!cell || !cell.special) continue;
    const extra = [];
    if (cell.special === 'row') { for (let i = 0; i < M3.cols; i++) extra.push(m3key(r, i)); }
    if (cell.special === 'col') { for (let i = 0; i < M3.rows; i++) extra.push(m3key(i, c)); }
    if (cell.special === 'bomb') {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < M3.rows && nc >= 0 && nc < M3.cols) extra.push(m3key(nr, nc));
      }
    }
    for (const k2 of extra) {
      if (!removals.has(k2)) { removals.add(k2); queue.push(k2); }
    }
  }

  M3.score += removals.size * 60 * (1 + 0.5 * cascade);
  for (const k of removals) M3.cellEls[k].classList.add('pop');
  await sleep(180);
  for (const k of removals) {
    const r = Math.floor(k / M3.cols), c = k % M3.cols;
    M3.board[r][c] = null;
  }
  M3.render();
  M3.updateHUD();
};

M3.gravity = function () {
  for (let c = 0; c < M3.cols; c++) {
    let write = M3.rows - 1;
    for (let r = M3.rows - 1; r >= 0; r--) {
      if (M3.board[r][c]) {
        M3.board[write][c] = M3.board[r][c];
        if (write !== r) M3.board[r][c] = null;
        write--;
      }
    }
    for (let r = write; r >= 0; r--) {
      M3.board[r][c] = { type: Math.floor(Math.random() * M3.TYPES.length), special: null };
    }
  }
};

M3.hasMove = function () {
  const clone = () => M3.board.map(row => row.map(cell => cell ? { type: cell.type, special: cell.special } : null));
  const orig = M3.board;
  for (let r = 0; r < M3.rows; r++) {
    for (let c = 0; c < M3.cols; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= M3.rows || nc >= M3.cols) continue;
        M3.board = clone();
        const a = M3.board[r][c], b = M3.board[nr][nc];
        if (!a || !b) continue;
        M3.board[r][c] = b; M3.board[nr][nc] = a;
        const ok = a.special === 'rainbow' || b.special === 'rainbow' || M3.findMatches().length > 0;
        M3.board = orig;
        if (ok) return true;
      }
    }
  }
  return false;
};

M3.shuffle = function () {
  do {
    M3.board = M3.makeBoard();
  } while (M3.findMatches().length || !M3.hasMove());
  M3.render();
};

M3.endTurn = async function () {
  if (!M3.hasMove()) {
    M3.shuffle();
    await M3.cascadeLoop();
  }
  if (M3.score >= M3.goal) { M3.onWin(); return; }
  if (M3.moves <= 0) { M3.onLose(); return; }
  M3.busy = false;
};

M3.onWin = function () {
  const stars = M3.score >= M3.goal * 1.6 ? 3 : M3.score >= M3.goal * 1.3 ? 2 : 1;
  const coins = 80 + M3.level * 15;
  addStars(stars);
  addCoins(coins);
  if (M3.level === S.match3Progress + 1) { S.match3Progress = M3.level; saveState(); }
  showModal({
    emoji: '🏆',
    title: t('win'),
    msg: `${t('m3_win_msg')}<br>⭐ +${stars} &nbsp; 🪙 +${coins}`,
    buttons: [{ label: t('next_level'), primary: true, cb: () => { M3.startLevel(); } }]
  });
};

M3.onLose = function () {
  loseLife();
  if (S.lives > 0) {
    showModal({
      emoji: '😢',
      title: t('lose'),
      msg: t('m3_lose_msg') + `<br>❤️ −1 (${S.lives}/${LIVES_MAX})`,
      buttons: [
        { label: t('retry'), primary: true, cb: () => { M3.startLevel(); } },
        { label: t('back_home'), cb: () => showScreen('home') }
      ]
    });
  } else {
    showModal({
      emoji: '💔',
      title: t('lose'),
      msg: t('no_lives'),
      buttons: [{ label: t('back_home'), primary: true, cb: () => showScreen('home') }]
    });
  }
};
