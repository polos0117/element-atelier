/* 지도 층(2026-11-24 — 사용자 「이대로 진행하고 … 판타지 대륙 지도부터 만들어줘」). 첫 층의 다른 보기(주기율표 옆 「지도」, 주소 view=map) — 대륙 → 지역 → 나라로 확대해 들어간다.
   그림은 판타지 대륙 지도 한 장(그림 저장소 element-atelier-img 의 backgrounds/maps — 궤도 그림처럼 배경 자리, 등록 그림 아님), 자리는 배치표 data/world-map.json 의 map.<세계>
   (대륙 상자 · 이름 자리 · 지역 점 — 그림 좌표 0~1). 세계 셋이 땅 하나를 나눈다 — 지도 그림은 아직 판타지만, 다른 세계는 「준비 중」 한 줄과 주기율표.
   · 온 세상: 그림을 끌어 옮기고(손가락 · 마우스) 휠 · 두 손가락으로 키운다, ＋ − ⤢ 단추 · 키(화살표 · + − · 0). 대륙 이름(한글)과 하늘 · 물밑 · 땅속 자리 표(층 배지).
   · 대륙(c): 누르면 그 상자로 부드럽게 다가가고 지역 이름이 뜬다. 하늘 · 물밑 · 땅속은 그 자리로 다가가 판에 지역과 나라를 늘어놓는다(따로 그림은 아직 없다).
   · 지역(r): 더 다가가 그 지역 나라를 지역 점 둘레에 고리로(겹치지 않게 코드가 놓는다) — 기호 · 이름, 그 세계 그 화풍에 그림이 있으면 켜짐, 없으면 안개.
     동맹(여러 나라 가문)은 두 나라가 다 보일 때 선. 나라를 누르면 나라 층(전경이 있으면 들어갈 때 로딩 화면 — walk-table enterNation).
   아래로(대륙 · 지역) 들어가면 역사 한 칸, 뒤로 가기는 늘 한 층 위(지나온 길 「대륙 › …」 · 「위로」 단추 · Esc). 움직임이 꺼져 있으면 다가가기 없이 바로.
   글자는 확대와 함께 커지지 않는다(--s 로 되돌려 같은 크기). window.AtelierMap 은 검사 손잡이(지금 보기 · 다가가기 수).
   다듬기(2026-11-25 — 사용자 「그러면 월드맵 다듬어줘」):
   · 휴대폰은 층을 옮겨도 온 세상 배율(높이 맞춤) 밑으로 줄지 않는다 — 대륙 · 지역 상자가 좁아도 위아래 빈 띠 없이, 옆으로 밀어 본다.
   · 넓은 화면(900 px 이상)은 그림이 기기 픽셀로 1.6 배 넘게 늘지 않는 데까지만 키운다(devicePixelRatio) — 표 · 이름은 DOM 이라 그대로 또렷.
   · 온 세상의 「동맹」 — 동맹 여덟을 나라 자리끼리 굽은 선으로(손 · 마우스를 대면 이름), 아래 줄에서 하나씩 고른다.
     대륙 · 지역에선 화면에 없는 동맹 상대를 가장자리 표(→ 수소 (하늘 군도))로 — 누르면 그 자리로 다가간다.
   · 지역의 나라 · 하늘 판의 나라가 보이면(그리고 손 · 초점이 닿으면) 전경을 미리 받는다 — 처음 누를 때도 로딩 화면(walk-table prefetchVista). */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'https://esm.sh/preact@10.24.3/hooks';
import { TableLayer, FirstView, enterNation, prefView, prefetchVista } from './walk-table.js?v=11';
import { litOf } from './walk-data.js?v=7';

