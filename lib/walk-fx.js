/* 「들어가는 곳」 효과 문(2026-11-12 — 효과 다섯, 사용자 「다 넣어줘」). 효과는 여기서만 켜고 끈다.
   움직임 판단은 lib/walk-core.js 의 motionOn() 한 곳(기기의 움직임 줄이기 · 도구 상자의 움직임 끄기) — 꺼져 있으면 아무것도 안 하고 바로 바뀐다.
   window.AtelierWalkFx 는 검사 손잡이 — 효과가 실제로 돈 때만 fired 에 이름을 더한다. PixiJS 는 이 파일의 함수 안에서만 늦게 불러온다(과제 5 · 9) */
import * as FX from './motion-fx.js?v=1';
import { PIXI_URL } from './holo.js?v=3';
export { FX };

const LOG = window.AtelierWalkFx = window.AtelierWalkFx || { fired: [], particles: null };

export function fx(name, fn) {
  if (!window.AtelierWalk.motionOn()) return false;
  LOG.fired.push(name); fn(); return true;
}
/* 누른 자리를 다음 층에 넘긴다 — 한 번 쓰면 비운다 */
let FROM = null;
export function markFrom(el) { try { FROM = el.getBoundingClientRect(); } catch (e) { FROM = null; } }
export function takeFrom() { const r = FROM; FROM = null; return r; }

/* ④ 불꽃 — 고른 칸 둘레로 그 분류 색 불티 여덟, 700ms 뒤 지운다(위치 · 투명도만, CSS) */
export function spark(el) {
  return fx('spark', () => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, color = getComputedStyle(el).getPropertyValue('--cat');
    const reach = Math.max(18, r.width * 1.6), made = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, s = document.createElement('i');
      s.className = 'w-spark'; s.setAttribute('aria-hidden', 'true');
      s.style.cssText = `left:${cx}px;top:${cy}px;--cat:${color};--dx:${(Math.cos(a) * reach).toFixed(1)}px;--dy:${(Math.sin(a) * reach).toFixed(1)}px`;
      document.body.appendChild(s); made.push(s);
    }
    setTimeout(() => made.forEach(s => s.remove()), 700);
  });
}

/* ── 효과 ② 궤도 입자(PixiJS) ──────────────────────────────────────────────
   PixiJS 는 여기서만, 처음 쓸 때 한 번 불러온다(실패하면 다음에 다시). 주소는 lib/holo.js 의 PIXI_URL 하나.
   움직임이 꺼졌거나 WebGL 이 없거나 PixiJS 를 못 받으면 null — 오류를 던지지 않고, 궤도는 그대로 쓴다.
   덮개에서 끊기지 않게 수는 cap(walk-core particleCap), 숨은 탭 · 화면 밖이면 멈춘다. */
let PIXI_P = null;
export const loadPixi = () => (PIXI_P = PIXI_P || import(PIXI_URL).catch(e => { PIXI_P = null; throw e; }));
const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };
const rnd = (a, b) => a + Math.random() * (b - a);
/* 종류마다: 모양(Graphics → 텍스처 한 장) · 색 · 태어나기 · 투명도. t = 나이(초), p.life = 수명(초) */
const KINDS = {
  ember: { tint: 0xffa04a, draw: g => g.circle(4, 4, 3).fill(0xffffff), size: [.5, 1],          /* 불티 — 주황 점, 위로 오르며 흐려짐 */
    born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(h * .3, h); p.vx = rnd(-8, 8); p.vy = rnd(-34, -14); p.life = rnd(2.5, 5); },
    alpha: (p, t) => Math.min(1, t * 3) * (1 - t / p.life) },
  breeze: { tint: 0xffffff, draw: g => g.roundRect(0, 0, 26, 2, 1).fill(0xffffff), size: [.6, 1.2],   /* 바람결 — 가는 흰 선, 옆으로 흐름 */
    born: (p, w, h) => { p.x = rnd(-30, w); p.y = rnd(0, h); p.vx = rnd(22, 48); p.vy = rnd(-3, 3); p.life = rnd(3, 6); },
    alpha: (p, t) => .4 * Math.sin(Math.PI * t / p.life) },
  mote: { tint: 0xfff3c8, draw: g => g.circle(3, 3, 2.2).fill(0xffffff), size: [.5, 1.1],          /* 빛 알갱이 — 작은 빛 점, 천천히 떠다님 */
    born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(0, h); p.vx = rnd(-6, 6); p.vy = rnd(-6, 6); p.life = rnd(4, 8); },
    alpha: (p, t) => .85 * Math.sin(Math.PI * t / p.life) },
  glint: { tint: 0xc9fff1, draw: g => g.poly([5, 0, 7, 5, 5, 10, 3, 5]).fill(0xffffff), size: [.6, 1.3],   /* 결정 반짝임 — 마름모, 깜빡 */
    born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(0, h); p.vx = 0; p.vy = rnd(-2, 2); p.life = rnd(1.2, 2.6); },
    alpha: (p, t) => Math.pow(Math.sin(Math.PI * t / p.life), 6) },
  flicker: { tint: 0x6cb6ff, draw: g => g.circle(4, 4, 3).fill(0xffffff), size: [.5, 1],          /* 푸른 깜빡임 — 푸른 점, 켜졌다 꺼짐 */
    born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(0, h); p.vx = rnd(-3, 3); p.vy = rnd(-3, 3); p.life = rnd(2, 4); },
    alpha: (p, t) => (Math.sin(t * 9 + p.phase) > .2 ? .9 : .08) * Math.sin(Math.PI * t / p.life) }
};

