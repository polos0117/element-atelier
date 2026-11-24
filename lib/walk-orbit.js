/* 「들어가는 곳」 나라 · 궤도 층(2026-11-12, 설계 물음 1 · 7 — 옛 gallery.html Nation 의 무대를 옮겨 넓힘).
   가운데 근본, 둘레 고리에 설계된 가문 전부 — 아직 안 그린 가문주는 흐린 빈 원(이름 · 「아직 그림 없음」)으로 자리를 지키고 누르면 목록 보기의 그 칸(→ 생성기).
   궤도 그림이 있는 일곱은 그 그림과 RING(큰 고리 반지름, 너비 대비), 나머지는 코드가 그린 점선 고리. 그림이 안 오면(404) 점선으로 갈아탄다.
   주기율표에서 들어오면 ①: 누른 칸에서 근본이 날아와 커지고, 고리가 선을 그리고, 가문주가 핵에서 퍼진다(lib/walk-fx.js — 움직임 판단 한 곳).
   머무는 동안 ②: 고리가 아주 천천히 돌고(손대면 멈춤, 뗀 뒤 2초), 그 분류의 입자가 떠다닌다(PixiJS — 이 층에서만 늦게 불러온다).
   전경(2026-11-24 — 도시 공방의 도시 무대 전경을 옮김, 철 시험): 그 나라 그 세계에 전경 그림이 있으면 궤도 위에 전경 무대(VistaStage)를 얹는다 — 나라 이름 · 사실 칸이 그 위로 올라가고,
   아래 1/4 에 근본 · 가문주 카드 띠. 궤도 · 보기 고르개 · 나라 글은 그 아래 그대로(궤도는 이 공방의 나라 지도라 남긴다). 전경이 없는 나라 · 세계는 예전 그대로 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useLayoutEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';
import { fx, FX, takeFrom, markFrom, mountParticles } from './walk-fx.js?v=6';
import { cardsOf, pick, imgFail } from './walk-data.js?v=7';

const R = window.AtelierWalk, W = window.W, IMG = window.AtelierImg;
const ORBIT = 'https://polos0117.github.io/element-atelier-img/backgrounds/orbits/orbit-';
const RING = { fe: .43, h: .407, o: .419, c: .398, na: .43, au: .428, og: .405 };
const list = v => Array.isArray(v) ? v : (v ? String(v).split(/\s*,\s*/).filter(Boolean) : []);   /* 성질 — 나라는 줄 목록, 가문은 쉼표 한 줄 */
const facts = el => [W('fact.number') + ' ' + el.number, W('fact.period') + ' ' + el.period, el.group ? W('fact.group') + ' ' + el.group : '', W('cat.' + el.category), W('state.' + el.state)].filter(Boolean);

/* 둥근 그림 — 썸네일 먼저, 없으면 원본. 다른 세계에서 빌려 온 그림이면 「… 의 그림」(옛 전시관처럼 — 최종 검토 A7) */
const fromWord = p => W('gallery.from', { world: W('world.' + p.world) });
const Thumb = ({ file }) => h('img', { src: IMG.thumbURL(file), alt: '', loading: 'lazy', decoding: 'async', onError: imgFail(file) });

/* 아직 그림 없는 카드 — 흐린 빈 원(이름 · 「아직 그림 없음」). 가문 층도 쓴다 */
export function EmptyArt({ card, onClick, class: cls }) {
  return h('button', { type: 'button', class: 'w-empty' + (cls ? ' ' + cls : ''), 'data-card': card.key, 'aria-label': card.name + ' · ' + W('walk.noart'), onClick },
    h('span', { class: 'w-empty-disc', 'aria-hidden': 'true' }), h('b', null, card.name), h('small', null, W('walk.noart')));
}

/* 궤도로 / 목록으로 — 역사 칸을 만들지 않는다(주소만 바꿔 쓴다). 이 기기에 기억하는 것은 이 고르개뿐이다(element_dex_v1 의 mode —
   나라 카드의 「목록」 · 빈 자리에서 목록으로 건너뛰기는 기억을 바꾸지 않는다, 최종 검토 A3) */
