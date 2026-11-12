/* 「들어가는 곳」 한 장 층(2026-11-12, 설계 물음 4 — 옛 dex.html 의 크게 보기 Lightbox 를 주소 층으로 옮김). 목록 · 가문 · 궤도 어디서 눌러도 같은 한 장.
   상자 상태 대신 주소 ?card=&pic= — 넘기기 · 화풍 맞추기는 주소만 바꿔 쓰고(역사 칸 없이), 닫기 · Esc · 바깥 · 뒤로 가기는 한 층 위(껍데기 back).
   홀로(lib/holo.js · PixiJS) · 넘기기 전환 · 즐겨찾기 하트는 옛 도감 그대로. 움직임 판단은 walk-core motionOn 한 곳 */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef, useLayoutEffect } from 'https://esm.sh/preact@10.24.3/hooks';
import { cardsOf, pick, picsOf, styleOfPic } from './walk-data.js?v=3';

const R = window.AtelierWalk, W = window.W, IMG = window.AtelierImg, FAV = window.AtelierFavorites, A = 'element';
const HOLO_KEY = 'atelier_holo_v1';
const reducedMotion = () => !R.motionOn();
function useFavorites() { const [l, set] = useState(() => FAV ? FAV.list() : []); useEffect(() => FAV ? FAV.onChange(set) : undefined, []); return l; }
function useNote() { const [m, set] = useState(''), t = useRef(0); useEffect(() => () => clearTimeout(t.current), []); return [m, s => { set(s); clearTimeout(t.current); t.current = setTimeout(() => set(''), 2000); }]; }