const R = window.AtelierWalk, W = window.W;
const BG = 'https://polos0117.github.io/element-atelier-img/';
const LOG = window.AtelierMap = window.AtelierMap || { view: null, anims: 0, level: '' };
const MAX = 2.4, MAX_REGION = 1.9, UPSCALE = 1.6, DUR = 480, TAP = 6;   /* 그림은 1536 px — 좁은 화면은 지역에서 1.9 배 · ＋ 로 2.4 배까지, 넓은 화면은 기기 픽셀로 1.6 배까지 */
const ALLY_R = 22, BENDS = [.2, -.2, .34, -.34, .48, -.48];   /* 온 세상 동맹 선 — 한 지역에 동맹 나라가 여럿이면 지역 점 둘레 22 px(그림)에, 같은 두 곳 사이 선은 번갈아 굽힌다 */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* 이름 표 비키기 — 배율이 바뀔 때마다 화면 px 로 셈: 왼쪽부터 놓되 앞서 놓은 표와 겹치면 위아래로 한 칸씩(위 → 아래 → 두 칸 …) 비킨다.
   점 자리는 그대로(.w-mr-dot), 표만 --dy 만큼. 비켜도 안 되면 제자리 */
function declutter(l, s, ox, W) {
  const items = [...l.querySelectorAll('.w-ml')].map(e => ({ e, x: +e.dataset.x * s, y: +e.dataset.y * s, w: e.offsetWidth, h: e.offsetHeight })).sort((a, b) => a.x - b.x || a.y - b.y), placed = [];
  for (const it of items) {
    /* 화면 끝에 걸린 표 — 조금이라도 보이면 표만 안으로 민다(휴대폰 온 세상의 「땅속」 · 대륙의 양 끝 지역처럼 반쯤 잘리지 않게, 2026-11-25). 점은 제자리 */
    const sx = ox + it.x, dx = sx < -it.w / 2 || sx > W + it.w / 2 ? 0 : Math.max(0, 6 - (sx - it.w / 2)) || Math.min(0, W - 6 - (sx + it.w / 2));
    const dxv = Math.round(dx) + 'px'; if (it.e.style.getPropertyValue('--dx') !== dxv) it.e.style.setProperty('--dx', dxv);
    it.x += dx;
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
  const stage = useRef(null), layer = useRef(null), edgeBox = useRef(null), root = useRef(null), view = useRef(null), size = useRef({ w: 0, h: 0 }), anim = useRef(0), [failed, setFailed] = useState(false), [, setTick] = useState(0);
  const [allies, setAllies] = useState(false), [hot, setHot] = useState('');   /* 온 세상 동맹 선 켜기 · 지금 이름이 뜬 동맹 */

  /* ── 보기 셈 — 화면 px = x + 그림 px × s ── */
  const fitS = () => { const { w, h: hh } = size.current; return Math.min(w / IW, hh / IH); };
  const worldS = () => { const f = fitS(), { w, h: hh } = size.current; return IW * f >= 700 ? f : Math.max(w / IW, hh / IH); };   /* 넓으면 한 장 다, 휴대폰은 높이에 맞춰 */
  const isWide = () => size.current.w >= 900;
  /* 가장 크게 — 넓은 화면은 그림 1 px 이 기기 픽셀 UPSCALE 개를 넘지 않게(그래도 온 세상 배율보다 작게는 아니다), 좁은 화면은 옛 한도 */
  const maxS = () => isWide() ? Math.max(worldS(), UPSCALE / (window.devicePixelRatio || 1)) : MAX;
  const insets = () => {   /* 위 줄(보기 고르개 · 위로) · 아래 글 판 · 넓은 화면의 옆 판이 가리는 자리 */
    const { w, h: hh } = size.current, wide = w >= 900, panel = level === 'anchor';
    return { t: 64, l: 16, r: panel && wide ? 380 : 64, b: level === 'world' ? 16 : panel && !wide ? Math.round(hh * .5) : wide ? 24 : 132 };
  };
  /* 그림이 화면보다 작은 쪽은 가운데에 — 지역에서만은 그쪽도 옮길 수 있다(넓은 화면 확대 한도로 그림이 화면 폭보다 작을 때 가장자리 지역의 나라 고리가 화면 밖으로 나가지 않게) */
  const limit = (v, loose = level === 'region') => { const { w, h: hh } = size.current, mw = IW * v.s, mh = IH * v.s;
    return { s: v.s, x: mw <= w && !loose ? (w - mw) / 2 : clamp(v.x, w / 2 - mw, w / 2), y: mh <= hh && !loose ? (hh - mh) / 2 : clamp(v.y, hh / 2 - mh, hh / 2) }; };
  const around = (cx, cy, s) => { const ins = insets(), { w, h: hh } = size.current, ax = ins.l + (w - ins.l - ins.r) / 2, ay = ins.t + (hh - ins.t - ins.b) / 2;
    return { s, x: ax - cx * IW * s, y: ay - cy * IH * s }; };
  const boxView = b => { const ins = insets(), { w, h: hh } = size.current;
    const s = clamp(Math.min((w - ins.l - ins.r) / (b.w * IW), (hh - ins.t - ins.b) / (b.h * IH)), worldS(), maxS());   /* 온 세상보다 작게는 아니다 — 휴대폰은 상자가 넘치면 옆으로 민다 */
    return around(b.x + b.w / 2, b.y + b.h / 2, s); };
  const target = () => {
    const f = fitS(), { w } = size.current;
    if (level === 'world') {
      const s = worldS(), hc = M.continents.heartland;   /* 휴대폰은 가운데 대륙부터(옆으로 밀어 본다) */
      return limit({ s, x: w / 2 - (hc ? hc.x + hc.w / 2 : .5) * IW * s, y: 0 });
    }
    const b = M.continents[cont.key], bv = boxView(b);
    if (level === 'anchor') return limit(around(b.x + b.w / 2, b.y + b.h / 2, Math.min(bv.s, Math.max(f * 2.2, worldS()))));   /* 작은 자리 — 둘레가 보이게 덜 다가간다 */
    if (level !== 'region') return limit(bv);
    const p = M.regions[reg.key], hi = isWide() ? maxS() : Math.min(MAX_REGION, Math.max(f * 3, worldS() * 1.5)), s = clamp(Math.max(bv.s * 1.8, f * 2.4), worldS(), hi);
    /* 빈 띠 없는 자리에서 시작해, 나라 고리가 가리는 자리 밖으로 나갈 때만 그만큼 민다(넓은 화면 DPR 2 처럼 그림이 화면만 할 때 가장자리 지역) */
    const v0 = limit(around(p.x, p.y, s), false), ins = insets(), hh = size.current.h, pos = ring(regionNations(reg.key).length);
    const ext = Math.max(...pos.map(q => Math.max(Math.abs(q.x), Math.abs(q.y)))) + 44, px = v0.x + p.x * IW * s, py = v0.y + p.y * IH * s;
    const push = (c, lo, hi2) => c - ext < lo ? lo - (c - ext) : c + ext > hi2 ? hi2 - (c + ext) : 0;
    return limit({ s, x: v0.x + push(px, ins.l, w - ins.r), y: v0.y + push(py, ins.t, hh - ins.b) });
  };
  const apply = v => {
    view.current = v; LOG.view = { s: +v.s.toFixed(4), x: Math.round(v.x), y: Math.round(v.y) }; LOG.level = level;
    const l = layer.current; if (!l) return;
    l.style.transform = 'translate(' + v.x.toFixed(2) + 'px,' + v.y.toFixed(2) + 'px) scale(' + v.s.toFixed(5) + ')'; l.style.setProperty('--s', v.s.toFixed(5));
    declutter(l, v.s, v.x, size.current.w); placeEdges(v);
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
    const s = clamp(v.s * k, fitS(), maxS()), q = s / v.s; flyTo({ s, x: px - (px - v.x) * q, y: py - (py - v.y) * q }, animate); };

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
  useEffect(() => {
    if (!first.current) {
      flyTo(target(), true);
      /* 누른 이름 표 · 가장자리 표가 사라지면 초점이 문서 처음으로 튀었다 — 지도 판으로 받아 키(화살표 · Esc)가 이어지게 */
      const a = document.activeElement; if ((!a || a === document.body || !a.isConnected) && stage.current) stage.current.focus({ preventScroll: true });
    }
    first.current = false;
    /* 나라가 보이는 층(지역 · 하늘 · 물밑 · 땅속 판) — 전경을 미리 받아 첫 누르기에도 로딩 화면이 뜨게 */
    if (level === 'region' || level === 'anchor') (level === 'region' ? regionNations(reg.key) : m.regions.filter(g => g.continent === cont.key).flatMap(g => regionNations(g.key)))
      .forEach(k => prefetchVista(doc, route, nats.get(k)));
  }, [levelKey]);

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
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top, s = clamp(g.v.s * d / g.d, fitS(), maxS()), q = s / g.v.s;
      apply(limit({ s, x: mx - (g.mx - g.v.x) * q, y: my - (g.my - g.v.y) * q })); return; }
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!moved.current && Math.hypot(dx, dy) > TAP) { moved.current = true; try { stage.current.setPointerCapture(e.pointerId); } catch (x) {} }   /* 끌기 시작한 뒤에만 잡는다 — 이름 단추 누르기를 빼앗지 않게 */
    if (moved.current) apply(limit({ s: g.v.s, x: g.v.x + dx, y: g.v.y + dy }));
  };
  const onUp = e => {
    const had = ptrs.current.delete(e.pointerId);
    if (ptrs.current.size === 1) { const [p] = ptrs.current.values(); gest.current = { x: p.x, y: p.y, v: view.current }; return; }
    gest.current = null;
    if (!had || moved.current || e.type !== 'pointerup') return;
    const ally = e.target.closest('[data-ally]');   /* 동맹 선을 누르면 그 이름(마우스는 대기만 해도 — onOver) */
    if (ally) { const f = ally.dataset.ally; setHot(x => x === f && e.pointerType !== 'mouse' ? '' : f); return; }
    if (!e.target.closest('button')) tapAt(e.clientX, e.clientY);
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
    } else if (level === 'anchor') {   /* 하늘 · 물밑 · 땅속 — 테두리 밖 빈 땅을 누르면 판을 닫고 온 세상으로 */
      const b = M.continents[cont.key]; if (ix < b.x || ix > b.x + b.w || iy < b.y || iy > b.y + b.h) back();
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
    const pre = () => prefetchVista(doc, route, nats.get(k));
    return h('button', { key: k, type: 'button', class: cls + (on ? ' is-lit' : ' is-fog'), 'data-n': k, 'data-cat': e.category, style,
        'aria-label': e.ko + ' ' + (e.symbol || '') + (on ? '' : ' · ' + W('walk.noart')), onPointerEnter: pre, onFocus: pre, onClick: ev => enter(k, ev.currentTarget) },
      h('b', null, e.symbol), h('span', null, e.ko)); };
  const regionNations = k => (byRegion[k] || []).slice().sort((a, b) => num(a) - num(b));
  const ko = k => (els.get(k) || {}).ko || k;

  /* ── 동맹 — 온 세상의 굽은 선(그림 px). 나라 자리 = 지역 점(하늘 · 물밑 · 땅속도 지역 점), 한 지역에 동맹 나라가 여럿이면 그 둘레에 ── */
  const ally = useMemo(() => {
    const per = {}, at = {}, pairN = {};
    for (const a of m.alliances) for (const k of a.nations) (per[m.nations[k].region] = per[m.nations[k].region] || new Set()).add(k);
    for (const [rk, set] of Object.entries(per)) {
      const p = M.regions[rk] || { x: .5, y: .5 }, ks = [...set].sort((a, b) => num(a) - num(b));
      ks.forEach((k, i) => { const t = -Math.PI / 2 + i * 2 * Math.PI / ks.length, r = ks.length > 1 ? ALLY_R : 0; at[k] = { x: p.x * IW + Math.cos(t) * r, y: p.y * IH + Math.sin(t) * r }; });
    }
    const f1 = v => v.toFixed(1);
    const lines = m.alliances.map(a => {
      let d = '', mid = null;
      for (let j = 1; j < a.nations.length; j++) {
        const [ka, kb] = [a.nations[j - 1], a.nations[j]], A = at[ka], B = at[kb], ra = m.nations[ka].region, rb = m.nations[kb].region;
        const pk = [ra, rb].sort().join('|'), i = pairN[pk] = (pairN[pk] == null ? 0 : pairN[pk] + 1), bend = BENDS[i % BENDS.length] * (ra <= rb ? 1 : -1) * (ra === rb ? 2.4 : 1);
        const cx = (A.x + B.x) / 2 - (B.y - A.y) * bend, cy = (A.y + B.y) / 2 + (B.x - A.x) * bend;
        d += (j === 1 ? 'M' + f1(A.x) + ' ' + f1(A.y) : '') + ' Q' + f1(cx) + ' ' + f1(cy) + ' ' + f1(B.x) + ' ' + f1(B.y);
        if (!mid) mid = { x: (A.x + 2 * cx + B.x) / 4, y: (A.y + 2 * cy + B.y) / 4 };
      }
      return { a, d, mid };
    });
    return { at, lines };
  }, [m, M]);
  const allyName = a => W('map.ally.pair', { family: a.ko, list: a.nations.map(ko).join(' · ') });

  /* ── 화면 밖 동맹 상대 — 대륙 · 지역 · 판에 보이는 나라의 동맹 상대가 다른 곳이면 그곳으로 가는 가장자리 표 하나(곳마다 묶음) ── */
  const edges = useMemo(() => {
    if (level === 'world') return [];
    const here = new Set(level === 'region' ? (byRegion[reg.key] || []) : m.regions.filter(g => g.continent === cont.key).flatMap(g => byRegion[g.key] || [])), by = new Map();
    for (const a of m.alliances) {
      if (!a.nations.some(k => here.has(k))) continue;
      for (const k of a.nations) {
        if (here.has(k)) continue;
        const g = regs.get(m.nations[k].region), c = conts.get(g.continent), surf = c.layer === 'surface', b = M.continents[c.key], key = surf ? g.key : c.key;
        const pt = surf ? M.regions[g.key] : { x: (b.label || [b.x + b.w / 2])[0], y: b.label ? b.label[1] : b.y + b.h / 2 };
        const e = by.get(key) || { key, to: { c: c.key, r: surf ? g.key : '' }, where: surf ? g.ko : c.ko, x: pt.x * IW, y: pt.y * IH, who: [], fam: [] };
        if (!e.who.includes(k)) e.who.push(k); if (!e.fam.includes(a.ko)) e.fam.push(a.ko); by.set(key, e);
      }
    }
    return [...by.values()].map(e => Object.assign(e, { who: e.who.sort((a, b) => num(a) - num(b)).map(ko).join(' · ') }));
  }, [levelKey, m]);
  /* 가장자리 표 놓기(보기가 바뀔 때마다 — apply) — 가리는 자리(insets · 아래 글 판) 안쪽 네모의 가운데에서 상대 쪽으로 뻗어 테두리에 닿는 곳.
     나라 표시 · 이름 표 · 앞서 놓은 표와 겹치면 테두리를 따라(왼쪽 · 오른쪽 테두리면 위아래로, 위 · 아래면 옆으로) 가까운 빈자리로 비킨다 */
  function placeEdges(v) {
    const box = edgeBox.current, rt = root.current; if (!box || !box.children.length || !rt) return;
    const ins = insets(), { w, h: hh } = size.current, capEl = rt.querySelector('.w-map-cap'), o = rt.getBoundingClientRect();
    const L = ins.l, Rr = w - ins.r, T = ins.t, B = hh - Math.max(ins.b, capEl ? capEl.offsetHeight + 22 : 0), cx = (L + Rr) / 2, cy = (T + B) / 2;
    const placed = [...rt.querySelectorAll('.w-mk, .w-ml')].map(e => { const r = e.getBoundingClientRect(); return { x: r.left - o.left + r.width / 2, y: r.top - o.top + r.height / 2, w: r.width, h: r.height }; }).filter(r => r.w);
    const hit = (x, y, bw, bh) => placed.some(p => Math.abs(p.x - x) < (p.w + bw) / 2 + 4 && Math.abs(p.y - y) < (p.h + bh) / 2 + 4);
    for (const e of box.children) {
      const bw = e.offsetWidth, bh = e.offsetHeight, hx = Math.max(0, (Rr - L - bw) / 2), hy = Math.max(0, (B - T - bh) / 2);
      let dx = v.x + e.dataset.x * v.s - cx, dy = v.y + e.dataset.y * v.s - cy; if (!dx && !dy) dy = -1;
      const t = Math.min(dx ? hx / Math.abs(dx) : Infinity, dy ? hy / Math.abs(dy) : Infinity);
      let x = cx + dx * t, y = cy + dy * t;
      const vert = Math.abs(Math.abs(x - cx) - hx) < 1, step = vert ? bh + 6 : 24;
      for (let i = 1; i <= 24 && hit(x, y, bw, bh); i++) {
        const k = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * step;
        const nx = vert ? x : clamp(x + k, cx - hx, cx + hx), ny = vert ? clamp(y + k, cy - hy, cy + hy) : y;
        if (!hit(nx, ny, bw, bh)) { x = nx; y = ny; break; }
      }
      placed.push({ x, y, w: bw, h: bh });
      e.style.transform = 'translate(' + Math.round(x - bw / 2) + 'px,' + Math.round(y - bh / 2) + 'px)';
      e.style.setProperty('--a', Math.atan2(dy, dx).toFixed(3) + 'rad');
    }
  }
  useLayoutEffect(() => { if (view.current) placeEdges(view.current); });

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
  /* 온 세상 동맹 — 선(SVG, 굵기는 확대와 무관) · 나라 자리 점 · 이름 표(고른 하나) */
  let allyLayer = null;
  if (level === 'world' && allies) {
    const on = ally.lines.find(l => l.a.family === hot), ends = [...new Set(m.alliances.flatMap(a => a.nations))];
    allyLayer = [
      h('svg', { key: 'ma', class: 'w-ma', width: IW, height: IH, viewBox: '0 0 ' + IW + ' ' + IH, 'aria-hidden': 'true',
          onPointerOver: e => { const g = e.pointerType === 'mouse' && e.target.closest('[data-ally]'); if (g) setHot(g.dataset.ally); },
          onPointerOut: e => { if (e.pointerType === 'mouse' && e.target.closest('[data-ally]')) setHot(''); } },
        ally.lines.map(({ a, d }) => h('g', { key: a.family, 'data-ally': a.family, class: hot === a.family ? 'is-on' : hot ? 'is-dim' : '' },
          h('path', { class: 'w-ma-hit', d }), h('path', { class: 'w-ma-line', d })))),
      ends.map(k => h('i', { key: 'e-' + k, class: 'w-ma-end' + (on && on.a.nations.includes(k) ? ' is-on' : ''), 'data-n': k, style: pct(ally.at[k].x / IW, ally.at[k].y / IH), 'aria-hidden': 'true' })),
      on && h('p', { key: 'tag', class: 'w-ma-tag', 'data-ally': on.a.family, style: pct(on.mid.x / IW, on.mid.y / IH), role: 'status' }, allyName(on.a))];
  }
  const crumbsOn = level !== 'world';
  const nTotal = c => m.regions.filter(g => g.continent === c.key).reduce((s, g) => s + (byRegion[g.key] || []).length, 0);
  const cap = level === 'continent' ? h('div', { class: 'w-map-cap', 'data-c': cont.key },
      h('h2', null, cont.ko), h('p', { class: 'w-map-sub' }, W('map.c.sub', { r: m.regions.filter(g => g.continent === cont.key).length, n: nTotal(cont) })), h('p', { class: 'w-map-why' }, cont.why_ko))
    : level === 'region' ? h('div', { class: 'w-map-cap', 'data-r': reg.key },
      h('h2', null, reg.ko, h('small', null, cont.ko)), h('p', { class: 'w-map-sub' }, W('map.r.sub', { n: (byRegion[reg.key] || []).length, lit: (byRegion[reg.key] || []).filter(lit).length })), h('p', { class: 'w-map-why' }, reg.why_ko))
    : null;
  const panel = level === 'anchor' ? h('aside', { class: 'w-map-panel', 'data-c': cont.key, 'data-layer': cont.layer, 'aria-label': W('map.panel', { name: cont.ko }) },
      h('h2', null, h('i', { class: 'w-ml-badge' }, W('layer.' + cont.layer)), cont.ko,
        h('button', { type: 'button', class: 'w-map-pclose', 'aria-label': W('map.panel.close'), onClick: back }, '×')),
      h('p', { class: 'w-map-why' }, cont.why_ko),
      m.regions.filter(g => g.continent === cont.key).map(g => h('section', { key: g.key, class: 'w-map-preg', 'data-r': g.key },
        h('h3', null, g.ko, h('small', null, W('map.region.n', { n: (byRegion[g.key] || []).length, lit: (byRegion[g.key] || []).filter(lit).length }))),
        h('div', { class: 'w-map-pnats' }, regionNations(g.key).map(k => nationBtn(k, 'w-pn')))))) : null;

  /* 화면 밖 이름 표 · 나라 표시에 Tab 으로 초점이 가면 브라우저가 판(overflow hidden)을 굴려 좌표가 어긋났다 — 굴린 만큼 지도를 옮기고 판은 제자리로 */
  const onScrollStage = () => { const st = stage.current, v = view.current; if (!st || !v || (!st.scrollLeft && !st.scrollTop)) return;
    const dx = st.scrollLeft, dy = st.scrollTop; st.scrollLeft = 0; st.scrollTop = 0; flyTo({ s: v.s, x: v.x - dx, y: v.y - dy }, false); };
  /* Esc — 지도 판 밖(하늘 판 · 가장자리 표 · 단추)에 초점이 있어도 한 층 위로, 온 세상이면 고른 동맹 이름을 닫는다 */
  const onRootKey = e => {
    if (e.key !== 'Escape' || e.target === stage.current || e.defaultPrevented) return;
    if (level !== 'world') { e.preventDefault(); back(); } else if (hot) { e.preventDefault(); setHot(''); }
  };
  return h('div', { class: 'w-map', ref: root, 'data-level': level, 'data-world': world, onKeyDown: onRootKey },
    h('div', { class: 'w-map-stage', ref: stage, tabIndex: 0, role: 'application', 'aria-roledescription': W('map.role'), 'aria-label': W('map.stage', { world: W('world.' + world) }),
        onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp, onKeyDown: onKey, onScroll: onScrollStage },
      h('div', { class: 'w-map-layer', ref: layer, style: { width: IW + 'px', height: IH + 'px' } },
        h('img', { class: 'w-map-img', src: BG + M.image, alt: '', width: IW, height: IH, draggable: false, decoding: 'async', onError: () => setFailed(true) }),
        level !== 'world' && cont && cont.layer !== 'surface' && h('i', { class: 'w-map-focus', style: Object.assign(pct(M.continents[cont.key].x, M.continents[cont.key].y), { width: M.continents[cont.key].w * 100 + '%', height: M.continents[cont.key].h * 100 + '%' }), 'aria-hidden': 'true' }),
        allyLayer, labels, marks)),
    failed && h('p', { class: 'w-map-fail', role: 'status' }, W('map.fail')),
    h('div', { class: 'w-map-top' },
      h(FirstView, { route, go }),
      crumbsOn && h('button', { type: 'button', class: 'w-map-up', onClick: back }, W('map.up')),
      level === 'world' && h('button', { type: 'button', class: 'w-map-allies', 'aria-pressed': allies, 'aria-label': W('map.allies.label'),
        onClick: () => { setAllies(!allies); setHot(''); } }, W('map.allies'))),
    level === 'world' && allies && h('div', { class: 'w-ma-list', role: 'group', 'aria-label': W('map.allies.list') }, m.alliances.map(a =>
      h('button', { key: a.family, type: 'button', 'data-ally': a.family, 'aria-pressed': hot === a.family, 'aria-label': allyName(a), onClick: () => setHot(hot === a.family ? '' : a.family) }, W('map.ally', { family: a.ko })))),
    edges.length > 0 && h('div', { class: 'w-map-edges', ref: edgeBox }, edges.map(e =>
      h('button', { key: e.key, type: 'button', class: 'w-me', 'data-to': e.key, 'data-x': e.x, 'data-y': e.y, 'aria-label': W('map.edge.label', { family: e.fam.join(' · '), who: e.who, where: e.where }),
          onClick: () => go(e.to) },
        h('i', { class: 'w-me-arrow', 'aria-hidden': 'true' }, '→'), h('span', null, W('map.edge', { who: e.who, where: e.where }))))),
    h('div', { class: 'w-map-zoom', role: 'group', 'aria-label': W('map.zoom') },
      h('button', { type: 'button', 'data-z': 'in', 'aria-label': W('map.in'), onClick: () => zoomBtn(1.5) }, '＋'),
      h('button', { type: 'button', 'data-z': 'out', 'aria-label': W('map.out'), onClick: () => zoomBtn(1 / 1.5) }, '−'),
      h('button', { type: 'button', 'data-z': 'fit', 'aria-label': W('map.fit'), onClick: () => flyTo(target(), true) }, '⤢')),
    cap, panel);
}
