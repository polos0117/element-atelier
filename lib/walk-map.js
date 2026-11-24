/* 지도 층(2026-11-24 — 사용자 「이대로 진행하고 … 판타지 대륙 지도부터 만들어줘」). 첫 층의 다른 보기(주기율표 옆 「지도」, 주소 view=map) — 대륙 → 지역 → 나라로 확대해 들어간다.
   그림은 판타지 대륙 지도 한 장(그림 저장소 element-atelier-img 의 backgrounds/maps — 궤도 그림처럼 배경 자리, 등록 그림 아님), 자리는 배치표 data/world-map.json 의 map.<세계>
   (대륙 상자 · 이름 자리 · 지역 점 — 그림 좌표 0~1). 세계 셋이 땅 하나를 나눈다 — 지도 그림은 아직 판타지만, 다른 세계는 「준비 중」 한 줄과 주기율표.
   · 온 세상: 그림을 끌어 옮기고(손가락 · 마우스) 휠 · 두 손가락으로 키운다, ＋ − ⤢ 단추 · 키(화살표 · + − · 0). 대륙 이름(한글)과 하늘 · 물밑 · 땅속 자리 표(층 배지).
   · 대륙(c): 누르면 그 상자로 부드럽게 다가가고 지역 이름이 뜬다. 하늘 · 물밑 · 땅속은 그 자리로 다가가 판에 지역과 나라를 늘어놓는다(따로 그림은 아직 없다).
   · 지역(r): 더 다가가 그 지역 나라를 지역 점 둘레에 고리로(겹치지 않게 코드가 놓는다) — 기호 · 이름, 그 세계 그 화풍에 그림이 있으면 켜짐, 없으면 안개.
     동맹(여러 나라 가문)은 두 나라가 다 보일 때 선. 나라를 누르면 나라 층(전경이 있으면 들어갈 때 로딩 화면 — walk-table enterNation).
   아래로(대륙 · 지역) 들어가면 역사 한 칸, 뒤로 가기는 늘 한 층 위(지나온 길 「대륙 › …」 · 「위로」 단추 · Esc). 움직임이 꺼져 있으면 다가가기 없이 바로.
   글자는 확대와 함께 커지지 않는다(--s 로 되돌려 같은 크기). window.AtelierMap 은 검사 손잡이(지금 보기 · 다가가기 수). */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';
import { TableLayer, FirstView, enterNation, prefView } from './walk-table.js?v=10';
import { litOf } from './walk-data.js?v=7';

const R = window.AtelierWalk, W = window.W;
const BG = 'https://polos0117.github.io/element-atelier-img/';
const LOG = window.AtelierMap = window.AtelierMap || { view: null, anims: 0, level: '' };
const MAX = 2.4, MAX_REGION = 1.9, DUR = 480, TAP = 6;   /* 그림은 1536 px — 지역에선 1.9 배까지(더 키우면 붓자국이 뭉갠다, ＋ 로는 2.4 까지) */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* 이름 표 비키기 — 배율이 바뀔 때마다 화면 px 로 셈: 왼쪽부터 놓되 앞서 놓은 표와 겹치면 위아래로 한 칸씩(위 → 아래 → 두 칸 …) 비킨다.
   점 자리는 그대로(.w-mr-dot), 표만 --dy 만큼. 비켜도 안 되면 제자리 */
function declutter(l, s) {
  const items = [...l.querySelectorAll('.w-ml')].map(e => ({ e, x: +e.dataset.x * s, y: +e.dataset.y * s, w: e.offsetWidth, h: e.offsetHeight })).sort((a, b) => a.x - b.x || a.y - b.y), placed = [];
  for (const it of items) {
    let pick = null;
    for (const k of [0, -1, 1, -2, 2, -3, 3]) {
      const dy = k * (it.h + 4), b = { l: it.x - it.w / 2 - 2, r: it.x + it.w / 2 + 2, t: it.y + dy - it.h / 2 - 2, b: it.y + dy + it.h / 2 + 2 };
      if (!placed.some(p => p.l < b.r && b.l < p.r && p.t < b.b && b.t < p.b)) { pick = { dy, b }; break; }
    }
    if (!pick) pick = { dy: 0, b: { l: it.x - it.w / 2, r: it.x + it.w / 2, t: it.y - it.h / 2, b: it.y + it.h / 2 } };
    placed.push(pick.b);
    const v = pick.dy + 'px'; if (it.e.style.getPropertyValue('--dy') !== v) it.e.style.setProperty('--dy', v);
  }
}

