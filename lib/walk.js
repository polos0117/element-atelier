/* 「들어가는 곳」 껍데기(index.html, 2026-11-12 — 사용자 「괜찮네. 이대로 진행해줘」, 설계 docs/superpowers/specs/2026-11-12-element-walk-in-design.md).
   주소 쿼리가 층을 정한다(lib/walk-core.js). 아래로 들어가면 pushState, 옆으로(세계 · 화풍 · 보기 …) 바꾸면 replaceState — 뒤로 가기는 늘 한 층 위.
   바깥에서 깊은 주소로 들어오면 조상 층을 역사에 한 칸씩 심는다(씨앗). 층마다 컴포넌트 하나(LAYERS) — {doc, route, go, back} 를 받는다. */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useLayoutEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';
import { loadDocs, cardsOf, picsOf, styleOfPic } from './walk-data.js?v=5';
import { Toolbox } from './toolbox.js?v=4';
import { TableLayer } from './walk-table.js?v=7';
import { OrbitLayer } from './walk-orbit.js?v=7';
import { ListLayer } from './walk-list.js?v=5';
import { CardLayer } from './walk-card.js?v=5';
import { FamilyLayer } from './walk-family.js?v=5';
import { playShift } from './walk-fx.js?v=6';

const R = window.AtelierWalk, W = window.W;
const PREF = 'element_dex_v1', LAST = 'element_walk_last';
const readPref = () => { try { const p = JSON.parse(localStorage.getItem(PREF) || '{}'); return p && typeof p === 'object' ? p : {}; } catch (e) { return {}; } };
const urlOf = s => location.pathname + s;
const place = r => r ? R.routeSearch(Object.assign({}, r, { w: '', st: '', view: '' })) : null;   /* 층 자리 — 전역 값(세계 · 화풍 · 보기)을 뺀 주소 */
/* 움직임 — html[data-motion] 에 걸어 CSS 효과(숨쉬기 …)도 같은 판단(walk-core motionOn)을 본다 */
const syncMotion = () => { document.documentElement.dataset.motion = R.motionOn() ? 'on' : 'off'; };
syncMotion(); addEventListener('element-motion', syncMotion);

/* 층 — 주소가 고른 층 하나(한 장은 부모 층 위에 겹친다) */
export const LAYERS = { table: TableLayer, orbit: OrbitLayer, list: ListLayer, family: FamilyLayer, card: CardLayer };

/* 카드 이름 — 근본은 원소 이름, 가문주는 「… 가문주」, 주민은 제 이름(옛 도감 cardsOf 와 같은 규칙) */
function cardName(doc, key) {
  const [nk, fk, ck] = key.split('-'), n = doc.d.nations.find(x => x.key === nk), el = doc.d.elements.find(e => e.key === nk) || {};
  const f = fk && n && n.families.find(x => x.key === fk), c = ck && f && f.citizens.find(x => x.key === ck);
  return c ? c.ko : f ? W('dex.lord.name', { family: f.ko }) : el.ko;
}

/* 위 막대 — 지나온 길 · 세계 · 도구 상자(lib/toolbox.js — 단추는 오른쪽 아래에 떠 있다).
   길 표시는 위로 가는 것(up — 껍데기가 역사 칸을 거슬러 오르거나 지금 칸을 바꾼다). 덮개에서 길이 넘치면 끝(지금 자리)이 보이게 민다 */
