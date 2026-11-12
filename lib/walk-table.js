/* 「들어가는 곳」 첫 화면 — 주기율표(2026-11-12, 옛 hall.html 의 칸 배치 그대로). 118칸 중 나라가 된 칸만 분류 색으로 빛나고(④ 숨쉬기) 나머지는 흐리다.
   칸은 폴드 덮개에서 16px 남짓이라 누르기는 표 한 곳에서 받아 가장 가까운 나라를 잡는다(walk-core nearestNation) — 흐린 칸 위를 눌러도 된다.
   고르면 그 칸에 불꽃(④)이 튀고 아래에 큰 나라 카드: 「들어가기」(궤도 — 이 기기에 기억된 보기면 그 보기) · 「목록」. 역사는 고를 때 늘지 않고, Esc 로 닫힌다 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';
import { spark, markFrom } from './walk-fx.js?v=4';

const R = window.AtelierWalk, W = window.W;
export const CATS = ['alkali', 'alkaline_earth', 'transition', 'post_transition', 'metalloid', 'nonmetal', 'halogen', 'noble_gas', 'lanthanide', 'actinide'];
/* 이 기기에 기억된 보기(껍데기 lib/walk.js 가 element_dex_v1 에 쓴다) */
const prefMode = () => { try { return (JSON.parse(localStorage.getItem('element_dex_v1') || '{}') || {}).mode || ''; } catch (e) { return ''; } };

function NationCard({ n, el, onEnter, onList, onClose }) {
  const fam = n.families || [], cit = fam.reduce((s, f) => s + (f.citizens || []).length, 0);
  return h('section', { class: 'w-ncard', 'data-n': n.key, 'data-cat': el.category, 'aria-label': el.ko },
    h('button', { type: 'button', class: 'w-ncard-x', 'aria-label': W('tool.close'), onClick: onClose }, '×'),
    h('p', { class: 'w-ncard-sym' }, h('b', null, el.symbol), h('small', null, el.number)),
    h('div', { class: 'w-ncard-text' },
      h('h2', null, el.ko, h('small', null, el.en)),
      h('p', { class: 'w-ncard-cat' }, W('cat.' + el.category)),
      h('p', { class: 'w-ncard-persona' }, n.persona),
      h('p', { class: 'w-ncard-counts' }, W('walk.counts', { f: fam.length, c: cit }))),
    h('div', { class: 'w-ncard-acts' },
      h('button', { type: 'button', class: 'main', 'data-act': 'enter', onClick: onEnter }, W('walk.enter')),
      h('button', { type: 'button', 'data-act': 'list', onClick: onList }, W('walk.list'))));
}

export function TableLayer({ doc, route, go }) {
  const d = doc.d, [sel, setSel] = useState(null), tbl = useRef(null);
  const on = new Set(d.nations.map(n => n.key)), byNum = new Map(d.elements.map(e => [e.number, e]));
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
    setSel(key); spark(cellOf(key));
  };
  const cell = (e, f) => {
    if (!e) return h('span', { class: 'gap' });
    const lit = on.has(e.key), a = { key: e.number, class: 'pcell' + (lit ? ' on' : '') + (f ? ' f' : ''), 'data-cat': e.category };
    const body = [h('small', null, e.number), h('b', null, e.symbol)];
    return lit ? h('button', { ...a, type: 'button', 'data-n': e.key, 'aria-label': e.ko + ' ' + e.en, 'aria-pressed': sel === e.key }, body) : h('span', { ...a, 'aria-hidden': 'true' }, body);
  };
  /* 번호 → (줄, 열). 란타넘 · 악티늄족(족 없음)은 아래 두 줄 */
  const main = []; for (let p = 1; p <= 7; p++) for (let g = 1; g <= 18; g++) main.push(cell(d.elements.find(x => x.period === p && x.group === g)));
  const fblock = []; for (const [a, b] of [[57, 71], [89, 103]]) { fblock.push(h('span', { class: 'gap' }), h('span', { class: 'gap' }), h('span', { class: 'gap' })); for (let i = a; i <= b; i++) fblock.push(cell(byNum.get(i), true)); }
  const n = sel && d.nations.find(x => x.key === sel), el = n && d.elements.find(x => x.key === sel);
  return h('section', { class: 'w-layer w-table-layer', 'data-layer': 'table' },
    h('p', { class: 'w-note' }, W('walk.table.note')),
    h('div', { class: 'w-table', ref: tbl, onClick: pickAt },
      h('div', { class: 'ptable' }, main), h('div', { class: 'ptable ptable-f' }, fblock)),
    n && h(NationCard, { n, el, onClose: () => setSel(null),
      onEnter: () => { markFrom(cellOf(n.key)); go({ n: n.key, mode: route.mode || prefMode() || 'orbit' }); },
      onList: () => go({ n: n.key, mode: 'list' }) }),
    h('ul', { class: 'w-legend', 'aria-label': W('walk.legend') }, CATS.map(k => h('li', { key: k, 'data-cat': k }, h('i', { 'aria-hidden': 'true' }), W('cat.' + k)))));
}