export async function mountParticles(host, { kind, cap }) {
  const K = KINDS[kind] || KINDS.mote;
  if (!host || !window.AtelierWalk.motionOn() || !hasWebGL()) return null;
  let PIXI; try { PIXI = await loadPixi(); } catch (e) { return null; }
  if (!host.isConnected || !window.AtelierWalk.motionOn()) return null;
  const app = new PIXI.Application(), canvas = document.createElement('canvas');
  canvas.className = 'w-particles'; canvas.setAttribute('aria-hidden', 'true');
  const W0 = () => Math.max(2, host.clientWidth), H0 = () => Math.max(2, host.clientHeight);
  try {
    /* lib/holo.js 와 같이 — 배열로 줘야 WebGPU · Canvas 로 넘어가지 않고, WebGL 을 못 얻으면 여기서 멈춘다 */
    await app.init({ canvas, width: W0(), height: H0(), backgroundAlpha: 0, antialias: false, preference: ['webgl'],
      resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false });
  } catch (e) { try { app.destroy(); } catch (x) {} return null; }
  const kill = () => { try { app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true }); } catch (e) {} };   /* 전역 자원은 놓지 않는다 — 세계 전환 · 한 장의 홀로가 같이 쓴다 */
  if (!host.isConnected) { kill(); return null; }
  const g = new PIXI.Graphics(); K.draw(g); const tex = app.renderer.generateTexture(g); g.destroy();
  const parts = [];
  for (let i = 0; i < cap; i++) {
    const sp = new PIXI.Sprite(tex); sp.anchor.set(.5); sp.tint = K.tint; sp.scale.set(rnd(K.size[0], K.size[1])); sp.alpha = 0;
    const p = { sp, t: 0, phase: rnd(0, 6.3) }; K.born(p, W0(), H0()); p.t = rnd(0, p.life);   /* 처음부터 나이가 고르게 — 한꺼번에 태어나 깜빡이지 않게 */
    app.stage.addChild(sp); parts.push(p);
  }
  app.ticker.add(tk => {
    const dt = Math.min(.1, tk.deltaMS / 1000), w = app.screen.width, h = app.screen.height;
    for (const p of parts) {
      p.t += dt; if (p.t >= p.life) { K.born(p, w, h); p.t = 0; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.sp.position.set(p.x, p.y); p.sp.alpha = Math.max(0, K.alpha(p, p.t));
    }
  });
  host.appendChild(canvas);
  let dead = false, inView = true;
  const state = () => ({ kind, count: parts.length, running: !dead && app.ticker.started });
  const sync = () => {
    if (dead) return;
    if (!document.hidden && inView) app.ticker.start(); else app.ticker.stop();
    LOG.particles = state();
  };
  const ro = window.ResizeObserver ? new ResizeObserver(() => { if (!dead) app.renderer.resize(W0(), H0()); }) : null; if (ro) ro.observe(host);
  const io = window.IntersectionObserver ? new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; sync(); }) : null; if (io) io.observe(host);
  document.addEventListener('visibilitychange', sync);
  sync();
  return {
    state,
    destroy() {
      if (dead) return; dead = true;
      document.removeEventListener('visibilitychange', sync); if (ro) ro.disconnect(); if (io) io.disconnect();
      kill(); canvas.remove(); LOG.particles = null;
    }
  };
}

