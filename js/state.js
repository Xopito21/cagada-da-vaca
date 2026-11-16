/* Estado persistente do jogo (localStorage) */
const SAVE_KEY = 'cagadaDaVaca_v1';

const DEFAULT_STATE = {
  coins: 500,
  horseshoes: 0,
  stars: 0,
  lives: 5,
  livesUpdated: Date.now(),
  match3Progress: 0,
  playerName: 'Jogador',
  cowName: 'Mimosa',
  lang: 'pt-PT',
  ownedSkins: ['frisia'],
  ownedAcc: [],
  equipped: { skin: 'frisia', hat: null, glasses: null, neck: null },
  farmItems: [],
  calendar: { lastClaim: null, day: 0 },
  subsidyAt: 0
};

let S = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    }
  } catch (e) { /* save corrompido -> estado novo */ }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
}

const LIVES_MAX = 5;
const LIVES_REGEN_MS = 30 * 60 * 1000; /* 1 vida por 30 min */

function regenLives() {
  if (S.lives >= LIVES_MAX) { S.livesUpdated = Date.now(); return; }
  const now = Date.now();
  while (S.lives < LIVES_MAX && now - S.livesUpdated >= LIVES_REGEN_MS) {
    S.lives++;
    S.livesUpdated += LIVES_REGEN_MS;
  }
  if (S.lives >= LIVES_MAX) S.livesUpdated = now;
  saveState();
}

function addCoins(n) { S.coins = Math.max(0, S.coins + n); saveState(); updateTopbar(); }
function addStars(n) { S.stars = Math.max(0, S.stars + n); saveState(); updateTopbar(); }
function addHorseshoes(n) { S.horseshoes = Math.max(0, S.horseshoes + n); saveState(); updateTopbar(); }
function loseLife() { regenLives(); if (S.lives > 0) { S.lives--; saveState(); updateTopbar(); } }
