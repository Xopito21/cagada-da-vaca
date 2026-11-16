# A Cagada da Vaca — Protótipo Jogável

Protótipo HTML5 mobile-first inspirado na tradição portuguesa da **"Cagada da Vaca"**
(cow bingo), com uma meta-camada de decoração estilo *Fishdom* (Match-3 + quinta
personalizável). Arte 100% original desenhada em código (SVG/Canvas) — sem assets
externos e sem depender de rede.

> **Nota legal:** o grafismo não replica o Fishdom (assets protegidos pela Playrix).
> Segue a mesma *linguagem visual* (cartoon colorido, botões "gordos", feedback
> constante) com arte própria. Moedas virtuais sem valor monetário real — evita a
> classificação como jogo de azar (SRIJ).

## Como jogar / correr

Sem build e sem dependências:

```bash
# opção 1: abrir diretamente
open index.html          # macOS
xdg-open index.html      # Linux

# opção 2: servidor local (recomendado para testar no telemóvel)
npx serve .              # ou: python3 -m http.server 8080
```

No telemóvel, abre o URL na mesma rede (ex.: `http://<ip-do-pc>:8080`).

## O que está implementado

| Sistema | Detalhes |
|---|---|
| **Ronda da Vaca** (canvas) | Grelha 6×6, fase de apostas 10s (50 🪙/lote, máx. 2), 5 bots, pastoreio 30s com **couve** (atrai) e **chocalho** (espanta), barra de digestão, evento final cómico, pote + consolação |
| **Match-3 da Quinta** | Níveis progressivos (meta e jogadas crescem), cascatas, especiais: 4 em linha = chocalho (↔/↕), L/T = bomba 💥, 5 = pote de leite 🌈, baralhamento automático |
| **Vidas** | 5 máx., −1 ao falhar um nível, regeneração 1/30 min (persistente) |
| **A Quinta** | 10 decorações compradas com ⭐ (ganhas no Match-3), vaca equipada visível na cena |
| **Loja** | Skins (Frísia, Minhota, Dourada, Alien, Campeã) + acessórios (chapéu, boné, boina, óculos, sino, laço) com preview em SVG |
| **Calendário diário** | 30 dias progressivos; dia 7 = óculos, dia 14 = ferradura, dia 22 = sino, dia 30 = skin "Campeã" + 500 🪙; falhar um dia reinicia a sequência |
| **Economia** | 500 🪙 iniciais, vitória no pote, consolação +10, anúncio recompensado **simulado** (+150), "Subsídio do Pastor" (+100) quando fica sem moedas |
| **Idiomas** | PT-PT (padrão) e EN via dicionários separados (`js/i18n.js`), pronto para ES |
| **Persistência** | `localStorage` (moedas, estrelas, progresso, inventário, calendário) |

## Estrutura

```
index.html          # ecrãs e topbar
css/style.css       # tema cartoon mobile-first
assets/             # arte gerada por IA (vaca, peças, fundos)
js/state.js         # estado persistente + vidas
js/i18n.js          # dicionários pt-PT / en
js/cowsvg.js        # vaca (sprite IA + fallback SVG, skins por filtro CSS)
js/assets.js        # carregador de assets com fallback emoji/SVG
js/match3.js        # motor Match-3
js/cowdrop.js       # Ronda da Vaca (canvas)
js/farm.js          # quinta decorável
js/shop.js          # loja de cosméticos
js/calendar.js      # calendário de 30 dias
js/main.js          # navegação, modais, init
```

## Arte (assets)

Imagens geradas por IA (Black Forest/FLUX) em estilo cartoon casual:
`bg-field.jpg` (arena da vaca), `bg-farm.jpg` (quinta/hero), `cow.png`
(sprite recortado com transparência) e `piece-*.png` (peças do Match-3).
O processamento (chave cromática do fundo magenta por flood-fill a partir
das bordas + fatiamento por componentes conexos) foi feito offline e as
imagens finais são embarcadas no repo. Se algum asset falhar ao carregar,
o jogo usa automaticamente o fallback emoji/SVG.

Skins: aplicadas como filtros CSS sobre o sprite (sepia/hue-rotate) —
solução de protótipo; a versão final deve ter sprites por skin desenhados
ou gerados individualmente para máxima qualidade.

## Roadmap sugerido

1. **Fase 2** — multijogador real: Node.js + Socket.io (sincronizar posição da vaca
   e lotes); a vaca da sala passa a ser a do **anfitrião** (+5% de comissão do pote).
2. **Wrap nativo** — Capacitor para iOS/Android.
3. **Monetização real** — SDK de rewarded ads (AdMob/LevelPlay) no lugar do anúncio
   simulado; IAP de ferraduras douradas.
4. **Social** — amigos por código, visita à quinta, envio de feno (1 vida/dia).
5. **ES** como terceiro idioma; mensagens rápidas pré-definidas no chat.