const remember = m => { try { const k = 'element_dex_v1', p = JSON.parse(localStorage.getItem(k) || '{}') || {}; p.mode = m; localStorage.setItem(k, JSON.stringify(p)); } catch (e) {} };
export function ModeSwitch({ route, go }) {
  return h('div', { class: 'w-mode', role: 'group', 'aria-label': W('walk.mode') }, ['orbit', 'list'].map(m =>
    h('button', { key: m, type: 'button', 'data-mode': m, 'aria-pressed': (route.mode || 'orbit') === m, onClick: () => { remember(m); go({ mode: m }, { replace: true }); } }, W('walk.mode.' + m))));
}

/* ── 전경(2026-11-24) ── 그 나라 그 세계의 풍경 한 장(img.json 세계 몫의 vista — tools/register-images.py). 고른 화풍(st) → 기본 화풍 → 아무 화풍. 없으면 null */
export function vistaOf(doc, nk, world, st) {
  const bs = IMG.styleMap(doc.img[nk]), order = [st, doc.s.default, ...Object.keys(bs)].filter((k, i, a) => k && bs[k] && a.indexOf(k) === i);
  for (const k of order) { const f = IMG.formOf(bs[k], world); if (f && f.vista) return f.vista; }
  return null;
}
/* 전경 무대 — 배경(휴대폰 세로는 천천히 좌우로, 움직임 끔이면 가운데에 멈춤) · 위에 나라 이름 · 아래 1/4 에 카드 띠(근본 → 가문주, 설계표 차례).
   카드: 근본은 그림이면 한 장 · 가문주는 그림이면 가문(⑤ 가 띠의 그림에서 날아온다) · 그림이 없으면 목록의 그 칸(궤도의 빈 원과 같다).
   전경 구경: 「전경」 단추 또는 배경 길게 누르기(0.45초 — 단추 · 카드 위는 아님)면 이름 · 띠를 감추고 흐름을 멈춘 채 그림을 무대 높이에 맞춰 펴 옆으로 밀어 본다(흐르던 자리부터).
   「돌아가기」 · 「전경」 다시 · Esc · 그림을 한 번 누르기로 나온다. 역사 칸은 만들지 않는다 */
