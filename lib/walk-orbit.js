/* 「들어가는 곳」 나라 · 궤도 층(2026-11-12, 설계 물음 1 · 7 — 옛 gallery.html Nation 의 무대를 옮겨 넓힘).
   가운데 근본, 둘레 고리에 설계된 가문 전부 — 아직 안 그린 가문주는 흐린 빈 원(이름 · 「아직 그림 없음」)으로 자리를 지키고 누르면 목록 보기의 그 칸(→ 생성기).
   궤도 그림이 있는 일곱은 그 그림과 RING(큰 고리 반지름, 너비 대비), 나머지는 코드가 그린 점선 고리. 그림이 안 오면(404) 점선으로 갈아탄다.
   주기율표에서 들어오면 ①: 누른 칸에서 근본이 날아와 커지고, 고리가 선을 그리고, 가문주가 핵에서 퍼진다(lib/walk-fx.js — 움직임 판단 한 곳).
   머무는 동안 ②: 고리가 아주 천천히 돌고(손대면 멈춤, 뗀 뒤 2초), 그 분류의 입자가 떠다닌다(PixiJS — 이 층에서만 늦게 불러온다) */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useLayoutEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';
import { fx, FX, takeFrom, markFrom, mountParticles } from './walk-fx.js?v=5';
import { cardsOf, pick } from './walk-data.js?v=3';

const R = window.AtelierWalk, W = window.W, IMG = window.AtelierImg;
const ORBIT = 'https://polos0117.github.io/element-atelier-img/backgrounds/orbits/orbit-';
const RING = { fe: .43, h: .407, o: .419, c: .398, na: .43, au: .428, og: .405 };
const list = v => Array.isArray(v) ? v : (v ? String(v).split(/\s*,\s*/).filter(Boolean) : []);   /* 성질 — 나라는 줄 목록, 가문은 쉼표 한 줄 */
const facts = el => [W('fact.number') + ' ' + el.number, W('fact.period') + ' ' + el.period, el.group ? W('fact.group') + ' ' + el.group : '', W('cat.' + el.category), W('state.' + el.state)].filter(Boolean);

/* 둥근 그림 — 썸네일 먼저, 없으면 원본 */
const Thumb = ({ file }) => h('img', { src: IMG.thumbURL(file), alt: '', loading: 'lazy', decoding: 'async',
  onError: e => { const t = e.currentTarget; if (!t.dataset.full) { t.dataset.full = '1'; t.src = IMG.imgURL(file); } } });

/* 아직 그림 없는 카드 — 흐린 빈 원(이름 · 「아직 그림 없음」). 가문 층도 쓴다 */
export function EmptyArt({ card, onClick, class: cls }) {
  return h('button', { type: 'button', class: 'w-empty' + (cls ? ' ' + cls : ''), 'data-card': card.key, 'aria-label': card.name + ' · ' + W('walk.noart'), onClick },
    h('span', { class: 'w-empty-disc', 'aria-hidden': 'true' }), h('b', null, card.name), h('small', null, W('walk.noart')));
}

