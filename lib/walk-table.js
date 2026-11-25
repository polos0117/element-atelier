/* 「들어가는 곳」 첫 화면 — 주기율표(지도) + 나라 판(2026-11-13). 118칸 중 나라가 된 칸만 분류 색으로 빛난다(④ 숨쉬기) — 그림이 있으면 칠한 칸, 설계만 있으면 테두리만(.bare).
   칸은 폴드 덮개에서 16px 남짓이고 나라가 마흔일곱이라 표에서는 정확히 누르기 어렵다 → 누르는 곳은 아래 나라 판: 갈래마다 큰 타일(기호 · 이름 · 세계 그림 채운/채울 · 일상컷 · 세계 셋 막대).
   표를 누르면 가장 가까운 나라(walk-core nearestNation)가 골라지고 판의 그 타일로 내려간다. 고르면 타일 줄 아래에 나라 카드: 세계별 장수 · 「들어가기」(궤도 — 기억된 보기면 그 보기) · 「목록」.
   판 위 거르개: 전부 · 그림 있음 · 그림 없음. 역사는 고를 때 늘지 않고, Esc 로 닫힌다.
   신규 생성(2026-11-15 — 최근 1일 안에 등록된 기본 화풍 그림, walk-data freshOf): 표 칸은 흰 빛 테두리 · 점(.new), 범례 맨 앞 「신규 생성」,
   나라 판의 알칼리 금속 위에 「신규 생성」 묶음(가장 늦게 등록된 나라부터 — 시간순), 갈래 묶음의 타일에도 N 배지 · 흰 테두리.
   주민 · 가문주는 표에 칸이 없어 타일의 「근본 · 가문주 · 주민」 수와 나라 카드의 새 그림 카드 이름으로 보인다. 한 나라가 두 묶음에 나오므로 고른 나라는 (나라, 묶음)으로 기억한다 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';
import { spark, markFrom, loadPixi } from './walk-fx.js?v=6';
import { vistaOf } from './walk-orbit.js?v=9';
import { enterWithSplash, clause, seen } from './splash.js?v=1';
import { tally, freshOf } from './walk-data.js?v=7';

const R = window.AtelierWalk, W = window.W, IMG = window.AtelierImg, SPLASH = 'element_splash_v1';   /* 로딩 화면을 이 탭에서 본 자리 */
export const CATS = ['alkali', 'alkaline_earth', 'transition', 'post_transition', 'metalloid', 'nonmetal', 'halogen', 'noble_gas', 'lanthanide', 'actinide'];
/* 이 기기에 기억된 보기(껍데기 lib/walk.js 가 element_dex_v1 에 쓴다) */
const prefMode = () => { try { return (JSON.parse(localStorage.getItem('element_dex_v1') || '{}') || {}).mode || ''; } catch (e) { return ''; } };
const hasArt = t => t.done > 0 || t.casual > 0;
/* 목록의 보기 기억(world · casual · all) — 지도에서 주기율표 · 나라로 갈 때 되살린다(view=map 은 기억하지 않는다) */
export const prefView = () => { try { const v = (JSON.parse(localStorage.getItem('element_dex_v1') || '{}') || {}).view || ''; return v === R.MAP ? '' : v; } catch (e) { return ''; } };

/* 첫 화면 보기 — 주기율표 · 지도(2026-11-24). 옆으로 가는 것이라 역사 칸을 만들지 않는다. 주기율표가 첫 화면(DESIGN — 지도는 판타지만 있다) */
export function FirstView({ route, go }) {
  const on = route.view === R.MAP ? 'map' : 'table';
  return h('div', { class: 'w-first', role: 'group', 'aria-label': W('walk.first') }, ['table', 'map'].map(k =>
    h('button', { key: k, type: 'button', 'data-first': k, 'aria-pressed': on === k, onClick: () => { if (on !== k) go({ view: k === 'map' ? R.MAP : prefView() }, { replace: true }); } }, W('first.' + k))));
}

/* 나라로 들어가기 — 나라 카드 「들어가기」와 지도의 나라 표시가 같이 쓴다. 궤도로 가면 ① 의 출발 자리(from)를 넘기고,
   그 나라 그 세계에 전경이 있으면 들어갈 때 로딩 화면(lib/splash.js). patch 는 주소에 더할 것(지도에서는 목록 보기 기억 view) */
