/* 홀로 카드 효과(2026-11-12 사용자 「pkm 도감에 PixiJS로 홀로 효과 붙여줄래?」) — 크게 보기 그림 위에 무지갯빛 반사(foil)와 빛 번짐(glare)을 겹친다.
   PixiJS(WebGL) 캔버스 하나를 그림이 실제로 그려진 자리(object-fit: contain 의 안쪽 칸)에 정확히 얹고, CSS mix-blend-mode: screen 으로 섞는다 —
   검정은 그대로, 빛만 더해진다. 그림 자체(<img>)는 건드리지 않아 원본 크기 · 넘기기 · 대체 글은 그대로다.
   반사는 그림의 밝고 채도가 낮은 곳(금속 · 흰 장갑 · 하이라이트 · 하늘)에 세게, 어두운 곳 · 살색 같은 따뜻한 색엔 약하게 든다(그림 밝기 · 색을 가면으로).
   움직임: 마우스를 그림 위에서 움직이면 그 쪽으로, 폰은 기울이면(기기 방향 — iOS 는 처음 한 번 누를 때 허락을 묻는다), 손대지 않으면 천천히 혼자 지나간다.
   움직임 줄이기(prefers-reduced-motion)면 혼자 지나가지 않고 손으로 움직일 때만. WebGL 이 없거나 PixiJS 를 못 받으면 아무것도 하지 않는다. */
export const PIXI_URL = 'https://cdn.jsdelivr.net/npm/pixi.js@8.19.0/dist/pixi.min.mjs';
let pixi = null;
const loadPixi = () => (pixi = pixi || import(PIXI_URL).catch(e => { pixi = null; throw e; }));

