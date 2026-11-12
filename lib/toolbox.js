/* 도구 상자(2026-11-12 「들어가는 곳」 — 합성 · 화풍 · 프롬프트는 장소가 아니라 도구). 구석의 단추 하나 → 아래에서 오르는 판:
   합성 · 화풍 · 프롬프트 · 즐겨찾기(수) · 설정(공간 · 밀도 · 움직임) · 패치 기록. 닫기 셋 — 판 밖 · Esc · 뒤로 가기(열 때 역사에 {tb:1} 한 칸).
   판 안 링크는 그 {tb:1} 칸을 먼저 걷고 간다 — 돌아왔을 때 「아무 일 없는 뒤로 가기」 한 번이 남지 않게.
   도구 화면(alchemy · styles · prompt)의 머리는 ToolBar — 「← 돌아가기」(들어오기 전 층) · 도구 이름 · 도구 상자. 탭 줄(lib/workspace-ui.js)은 쓰지 않는다.
   window.AtelierAppearance · AtelierFavorites · AtelierPatch · AtelierWalk(움직임)를 쓴다 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';

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

function Settings() {
  const A = window.AtelierAppearance, look = useEvent('atelier-appearance', () => A.get()), motion = useEvent('element-motion', () => window.AtelierWalk.motionOn());
  const pick = (id, key, values, word) => h('label', { class: 'tb-field' }, h('span', null, W(word)),
    h('select', { id, value: look[key], onChange: e => A.set(key, e.target.value) }, values.map(k => h('option', { key: k, value: k }, W((key === 'theme' ? 'theme.' : 'ui.density.') + k)))));
  return h('section', { class: 'tb-settings', 'data-tool': 'settings' },
    h('h3', null, W('tool.settings')),
    pick('tb-theme', 'theme', A.themes, 'ui.theme'),
    pick('tb-density', 'density', ['compact', 'relaxed'], 'ui.density'),
    h('div', { class: 'tb-field tb-motion', role: 'group', 'aria-label': W('tool.motion') }, h('span', null, W('tool.motion')),
      h('div', { class: 'tb-seg' }, ['on', 'off'].map(k => h('button', { key: k, type: 'button', 'data-motion': k, 'aria-pressed': (k === 'on') === motion,
        onClick: () => window.AtelierWalk.setMotion(k === 'on') }, W('tool.motion.' + k))))));
}

export function Toolbox({ here } = {}) {
  const [open, setOpen] = useState(false), pending = useRef(null), opener = useRef(null), sheet = useRef(null);
  useEffect(() => {
    const pop = () => {
      if (pending.current) { const u = pending.current; pending.current = null; location.assign(u); return; }
      if (!tbOpen()) setOpen(false);
    };
    addEventListener('popstate', pop); return () => removeEventListener('popstate', pop);
  }, []);
  const hide = () => { if (tbOpen()) history.back(); else setOpen(false); };
  useEffect(() => {
    if (!open) return;
    const esc = e => { if (e.key === 'Escape') { e.preventDefault(); hide(); } };
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
      h(Settings),
      h(Patch)));
}

/* 도구 화면의 가는 막대 — 「← 돌아가기」는 들어오기 전 층(껍데기의 마지막 주소)으로 */
export function ToolBar({ tool }) {
  let back = 'index.html';
  try { back += sessionStorage.getItem(LAST) || ''; } catch (e) {}
  return h('header', { class: 'tb-bar' },
    h('a', { class: 'tb-back', href: back }, W('tool.back')),
    h('h1', { class: 'tb-name' }, W('tool.' + tool)),
    h(Toolbox, { here: tool }));
}
