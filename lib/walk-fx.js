/* 「들어가는 곳」 효과 문(2026-11-12 — 효과 다섯, 사용자 「다 넣어줘」). 효과는 여기서만 켜고 끈다.
   움직임 판단은 lib/walk-core.js 의 motionOn() 한 곳(기기의 움직임 줄이기 · 도구 상자의 움직임 끄기) — 꺼져 있으면 아무것도 안 하고 바로 바뀐다.
   window.AtelierWalkFx 는 검사 손잡이 — 효과가 실제로 돈 때만 fired 에 이름을 더한다. PixiJS 는 이 파일의 함수 안에서만 늦게 불러온다(과제 5 · 9) */
import * as FX from './motion-fx.js?v=1';
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
