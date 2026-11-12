/* 「들어가는 곳」 나라 · 목록 층(2026-11-12, 설계 목표 3 · 물음 2 · 3 — 옛 dex.html 의 몸통 Nation · Card · WorldSlot · PicSlot · Toc 를 옮김).
   바뀐 것만: 위 원소 알약 줄 없음(주기율표가 고르는 판) · 조작 줄 두 줄(화풍 한 줄 · 보기 한 줄 — 옆으로 잘리지 않는다) · 세계 거르기는 막대의 세계 고르개(목록에선 「전부」가 붙는다) ·
   즐겨찾기 수는 도구 상자로 · 바로 가기 띠는 따로 위에 붙고 양끝이 흐리다 · 그림을 누르면 한 장 층(주소 ?card=&pic= — 뒤로 가기로 닫힘) · 보기 · 화풍은 주소만 바꿔 쓴다(기억은 껍데기).
   빈 칸은 그대로 생성기로(기본 화풍일 때만 — 생성기는 늘 기본 화풍으로 짓는다). ?at= 이면 그 칸으로 내려간다 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import { cardsOf, fileOf, styleList, picsOf } from './walk-data.js?v=3';
import { ModeSwitch } from './walk-orbit.js?v=6';

const W = window.W, IMG = window.AtelierImg, FAV = window.AtelierFavorites, A = 'element', VIEWS = ['world', 'casual', 'all'];
function useFavorites() { const [l, set] = useState(() => FAV ? FAV.list() : []); useEffect(() => FAV ? FAV.onChange(set) : undefined, []); return l; }
const styleName = (doc, k) => { const s = doc.s.styles && doc.s.styles[k]; return s && s.name || k; };
const sharedWith = (d, nation, family) => (family.elements || []).filter(k => k !== nation.key).map(k => { const n = d.nations.find(x => x.key === k); const f = n && (n.families || []).find(x => x.key === family.key); return f ? { nation: n, family: f, el: d.elements.find(e => e.key === k) } : null; }).filter(Boolean);
const Thumb = ({ file }) => h('img', { loading: 'lazy', src: IMG.thumbURL(file), alt: '', onError: e => { e.target.onerror = null; e.target.src = IMG.imgURL(file); } });
/* 세계 한 칸 — 그림이면 한 장, 사는데 그림이 없으면 생성기로(기본 화풍일 때만), 안 사는 세계는 작고 흐린 칸 */
function WorldSlot({ card, world, pic, onOpen, make }) {
  const ko = W('world.' + world);
  if (!card.worlds.includes(world)) return h('span', { class: 'slot dead', disabled: true, title: W('world.none') }, h('span', { class: 'face' }, h('span', { class: 'ph' }, W('world.none'))), h('span', { class: 'cap' }, ko));
  if (!pic && !make) return h('span', { class: 'slot empty', title: W('dex.style.empty') }, h('span', { class: 'face' }, h('span', { class: 'ph' }, W('art.missing'))), h('span', { class: 'cap' }, ko));
  if (!pic) return h('a', { class: 'slot', href: 'prompt.html?card=' + encodeURIComponent(card.key) + '&world=' + world, title: W('dex.prompt') }, h('span', { class: 'face' }, h('span', { class: 'ph' }, W('art.missing'))), h('span', { class: 'cap' }, ko));
  return h('button', { type: 'button', class: 'slot', onClick: () => onOpen(card, pic.file), title: W('dex.open') }, h('span', { class: 'face' }, h(Thumb, { file: pic.file })), h('span', { class: 'cap' }, ko));
}
const PicSlot = ({ card, pic, onOpen, cls }) => h('button', { type: 'button', class: 'slot' + (cls ? ' ' + cls : ''), onClick: () => onOpen(card, pic.file), title: pic.long || pic.label }, h('span', { class: 'face' }, h(Thumb, { file: pic.file })), h('span', { class: 'cap' }, pic.label));
/* 카드 하나 — 보기 · 세계 거르기와 접기를 따른다 */
function Card({ doc, card, view, wf, st, open, setOpen, onOpen, favs }) {
  const pics = picsOf(doc, card, st), inW = p => !wf || p.world === wf, make = st === doc.s.default;
  const worldsShown = doc.d.vocab.worlds.filter(w => !wf || w === wf);
  const casuals = pics.filter(p => p.kind === 'casual' && inW(p));
  const o = open[card.key] || {}, showCasual = view === 'casual' || view === 'all' || o.casual;
  const fav = pics.filter(p => favs.some(x => x.a === A && x.file === p.file)).length;
  const toggle = k => setOpen(Object.assign({}, open, { [card.key]: Object.assign({}, o, { [k]: !o[k] }) }));
  const head = h('div', { class: 'card-head' }, h('b', null, card.name), card.citizen && h('i', null, card.citizen.en), fav > 0 && h('span', { class: 'fav-mark', title: W('dex.fav.inCard', { n: fav }) }, '♥ ' + fav));
  const body = [];
  if (view !== 'casual') body.push(h('div', { key: 'w', class: 'worlds main' }, worldsShown.map(w => h(WorldSlot, { key: w, card, world: w, pic: pics.find(p => p.kind === 'world' && p.world === w), onOpen, make }))));
  if (view === 'world' && casuals.length) body.push(h('div', { key: 'm', class: 'more-row' },
    h('button', { type: 'button', class: 'more', 'aria-expanded': !!o.casual, 'data-more': 'casual', onClick: () => toggle('casual') }, W(o.casual ? 'dex.less.casual' : 'dex.more.casual', { n: casuals.length }))));
  if (showCasual && casuals.length) body.push(h('div', { key: 'cas', class: 'worlds casuals' }, casuals.map(p => h(PicSlot, { key: p.file, card, pic: p, onOpen }))));
  if (view === 'casual' && !casuals.length) body.push(h('p', { key: 'no', class: 'none-note' }, W('dex.casual.none')));
  const who = card.citizen && h('p', { class: 'obj' }, card.citizen.object && card.citizen.object.en);
  return h('article', { class: 'ek-card tier-' + card.tier, id: 'c-' + card.key, 'data-card': card.key }, h('div', { class: 'who' }, head, who), h('div', { class: 'body' }, body));
}
/* 조작 줄 — 두 줄(화풍 · 보기). 화풍 고르개의 수는 이 나라에서 그 화풍으로 등록된 세계 그림 장수 */
function Toc({ doc, cards, view, setView, st, setSt }) {
  const picN = s => cards.reduce((n, c) => n + c.worlds.filter(w => fileOf(doc, c.key, w, s)).length, 0);
  return h('div', { class: 'dex-toc' },
    h('div', { class: 'toc-row' },
      h('label', { class: 'style-pick' }, h('span', null, W('dex.style')),
        h('select', { id: 'dex-style', value: st, onChange: e => setSt(e.target.value) }, styleList(doc).map(s => h('option', { key: s, value: s }, W(s === doc.s.default ? 'dex.style.default' : 'dex.style.opt', { name: styleName(doc, s), n: picN(s) })))))),
    h('div', { class: 'toc-row' },
      h('div', { class: 'seg', role: 'group', 'aria-label': W('dex.view') }, VIEWS.map(v => h('button', { key: v, type: 'button', 'data-view': v, 'aria-pressed': view === v, onClick: () => setView(v) }, W('dex.view.' + v))))));
}
/* 바로 가기 띠 — 근본 · 가문 · 주민. 막대 아래 붙고 옆으로 구르며 양끝이 흐리다 */
function Jump({ cards }) {
  const to = k => { const el = document.getElementById('c-' + k); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  return h('nav', { class: 'toc-jump', 'aria-label': W('dex.toc') }, cards.map(c => h('button', { key: c.key, type: 'button', class: 'jump tier-' + c.tier, 'data-jump': c.key, onClick: () => to(c.key) },
    c.tier === 'root' ? W('dex.toc.root') : c.tier === 'lord' ? c.family.ko : c.name)));
}
function Nation({ doc, route, go, n, favs }) {
  const d = doc.d, e = d.elements.find(x => x.key === n.key) || {}, cards = cardsOf(doc, n);
  const st = route.st || doc.s.default, view = VIEWS.includes(route.view) ? route.view : 'world', wf = d.vocab.worlds.includes(route.w) ? route.w : '';
  const [open, setOpen] = useState({});
  let slots = 0, done = 0; for (const c of cards) { slots += c.worlds.length; done += c.worlds.filter(w => fileOf(doc, c.key, w, st)).length; }
  const setView = v => go({ view: v }, { replace: true }), setSt = s => { setOpen({}); go({ st: s === doc.s.default ? '' : s }, { replace: true }); };
  const onOpen = (card, file) => go({ card: card.key, pic: file });
  const props = { doc, view, wf, st, open, setOpen, onOpen, favs };
  /* ?at= — 그려진 뒤 그 칸으로 */
  useEffect(() => { if (!route.at) return; const t = setTimeout(() => { const el = document.getElementById('c-' + route.at); if (el) el.scrollIntoView({ block: 'start' }); }, 50); return () => clearTimeout(t); }, [route.at]);
  return h('section', { class: 'ek-section', 'data-cat': e.category, 'aria-label': e.ko },
    h('div', { class: 'dex-head' }, h('span', { class: 'sym' }, e.symbol), h('div', null, h('h2', null, e.ko, ' ', h('span', { class: 'en' }, e.en)),
      h('ul', { class: 'facts' },
        h('li', null, W('fact.number'), h('b', null, e.number)), h('li', null, W('fact.period'), h('b', null, e.period)),
        e.group && h('li', null, W('fact.group'), h('b', null, e.group)), h('li', null, W('fact.category'), h('b', null, W('cat.' + e.category))),
        h('li', null, W('fact.state'), h('b', null, W('state.' + e.state))), e.synthetic && h('li', null, h('b', null, W('fact.synthetic')))))),
    h('details', { class: 'about' }, h('summary', null, W('dex.about'), ' · ', W('dex.progress', { done, all: slots })),
      h('p', null, n.persona), h('ul', { class: 'traits' }, (n.traits && n.traits.ko || []).map((t, i) => h('li', { key: i }, t)))),
    h(Toc, { doc, cards, view, setView, st, setSt }),
    h(Jump, { cards }),
    h('div', { class: 'row-head' }, h('h3', null, W('dex.root'))),
    h(Card, Object.assign({ card: cards[0] }, props)),
    (n.families || []).map(f => {
      const shared = sharedWith(d, n, f);
      return h('div', { key: f.key, class: 'family' },
        h('div', { class: 'row-head' }, h('h3', null, f.ko), h('span', { class: 'en' }, f.en),
          h('span', { class: 'elements' }, (f.elements || []).map(k => { const el = d.elements.find(x => x.key === k); return h('span', { key: k }, el ? el.symbol : k); })),
          !!shared.length && h('span', { class: 'shared' }, W('dex.shared', { n: shared.length + 1 }), ' · ', shared.map((s, i) => h('a', { key: i, href: 'index.html?n=' + s.nation.key + '&mode=list',
            onClick: ev => { ev.preventDefault(); go({ n: s.nation.key }); } }, W('dex.shared.other', { nation: s.el.ko, family: s.family.ko }))))),
        h('p', { class: 'row-persona' }, f.persona),
        h('div', { class: 'cards' }, cards.filter(c => c.family === f).map(c => h(Card, Object.assign({ key: c.key, card: c }, props)))));
    }));
}

export function ListLayer({ doc, route, go }) {
  const n = doc.d.nations.find(x => x.key === route.n), favs = useFavorites();
  /* 나라마다 새로(‹ › — 접은 칸 · 내려갈 칸을 나라마다) */
  return h('section', { class: 'w-layer w-list', 'data-layer': 'list' },
    h(ModeSwitch, { route, go }),
    h(Nation, { key: n.key, doc, route, go, n, favs }));
}
