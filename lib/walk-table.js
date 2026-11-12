/* 「들어가는 곳」 첫 화면 — 주기율표(지도) + 나라 판(2026-11-13). 118칸 중 나라가 된 칸만 분류 색으로 빛난다(④ 숨쉬기) — 그림이 있으면 칠한 칸, 설계만 있으면 테두리만(.bare).
   칸은 폴드 덮개에서 16px 남짓이고 나라가 마흔일곱이라 표에서는 정확히 누르기 어렵다 → 누르는 곳은 아래 나라 판: 갈래마다 큰 타일(기호 · 이름 · 세계 그림 채운/채울 · 일상컷 · 세계 셋 막대).
   표를 누르면 가장 가까운 나라(walk-core nearestNation)가 골라지고 판의 그 타일로 내려간다. 고르면 타일 줄 아래에 나라 카드: 세계별 장수 · 「들어가기」(궤도 — 기억된 보기면 그 보기) · 「목록」.
   판 위 거르개: 전부 · 그림 있음 · 그림 없음. 역사는 고를 때 늘지 않고, Esc 로 닫힌다 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';
import { spark, markFrom } from './walk-fx.js?v=6';
import { tally } from './walk-data.js?v=5';

const R = window.AtelierWalk, W = window.W;
export const CATS = ['alkali', 'alkaline_earth', 'transition', 'post_transition', 'metalloid', 'nonmetal', 'halogen', 'noble_gas', 'lanthanide', 'actinide'];
/* 이 기기에 기억된 보기(껍데기 lib/walk.js 가 element_dex_v1 에 쓴다) */
const prefMode = () => { try { return (JSON.parse(localStorage.getItem('element_dex_v1') || '{}') || {}).mode || ''; } catch (e) { return ''; } };
const hasArt = t => t.done > 0 || t.casual > 0;

function NationCard({ n, el, t, worlds, onEnter, onList, onClose }) {
  const fam = n.families || [], cit = fam.reduce((s, f) => s + (f.citizens || []).length, 0);
  return h('section', { class: 'w-ncard', 'data-n': n.key, 'data-cat': el.category, 'aria-label': el.ko },
    h('button', { type: 'button', class: 'w-ncard-x', 'aria-label': W('tool.close'), onClick: onClose }, '×'),
    h('p', { class: 'w-ncard-sym' }, h('b', null, el.symbol), h('small', null, el.number)),
    h('div', { class: 'w-ncard-text' },
      h('h2', null, el.ko, h('small', null, el.en)),
      h('p', { class: 'w-ncard-cat' }, W('cat.' + el.category)),
      h('p', { class: 'w-ncard-persona' }, n.persona),
      h('p', { class: 'w-ncard-counts' }, W('walk.counts', { f: fam.length, c: cit }))),
    h('dl', { class: 'w-ncard-tally' },
      worlds.map(w => h('div', { key: w, 'data-w': w }, h('dt', null, W('world.' + w)), h('dd', null, t.have[w] + ' / ' + t.need[w]))),
      h('div', { 'data-w': 'casual' }, h('dt', null, W('dex.casual')), h('dd', null, t.casual))),
    h('div', { class: 'w-ncard-acts' },
      h('button', { type: 'button', class: 'main', 'data-act': 'enter', onClick: onEnter }, W('walk.enter')),
      h('button', { type: 'button', 'data-act': 'list', onClick: onList }, W('walk.list'))));
}