/* ── 효과 ③ 세계 바꾸기 전환 ──────────────────────────────────────────────
   host(main.w-main) 위에 덮개 .w-shift[data-to] 하나 — 늘 하나(새로 바꾸면 옛것을 지우고 새로), 누르기를 막지 않고(pointer-events none) 900ms 안에 지운다.
   가면 움직임은 CSS(lib/walk.css — 판타지 가루 · 스팀펑크 김 · 메카 주사선, 600ms). WebGL · PixiJS 가 되면 같은 덮개 안에 그 세계 입자 한 번 — 안 되면 CSS 만.
   세계 상태는 이 효과를 기다리지 않는다(부르는 쪽이 주소를 먼저 바꾼다). */
const BURST = {
  fantasy: { n: 40, draw: g => g.circle(4, 4, 2.6).fill(0xffffff), tints: [0xffe08a, 0xd9c2ff, 0xffffff],   /* 가루 — 가운데서 흩어진다 */
    born: (p, w, h) => { const a = rnd(0, 6.3), s = rnd(120, 420); p.x = w / 2 + rnd(-w * .3, w * .3); p.y = h / 2 + rnd(-h * .25, h * .25); p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.life = rnd(.4, .75); } },
  steampunk: { n: 22, draw: g => g.circle(24, 24, 22).fill({ color: 0xffffff, alpha: .35 }), tints: [0xf3e6d0, 0xffffff], grow: 1.6,   /* 김 — 아래에서 훅 오른다 */
    born: (p, w, h) => { p.x = rnd(0, w); p.y = h + rnd(0, 40); p.vx = rnd(-30, 30); p.vy = rnd(-900, -500); p.life = rnd(.5, .8); } },
  mecha: { n: 30, draw: g => g.rect(0, 0, 70, 2).fill(0xffffff), tints: [0x62d6ff, 0xffffff],   /* 주사선 잡음 — 가로 띠가 옆으로 튄다 */
    born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(0, h); p.vx = rnd(-700, 700); p.vy = 0; p.life = rnd(.3, .6); }, flick: true }
};
async function burst(el, world) {
  const B = BURST[world]; if (!B || !hasWebGL()) return null;
  let PIXI; try { PIXI = await loadPixi(); } catch (e) { return null; }
  if (!el.isConnected) return null;
  const app = new PIXI.Application(), canvas = document.createElement('canvas'), w = Math.max(2, el.clientWidth), h = Math.max(2, el.clientHeight);
  try {
    await app.init({ canvas, width: w, height: h, backgroundAlpha: 0, antialias: false, preference: ['webgl'],
      resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false });
  } catch (e) { try { app.destroy(); } catch (x) {} return null; }
  const kill = () => { try { app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true }); } catch (e) {} canvas.remove(); };   /* 전역 자원은 놓지 않는다 — 한 장의 홀로 · 궤도 입자가 같이 쓴다 */
  if (!el.isConnected) { kill(); return null; }
  const g = new PIXI.Graphics(); B.draw(g); const tex = app.renderer.generateTexture(g); g.destroy();
  const parts = [];
  for (let i = 0; i < B.n; i++) {
    const sp = new PIXI.Sprite(tex); sp.anchor.set(.5); sp.tint = B.tints[i % B.tints.length]; sp.alpha = 0;
    const p = { sp, t: 0 }; B.born(p, w, h); app.stage.addChild(sp); parts.push(p);
  }
  app.ticker.add(tk => {
    const dt = Math.min(.1, tk.deltaMS / 1000);
    for (const p of parts) {
      p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.sp.position.set(p.x, p.y);
      const k = Math.min(1, p.t / p.life); p.sp.scale.set(1 + (B.grow || 0) * k);
      p.sp.alpha = k >= 1 ? 0 : Math.sin(Math.PI * k) * (B.flick && Math.random() < .3 ? .2 : 1);
    }
  });
  canvas.setAttribute('aria-hidden', 'true'); el.appendChild(canvas); app.ticker.start();
  return kill;
}
let SHIFT_END = null;
export function playShift(host, world) {
  return new Promise(done => {
    if (SHIFT_END) SHIFT_END();
    const ran = host && fx('shift:' + world, () => {
      const el = document.createElement('div'); el.className = 'w-shift'; el.dataset.to = world; el.setAttribute('aria-hidden', 'true');
      host.appendChild(el);
      let kill = null, gone = false;
      const end = () => { if (gone) return; gone = true; clearTimeout(t); if (kill) kill(); el.remove(); if (SHIFT_END === end) SHIFT_END = null; done(); };
      const t = setTimeout(end, 900); SHIFT_END = end;
      burst(el, world).then(k => { if (gone) { if (k) k(); } else kill = k; }, () => {});
    });
    if (!ran) done();
  });
}
