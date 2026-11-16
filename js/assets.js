/* Assets gerados por IA (pré-processados: fundo magenta removido, peças fatiadas).
   Se o carregamento falhar, o jogo usa o fallback emoji/SVG. */
const ASSETS = {
  ready: null, ok: false,
  cowImg: null, cowURL: null,
  pieceURLs: [],
  bgField: null, bgFarm: null,

  load() {
    if (this.ready) return this.ready;
    this.ready = this._load();
    return this.ready;
  },

  async _load() {
    try {
      const names = ['couve', 'milho', 'leite', 'cenoura', 'maca'];
      const [cow, bgField, bgFarm, ...pieces] = await Promise.all([
        this._img('assets/cow.png'),
        this._img('assets/bg-field.jpg'),
        this._img('assets/bg-farm.jpg'),
        ...names.map(n => this._img('assets/piece-' + n + '.png'))
      ]);
      this.cowImg = cow;
      this.cowURL = cow.src;
      this.bgField = bgField;
      this.bgFarm = bgFarm;
      this.pieceURLs = pieces.map(p => p.src);
      this.ok = true;
    } catch (e) {
      console.warn('Assets: fallback para emoji/SVG', e);
      this.ok = false;
    }
    return this.ok;
  },

  _img(src) {
    return new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
  }
};
