/* 도구 상자(2026-11-12 「들어가는 곳」 — 합성 · 화풍 · 프롬프트는 장소가 아니라 도구). 구석의 단추 하나 → 아래에서 오르는 판:
   합성 · 화풍 · 프롬프트 · 즐겨찾기(수) · 설정(공간 · 밀도 · 움직임) · 패치 기록. 닫기 셋 — 판 밖 · Esc · 뒤로 가기(열 때 역사에 {tb:1} 한 칸).
   판 안 링크는 그 {tb:1} 칸을 먼저 걷고 간다 — 돌아왔을 때 「아무 일 없는 뒤로 가기」 한 번이 남지 않게.
   도구 화면(alchemy · styles · prompt)의 머리는 ToolBar — 「← 돌아가기」(들어오기 전 층) · 도구 이름 · 도구 상자. 탭 줄(옛 lib/workspace-ui.js — 과제 10 에서 지움)은 쓰지 않는다.
   window.AtelierAppearance · AtelierFavorites · AtelierPatch · AtelierWalk(움직임)를 쓴다 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useLayoutEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';

const W = window.W, TOOLS = ['alchemy', 'styles', 'prompt'], FAV_HUB = '/favorites.html', LAST = 'element_walk_last';
const favCount = () => { try { return window.AtelierFavorites.list().filter(e => e.a === 'element').length; } catch (e) { return 0; } };
const tbOpen = () => !!(history.state && history.state.tb);

/* 바깥 사건 하나에 다시 그리기 — 공간(atelier-appearance) · 움직임(element-motion) */
function useEvent(name, read) {
  const [v, set] = useState(read);
  useEffect(() => { const f = () => set(read()); addEventListener(name, f); return () => removeEventListener(name, f); }, []);
  return v;
}

/* 패치 기록 — docs/PATCH.md 를 그대로 읽는다(옛 hall.html Patch) */
function Patch() {
  const [open, setOpen] = useState(false), [log, setLog] = useState(null);
  useEffect(() => {
    if (!open || log) return;
    fetch(window.AtelierPatch.PATH, { cache: 'no-cache' })
      .then(r => r.ok ? r.text() : Promise.reject(new Error(String(r.status))))
      .then(t => setLog({ entries: window.AtelierPatch.parse(t) }))
      .catch(() => setLog({ entries: [], failed: true }));
  }, [open, log]);
  return h('div', { class: 'tb-patch' },
    h('button', { type: 'button', 'data-tool': 'patch', 'aria-expanded': open, onClick: () => setOpen(v => !v) }, W('tool.patch')),
    open && (!log ? h('p', { class: 'tb-note' }, W('home.patch.loading')) :
      log.failed ? h('p', { class: 'tb-note' }, W('home.patch.fail')) :
      !log.entries.length ? h('p', { class: 'tb-note' }, W('home.patch.none')) :
      h('ul', { class: 'tb-patch-list' }, log.entries.map((e, i) =>
        h('li', { class: 'patch-entry', key: i },
          h('p', { class: 'patch-when' }, e.date + ' · ' + e.who),
          h('strong', null, e.title),
          !!e.items.length && h('ul', null, e.items.map((x, j) => h('li', { key: j }, x))))))));
}

function Settings({ here, onScenery }) {
  const RW = window.AtelierWalk, land = useEvent('element-land', () => RW.getLand());
  const A = window.AtelierAppearance, look = useEvent('atelier-appearance', () => A.get()), motion = useEvent('element-motion', () => window.AtelierWalk.motionOn());
  const sys = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  const pick = (id, key, values, word) => h('label', { class: 'tb-field' }, h('span', null, W(word)),
    h('select', { id, value: look[key], onChange: e => A.set(key, e.target.value) }, values.map(k => h('option', { key: k, value: k }, W((key === 'theme' ? 'theme.' : 'ui.density.') + k)))));
  return h('section', { class: 'tb-settings', 'data-tool': 'settings' },
    h('h3', null, W('tool.settings')),
    /* 공방(껍데기) 안에서는 「공간」 대신 땅 여섯 — 그림 단추(지금 세계의 작은 그림). 도구 화면은 예전 공간 고르개 그대로 */
    here ? pick('tb-theme', 'theme', A.themes, 'ui.theme') : h('div', { class: 'tb-lands', role: 'group', 'aria-label': W('tool.land') },
      h('span', null, W('tool.land')),
      h('div', { class: 'tb-land-grid' }, RW.LANDS.map(k => h('button', { key: k, type: 'button', 'data-land': k, 'aria-pressed': k === land, onClick: () => RW.setLand(k) },
        h('img', { src: RW.sceneURL(k, document.documentElement.dataset.world || 'fantasy', true), alt: '', loading: 'lazy', onError: e => { e.currentTarget.style.visibility = 'hidden'; } }),
        h('b', null, W('land.' + k))))),
      h('button', { type: 'button', class: 'tb-scenery', onClick: onScenery }, W('tool.scenery'))),
    pick('tb-density', 'density', ['compact', 'relaxed'], 'ui.density'),
    /* 기기의 움직임 줄이기가 켜져 있으면 늘 꺼짐(motionOn) — 고르개를 막고 까닭을 적는다(켜기가 아무 일도 안 하던 것, 최종 검토 B10) */
    h('div', { class: 'tb-field tb-motion', role: 'group', 'aria-label': W('tool.motion') }, h('span', null, W('tool.motion')),
      h('div', { class: 'tb-seg' }, ['on', 'off'].map(k => h('button', { key: k, type: 'button', 'data-motion': k, 'aria-pressed': (k === 'on') === motion, disabled: sys,
        onClick: () => window.AtelierWalk.setMotion(k === 'on') }, W('tool.motion.' + k))))),
    sys && h('p', { class: 'tb-note tb-motion-note' }, W('tool.motion.system')));
}