const LONG = 450;
function VistaStage({ doc, route, go, n, el, root, lords, world, file, title, toList }) {
  const bg = useRef(null), look = useRef(null), press = useRef(null), drag = useRef(null), at = useRef(0.5), [seeing, setSeeing] = useState(false);
  const wn = W('world.' + world), cards = [root].concat(lords);
  /* 들어갈 때 흐르던 자리(background-position-x %)를 잡아 둔다 — 멈춰 있으면 가운데(50%) */
  const enter = () => { const x = bg.current ? parseFloat(getComputedStyle(bg.current).backgroundPositionX) : NaN; at.current = isFinite(x) ? Math.min(1, Math.max(0, x / 100)) : 0.5; setSeeing(true); };
  const leave = () => setSeeing(false);
  useLayoutEffect(() => {   /* 그리는 즉시 붙인다 — 들자마자 누른 Esc 를 놓치지 않게. 도구 상자 · 풍경의 Esc 보다 먼저(capture) */
    if (!seeing) return;
    const k = e => { if (e.key === 'Escape') { e.stopPropagation(); leave(); } };
    addEventListener('keydown', k, true); return () => removeEventListener('keydown', k, true);
  }, [seeing]);
  const place = () => { const b = look.current; if (b) b.scrollLeft = at.current * Math.max(0, b.scrollWidth - b.clientWidth); };
  const longOff = () => { if (press.current) { clearTimeout(press.current.t); press.current = null; } };
  useEffect(() => longOff, []);
  const longOn = {
    onPointerDown: e => { if (seeing || e.button > 0 || e.target.closest('button, a, .w-vista-strip, .w-vista-tools')) return;
      longOff(); const x = e.clientX, y = e.clientY; press.current = { x, y, t: setTimeout(() => { press.current = null; enter(); }, LONG) }; },
    onPointerMove: e => { const p = press.current; if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) longOff(); },
    onPointerUp: longOff, onPointerCancel: longOff, onPointerLeave: longOff,
    onContextMenu: e => { if (!e.target.closest('button, a')) e.preventDefault(); } };
  /* 구경 — 손가락은 기본 옆 스크롤, 마우스는 끌어서. 움직임 없이 한 번 누르면 나온다 */
  const lookOn = {
    onPointerDown: e => { drag.current = { x: e.clientX, l: look.current.scrollLeft, moved: false, mouse: e.pointerType === 'mouse' }; },
    onPointerMove: e => { const d = drag.current; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 6) d.moved = true; if (d.mouse && e.buttons) look.current.scrollLeft = d.l - dx; },
    onPointerUp: () => { const d = drag.current; drag.current = null; if (d && !d.moved) leave(); },
    onPointerCancel: () => { drag.current = null; } };
  const label = W('walk.vista', { world: wn, nation: el.ko });
  return h('section', Object.assign({ class: 'w-vista' + (seeing ? ' is-look' : ''), 'data-world': world, 'aria-label': label }, longOn),
    h('div', { class: 'w-vista-bg', ref: bg, 'aria-hidden': 'true', style: '--vista:url("' + IMG.imgURL(file) + '")' }),
    seeing ? h('div', Object.assign({ class: 'w-vista-look', ref: look, role: 'img', 'aria-label': label + ' — ' + W('walk.look.hint') }, lookOn),
      h('img', { src: IMG.imgURL(file), alt: '', draggable: false, onLoad: place, ref: im => { if (im && im.complete) requestAnimationFrame(place); } })) : null,
    seeing ? h('button', { type: 'button', class: 'w-look-close', ref: b => { if (b && !b.dataset.f) { b.dataset.f = '1'; b.focus({ preventScroll: true }); } }, onClick: leave }, W('walk.look.close')) : null,
    seeing ? h('p', { class: 'w-look-hint', 'aria-hidden': 'true' }, W('walk.look.hint')) : null,
    h('div', { class: 'w-vista-top', 'aria-hidden': seeing ? 'true' : undefined }, title),
    h('div', { class: 'w-vista-foot' },
    h('div', { class: 'w-vista-tools' },
      h('button', { type: 'button', class: 'w-look-btn', 'aria-pressed': seeing ? 'true' : 'false', title: W('walk.look.label'), onClick: () => (seeing ? leave() : enter()) }, W('walk.look'))),
    h('ol', { class: 'w-vista-strip', 'aria-label': W('walk.strip', { world: wn, nation: el.ko }), 'aria-hidden': seeing ? 'true' : undefined }, cards.map(c => {
      const p = pick(doc, c, world, route.st), isRoot = c.tier === 'root', name = isRoot ? el.ko : c.family.ko;
      const sub = isRoot ? W('walk.vroot') : W('gallery.citizens', { n: (c.family.citizens || []).length });
      const open = e => {
        if (!p) return toList(c);
        if (isRoot) return go({ card: c.key, pic: p.file });
        markFrom(e.currentTarget.querySelector('.w-vcard-fig')); go({ f: c.family.key });
      };
      return h('li', { key: c.key, 'data-card': c.key },
        h('button', { type: 'button', class: 'w-vcard' + (isRoot ? ' is-root' : '') + (p ? '' : ' empty'), tabIndex: seeing ? -1 : undefined,
            'aria-label': W(p ? (isRoot ? 'walk.vcard.root' : 'walk.vcard.family') : 'walk.vcard.none', { name: c.name }), onClick: open },
          p ? h('span', { class: 'w-vcard-fig' }, h(Thumb, { file: p.file }), p.from && h('span', { class: 'w-from' }, fromWord(p)))
            : h('span', { class: 'w-vcard-fig is-empty' }, h('i', { 'aria-hidden': 'true' }), W('walk.noart')),
          h('b', null, isRoot ? h('span', { class: 'w-vcard-sym' }, el.symbol) : null, name), h('small', null, sub)));
    }))));
}

