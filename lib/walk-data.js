/* 「들어가는 곳」 자료 — 설계표 · 화풍 판 · 그림 등록부를 한 번 읽는다(옛 gallery.html useDocs 의 Promise 그대로). window.AtelierImg 를 쓴다 */
const IMG = window.AtelierImg;
const json = u => fetch(u, { cache: 'no-cache' }).then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))));

export function loadDocs() {
  return Promise.all([
    json('data/element-design.json'),
    json('data/style.json'),
    fetch(IMG.DATA, { cache: 'no-cache' }).then(r => r.ok ? r.json() : { img: {} }).catch(() => ({ img: {} }))
  ]).then(([d, s, i]) => { IMG.setShards(i); IMG.setAdded(i); return { d, s, img: i.img || {} }; }).catch(() => ({ failed: true }));
}

/* 한 나라의 카드 — 근본 → 가문마다 가문주 → 그 주민(옛 도감 cardsOf 와 같은 이름 규칙). 층들이 같이 쓴다 */
export function cardsOf(doc, n) {
  const d = doc.d, el = d.elements.find(x => x.key === n.key) || {}, all = d.vocab.worlds, W = window.W;
  const out = [{ key: n.key, tier: 'root', name: el.ko, en: el.en, worlds: all, nation: n, family: null, citizen: null, el }];
  for (const f of n.families || []) {
    const fk = n.key + '-' + f.key;
    out.push({ key: fk, tier: 'lord', name: W('dex.lord.name', { family: f.ko }), en: f.en, worlds: all, nation: n, family: f, citizen: null, el });
    for (const c of f.citizens || []) out.push({ key: fk + '-' + c.key, tier: 'citizen', name: c.ko, en: c.en, worlds: c.worlds || [], nation: n, family: f, citizen: c, el });
  }
  return out;
}
/* 걸 그림 한 장 — 고른 화풍 → 다른 화풍(기본 먼저) 차례로 그 세계, 없으면 다른 세계(from: true). 없으면 null */
export function pick(doc, card, world, style) {
  const e = doc.img[card.key]; if (!e) return null;
  const sm = IMG.styleMap(e), order = [...new Set([style || doc.s.default, doc.s.default, ...Object.keys(sm)])].filter(k => sm[k]);
  for (const w of [world, ...doc.d.vocab.worlds.filter(x => x !== world)])
    for (const st of order) { const f = IMG.formMap(sm[st])[w]; if (f && f.f) return { file: f.f, world: w, style: st, from: w !== world }; }
  return null;
}
export const hasArt = (doc, card) => !!pick(doc, card, doc.d.vocab.worlds[0]);