export function Bar({ doc, route, go, up }) {
  const d = doc.d, n = d.nations.find(x => x.key === route.n), el = n && d.elements.find(e => e.key === n.key), worlds = d.vocab.worlds;
  const label = r => {
    switch (R.layerOf(r)) {
      case 'table': return W('walk.table');
      case 'family': return W('walk.family', { family: (n.families.find(f => f.key === r.f) || {}).ko });
      case 'card': return cardName(doc, r.card);
      default: return el.ko + ' ' + el.symbol;
    }
  };
  const chain = R.ancestors(route), world = R.worldOf(route, worlds), layer = R.layerOf(route);
  /* 나라 층(궤도 · 목록)이면 길 표시 옆 ‹ › — 주기율표 번호 차례로 앞 · 뒤 나라, 옆으로 가는 것이라 역사 칸을 만들지 않는다 */
  const cardObj = layer === 'card' && n ? cardsOf(doc, n).find(c => c.key === route.card) : null, lives = cardObj ? cardObj.worlds || null : null;   /* 한 장의 카드가 사는 세계 */
  /* 한 장에서 눌린 탭은 지금 그림의 세계(lib/walk-card.js 와 같은 셈 — 목록의 「전부」 에서 열어도 그림의 세계가 눌려 보인다) */
  const cardPics = cardObj && route.pic ? picsOf(doc, cardObj, styleOfPic(doc, cardObj, route.pic)) : [];
  const picWorld = worlds.includes(route.w) && cardPics.length && !cardPics.some(x => x.world === route.w) ? route.w : ((cardPics.find(x => x.file === route.pic) || {}).world || '');
  const on = picWorld ? picWorld : layer === 'list' ? (worlds.includes(route.w) ? route.w : 'all') : world;   /* 눌린 세계 — 목록에서만 「전부」 가 있다 */
  const nb = (layer === 'orbit' || layer === 'list') && R.neighbors(R.nationOrder(d), route.n);
  const crumbs = useRef(null);
  useLayoutEffect(() => { const c = crumbs.current; if (c) c.scrollLeft = c.scrollWidth; }, [R.routeSearch(route)]);
  return h('header', { class: 'w-bar' },
    h('div', { class: 'w-where' },
      h('nav', { class: 'w-crumbs', ref: crumbs, 'aria-label': W('walk.crumbs') }, chain.map((r, i) => [
        i ? h('i', { key: 's' + i, 'aria-hidden': 'true' }, '›') : null,
        h('button', { key: 'b' + i, type: 'button', 'aria-current': i === chain.length - 1 ? 'page' : undefined, onClick: () => up(chain.length - 1 - i, r) }, label(r))])),
      nb && h('div', { class: 'w-steps' }, [['prev', '‹'], ['next', '›']].map(([k, t]) =>
        h('button', { key: k, type: 'button', 'data-step': k, 'aria-label': W('walk.' + k), onClick: () => go({ n: nb[k] }, { replace: true }) }, t)))),
    /* 목록 층에서만 끝에 「전부」(옛 도감의 세계 거르기 — 비었거나 all 이면 눌림). 다른 층에서 all 은 판타지로 보인다(worldOf) */
    /* 고르면 세계가 바로 바뀌고(주소 먼저), 그 뒤에 그 세계의 전환 효과 ③ — 막대 아래 덮개(lib/walk-fx.js playShift, 누르기를 막지 않는다) */
    /* 한 장 층 — 그 카드가 안 사는 세계의 탭은 끈다(2026-11-12 사용자 「스팀펑크가 없잖아. 그럼 그 없는 세계 탭을 비활성화」 — 산소 녹 가문의 화성처럼) */
    h('div', { class: 'w-worlds', role: 'group', 'aria-label': W('walk.world') }, (layer === 'list' ? worlds.concat('all') : worlds).map(w =>
      h('button', { key: w, type: 'button', 'data-w': w, 'aria-pressed': on === w, disabled: !!(lives && !lives.includes(w)), title: lives && !lives.includes(w) ? W('walk.world.none') : undefined,
        onClick: () => { go({ w }, { replace: true }); if (w !== on && w !== 'all') playShift(document.querySelector('.w-main'), w); } }, W(w === 'all' ? 'walk.world.all' : 'world.' + w)))),
    h('div', { class: 'w-tools' }, h(Toolbox)));
}