/* 궤도로 / 목록으로 — 역사 칸을 만들지 않는다(주소만 바꿔 쓴다), 껍데기가 이 기기에 기억 */
export function ModeSwitch({ route, go }) {
  return h('div', { class: 'w-mode', role: 'group', 'aria-label': W('walk.mode') }, ['orbit', 'list'].map(m =>
    h('button', { key: m, type: 'button', 'data-mode': m, 'aria-pressed': (route.mode || 'orbit') === m, onClick: () => go({ mode: m }, { replace: true }) }, W('walk.mode.' + m))));
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
    const nuc = s.querySelector('.w-nucleus');
    fx('enter', () => { FX.flyFrom(from, nuc); FX.draw(s.querySelector('.w-ring-line')); FX.burst(s.querySelectorAll('.w-node'), nuc.getBoundingClientRect()); });
  }, []);
  const toList = c => go({ mode: 'list', at: c.key, f: '', card: '' });
  const rootPic = pick(doc, root, world, route.st);
  const wtext = n.worlds && n.worlds[world], traits = list(n.traits && n.traits.ko);
  return h('div', { class: 'w-nation' },
    h('div', { class: 'w-stage-wrap' },
      h('div', { class: 'w-stage', ref: stage, onPointerDown: () => hold(true), onPointerUp: () => hold(false), onPointerCancel: () => hold(false), onPointerLeave: e => { if (e.currentTarget.classList.contains('held')) hold(false); } },
        art && h('img', { class: 'w-orbit-img', src: ORBIT + n.key + '.webp', alt: '', decoding: 'async', onError: () => setArtFail(true) }),
        h('svg', { class: 'w-ring', viewBox: '0 0 100 100', 'aria-hidden': 'true' },
          !art && h('circle', { class: 'w-ring-dash', cx: 50, cy: 50, r: ringR }),
          h('circle', { class: 'w-ring-line', cx: 50, cy: 50, r: ringR, pathLength: 1 })),
        h('div', { class: 'w-fx', ref: fxHost, 'aria-hidden': 'true' }),   /* 입자 캔버스 자리 — 그림 · 고리 위, 근본 · 가문주 아래. Preact 가 안을 그리지 않는다 */
        rootPic
          ? h('button', { type: 'button', class: 'w-nucleus', 'data-card': root.key, 'aria-label': root.name, onClick: () => go({ card: root.key, pic: rootPic.file }) },
              h('span', { class: 'w-nuc-pic', 'aria-hidden': 'true' }, h(Thumb, { file: rootPic.file })), h('span', { class: 'w-nuc-cap' }, h('b', null, el.symbol), ' ' + el.ko))
          : h(EmptyArt, { card: root, class: 'w-nucleus empty', onClick: () => toList(root) }),
        h('div', { class: 'w-orbit-ring' }, lords.map((l, i) => {
          const a = i / N * 2 * Math.PI - Math.PI / 2, x = 50 + Math.cos(a) * ringR, y = 50 + Math.sin(a) * ringR;
          const p = pick(doc, l, world, route.st), cits = (l.family.citizens || []).length;
          return h('button', { key: l.key, type: 'button', class: 'w-node' + (p ? '' : ' empty'), 'data-f': l.family.key, 'data-card': l.key,
              style: { left: x.toFixed(2) + '%', top: y.toFixed(2) + '%' }, 'aria-label': l.name + (p ? '' : ' · ' + W('walk.noart')),
              onClick: e => { if (p) { markFrom(e.currentTarget.querySelector('.w-node-pic')); go({ f: l.family.key }); } else toList(l); } },
            h('span', { class: 'w-node-pic', 'aria-hidden': 'true' }, p && h(Thumb, { file: p.file })),
            h('b', null, l.family.ko), h('small', null, W('gallery.citizens', { n: cits })), !p && h('em', null, W('walk.noart')));
        }))),
      h(ModeSwitch, { route, go })),
    h('div', { class: 'w-ntext' },
      h('p', { class: 'w-sym', 'data-cat': el.category }, h('span', null, el.symbol), h('small', null, el.number)),
      h('h1', null, el.ko, h('small', null, el.en)),
      h('p', { class: 'w-facts' }, facts(el).join(' · ')),
      h('p', { class: 'w-persona' }, n.persona),
      wtext && h('div', { class: 'w-wtext' }, h('h2', null, W('gallery.world.text') + ' · ' + W('world.' + world)), h('p', null, wtext.ko)),
      traits.length > 0 && h('ul', { class: 'w-traits' }, traits.map((t, i) => h('li', { key: i }, t)))));
}

export function OrbitLayer({ doc, route, go }) {
  const n = doc.d.nations.find(x => x.key === route.n);
  /* 나라마다 새로 붙인다(‹ › 로 옆 나라 — 그림 실패 · 효과 · 입자를 나라마다) */
  return h('section', { class: 'w-layer w-orbit', 'data-layer': 'orbit' }, h(Nation, { key: n.key, doc, route, go, n }));
}