export function Toolbox({ here } = {}) {
  const [open, setOpen] = useState(false), pending = useRef(null), opener = useRef(null), sheet = useRef(null);
  /* 판을 연 채 새로고침하면 그 {tb:1} 칸(같은 주소)이 죽은 칸으로 남는다 — 한 칸 물러나 아래 칸(같은 주소)으로 돌아간다(최종 검토 A5) */
  useEffect(() => { if (tbOpen()) history.back(); }, []);
  useEffect(() => {
    const pop = () => {
      if (pending.current) { const u = pending.current; pending.current = null; location.assign(u); return; }
      if (!tbOpen()) setOpen(false);
    };
    addEventListener('popstate', pop); return () => removeEventListener('popstate', pop);
  }, []);
  const hide = () => { if (tbOpen()) history.back(); else setOpen(false); };
  useLayoutEffect(() => {   /* 그리자마자 Esc 를 받는다(열고 바로 누른 Esc 를 놓치던 것 — walk-list 가끔 시간 초과) */
    if (!open) return;
    /* Esc 로 닫고, Tab 은 판 안에서 돈다(aria-modal — 뒤 화면으로 나가지 않게, 최종 검토 B3) */
    const esc = e => {
      if (e.key === 'Escape') { e.preventDefault(); hide(); return; }
      const s = sheet.current; if (e.key !== 'Tab' || !s) return;
      const f = [...s.querySelectorAll('a[href], button:not([disabled]), select:not([disabled])')], a = document.activeElement, i = f.indexOf(a);
      if (!f.length) return;
      if (i < 0 || (e.shiftKey && i === 0) || (!e.shiftKey && i === f.length - 1)) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
    };
    addEventListener('keydown', esc);
    const first = sheet.current && sheet.current.querySelector('button, a, select'); if (first) first.focus();
    return () => { removeEventListener('keydown', esc); if (opener.current) opener.current.focus(); };
  }, [open]);
  const show = () => { try { history.pushState({ tb: 1 }, '', location.href); } catch (e) {} setOpen(true); };
  const follow = e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    e.preventDefault(); const href = e.currentTarget.getAttribute('href');
    if (tbOpen()) { pending.current = href; history.back(); } else location.assign(href);
  };
  return h('div', { class: 'tb' },
    h('button', { type: 'button', class: 'tb-open', ref: opener, 'aria-expanded': open, 'aria-haspopup': 'dialog', onClick: () => open ? hide() : show() }, W('tool.open')),
    open && h('div', { class: 'tb-backdrop', onClick: hide }),
    open && h('div', { class: 'tb-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': W('tool.sheet'), ref: sheet },
      h('div', { class: 'tb-head' }, h('h2', null, W('tool.sheet')), h('button', { type: 'button', class: 'tb-close', onClick: hide }, W('tool.close'))),
      h('nav', { class: 'tb-tools' },
        TOOLS.map(k => h('a', { key: k, 'data-tool': k, href: k + '.html', 'aria-current': k === here ? 'page' : undefined, onClick: follow }, W('tool.' + k))),
        h('a', { 'data-tool': 'fav', href: FAV_HUB, onClick: follow }, W('tool.fav', { n: favCount() }))),
      /* 풍경만 보기 — 판의 역사 칸({tb:1})을 풍경 칸({sc:1})으로 바꾸고 판을 닫는다: 뒤로 가기 한 번이 풍경을 닫는다(껍데기 lib/walk.js) */
      h(Settings, { here, onScenery: () => { try { history.replaceState({ sc: 1 }, '', location.href); } catch (e) {} setOpen(false); dispatchEvent(new Event('element-scenery')); } }),
      h(Patch)));
}

/* 도구 화면의 가는 막대 — 「← 돌아가기」는 들어오기 전 층(껍데기의 마지막 주소)으로.
   공방(index.html)에서 바로 왔으면 역사를 한 칸 물러난다 — 링크로 가면 역사가 늘어 뒤로 가기가 도구 화면으로 되돌아왔다(최종 검토 A4) */
const fromWalk = () => { try { const r = new URL(document.referrer), dir = p => p.replace(/[^/]*$/, ''); return r.origin === location.origin && dir(r.pathname) === dir(location.pathname) && /\/(index\.html)?$/.test(r.pathname); } catch (e) { return false; } };
export function ToolBar({ tool }) {
  let back = 'index.html';
  try { back += sessionStorage.getItem(LAST) || ''; } catch (e) {}
  const goBack = e => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button || !fromWalk() || history.length < 2) return; e.preventDefault(); history.back(); };
  return h('header', { class: 'tb-bar' },
    h('a', { class: 'tb-back', href: back, onClick: goBack }, W('tool.back')),
    h('h1', { class: 'tb-name' }, W('tool.' + tool)),
    h(Toolbox, { here: tool }));
}