export function enterNation({ doc, route, go, n, from, patch }) {
  const el = doc.d.elements.find(e => e.key === n.key), worlds = doc.d.vocab.worlds;
  const mode = route.mode || prefMode() || 'orbit'; if (mode !== 'list' && from) markFrom(from);
  /* 들어갈 때 로딩 화면(2026-11-24, lib/splash.js) — 궤도로 들어가고 그 나라 그 세계에 전경이 있으면 「Fe 26 · 철」 · 세계 · 성격 첫 마디 · 빛 입자를 1.6초쯤 띄우고 그 뒤에서 들어간다.
     이 탭에서 그 나라 그 세계는 한 번만(element_splash_v1), 움직임 끔 · 전경 없음 · 그림이 600ms 안에 안 오면 그냥 들어간다. 끝나면 초점은 나라 이름으로 */
  const w = R.worldOf(route, worlds), v = mode !== 'list' && vistaOf(doc, n.key, w, route.st), wn = W('world.' + w);
  enterWithSplash({ url: v && IMG.imgURL(v), id: n.key + '|' + w, store: SPLASH, motion: R.motionOn(), world: w, kicker: wn,
    title: [{ text: el.symbol, cls: 'sp-sym', cat: el.category }, { text: String(el.number), cls: 'sp-num' }, { text: '·', cls: 'sp-dot' }, { text: el.ko }],
    n: Math.ceil(el.symbol.length * .65 + 1.7 + el.ko.length), line: clause(n.persona), live: W('splash.live', { world: wn, nation: el.ko }), skip: W('splash.skip'), loadPixi,
    go: () => go(Object.assign({ n: n.key, mode }, patch || {})),
    done: () => { const t = document.querySelector('.w-vtitle h1'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } } });
}

/* 전경 미리 받기(2026-11-25 — 지도 · 나라 카드에서 처음 누를 때도 로딩 화면이 600ms 규칙에 걸려 빠지지 않게). 나라가 보이는 순간(지도의 지역 · 판, 나라 카드 열기)과
   나라 표시에 손 · 초점이 닿을 때 — 로딩 화면이 나올 자리(궤도로 · 움직임 켬 · 이 탭에서 처음)일 때만, 낮은 우선으로 한 번. 데이터 절약(saveData)이면 받지 않는다 */
const PRE = new Map();
export function prefetchVista(doc, route, n) {
  try { const c = navigator.connection; if (c && c.saveData) return; } catch (e) {}
  if (!n || !R.motionOn() || (route.mode || prefMode() || 'orbit') === 'list') return;
  const w = R.worldOf(route, doc.d.vocab.worlds), v = vistaOf(doc, n.key, w, route.st); if (!v || seen(SPLASH, n.key + '|' + w)) return;
  const url = IMG.imgURL(v); if (PRE.has(url)) return;
  const im = new Image(); im.decoding = 'async'; try { im.fetchPriority = 'low'; } catch (e) {}
  im.src = url; PRE.set(url, im);
}

function NationCard({ n, el, t, fr, worlds, onEnter, onList, onClose }) {
  const fam = n.families || [], cit = fam.reduce((s, f) => s + (f.citizens || []).length, 0);
  return h('section', { class: 'w-ncard', 'data-n': n.key, 'data-cat': el.category, 'aria-label': el.ko },
    h('button', { type: 'button', class: 'w-ncard-x', 'aria-label': W('tool.close'), onClick: onClose }, '×'),
    h('p', { class: 'w-ncard-sym' }, h('b', null, el.symbol), h('small', null, el.number)),
    h('div', { class: 'w-ncard-text' },
      h('h2', null, el.ko, h('small', null, el.en)),
      h('p', { class: 'w-ncard-cat' }, W('cat.' + el.category)),
      h('p', { class: 'w-ncard-persona' }, n.persona),
      h('p', { class: 'w-ncard-counts' }, W('walk.counts', { f: fam.length, c: cit })),
      fr && fr.count > 0 && h('p', { class: 'w-ncard-new' }, W('walk.ncard.new', { list: fr.cards.map(c => c.name + ' ' + c.n).join(' · ') }))),
    h('dl', { class: 'w-ncard-tally' },
      worlds.map(w => h('div', { key: w, 'data-w': w }, h('dt', null, W('world.' + w)), h('dd', null, t.have[w] + ' / ' + t.need[w]))),
      h('div', { 'data-w': 'casual' }, h('dt', null, W('dex.casual')), h('dd', null, t.casual))),
    h('div', { class: 'w-ncard-acts' },
      h('button', { type: 'button', class: 'main', 'data-act': 'enter', onClick: onEnter }, W('walk.enter')),
      h('button', { type: 'button', 'data-act': 'list', onClick: onList }, W('walk.list'))));
}