export function App() {
  const [doc, setDoc] = useState(null), [route, setRoute] = useState(null), cur = useRef(null);
  const commit = r => { cur.current = r; setRoute(r); };
  /* 처음 한 번 — 기억값 채우기 → 검증 → 주소 바로잡기 → 씨앗(이미 심은 칸이면 다시 심지 않는다 — 새로고침) */
  useEffect(() => {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    loadDocs().then(dc => {
      setDoc(dc); if (dc.failed) return;
      const r = R.validate(R.resolve(R.readRoute(location.search), readPref()), dc), s = R.routeSearch(r);
      if (history.state && (history.state.walk != null || history.state.tb)) { if (s !== location.search) history.replaceState(history.state, '', urlOf(s)); }
      else R.ancestors(r).forEach((a, i) => history[i ? 'pushState' : 'replaceState']({ walk: i }, '', urlOf(R.routeSearch(a))));
      commit(r);
    });
  }, []);
  /* 뒤로 · 앞으로 — 층 열쇠와 mode 는 그 칸의 것, 나머지 전역 값(w · st · view)은 지금 것.
     mode 를 이어 가면 빈 자리에서 목록으로 건너뛴 뒤(mode=list 를 push) 뒤로 가기가 그 칸의 궤도를 목록으로 덮어 한 층씩 오르지 못했다(최종 검토 A1).
     보기 바꾸기는 지금 칸을 고쳐 쓰니(replaceState) 칸의 mode 가 늘 그 칸의 보기다 */
  useEffect(() => {
    if (!doc || doc.failed) return;
    const pop = () => {
      const u = R.readRoute(location.search), now = cur.current || R.EMPTY;
      for (const k of R.GLOBALS) if (k !== 'mode') u[k] = now[k];
      const r = R.validate(u, doc), s = R.routeSearch(r);
      if (s !== location.search) history.replaceState(history.state, '', urlOf(s));
      commit(r);
    };
    addEventListener('popstate', pop); return () => removeEventListener('popstate', pop);
  }, [doc]);
  /* 땅(테마) 배경 — 고른 땅 x 지금 세계의 그림 한 장을 화면 전체 뒤에 깐다(.w-scenery). 새 그림을 다 받은 뒤에 바꾸고(빈 화면이 번쩍이지 않게),
     땅을 바꿀 때는 화면 전체가 겹쳐 넘어간다(View Transition — 움직임이 꺼져 있거나 못 쓰는 브라우저면 바로). 강조색은 html[data-land] 가 정한다(walk.css) */
  const [land, setLandKey] = useState(R.getLand()), shown = useRef('');
  useEffect(() => { const f = () => setLandKey(R.getLand()); addEventListener('element-land', f); return () => removeEventListener('element-land', f); }, []);
  const world = route && doc && !doc.failed ? R.worldOf(route, doc.d.vocab.worlds) : '';
  useEffect(() => {
    const de = document.documentElement, key = land + '_' + world; if (!world || shown.current === key) return;
    const landChanged = shown.current && shown.current.split('_')[0] !== land, url = R.sceneURL(land, world);
    shown.current = key;
    if (!landChanged) de.dataset.land = land;   /* 강조색은 첫 그리기부터 — 그림만 다 받은 뒤에 */
    const apply = () => { if (shown.current !== key) return;
      const set = () => { de.dataset.land = land; de.style.setProperty('--w-scene', 'url("' + url + '")'); };
      if (landChanged && R.motionOn() && document.startViewTransition) { try { const t = document.startViewTransition(set); t.ready.catch(() => {}); t.finished.catch(() => {}); } catch (e) { set(); } } else set(); };
    const im = new Image(), t = setTimeout(apply, 1500); im.onload = im.onerror = () => { clearTimeout(t); apply(); }; im.src = url;
  }, [land, world]);
  /* 풍경만 보기 — 도구 상자가 element-scenery 를 쏘면 화면 요소를 다 치우고 그림만. 아무 데나 누르거나 뒤로 가기 · Esc 로 돌아온다(역사 한 칸 {sc:1} — 도구 상자가 제 칸을 이 칸으로 바꿔 둔다) */
  const [only, setOnly] = useState(false);
  useEffect(() => {
    if (history.state && history.state.sc) history.back();   /* 풍경을 연 채 새로고침 — 죽은 칸에서 물러난다 */
    const on = () => setOnly(true), pop = () => { if (!(history.state && history.state.sc)) setOnly(false); };
    const esc = e => { if (e.key === 'Escape' && history.state && history.state.sc) history.back(); };
    addEventListener('element-scenery', on); addEventListener('popstate', pop); addEventListener('keydown', esc);
    return () => { removeEventListener('element-scenery', on); removeEventListener('popstate', pop); removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { if (only) document.documentElement.dataset.only = '1'; else delete document.documentElement.dataset.only; }, [only]);
  /* 위 막대 높이 — 목록의 바로 가기 띠 · 한 장이 그 아래에 앉는다(덮개에선 막대가 두 줄) */
  const ready = !!(route && doc && !doc.failed);
  useEffect(() => {
    const b = ready && document.querySelector('.w-bar'); if (!b) return;
    const set = () => document.documentElement.style.setProperty('--w-bar-h', b.offsetHeight + 'px'); set();
    const ro = window.ResizeObserver ? new ResizeObserver(set) : null; if (ro) ro.observe(b); addEventListener('resize', set);
    return () => { if (ro) ro.disconnect(); removeEventListener('resize', set); };
  }, [ready]);
  /* 층 · 세계 표시와 기기 기억 — 보기(mode)는 여기서 기억하지 않는다: 궤도/목록 고르개(walk-orbit ModeSwitch)만 기억시킨다(최종 검토 A3) */
  useEffect(() => {
    if (!route) return;
    const de = document.documentElement;
    de.dataset.layer = R.layerOf(route); de.dataset.world = R.worldOf(route, doc.d.vocab.worlds);
    try { sessionStorage.setItem(LAST, location.search); } catch (e) {}
    try { const p = readPref(); p.w = route.w; p.st = route.st; p.view = route.view; localStorage.setItem(PREF, JSON.stringify(p)); } catch (e) {}
  }, [route]);

  /* 주소를 같은 틱에 쓴다 — 새 주소가 지금 주소와 같으면 아무것도 안 한다(두 번 눌러도 역사 한 칸).
     역사 칸의 walk = 이 칸 바로 아래로 이어진 조상 칸 수(씨앗은 층 깊이, 바로 아래 층으로 들어가면 +1, 옆 · 건너뛰기면 0) — 길 표시가 history.go(-k) 로 오를 수 있는지 본다 */
  const depth = () => (history.state && history.state.walk) | 0;
  const go = (patch, opt = {}) => {
    const next = R.validate(Object.assign({}, cur.current, patch), doc), s = R.routeSearch(next);
    if (s === location.search) return;
    if (opt.replace) history.replaceState(history.state, '', urlOf(s));
    else { history.pushState({ walk: place(R.parentOf(next)) === place(cur.current) ? depth() + 1 : 0 }, '', urlOf(s)); if (R.layerOf(next) !== 'card') scrollTo(0, 0); }
    commit(next);
  };
  const back = () => { if (depth()) history.back(); else { const p = R.parentOf(cur.current); if (p) go(p, { replace: true }); } };
  /* 길 표시 — k 층 위로. 그 조상이 역사 바로 아래 칸들이면 거슬러 오르고(앞으로 가기에 남는다), 모르면 지금 칸을 바꾼다 — 길 표시가 역사를 늘리지 않는다(최종 검토 A6) */
  const up = (k, r) => { if (k < 1) return; if (k <= depth()) history.go(-k); else go(r, { replace: true }); };

  const scenery = h('div', { class: 'w-scenery', 'aria-hidden': 'true' });
  if (!doc || (!doc.failed && !route)) return h('div', { class: 'w-shell' }, scenery, h('p', { class: 'w-wait' }, W('walk.loading')));
  if (doc.failed) return h('div', { class: 'w-shell' }, scenery, h('p', { class: 'w-wait' }, W('walk.fail')));
  /* 한 장은 부모 층 위에 겹친다 — 부모는 붙은 채 inert(스크롤 자리 그대로) */
  const layer = R.layerOf(route), under = layer === 'card' ? R.parentOf(route) : route, base = R.layerOf(under);
  return h('div', { class: 'w-shell' }, scenery,
    only && h('button', { type: 'button', class: 'w-only', 'aria-label': W('tool.scenery.back'), onClick: () => history.back() }),
    h(Bar, { doc, route, go, up }),
    h('main', { class: 'w-main' },
      h('div', { class: 'w-under', key: base, inert: layer === 'card' }, h(LAYERS[base], { doc, route: under, go, back })),
      layer === 'card' && h(LAYERS.card, { doc, route, go, back })));
}