export function TableLayer({ doc, route, go }) {
  const d = doc.d, [sel, setSel] = useState(null), [flt, setFlt] = useState('all'), tbl = useRef(null), worlds = d.vocab.worlds;
  const byKey = useMemo(() => new Map(d.elements.map(e => [e.key, e])), [d]), byNum = new Map(d.elements.map(e => [e.number, e]));
  const T = useMemo(() => new Map(d.nations.map(n => [n.key, tally(doc, n)])), [doc]);
  useEffect(() => {
    if (!sel) return;
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
    setFlt('all'); setSel(key); spark(cellOf(key));
  };
  const cell = (e, f) => {
    if (!e) return h('span', { class: 'gap' });
    const t = T.get(e.key), a = { key: e.number, class: 'pcell' + (t ? ' on' : '') + (t && !hasArt(t) ? ' bare' : '') + (f ? ' f' : ''), 'data-cat': e.category };
    const body = [h('small', null, e.number), h('b', null, e.symbol)];
    return t ? h('button', { ...a, type: 'button', 'data-n': e.key, 'aria-label': e.ko + ' ' + e.en, 'aria-pressed': sel === e.key }, body) : h('span', { ...a, 'aria-hidden': 'true' }, body);
  };
  /* 번호 → (줄, 열). 란타넘 · 악티늄족(족 없음)은 아래 두 줄 */
  const main = []; for (let p = 1; p <= 7; p++) for (let g = 1; g <= 18; g++) main.push(cell(d.elements.find(x => x.period === p && x.group === g)));
  const fblock = []; for (const [a, b] of [[57, 71], [89, 103]]) { fblock.push(h('span', { class: 'gap' }), h('span', { class: 'gap' }), h('span', { class: 'gap' })); for (let i = a; i <= b; i++) fblock.push(cell(byNum.get(i), true)); }

  const nHas = d.nations.filter(n => hasArt(T.get(n.key))).length, show = n => flt === 'all' || (flt === 'has') === hasArt(T.get(n.key));
  const fbtn = (k, n) => h('button', { type: 'button', 'data-f': k, 'aria-pressed': flt === k, onClick: () => { setFlt(k); setSel(null); } }, W('walk.f.' + k, { n }));
  const tile = n => {
    const el = byKey.get(n.key), t = T.get(n.key);
    return [h('button', { key: n.key, type: 'button', class: 'w-tile' + (hasArt(t) ? '' : ' bare'), 'data-n': n.key, 'data-cat': el.category, 'aria-pressed': sel === n.key, 'aria-label': el.ko + ' ' + el.en,
      onClick: e => { if (sel === n.key) return setSel(null); setSel(n.key); spark(e.currentTarget); } },
      h('span', { class: 'nm' }, h('b', null, el.symbol), el.ko),
      h('span', { class: 'ct' }, W('walk.t.world', { a: t.done, b: t.all })),
      h('span', { class: 'ct' }, W('walk.t.casual', { n: t.casual })),
      h('span', { class: 'bar', 'aria-hidden': 'true' }, worlds.map(w => h('i', { key: w }, h('s', { style: { width: (t.need[w] ? 100 * t.have[w] / t.need[w] : 0) + '%' } }))))),
    sel === n.key && h(NationCard, { key: 'card', n, el, t, worlds, onClose: () => setSel(null),
      /* ① 의 출발 자리는 궤도로 들어갈 때만 넘긴다 — 목록으로 가면 받을 층이 없어 남았다가 나중에 엉뚱한 자리에서 터졌다(최종 검토 A3) */
      onEnter: () => { const mode = route.mode || prefMode() || 'orbit'; if (mode !== 'list') markFrom(document.querySelector('.w-tile[data-n="' + n.key + '"]')); go({ n: n.key, mode }); },
      onList: () => go({ n: n.key, mode: 'list' }) })];
  };
  const groups = CATS.map(c => { const ns = d.nations.filter(n => byKey.get(n.key).category === c && show(n)); if (!ns.length) return null;
    const a = ns.reduce((s, n) => s + T.get(n.key).done, 0), b = ns.reduce((s, n) => s + T.get(n.key).all, 0);
    return h('section', { key: c, class: 'w-group', 'data-cat': c },
      h('h3', null, h('i', { 'aria-hidden': 'true' }), W('cat.' + c), h('small', null, W('walk.group', { n: ns.length, a, b }))),
      h('div', { class: 'w-tiles' }, ns.map(tile))); });

  return h('section', { class: 'w-layer w-table-layer', 'data-layer': 'table' },
    h('p', { class: 'w-note' }, W('walk.table.note')),
    h('div', { class: 'w-table', ref: tbl, onClick: pickAt },
      h('div', { class: 'ptable' }, main), h('div', { class: 'ptable ptable-f' }, fblock)),
    h('ul', { class: 'w-legend', 'aria-label': W('walk.legend') }, CATS.map(k => h('li', { key: k, 'data-cat': k }, h('i', { 'aria-hidden': 'true' }), W('cat.' + k)))),
    h('div', { class: 'w-board' },
      h('div', { class: 'w-filter', role: 'group', 'aria-label': W('walk.board') }, fbtn('all', d.nations.length), fbtn('has', nHas), fbtn('none', d.nations.length - nHas)),
      groups));
}