export function TableLayer({ doc, route, go, notice }) {
  const d = doc.d, [pick, setPick] = useState(null), [flt, setFlt] = useState('all'), tbl = useRef(null), worlds = d.vocab.worlds;
  const sel = pick && pick.n, setSel = (k, g) => setPick(k ? { n: k, g: g || '' } : null);   /* 고른 나라와 그 타일이 있는 묶음(신규 생성 · 제 갈래) */
  const byKey = useMemo(() => new Map(d.elements.map(e => [e.key, e])), [d]), byNum = new Map(d.elements.map(e => [e.number, e]));
  const T = useMemo(() => new Map(d.nations.map(n => [n.key, tally(doc, n)])), [doc]);
  const F = useMemo(() => new Map(d.nations.map(n => [n.key, freshOf(doc, n)])), [doc]), isNew = k => { const f = F.get(k); return !!(f && f.count); };
  useEffect(() => {
    if (!sel) return;
    prefetchVista(doc, route, d.nations.find(n => n.key === sel));   /* 「들어가기」 전에 전경을 받아 둔다 */
    const card = document.querySelector('.w-ncard'); if (card) card.scrollIntoView({ block: 'nearest' });
    const k = e => { if (e.key === 'Escape') setSel(null); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [sel]);
  const cellOf = key => tbl.current && tbl.current.querySelector('.pcell.on[data-n="' + key + '"]');
  const pickAt = e => {
    const own = e.target.closest && e.target.closest('.pcell.on');
    let key = own ? own.dataset.n : null;
    if (!key) {
      const cells = [...tbl.current.querySelectorAll('.pcell.on')].map(c => { const r = c.getBoundingClientRect(); return { key: c.dataset.n, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; });
      key = cells.length ? R.nearestNation(cells, e.clientX, e.clientY, 1.5 * cells[0].w) : null;
    }
    if (!key) return;
    setFlt('all'); setSel(key, byKey.get(key).category); spark(cellOf(key));   /* 표에서 고르면 제 갈래 묶음의 타일 아래로 */
  };
  const cell = (e, f) => {
    if (!e) return h('span', { class: 'gap' });
    const t = T.get(e.key), a = { key: e.number, class: 'pcell' + (t ? ' on' : '') + (t && !hasArt(t) ? ' bare' : '') + (t && isNew(e.key) ? ' new' : '') + (f ? ' f' : ''), 'data-cat': e.category };
    const body = [h('small', null, e.number), h('b', null, e.symbol)];
    return t ? h('button', { ...a, type: 'button', 'data-n': e.key, 'aria-label': e.ko + ' ' + e.en, 'aria-pressed': sel === e.key }, body) : h('span', { ...a, 'aria-hidden': 'true' }, body);
  };
  /* 번호 → (줄, 열). 란타넘 · 악티늄족(족 없음)은 아래 두 줄 */
  const main = []; for (let p = 1; p <= 7; p++) for (let g = 1; g <= 18; g++) main.push(cell(d.elements.find(x => x.period === p && x.group === g)));
  const fblock = []; for (const [a, b] of [[57, 71], [89, 103]]) { fblock.push(h('span', { class: 'gap' }), h('span', { class: 'gap' }), h('span', { class: 'gap' })); for (let i = a; i <= b; i++) fblock.push(cell(byNum.get(i), true)); }

  const nHas = d.nations.filter(n => hasArt(T.get(n.key))).length, show = n => flt === 'all' || (flt === 'has') === hasArt(T.get(n.key));
  const fbtn = (k, n) => h('button', { type: 'button', 'data-f': k, 'aria-pressed': flt === k, onClick: () => { setFlt(k); setSel(null); } }, W('walk.f.' + k, { n }));
  const tile = (n, g) => {
    const el = byKey.get(n.key), t = T.get(n.key), fr = F.get(n.key), nw = !!fr.count, on = sel === n.key && pick.g === g;
    const tiers = ['root', 'lord', 'citizen'].filter(k => fr[k]).map(k => W('walk.tier.' + k, { n: fr[k] })).join(' · ');
    return [h('button', { key: n.key, type: 'button', class: 'w-tile' + (hasArt(t) ? '' : ' bare') + (nw ? ' new' : ''), 'data-n': n.key, 'data-g': g, 'data-cat': el.category, 'aria-pressed': on, 'aria-label': el.ko + ' ' + el.en + (nw ? ' · ' + W('walk.t.new', { n: fr.count }) : ''),
      onClick: e => { if (on) return setSel(null); setSel(n.key, g); spark(e.currentTarget); } },
      nw && h('span', { class: 'w-new', title: W('dex.new.title'), 'aria-hidden': 'true' }, W('dex.new')),
      h('span', { class: 'nm' }, h('b', null, el.symbol), el.ko),
      g === 'new' ? h('span', { class: 'ct new-ct' }, W('walk.t.new', { n: fr.count })) : h('span', { class: 'ct' }, W('walk.t.world', { a: t.done, b: t.all })),
      g === 'new' ? h('span', { class: 'ct new-tiers' }, tiers) : h('span', { class: 'ct' }, W('walk.t.casual', { n: t.casual })),
      h('span', { class: 'bar', 'aria-hidden': 'true' }, worlds.map(w => h('i', { key: w }, h('s', { style: { width: (t.need[w] ? 100 * t.have[w] / t.need[w] : 0) + '%' } }))))),
    on && h(NationCard, { key: 'card', n, el, t, fr, worlds, onClose: () => setSel(null),
      /* ① 의 출발 자리는 궤도로 들어갈 때만 넘긴다 — 목록으로 가면 받을 층이 없어 남았다가 나중에 엉뚱한 자리에서 터졌다(최종 검토 A3). 로딩 화면은 enterNation */
      onEnter: () => enterNation({ doc, route, go, n, from: document.querySelector('.w-tile[data-n="' + n.key + '"][data-g="' + g + '"]') }),
      onList: () => go({ n: n.key, mode: 'list' }) })];
  };
  const groups = CATS.map(c => { const ns = d.nations.filter(n => byKey.get(n.key).category === c && show(n)); if (!ns.length) return null;
    const a = ns.reduce((s, n) => s + T.get(n.key).done, 0), b = ns.reduce((s, n) => s + T.get(n.key).all, 0);
    return h('section', { key: c, class: 'w-group', 'data-cat': c },
      h('h3', null, h('i', { 'aria-hidden': 'true' }), W('cat.' + c), h('small', null, W('walk.group', { n: ns.length, a, b }))),
      h('div', { class: 'w-tiles' }, ns.map(n => tile(n, c)))); });
  /* 신규 생성 묶음 — 알칼리 금속 위, 가장 늦게 등록된 나라부터(시간순). 「그림 없음」 거르개에선 없다 */
  const fresh = d.nations.filter(n => isNew(n.key)).sort((a, b) => F.get(b.key).latest - F.get(a.key).latest);
  if (fresh.length && flt !== 'none') groups.unshift(h('section', { key: 'new', class: 'w-group w-group-new', 'data-cat': 'new' },
    h('h3', null, h('i', { 'aria-hidden': 'true' }), W('cat.new'), h('small', null, W('walk.group.new', { n: fresh.length, a: fresh.reduce((s, n) => s + F.get(n.key).count, 0) }))),
    h('div', { class: 'w-tiles' }, fresh.map(n => tile(n, 'new')))));

  /* notice — 지도가 아직 없는 세계에서 지도 보기를 고르면 지도 층이 「준비 중」 한 줄과 이 표를 그린다(lib/walk-map.js) */
  return h('section', { class: 'w-layer w-table-layer', 'data-layer': 'table' },
    h(FirstView, { route, go }), notice || null,
    h('p', { class: 'w-note' }, W('walk.table.note')),
    h('div', { class: 'w-table', ref: tbl, onClick: pickAt },
      h('div', { class: 'ptable' }, main), h('div', { class: 'ptable ptable-f' }, fblock)),
    h('ul', { class: 'w-legend', 'aria-label': W('walk.legend') }, ['new'].concat(CATS).map(k => h('li', { key: k, 'data-cat': k }, h('i', { 'aria-hidden': 'true' }), W('cat.' + k)))),
    h('div', { class: 'w-board' },
      h('div', { class: 'w-filter', role: 'group', 'aria-label': W('walk.board') }, fbtn('all', d.nations.length), fbtn('has', nHas), fbtn('none', d.nations.length - nHas)),
      groups));
}
