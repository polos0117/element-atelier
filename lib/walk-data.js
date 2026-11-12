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
/* ── 목록 · 한 장(옛 dex.html 의 같은 이름 함수를 옮김, 몸은 그대로) — 고른 화풍 하나만 본다(pick 처럼 다른 화풍 · 세계로 메우지 않는다) ── */
/* 고르개 차례 — 기본 화풍이 먼저, 나머지는 style.json 차례 */
export const styleList = doc => [doc.s.default, ...Object.keys(doc.s.styles || {}).filter(k => k !== doc.s.default)];
/* 그 화풍의 세계 그림 한 장 — 없으면 null(다른 화풍으로 메우지 않는다) */
export function fileOf(doc, key, world, style) {
  const e = doc.img[key]; if (!e) return null;
  const b = IMG.styleMap(e)[style || doc.s.default]; if (!b) return null;
  const f = IMG.formMap(b)[world]; return f && f.f || null;
}
/* 한 화풍 안에서 카드의 그림 전부 — 한 장이 이 차례로 넘긴다: 세계 그림 → 일상컷(세계마다 번호) */
export function picsOf(doc, card, st) {
  const W = window.W, all = doc.d.vocab.worlds, out = [], style = st || doc.s.default;
  for (const w of all) { if (!card.worlds.includes(w)) continue; const f = fileOf(doc, card.key, w, style); if (f) out.push({ file: f, kind: 'world', world: w, label: W('world.' + w) }); }
  const e = doc.img[card.key], b = e && IMG.styleMap(e)[style];
  if (b) { const seen = {}; for (const c of IMG.casualsOf(b, all, 'f')) { const wk = c.world || ''; seen[wk] = (seen[wk] || 0) + 1;
    out.push({ file: c.file, kind: 'casual', world: wk, label: (wk ? W('world.' + wk) : W('dex.casual.draft')) + ' ' + seen[wk], long: W('dex.casual') + ' · ' + (wk ? W('world.' + wk) : W('dex.casual.draft')) + ' ' + seen[wk] }); } }
  return out;
}
/* 그 그림이 든 화풍 — 즐겨찾기 link · 궤도 · 가문에서 올 때 고르개를 옮긴다 */
export const styleOfPic = (doc, card, file) => styleList(doc).find(s => picsOf(doc, card, s).some(p => p.file === file)) || null;
