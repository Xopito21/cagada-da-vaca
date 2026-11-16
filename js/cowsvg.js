/* Vaca desenhada em SVG — skins e acessórios equipáveis */

const COW_SKINS = {
  frisia:  { body: '#f7f2e7', spots: '#3b3b3b', muzzle: '#e8b7b0', name: 'Frísia', price: 0 },
  castanha:{ body: '#b07a4e', spots: '#5d3a22', muzzle: '#e8c9a8', name: 'Minhota', price: 300 },
  dourada: { body: '#f0c25a', spots: '#b3821f', muzzle: '#f5dcae', name: 'Dourada', price: 800 },
  alien:   { body: '#a5e8a8', spots: '#3f8f4a', muzzle: '#d6f2d0', name: 'Alien', price: 1200 },
  campea:  { body: '#fdfaf2', spots: '#c9a227', muzzle: '#efc9c2', name: 'Campeã', price: null }
};

const COW_ACC = {
  hat: {
    palha:  { emoji: '👒', price: 250, name: 'Chapéu de palha' },
    bone:   { emoji: '🧢', price: 200, name: 'Boné' },
    boina:  { emoji: '🎩', price: 220, name: 'Boina' }
  },
  glasses: {
    oculos: { emoji: '🕶️', price: 300, name: 'Óculos escuros' }
  },
  neck: {
    sino:   { emoji: '🔔', price: 350, name: 'Sino' },
    laco:   { emoji: '🎀', price: 280, name: 'Laço' }
  }
};

function cowSVG(skinId, equipped, opts) {
  opts = opts || {};
  const skin = COW_SKINS[skinId] || COW_SKINS.frisia;
  const acc = equipped || {};
  const hat = acc.hat ? COW_ACC.hat[acc.hat] : null;
  const gl = acc.glasses ? COW_ACC.glasses[acc.glasses] : null;
  const neck = acc.neck ? COW_ACC.neck[acc.neck] : null;

  return `
<svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg">
  <!-- cauda -->
  <path d="M158 78 Q 186 84 180 116" stroke="${skin.spots}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="180" cy="120" r="8" fill="${skin.spots}"/>
  <!-- pernas -->
  <rect x="62" y="118" width="14" height="34" rx="6" fill="${skin.body}"/>
  <rect x="84" y="122" width="14" height="32" rx="6" fill="${skin.body}"/>
  <rect x="112" y="122" width="14" height="32" rx="6" fill="${skin.body}"/>
  <rect x="132" y="118" width="14" height="34" rx="6" fill="${skin.body}"/>
  <rect x="62" y="144" width="14" height="10" rx="4" fill="${skin.spots}"/>
  <rect x="132" y="144" width="14" height="10" rx="4" fill="${skin.spots}"/>
  <!-- corpo -->
  <ellipse cx="102" cy="92" rx="62" ry="42" fill="${skin.body}"/>
  <ellipse cx="82" cy="80" rx="16" ry="11" fill="${skin.spots}" transform="rotate(-12 82 80)"/>
  <ellipse cx="120" cy="104" rx="13" ry="9" fill="${skin.spots}" transform="rotate(9 120 104)"/>
  <ellipse cx="138" cy="76" rx="10" ry="7" fill="${skin.spots}" transform="rotate(-6 138 76)"/>
  <!-- cabeça -->
  <circle cx="46" cy="72" r="30" fill="${skin.body}"/>
  <!-- chifres -->
  <path d="M28 48 Q 22 34 34 30" stroke="#e9dcc0" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M62 46 Q 70 32 58 28" stroke="#e9dcc0" stroke-width="7" fill="none" stroke-linecap="round"/>
  <!-- orelhas -->
  <ellipse cx="20" cy="66" rx="10" ry="7" fill="${skin.body}" transform="rotate(-25 20 66)"/>
  <ellipse cx="70" cy="64" rx="10" ry="7" fill="${skin.body}" transform="rotate(25 70 64)"/>
  <!-- focinho -->
  <ellipse cx="42" cy="86" rx="18" ry="13" fill="${skin.muzzle}"/>
  <circle cx="35" cy="84" r="2.6" fill="#7a4a44"/>
  <circle cx="49" cy="84" r="2.6" fill="#7a4a44"/>
  <!-- olhos / óculos -->
  ${gl
    ? `<rect x="20" y="56" width="50" height="13" rx="6" fill="#222"/>
       <rect x="30" y="58" width="12" height="9" rx="3" fill="#4a4a4a"/>
       <rect x="48" y="58" width="12" height="9" rx="3" fill="#4a4a4a"/>`
    : `<circle cx="34" cy="62" r="5" fill="#2c2c2c"/><circle cx="56" cy="62" r="5" fill="#2c2c2c"/>
       <circle cx="35.5" cy="60.5" r="1.6" fill="#fff"/><circle cx="57.5" cy="60.5" r="1.6" fill="#fff"/>`}
  <!-- colar / sino / laço -->
  ${neck
    ? (acc.neck === 'sino'
        ? `<path d="M28 100 Q 44 112 62 100" stroke="#c0392b" stroke-width="6" fill="none"/>
           <circle cx="45" cy="114" r="9" fill="#f2b632" stroke="#a97b1d" stroke-width="2"/>`
        : `<path d="M28 100 Q 44 112 62 100" stroke="#e05b9b" stroke-width="6" fill="none"/>
           <path d="M45 112 l-12 -8 v16 z" fill="#e05b9b"/><path d="M45 112 l12 -8 v16 z" fill="#e05b9b"/>`)
    : ''}
  <!-- chapéu -->
  ${hat
    ? `<text x="40" y="40" font-size="30" text-anchor="middle">${hat.emoji}</text>`
    : ''}
  ${opts.champion ? '<text x="150" y="52" font-size="26" text-anchor="middle">🏅</text>' : ''}
</svg>`;
}