function Nation({ doc, route, go, n }) {
  const d = doc.d, cards = cardsOf(doc, n), root = cards[0], el = root.el, lords = cards.filter(c => c.tier === 'lord'), N = lords.length;
  const world = R.worldOf(route, d.vocab.worlds), [artFail, setArtFail] = useState(false), art = !!RING[n.key] && !artFail, ringR = (RING[n.key] || .41) * 100;
  const stage = useRef(null), fxHost = useRef(null), held = useRef(0), [motion, setMotion] = useState(R.motionOn());
  /* ② 입자 — 움직임 판단이 바뀌면(도구 상자의 움직임 끄기) 바로 붙이고 뗀다 */
  useEffect(() => { const m = () => setMotion(R.motionOn()); addEventListener('element-motion', m); return () => removeEventListener('element-motion', m); }, []);
  useEffect(() => {
    if (!motion) return;
    let alive = true, mounted = null;
    mountParticles(fxHost.current, { kind: R.particleKind(el.category), cap: R.particleCap(innerWidth) }).then(x => { if (alive) mounted = x; else if (x) x.destroy(); });
    return () => { alive = false; if (mounted) mounted.destroy(); };
  }, [motion]);
  /* 손대면 고리가 멈춘다(누르기 쉽게) — 뗀 뒤 2초 지나 다시 */
  const hold = on => { const s = stage.current; clearTimeout(held.current); if (on) s.classList.add('held'); else held.current = setTimeout(() => s.classList.remove('held'), 2000); };
  useEffect(() => () => clearTimeout(held.current), []);
  /* ① — 주기율표에서 누른 자리가 넘어왔을 때만(주소로 바로 열거나 ‹ › 로 오면 없다). 그리기 전에 건다 — 끝 모습이 한 틀 먼저 비치지 않게 */
  useLayoutEffect(() => {
    const from = takeFrom(), s = stage.current; if (!from || !s) return;
    const nuc = s.querySelector('.w-nucleus'), vroot = document.querySelector('.w-vcard.is-root .w-vcard-fig');
    /* 전경이 있으면 누른 칸이 띠의 근본 카드로 날아오고 가문주 카드가 차례로(궤도는 첫 화면 아래라 그대로) */
    fx('enter', () => vroot ? (FX.flyFrom(from, vroot), FX.stagger(document.querySelectorAll('.w-vcard:not(.is-root)'), { y: 14, each: .05 }))
      : (FX.flyFrom(from, nuc), FX.draw(s.querySelector('.w-ring-line')), FX.burst(s.querySelectorAll('.w-node'), nuc.getBoundingClientRect())));
  }, []);
  const toList = c => go({ mode: 'list', at: c.key, f: '', card: '' });
  const rootPic = pick(doc, root, world, route.st);
  const wtext = n.worlds && n.worlds[world], traits = list(n.traits && n.traits.ko);
  /* 전경 — 있으면 나라 이름 · 사실 칸이 전경 위로 올라간다. html[data-vista] 는 좁은 화면의 머리 줄이기(lib/walk.css)가 본다 */
  const vista = vistaOf(doc, n.key, world, route.st), nb = R.neighbors(R.nationOrder(d), n.key);
  useLayoutEffect(() => { const de = document.documentElement; if (vista) de.dataset.vista = '1'; else delete de.dataset.vista; }, [vista]);
  useEffect(() => () => { delete document.documentElement.dataset.vista; }, []);
  const head = [
    h('p', { key: 's', class: 'w-sym', 'data-cat': el.category }, h('span', null, el.symbol), h('small', null, el.number)),
    h('h1', { key: 'h' }, el.ko, h('small', null, el.en)),
    h('p', { key: 'f', class: 'w-facts' }, facts(el).join(' · '))];
  const title = vista && h('div', { class: 'w-vtitle' }, head,
    nb && h('div', { class: 'w-vsteps' }, [['prev', '‹'], ['next', '›']].map(([k, t]) =>
      h('button', { key: k, type: 'button', 'data-step': k, 'aria-label': W('walk.' + k), onClick: () => go({ n: nb[k] }, { replace: true }) }, t))));
  return h('div', { class: 'w-nation' + (vista ? ' has-vista' : '') },
    vista && h(VistaStage, { doc, route, go, n, el, root, lords, world, file: vista, title, toList }),
    h('div', { class: 'w-stage-wrap' },
      h('div', { class: 'w-stage', ref: stage, onPointerDown: () => hold(true), onPointerUp: () => hold(false), onPointerCancel: () => hold(false), onPointerLeave: e => { if (e.currentTarget.classList.contains('held')) hold(false); } },
        art && h('img', { class: 'w-orbit-img', src: ORBIT + n.key + '.webp', alt: '', decoding: 'async', onError: () => setArtFail(true) }),
        h('svg', { class: 'w-ring', viewBox: '0 0 100 100', 'aria-hidden': 'true' },
          !art && h('circle', { class: 'w-ring-dash', cx: 50, cy: 50, r: ringR }),
          h('circle', { class: 'w-ring-line', cx: 50, cy: 50, r: ringR, pathLength: 1 })),
        h('div', { class: 'w-fx', ref: fxHost, 'aria-hidden': 'true' }),   /* 입자 캔버스 자리 — 그림 · 고리 위, 근본 · 가문주 아래. Preact 가 안을 그리지 않는다 */
        rootPic
          ? h('button', { type: 'button', class: 'w-nucleus', 'data-card': root.key, 'aria-label': root.name, onClick: () => go({ card: root.key, pic: rootPic.file }) },
              h('span', { class: 'w-nuc-pic', 'aria-hidden': 'true' }, h(Thumb, { file: rootPic.file }), rootPic.from && h('span', { class: 'w-from' }, fromWord(rootPic))), h('span', { class: 'w-nuc-cap' }, h('b', null, el.symbol), ' ' + el.ko))
          : h(EmptyArt, { card: root, class: 'w-nucleus empty', onClick: () => toList(root) }),
        h('div', { class: 'w-orbit-ring' }, lords.map((l, i) => {
          const a = i / N * 2 * Math.PI - Math.PI / 2, x = 50 + Math.cos(a) * ringR, y = 50 + Math.sin(a) * ringR;
          const p = pick(doc, l, world, route.st), cits = (l.family.citizens || []).length;
          return h('button', { key: l.key, type: 'button', class: 'w-node' + (p ? '' : ' empty'), 'data-f': l.family.key, 'data-card': l.key,
              style: { left: x.toFixed(2) + '%', top: y.toFixed(2) + '%' }, 'aria-label': l.name + (p ? '' : ' · ' + W('walk.noart')),
              onClick: e => { if (p) { markFrom(e.currentTarget.querySelector('.w-node-pic')); go({ f: l.family.key }); } else toList(l); } },
            h('span', { class: 'w-node-pic', 'aria-hidden': 'true' }, p && h(Thumb, { file: p.file })),
            h('b', null, l.family.ko), h('small', null, W('gallery.citizens', { n: cits })), !p && h('em', null, W('walk.noart')), p && p.from && h('em', { class: 'w-from-note' }, fromWord(p)));
        }))),
      h(ModeSwitch, { route, go })),
    h('div', { class: 'w-ntext' },
      vista ? null : head,
      h('p', { class: 'w-persona' }, n.persona),
      wtext && h('div', { class: 'w-wtext' }, h('h2', null, W('gallery.world.text') + ' · ' + W('world.' + world)), h('p', null, wtext.ko)),
      traits.length > 0 && h('ul', { class: 'w-traits' }, traits.map((t, i) => h('li', { key: i }, t)))));
}

export function OrbitLayer({ doc, route, go }) {
  const n = doc.d.nations.find(x => x.key === route.n);
  /* 나라마다 새로 붙인다(‹ › 로 옆 나라 — 그림 실패 · 효과 · 입자를 나라마다) */
  return h('section', { class: 'w-layer w-orbit', 'data-layer': 'orbit' }, h(Nation, { key: n.key, doc, route, go, n }));
}