const FRAG = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform highp vec4 uOutputFrame;
uniform vec2 uTilt;
uniform float uStrength;
vec3 spectrum(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main(void) {
  vec4 c = texture(uTexture, vTextureCoord);
  vec2 uv = vTextureCoord * uInputSize.xy / uOutputFrame.zw;
  vec3 rgb = c.a > 0.0 ? c.rgb / c.a : c.rgb;
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
  float sat = max(rgb.r, max(rgb.g, rgb.b)) - min(rgb.r, min(rgb.g, rgb.b));
  float warm = smoothstep(0.06, 0.22, rgb.r - rgb.b) * step(rgb.b, rgb.g);   /* 살색 · 따뜻한 천 — 반사를 줄인다(홀로는 장갑 · 금속 · 하늘에) */
  float mask = (0.15 + 0.85 * smoothstep(0.2, 0.9, lum)) * (1.0 - 0.5 * sat) * (1.0 - 0.75 * warm);
  float band = uv.x * 0.7 + uv.y * 1.1 + uTilt.x * 0.55 - uTilt.y * 0.4;
  vec3 foil = spectrum(fract(band * 1.35));
  float lines = 0.85 + 0.15 * sin((uv.x * 1.2 - uv.y) * 320.0 + uTilt.x * 5.0);
  float sweep = smoothstep(0.3, 0.0, abs(fract(band * 0.5) - 0.5));
  vec2 d = (uv - vec2(0.5 + uTilt.x * 0.55, 0.5 + uTilt.y * 0.55)) * vec2(1.0, 1.5);
  float glare = exp(-dot(d, d) * 7.0);
  vec3 col = foil * mask * lines * (0.3 + 0.7 * sweep) * uStrength + vec3(glare) * (0.15 + 0.35 * lum) * uStrength;
  finalColor = vec4(col * c.a, 1.0);
}`;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* object-fit: contain 그림이 상자 안에서 실제로 차지하는 칸(상자 기준 좌표) */
function contentRect(img) {
  const bw = img.clientWidth, bh = img.clientHeight, nw = img.naturalWidth, nh = img.naturalHeight;
  if (!bw || !bh || !nw || !nh) return null;
  const s = Math.min(bw / nw, bh / nh), w = nw * s, h = nh * s;
  return { x: img.offsetLeft + (bw - w) / 2, y: img.offsetTop + (bh - h) / 2, w, h };
}
function loadImage(src) {
  return new Promise((ok, no) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.decoding = 'async'; i.onload = () => ok(i); i.onerror = no; i.src = src; });
}

/* host — 그림과 같은 부모(position: relative). img — 비추는 그림. opt — reduced(움직임 줄이기) · strength · before(캔버스를 넣을 자리).
   돌려주는 것: setImage(img) · destroy(). pkm · element 도감이 같은 파일을 쓴다(2026-11-12) */
export async function mountHolo(host, img, opt = {}) {
  const reduced = !!opt.reduced, strength = opt.strength ?? 0.45;
  let dead = false, app = null, sprite = null, filter = null, texture = null, cur = img, ro = null, token = 0;
  const tilt = { x: 0.35, y: -0.2 }, want = { x: 0.35, y: -0.2 };
  let lastInput = -1e9, base = null;
  const canvasBox = document.createElement('canvas');
  canvasBox.className = 'holo-layer'; canvasBox.setAttribute('aria-hidden', 'true');

  const PIXI = await loadPixi();
  if (dead) return null;
  app = new PIXI.Application();
  try {
    await app.init({ canvas: canvasBox, width: 2, height: 2, backgroundAlpha: 0, antialias: false, preference: ['webgl'],
      resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false });
  } catch (e) { return null; }   /* WebGL 이 없으면 여기서 멈춘다 — 배열로 줘야 WebGPU · Canvas 로 넘어가지 않는다(그 렌더러는 이 필터를 건너뛰어 그림이 한 겹 더 밝게 얹힌다, 2026-11-12 Context7 · 8.19 소스 확인) */
  filter = new PIXI.Filter({
    glProgram: PIXI.GlProgram.from({ vertex: PIXI.defaultFilterVert, fragment: FRAG, name: 'holo-foil' }),
    resources: { holo: new PIXI.UniformGroup({ uTilt: { value: new Float32Array([tilt.x, tilt.y]), type: 'vec2<f32>' }, uStrength: { value: strength, type: 'f32' } }) }
  });
  sprite = new PIXI.Sprite(); sprite.filters = [filter];
  app.stage.addChild(sprite);
  host.insertBefore(canvasBox, opt.before || null);   /* before — 그 앞에 넣는다(넘기기 단추가 캔버스 위에 오게). 없으면 맨 끝(그땐 CSS z-index 로) */

  const layout = () => {
    const r = cur && contentRect(cur);
    if (!r || !app) { canvasBox.style.display = 'none'; return; }
    canvasBox.style.display = '';
    Object.assign(canvasBox.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', borderRadius: getComputedStyle(cur).borderRadius });
    app.renderer.resize(Math.max(1, Math.round(r.w)), Math.max(1, Math.round(r.h)));
    sprite.width = Math.round(r.w); sprite.height = Math.round(r.h);
    draw();
  };
  const draw = () => {
    if (!app || !sprite.texture || sprite.texture === PIXI.Texture.EMPTY) return;
    const u = filter.resources.holo.uniforms; u.uTilt[0] = tilt.x; u.uTilt[1] = tilt.y;
    app.render();
  };
  const tick = () => {
    if (dead) return;
    const t = performance.now() / 1000;
    if (!reduced && performance.now() - lastInput > 2500) { want.x = Math.sin(t * 0.35) * 0.7; want.y = Math.cos(t * 0.27) * 0.45; }
    const k = 0.12, dx = want.x - tilt.x, dy = want.y - tilt.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.002) { tilt.x += dx * k; tilt.y += dy * k; draw(); }
    raf = requestAnimationFrame(tick);
  };
  let raf = requestAnimationFrame(tick);

  /* 손 — 마우스는 그림 위 자리, 폰은 기울기(첫 값을 기준으로) */
  const onMove = e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const r = canvasBox.getBoundingClientRect(); if (!r.width) return;
    want.x = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); want.y = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
    lastInput = performance.now();
  };
  const onTilt = e => {
    if (e.gamma == null || e.beta == null) return;
    if (!base) base = { g: e.gamma, b: e.beta };
    want.x = clamp((e.gamma - base.g) / 25, -1, 1); want.y = clamp((e.beta - base.b) / 25, -1, 1);
    lastInput = performance.now();
  };
  const ask = () => { const D = window.DeviceOrientationEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('click', ask, { once: true });
  addEventListener('deviceorientation', onTilt);
  ro = typeof ResizeObserver === 'function' ? new ResizeObserver(layout) : null;
  if (ro) ro.observe(host); else addEventListener('resize', layout);

  async function setImage(next) {
    const my = ++token;
    cur = next;
    if (!next) return;
    try {
      if (!next.complete || !next.naturalWidth) await next.decode().catch(() => {});
      const src = next.currentSrc || next.src, pic = await loadImage(src);
      if (dead || my !== token) return;
      const old = texture;
      texture = PIXI.Texture.from(pic);
      sprite.texture = texture;
      if (old) old.destroy(true);
      layout();
    } catch (e) { if (my === token) canvasBox.style.display = 'none'; }
  }
  await setImage(img);

  return {
    canvas: canvasBox,
    setImage,
    destroy() {
      if (dead) return; dead = true;
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove); host.removeEventListener('click', ask);
      removeEventListener('deviceorientation', onTilt);
      if (ro) ro.disconnect(); else removeEventListener('resize', layout);
      canvasBox.remove();
      try { app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true }); } catch (e) {}
      app = null;
    }
  };
}