/* 나라 고리 — n 나라를 지역 점 둘레에 겹치지 않게(화면 px). 표시 하나 76×64 안, 이웃 표시 중심 사이 ≥ 92 */
export function ring(n) {
  if (n <= 1) return [{ x: 0, y: 0 }];
  if (n === 2) return [{ x: -58, y: 0 }, { x: 58, y: 0 }];
  const r = Math.max(66, 48 / Math.sin(Math.PI / n));
  return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return { x: Math.round(Math.cos(a) * r), y: Math.round(Math.sin(a) * r) }; });
}

export function MapLayer({ doc, route, go, back }) {
  const world = R.worldOf(route, doc.d.vocab.worlds), M = doc.m && doc.m.map && doc.m.map[world];
  if (!M) return h(TableLayer, { doc, route, go, notice: h('p', { class: 'w-map-soon', role: 'status' }, W('map.soon', { world: W('world.' + world) })) });
  return h('section', { class: 'w-layer w-map-view', 'data-layer': 'map' }, h(MapStage, { doc, route, go, back, M, world }));
}

function MapStage({ doc, route, go, back, M, world }) {
  const m = doc.m, IW = M.size[0], IH = M.size[1];
  const conts = useMemo(() => new Map(m.continents.map(c => [c.key, c])), [m]), regs = useMemo(() => new Map(m.regions.map(r => [r.key, r])), [m]);
  const byRegion = useMemo(() => { const o = {}; for (const [k, v] of Object.entries(m.nations)) (o[v.region] = o[v.region] || []).push(k); return o; }, [m]);
  const els = useMemo(() => new Map(doc.d.elements.map(e => [e.key, e])), [doc]), nats = useMemo(() => new Map(doc.d.nations.map(n => [n.key, n])), [doc]);
  const num = k => (els.get(k) || {}).number || 0;
  const cont = route.c ? conts.get(route.c) : null, reg = route.r ? regs.get(route.r) : null;
  const level = reg ? 'region' : cont ? (cont.layer === 'surface' ? 'continent' : 'anchor') : 'world';
  const stage = useRef(null), layer = useRef(null), view = useRef(null), size = useRef({ w: 0, h: 0 }), anim = useRef(0), [failed, setFailed] = useState(false), [, setTick] = useState(0);

  /* ── 보기 셈 — 화면 px = x + 그림 px × s ── */
  const fitS = () => { const { w, h: hh } = size.current; return Math.min(w / IW, hh / IH); };
  const insets = () => {   /* 위 줄(보기 고르개 · 위로) · 아래 글 판 · 넓은 화면의 옆 판이 가리는 자리 */
    const { w, h: hh } = size.current, wide = w >= 900, panel = level === 'anchor';
    return { t: 64, l: 16, r: panel && wide ? 380 : 64, b: level === 'world' ? 16 : panel && !wide ? Math.round(hh * .5) : wide ? 24 : 132 };
  };
  const limit = v => { const { w, h: hh } = size.current, mw = IW * v.s, mh = IH * v.s;
    return { s: v.s, x: mw <= w ? (w - mw) / 2 : clamp(v.x, w / 2 - mw, w / 2), y: mh <= hh ? (hh - mh) / 2 : clamp(v.y, hh / 2 - mh, hh / 2) }; };
  const around = (cx, cy, s) => { const ins = insets(), { w, h: hh } = size.current, ax = ins.l + (w - ins.l - ins.r) / 2, ay = ins.t + (hh - ins.t - ins.b) / 2;
    return { s, x: ax - cx * IW * s, y: ay - cy * IH * s }; };
  const boxView = b => { const ins = insets(), { w, h: hh } = size.current;
    const s = clamp(Math.min((w - ins.l - ins.r) / (b.w * IW), (hh - ins.t - ins.b) / (b.h * IH)), fitS(), MAX);
    return around(b.x + b.w / 2, b.y + b.h / 2, s); };
  const worldS = () => { const f = fitS(), { w, h: hh } = size.current; return IW * f >= 700 ? f : Math.max(w / IW, hh / IH); };   /* 넓으면 한 장 다, 휴대폰은 높이에 맞춰 */
  const target = () => {
    const f = fitS(), { w } = size.current;
    if (level === 'world') {
      const s = worldS(), hc = M.continents.heartland;   /* 휴대폰은 가운데 대륙부터(옆으로 밀어 본다) */
      return limit({ s, x: w / 2 - (hc ? hc.x + hc.w / 2 : .5) * IW * s, y: 0 });
    }
    const b = M.continents[cont.key], bv = boxView(b);
    if (level === 'anchor') return limit(around(b.x + b.w / 2, b.y + b.h / 2, Math.min(bv.s, Math.max(f * 2.2, worldS()))));   /* 작은 자리 — 둘레가 보이게 덜 다가간다 */
    if (level !== 'region') return limit(bv);
    const p = M.regions[reg.key];
    return limit(around(p.x, p.y, clamp(Math.max(bv.s * 1.8, f * 2.4), f, Math.min(MAX_REGION, f * 3))));
  };
  const apply = v => {
    view.current = v; LOG.view = { s: +v.s.toFixed(4), x: Math.round(v.x), y: Math.round(v.y) }; LOG.level = level;
    const l = layer.current; if (!l) return;
    l.style.transform = 'translate(' + v.x.toFixed(2) + 'px,' + v.y.toFixed(2) + 'px) scale(' + v.s.toFixed(5) + ')'; l.style.setProperty('--s', v.s.toFixed(5));
    declutter(l, v.s);
  };
  const stop = () => { cancelAnimationFrame(anim.current); anim.current = 0; if (layer.current) layer.current.classList.remove('is-moving'); };
  /* 다가가기 — 그림 좌표의 가운데는 곧게, 배율은 로그로. 움직임이 꺼져 있으면 바로 */
  const flyTo = (to, animate) => {
    stop(); to = limit(to);
    const from = view.current;
    if (!animate || !from || !R.motionOn()) return apply(to);
    LOG.anims++;
    const { w, h: hh } = size.current, c0 = { x: (w / 2 - from.x) / from.s, y: (hh / 2 - from.y) / from.s }, c1 = { x: (w / 2 - to.x) / to.s, y: (hh / 2 - to.y) / to.s };
    const t0 = performance.now(); layer.current.classList.add('is-moving');
    const step = now => { const t = Math.min(1, (now - t0) / DUR), k = ease(t), s = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * k);
      const cx = c0.x + (c1.x - c0.x) * k, cy = c0.y + (c1.y - c0.y) * k;
      apply(t < 1 ? { s, x: w / 2 - cx * s, y: hh / 2 - cy * s } : to);
      if (t < 1) anim.current = requestAnimationFrame(step); else stop(); };
    anim.current = requestAnimationFrame(step);
  };
  /* 키우기 · 줄이기 — 화면 점(px, py) 둘레로 */
  const zoomAt = (k, px, py, animate) => { const v = view.current; if (!v) return;
    const s = clamp(v.s * k, fitS(), MAX), q = s / v.s; flyTo({ s, x: px - (px - v.x) * q, y: py - (py - v.y) * q }, animate); };

  /* 크기 — 처음 · 바뀔 때 그 층의 보기로 바로 맞춘다 */
  const levelKey = level + '|' + (route.c || '') + '|' + (route.r || '');
  const first = useRef(true), fresh = useRef(null); fresh.current = { target, apply, stop };   /* 크기 지켜보기는 처음 한 번 붙으니 늘 지금 층의 셈을 부른다 */
  useLayoutEffect(() => {
    const st = stage.current; if (!st) return;
    const measure = () => { const r = st.getBoundingClientRect(); size.current = { w: r.width, h: r.height }; };
    measure(); apply(target()); setTick(t => t + 1);
    const ro = window.ResizeObserver ? new ResizeObserver(() => { const o = size.current, f = fresh.current; measure();
      if (Math.abs(o.w - size.current.w) > 1 || Math.abs(o.h - size.current.h) > 1) { f.stop(); f.apply(f.target()); setTick(t => t + 1); } }) : null;
    if (ro) ro.observe(st);
    return () => { if (ro) ro.disconnect(); fresh.current.stop(); };
  }, []);
  /* 층이 바뀌면(대륙 · 지역 · 위로) 다가간다 — 처음 그리기는 위에서 바로 맞췄다 */
  useEffect(() => { if (first.current) { first.current = false; return; } flyTo(target(), true); }, [levelKey]);

  /* ── 손 — 한 손가락 · 마우스는 옮기기, 두 손가락은 키우기, 휠은 그 자리 둘레로 ── */
  const ptrs = useRef(new Map()), gest = useRef(null), moved = useRef(false);
  const onDown = e => {
    if (e.button > 0) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const v = view.current, ps = [...ptrs.current.values()]; stop();
    if (ps.length === 1) { moved.current = false; gest.current = { x: e.clientX, y: e.clientY, v }; }
    else if (ps.length === 2) { const [a, b] = ps, d = Math.hypot(a.x - b.x, a.y - b.y) || 1, r = stage.current.getBoundingClientRect();
      gest.current = { pinch: true, d, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top, v }; moved.current = true; }
  };
  const onMove = e => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gest.current; if (!g) return;
    if (g.pinch) { const ps = [...ptrs.current.values()]; if (ps.length < 2) return; const [a, b] = ps, r = stage.current.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top, s = clamp(g.v.s * d / g.d, fitS(), MAX), q = s / g.v.s;
      apply(limit({ s, x: mx - (g.mx - g.v.x) * q, y: my - (g.my - g.v.y) * q })); return; }
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!moved.current && Math.hypot(dx, dy) > TAP) { moved.current = true; try { stage.current.setPointerCapture(e.pointerId); } catch (x) {} }   /* 끌기 시작한 뒤에만 잡는다 — 이름 단추 누르기를 빼앗지 않게 */
    if (moved.current) apply(limit({ s: g.v.s, x: g.v.x + dx, y: g.v.y + dy }));
  };
  const onUp = e => {
    const had = ptrs.current.delete(e.pointerId);
    if (ptrs.current.size === 1) { const [p] = ptrs.current.values(); gest.current = { x: p.x, y: p.y, v: view.current }; return; }
    gest.current = null;
    if (had && !moved.current && e.type === 'pointerup' && !e.target.closest('button')) tapAt(e.clientX, e.clientY);
  };
  /* 빈 땅 누르기 — 온 세상이면 그 자리의 대륙(하늘 · 물밑 · 땅속 자리가 먼저, 작은 상자 먼저), 대륙이면 가까운 지역 점(56px 안) */
  const tapAt = (cx, cy) => {
    const r = stage.current.getBoundingClientRect(), v = view.current, ix = (cx - r.left - v.x) / (IW * v.s), iy = (cy - r.top - v.y) / (IH * v.s);
    if (level === 'world') {
      const hit = m.continents.filter(c => { const b = M.continents[c.key]; return b && b.w < 1 && ix >= b.x && ix <= b.x + b.w && iy >= b.y && iy <= b.y + b.h; })
        .sort((a, b) => (a.layer === 'surface') - (b.layer === 'surface') || M.continents[a.key].w * M.continents[a.key].h - M.continents[b.key].w * M.continents[b.key].h)[0];
      if (hit) go({ c: hit.key });
    } else if (level === 'continent') {
      let best = null, bd = 56;
      for (const g of m.regions) if (g.continent === cont.key) { const p = M.regions[g.key], d = Math.hypot((p.x - ix) * IW * v.s, (p.y - iy) * IH * v.s); if (d < bd) { bd = d; best = g; } }
      if (best) go({ r: best.key });
    }
  };
  useEffect(() => {   /* 휠 — 페이지가 구르지 않게(passive: false) */
    const st = stage.current; if (!st) return;
    const wheel = e => { e.preventDefault(); const r = st.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0016)), e.clientX - r.left, e.clientY - r.top, false); };
    st.addEventListener('wheel', wheel, { passive: false }); return () => st.removeEventListener('wheel', wheel);
  });
  const centre = () => ({ x: size.current.w / 2, y: size.current.h / 2 });
  const zoomBtn = k => { const c = centre(); zoomAt(k, c.x, c.y, true); };
  const onKey = e => {
    if (e.target !== stage.current) return;
    const v = view.current, step = 80, keys = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (keys[e.key]) { e.preventDefault(); flyTo({ s: v.s, x: v.x + keys[e.key][0], y: v.y + keys[e.key][1] }, false); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBtn(1.5); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBtn(1 / 1.5); }
    else if (e.key === '0') { e.preventDefault(); flyTo(target(), true); }
    else if (e.key === 'Escape' && level !== 'world') { e.preventDefault(); back(); }
  };

  /* ── 나라 ── */
  const st = route.st || doc.s.default;
  const lit = k => { const n = nats.get(k); return !!n && litOf(doc, n, world, st); };
  const enter = (k, el) => { const n = nats.get(k); if (n) enterNation({ doc, route, go, n, from: el, patch: { view: prefView() } }); };
  const nationBtn = (k, cls, style) => { const e = els.get(k) || {}, on = lit(k);
    return h('button', { key: k, type: 'button', class: cls + (on ? ' is-lit' : ' is-fog'), 'data-n': k, 'data-cat': e.category, style,
        'aria-label': e.ko + ' ' + (e.symbol || '') + (on ? '' : ' · ' + W('walk.noart')), onClick: ev => enter(k, ev.currentTarget) },
      h('b', null, e.symbol), h('span', null, e.ko)); };
  const regionNations = k => (byRegion[k] || []).slice().sort((a, b) => num(a) - num(b));

  /* ── 그리기 ── */
  const pct = (x, y) => ({ left: (x * 100).toFixed(3) + '%', top: (y * 100).toFixed(3) + '%' });
  const labels = [];
  if (level === 'world') for (const c of m.continents) {
    const b = M.continents[c.key]; if (!b) continue;
    const at = b.label || [b.x + b.w / 2, b.y + b.h / 2], badge = c.layer !== 'surface';
    labels.push(h('button', { key: c.key, type: 'button', class: 'w-ml' + (badge ? ' is-anchor' : ''), 'data-c': c.key, 'data-layer': c.layer, 'data-x': at[0] * IW, 'data-y': at[1] * IH, style: pct(at[0], at[1]),
        'aria-label': W(badge ? 'map.anchor.label' : 'map.cont.label', { name: c.ko, layer: W('layer.' + c.layer) }), onClick: () => go({ c: c.key }) },
      badge && h('i', { class: 'w-ml-badge' }, W('layer.' + c.layer)), h('span', null, c.ko)));
  }
  if (level === 'continent') for (const g of m.regions) if (g.continent === cont.key) {
    const p = M.regions[g.key], ns = byRegion[g.key] || [];
    labels.push(h('i', { key: g.key + '-dot', class: 'w-mr-dot', style: pct(p.x, p.y), 'aria-hidden': 'true' }));
    labels.push(h('button', { key: g.key, type: 'button', class: 'w-ml w-mr', 'data-r': g.key, 'data-x': p.x * IW, 'data-y': p.y * IH, style: pct(p.x, p.y), 'aria-label': W('map.region.label', { name: g.ko, n: ns.length }), onClick: () => go({ r: g.key }) },
      h('span', null, g.ko), h('small', null, W('map.region.n', { n: ns.length, lit: ns.filter(lit).length }))));
  }
  let marks = null;
  if (level === 'region') {
    const ks = regionNations(reg.key), pos = ring(ks.length), at = Object.fromEntries(ks.map((k, i) => [k, pos[i]])), p = M.regions[reg.key];
    const lines = m.alliances.flatMap(a => { const vis = a.nations.filter(k => at[k]); const out = []; for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) out.push([a, vis[i], vis[j]]); return out; });
    const ext = Math.max(...pos.map(q => Math.max(Math.abs(q.x), Math.abs(q.y)))) + 60;
    marks = h('div', { class: 'w-mk-ring', style: pct(p.x, p.y), 'data-r': reg.key },
      h('svg', { class: 'w-mk-lines', width: ext * 2, height: ext * 2, viewBox: [-ext, -ext, ext * 2, ext * 2].join(' '), style: { left: -ext + 'px', top: -ext + 'px' }, 'aria-hidden': 'true' },
        lines.map(([a, i, j]) => h('line', { key: a.family + i + j, 'data-family': a.family, x1: at[i].x, y1: at[i].y, x2: at[j].x, y2: at[j].y }))),
      h('i', { class: 'w-mk-dot', 'aria-hidden': 'true' }),
      ks.map(k => nationBtn(k, 'w-mk', { left: at[k].x + 'px', top: at[k].y + 'px' })),
      lines.length > 0 && h('p', { class: 'w-mk-ally', style: { '--ally-y': (Math.max(...pos.map(q => q.y)) + 42) + 'px' } }, lines.map(([a]) => W('map.ally', { family: a.ko })).filter((x, i, l) => l.indexOf(x) === i).join(' · ')));
  }
  const crumbsOn = level !== 'world';
  const nTotal = c => m.regions.filter(g => g.continent === c.key).reduce((s, g) => s + (byRegion[g.key] || []).length, 0);
  const cap = level === 'continent' ? h('div', { class: 'w-map-cap', 'data-c': cont.key },
      h('h2', null, cont.ko), h('p', { class: 'w-map-sub' }, W('map.c.sub', { r: m.regions.filter(g => g.continent === cont.key).length, n: nTotal(cont) })), h('p', { class: 'w-map-why' }, cont.why_ko))
    : level === 'region' ? h('div', { class: 'w-map-cap', 'data-r': reg.key },
      h('h2', null, reg.ko, h('small', null, cont.ko)), h('p', { class: 'w-map-sub' }, W('map.r.sub', { n: (byRegion[reg.key] || []).length, lit: (byRegion[reg.key] || []).filter(lit).length })), h('p', { class: 'w-map-why' }, reg.why_ko))
    : null;
  const panel = level === 'anchor' ? h('aside', { class: 'w-map-panel', 'data-c': cont.key, 'data-layer': cont.layer, 'aria-label': W('map.panel', { name: cont.ko }) },
      h('h2', null, h('i', { class: 'w-ml-badge' }, W('layer.' + cont.layer)), cont.ko),
      h('p', { class: 'w-map-why' }, cont.why_ko),
      m.regions.filter(g => g.continent === cont.key).map(g => h('section', { key: g.key, class: 'w-map-preg', 'data-r': g.key },
        h('h3', null, g.ko, h('small', null, W('map.region.n', { n: (byRegion[g.key] || []).length, lit: (byRegion[g.key] || []).filter(lit).length }))),
        h('div', { class: 'w-map-pnats' }, regionNations(g.key).map(k => nationBtn(k, 'w-pn')))))) : null;

  return h('div', { class: 'w-map', 'data-level': level, 'data-world': world },
    h('div', { class: 'w-map-stage', ref: stage, tabIndex: 0, role: 'application', 'aria-roledescription': W('map.role'), 'aria-label': W('map.stage', { world: W('world.' + world) }),
        onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, onKeyDown: onKey },
      h('div', { class: 'w-map-layer', ref: layer, style: { width: IW + 'px', height: IH + 'px' } },
        h('img', { class: 'w-map-img', src: BG + M.image, alt: '', width: IW, height: IH, draggable: false, decoding: 'async', onError: () => setFailed(true) }),
        level !== 'world' && cont && cont.layer !== 'surface' && h('i', { class: 'w-map-focus', style: Object.assign(pct(M.continents[cont.key].x, M.continents[cont.key].y), { width: M.continents[cont.key].w * 100 + '%', height: M.continents[cont.key].h * 100 + '%' }), 'aria-hidden': 'true' }),
        labels, marks)),
    failed && h('p', { class: 'w-map-fail', role: 'status' }, W('map.fail')),
    h('div', { class: 'w-map-top' },
      h(FirstView, { route, go }),
      crumbsOn && h('button', { type: 'button', class: 'w-map-up', onClick: back }, W('map.up'))),
    h('div', { class: 'w-map-zoom', role: 'group', 'aria-label': W('map.zoom') },
      h('button', { type: 'button', 'data-z': 'in', 'aria-label': W('map.in'), onClick: () => zoomBtn(1.5) }, '＋'),
      h('button', { type: 'button', 'data-z': 'out', 'aria-label': W('map.out'), onClick: () => zoomBtn(1 / 1.5) }, '−'),
      h('button', { type: 'button', 'data-z': 'fit', 'aria-label': W('map.fit'), onClick: () => flyTo(target(), true) }, '⤢')),
    cap, panel);
}
