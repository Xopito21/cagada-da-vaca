/* Internacionalização: PT-PT + EN (estrutura pronta para ES no futuro) */
const I18N = {
  'pt-PT': {
    play_cow: 'Ronda da Vaca',
    play_match3: 'Match-3 da Quinta',
    nav_farm: 'A Minha Quinta',
    nav_shop: 'Loja',
    nav_calendar: 'Calendário Diário',
    rewarded_ad: 'Anúncio (demo)',
    prototype_note: 'Protótipo — anúncios simulados, moedas sem valor real.',
    level: 'Nível', moves: 'Jogadas', goal: 'Meta',
    m3_tip: 'Junta 3 ou mais! 4 em linha = chocalho, 5 = pote de leite.',
    win: 'Vitória!', lose: 'Oh não!',
    m3_win_msg: 'Conseguiste a meta!', m3_lose_msg: 'Ficaste sem jogadas…',
    retry: 'Tentar outra vez', next_level: 'Próximo nível', back_home: 'Menu',
    no_lives: 'Sem vidas! Espera 30 min por uma vida nova.',
    bet_phase: 'Escolhe os teus lotes!', walk_phase: 'A Malhada passeia…',
    event_phase: 'Prepara…', result_phase: 'Resultado',
    bet_hint: 'Toca num quadrado livre (50 🪙 cada, máx. 2)',
    pot: 'Pote', you_win_pot: 'Ganhaste o pote!', you_lost: 'A vaca escolheu outro lote…',
    consolation: 'Prémio de consolação: +10 🪙',
    play_again: 'Jogar novamente',
    need_coins: 'Precisas de pelo menos 50 🪙 para apostar.',
    subsidy: 'Subsídio do Pastor', subsidy_msg: 'Recebe +100 🪙 grátis (de 4 em 4 horas).',
    ad_demo_msg: 'Anúncio simulado: +150 🪙 (numa app real: vídeo de 15-30s).',
    claim: 'Receber +150 🪙', claim_subsidy: 'Receber +100 🪙',
    farm_shop: 'Decora a quinta (custa ⭐)',
    buy: 'Comprar', bought: 'Comprado', equip: 'Usar', equipped: 'Em uso',
    tab_skins: 'Skins', tab_acc: 'Acessórios',
    cal_claim: 'Receber prémio de hoje', cal_already: 'Volta amanhã!',
    edit_player: 'Nome do jogador', edit_cow: 'Nome da vaca',
    save: 'Guardar', cancel: 'Cancelar',
    day: 'Dia', stars: 'estrelas', not_enough: 'Não tens moedas suficientes!'
  },
  'en': {
    play_cow: 'Cow Round',
    play_match3: 'Farm Match-3',
    nav_farm: 'My Farm',
    nav_shop: 'Shop',
    nav_calendar: 'Daily Calendar',
    rewarded_ad: 'Ad (demo)',
    prototype_note: 'Prototype — simulated ads, coins have no real value.',
    level: 'Level', moves: 'Moves', goal: 'Goal',
    m3_tip: 'Match 3 or more! 4 in a row = bell, 5 = milk jug.',
    win: 'You win!', lose: 'Oh no!',
    m3_win_msg: 'Goal reached!', m3_lose_msg: 'Out of moves…',
    retry: 'Try again', next_level: 'Next level', back_home: 'Menu',
    no_lives: 'No lives! Wait 30 min for a new one.',
    bet_phase: 'Pick your squares!', walk_phase: 'Malhada is walking…',
    event_phase: 'Get ready…', result_phase: 'Result',
    bet_hint: 'Tap a free square (50 🪙 each, max 2)',
    pot: 'Pot', you_win_pot: 'You won the pot!', you_lost: 'The cow chose another square…',
    consolation: 'Consolation prize: +10 🪙',
    play_again: 'Play again',
    need_coins: 'You need at least 50 🪙 to bet.',
    subsidy: 'Shepherd\u2019s Allowance', subsidy_msg: 'Get +100 🪙 free (every 4 hours).',
    ad_demo_msg: 'Simulated ad: +150 🪙 (real app: 15-30s video).',
    claim: 'Claim +150 🪙', claim_subsidy: 'Claim +100 🪙',
    farm_shop: 'Decorate the farm (costs ⭐)',
    buy: 'Buy', bought: 'Owned', equip: 'Equip', equipped: 'Equipped',
    tab_skins: 'Skins', tab_acc: 'Accessories',
    cal_claim: 'Claim today\u2019s reward', cal_already: 'Come back tomorrow!',
    edit_player: 'Player name', edit_cow: 'Cow name',
    save: 'Save', cancel: 'Cancel',
    day: 'Day', stars: 'stars', not_enough: 'Not enough coins!'
  }
};

function t(key) {
  const d = I18N[S.lang] || I18N['pt-PT'];
  return d[key] !== undefined ? d[key] : (I18N['pt-PT'][key] || key);
}

function applyI18n() {
  document.documentElement.lang = S.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  const btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = S.lang === 'pt-PT' ? 'EN' : 'PT';
}