/* 홀로 효과(2026-11-12 사용자 「원소 도감에도 홀로 효과 붙여줘」 — pkm 도감과 같은 lib/holo.js · PixiJS). 켜고 끈 것은 공방 모음 공용 열쇠(같은 github.io) */
function Lightbox({ doc, route, go, back, card, st }) {
  const favs = useFavorites(), [msg, say] = useNote(), touch = useRef(null), file = route.pic;
  const [holo, setHolo] = useState(() => { try { return localStorage.getItem(HOLO_KEY) !== '0'; } catch (e) { return true; } }), holoRef = useRef(null);
  const toggleHolo = () => { const on = !holo; setHolo(on); try { localStorage.setItem(HOLO_KEY, on ? '1' : '0'); } catch (e) {}
    const D = window.DeviceOrientationEvent; if (on && D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); };
  useEffect(() => {
    if (!holo) return;
    const stage = document.querySelector('.lightbox .lb-stage'), img = stage && stage.querySelector('img');
    if (!stage || !img) return;
    let gone = false;
    import('./holo.js?v=3').then(m => m.mountHolo(stage, img, { reduced: reducedMotion() })).then(x => { if (gone) x && x.destroy(); else holoRef.current = x; }, () => {});
    return () => { gone = true; if (holoRef.current) { holoRef.current.destroy(); holoRef.current = null; } };
  }, [holo]);
  useEffect(() => { const x = holoRef.current, img = document.querySelector('.lightbox .lb-stage img'); if (x && img) x.setImage(img); }, [file]);
  /* 넘기기 전환(2026-11-12 사용자 「원소 도감에도 넘기기 전환 넣어줘」 — pkm 도감 크게 보기와 같은 모양: 0.42초, 18px).
     나가는 그림은 바뀌기 직전(그리는 때)에 주소 · 자리를 떠 둔 사본(.lb-ghost)이 반대쪽으로 밀리며 흐려지고, 새 그림은 넘긴 쪽에서 들어온다.
     그림 요소는 넘길 때마다 새로 생긴다(key). 움직임이 꺼져 있으면 바로 바뀐다. lib/motion-fx.js 는 같이 쓰는 파일이라 건드리지 않고 여기서 Web Animations 로 */
  const dirRef = useRef(1), lastFile = useRef(null), outgoing = useRef(null), turnRun = useRef(null);
  if (lastFile.current && lastFile.current !== file && !outgoing.current) {
    const old = document.querySelector('.lightbox .lb-stage img'), sp = old && old.parentElement;
    if (old && (old.currentSrc || old.src)) outgoing.current = { src: old.currentSrc || old.src, x: old.offsetLeft, y: old.offsetTop, w: old.offsetWidth, h: old.offsetHeight, r: getComputedStyle(old).borderRadius, sw: sp ? sp.offsetWidth : 0, sh: sp ? sp.offsetHeight : 0 };
  }
  useLayoutEffect(() => {
    const prev = lastFile.current, snap = outgoing.current, stage = document.querySelector('.lightbox .lb-stage'), img = stage && stage.querySelector('img');
    outgoing.current = null; lastFile.current = file;
    if (turnRun.current) { turnRun.current(); turnRun.current = null; }
    if (!prev || !snap || !img || prev === file) return;
    /* 새 그림을 받는 동안 그림 요소는 크기가 0 — 새 그림이 올 때까지 칸을 옛 크기로 붙잡는다(사용자 「넘길 때 카드가 밑으로 이동했다가 다시 올라오네」) */
    Object.assign(stage.style, { minWidth: snap.sw + 'px', minHeight: snap.sh + 'px' });
    let arrived = false, gone = false;
    const release = () => { stage.style.minWidth = ''; stage.style.minHeight = ''; };
    const loaded = (img.complete && img.naturalWidth ? Promise.resolve() : new Promise(ok => { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); })).then(() => (img.decode ? img.decode().catch(() => {}) : null));
    loaded.then(() => { arrived = true; if (!gone) release(); });
    if (reducedMotion() || !img.animate) { turnRun.current = () => { gone = true; release(); }; return; }
    const dir = dirRef.current < 0 ? -1 : 1, ghost = document.createElement('div');
    ghost.className = 'lb-ghost'; ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, { left: snap.x + 'px', top: snap.y + 'px', width: snap.w + 'px', height: snap.h + 'px', borderRadius: snap.r, backgroundImage: 'url("' + snap.src.replace(/["\\\n\r]/g, encodeURIComponent) + '")' });
    stage.insertBefore(ghost, img);
    img.style.opacity = '0';
    const anims = []; let done = false;
    const end = () => { if (done) return; done = true; anims.forEach(a => { try { a.cancel(); } catch (e) {} }); ghost.remove(); img.style.opacity = ''; if (arrived) release(); };
    const stop = () => { gone = true; end(); release(); };
    turnRun.current = stop;
    const run = () => { if (done) return;
      const a = img.animate([{ opacity: 0, transform: 'translateX(' + dir * 18 + 'px)' }, { opacity: 1, transform: 'translateX(0px)' }], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
      anims.push(a, ghost.animate([{ opacity: 1, transform: 'translateX(0px)' }, { opacity: 0, transform: 'translateX(' + (-dir * 18 * 0.6) + 'px)' }], { duration: 357, easing: 'ease-in', fill: 'both' }));
      img.style.opacity = ''; a.onfinish = () => { if (turnRun.current === stop) turnRun.current = null; end(); }; };
    loaded.then(run);
  }, [file]);
  useEffect(() => () => { if (turnRun.current) turnRun.current(); }, []);
  const pics = picsOf(doc, card, st), i = Math.max(0, pics.findIndex(p => p.file === file)), p = pics[i];
  /* 늘 지금 주소에서 한 칸 — 키를 빨리 두 번 눌러도(주소는 같은 틱에 쓰인다) */
  const step = d => { const n = pics.length; if (n < 2) return; dirRef.current = d; const now = R.readRoute(location.search).pic, j = Math.max(0, pics.findIndex(x => x.file === now)); go({ pic: pics[(j + d + n) % n].file }, { replace: true }); };
  /* 키는 그려지는 그 순간부터 받는다(효과를 기다리지 않게 — 열자마자 → 를 눌러도). 처리기는 늘 이번 그리기의 것 */
  const keyRef = useRef(null);
  keyRef.current = e => { if (document.querySelector('.tb-sheet')) return; if (e.key === 'Escape') back(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); };
  useLayoutEffect(() => { const k = e => keyRef.current(e); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  const faved = favs.some(x => x.a === A && x.file === p.file);
  const toggleFav = () => { if (!FAV) return;
    const link = new URL('index.html', location.href).pathname + R.routeSearch(Object.assign({}, R.EMPTY, { n: route.n, mode: 'list', card: card.key, pic: p.file, st: st !== doc.s.default ? st : '' }));
    const on = FAV.toggle({ a: A, key: card.key, file: p.file, title: card.name, sub: p.long || p.label, thumb: IMG.thumbURL(p.file), full: IMG.imgURL(p.file), link });
    say(W(on ? 'dex.fav.added' : faved ? 'dex.fav.removed' : 'dex.fav.blocked')); };
  return h('div', { class: 'lightbox w-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': card.name, onClick: e => { if (e.target === e.currentTarget) back(); },
      onTouchStart: e => { touch.current = e.touches[0].clientX; }, onTouchEnd: e => { const x = touch.current; touch.current = null; if (x == null) return; const dx = e.changedTouches[0].clientX - x; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); } },
    h('div', { class: 'lb-top' }, h('b', null, card.name), h('span', null, p.long || p.label), h('span', { class: 'lb-n' }, W('dex.counter', { i: i + 1, n: pics.length }))),
    h('div', { class: 'lb-stage' },
      pics.length > 1 && h('button', { type: 'button', class: 'lb-nav prev', 'aria-label': W('dex.prev'), onClick: () => step(-1) }, '‹'),
      h('img', { key: p.file, src: IMG.imgURL(p.file), alt: card.name + ' · ' + (p.long || p.label) }),
      pics.length > 1 && h('button', { type: 'button', class: 'lb-nav next', 'aria-label': W('dex.next'), onClick: () => step(1) }, '›')),
    h('div', { class: 'bar' },
      h('button', { type: 'button', class: 'holo-toggle', id: 'dex-holo', 'aria-pressed': holo, title: W('dex.holo.note'), onClick: toggleHolo }, W('dex.holo')),
      h('button', { type: 'button', class: 'fav-heart', id: 'dex-fav', 'aria-pressed': faved, disabled: !FAV, title: W('dex.fav.note'), onClick: toggleFav }, h('span', { 'aria-hidden': 'true' }, faved ? '♥' : '♡'), ' ' + W('dex.fav')),
      p.kind === 'world' && st === doc.s.default && h('a', { href: 'prompt.html?card=' + encodeURIComponent(card.key) + '&world=' + p.world }, W('dex.prompt')),
      h('button', { type: 'button', onClick: back }, W('dex.close'))),
    h('div', { class: 'fav-toast', role: 'status', 'aria-live': 'polite' }, msg));
}

export function CardLayer({ doc, route, go, back }) {
  const n = doc.d.nations.find(x => x.key === route.n), card = cardsOf(doc, n).find(c => c.key === route.card), def = doc.s.default;
  /* 그림 · 화풍 맞추기 — pic 이 비었거나 어느 화풍에도 없으면 걸 그림을 고르고, 그림이 하나도 없는 카드면 목록의 그 칸. 화풍은 그 그림이 든 화풍으로 */
  const ps = route.pic && styleOfPic(doc, card, route.pic);
  let fix = null;
  if (!ps) { const p = pick(doc, card, R.worldOf(route, doc.d.vocab.worlds), route.st || def); fix = p ? { pic: p.file } : { card: '', pic: '', mode: 'list', at: card.key }; }
  else if (ps !== (route.st || def)) fix = { st: ps === def ? '' : ps };
  useEffect(() => { if (fix) go(fix, { replace: true }); });
  return fix ? null : h(Lightbox, { key: card.key, doc, route, go, back, card, st: ps });
}
