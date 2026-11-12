/* 「들어가는 곳」(2026-11-12) 주소의 순수 함수 — 주소 쿼리가 층을 정한다. 주기율표 → 나라(궤도 · 목록) → 가문 → 한 장.
   DOM · 저장소를 만지지 않는다(움직임 판단 motionOn · setMotion 만 예외 — 기기 기억 element_motion_v1). node 로도 돈다(tests/walk-core.cjs).
   껍데기(lib/walk.js)의 차례는 늘 validate(resolve(readRoute(search), pref), doc). 설계 docs/superpowers/specs/2026-11-12-element-walk-in-design.md */
(function (root) {
  'use strict';

  var KEYS = ['n', 'mode', 'f', 'card', 'pic', 'at', 'w', 'st', 'view'];   /* 주소에 쓰는 차례도 이대로 */
  var GLOBALS = ['mode', 'w', 'st', 'view'];                               /* 뒤로 가기에도 지금 값이 남는 것(「세계는 하나의 상태」) */
  var MODES = ['orbit', 'list'], VIEWS = ['world', 'casual', 'all'];

  function blank() { var r = {}; KEYS.forEach(function (k) { r[k] = ''; }); return r; }
  var EMPTY = Object.freeze(blank());
  function copy(route, patch) { var r = blank(); KEYS.forEach(function (k) { r[k] = String((route && route[k]) || ''); }); if (patch) for (var k in patch) if (KEYS.indexOf(k) >= 0) r[k] = String(patch[k] || ''); return r; }

  function readRoute(search) {
    var q = new URLSearchParams(search || ''), r = blank();
    KEYS.forEach(function (k) { r[k] = q.get(k) || ''; });
    return r;
  }
  function routeSearch(route) {
    var parts = [];
    KEYS.forEach(function (k) { if (route[k]) parts.push(k + '=' + encodeURIComponent(route[k])); });
    return parts.length ? '?' + parts.join('&') : '';
  }
  function layerOf(r) {
    if (!r.n) return 'table';
    if (r.card) return 'card';
    if (r.f) return 'family';
    return r.mode === 'list' ? 'list' : 'orbit';
  }
  function parentOf(r) {
    switch (layerOf(r)) {
      case 'card': return copy(r, { card: '', pic: '' });
      case 'family': return copy(r, { f: '' });
      case 'orbit': case 'list': return copy({ w: r.w, st: r.st, view: r.view });
      default: return null;
    }
  }
  function ancestors(r) { var out = [], x = copy(r); while (x) { out.unshift(x); x = parentOf(x); } return out; }
  /* 빈 전역 값만 기억값으로(mode 는 나라 안에서만). 맞는 값인지는 validate 가 본다 */
  function resolve(r, pref) {
    var out = copy(r); pref = pref || {};
    GLOBALS.forEach(function (k) { if (!out[k] && pref[k] && (k !== 'mode' || out.n)) out[k] = String(pref[k]); });
    return out;
  }
  /* 낡은 열쇠 — 빈 화면 없이 가장 가까운 맞는 층으로 */
  function validate(r, doc) {
    var out = copy(r), d = doc.d, nation = null, i;
    for (i = 0; i < d.nations.length; i++) if (d.nations[i].key === out.n) nation = d.nations[i];
    if (!nation) { out.n = out.mode = out.f = out.card = out.pic = out.at = ''; }
    else {
      var fams = nation.families || [], cards = [nation.key];
      if (!fams.some(function (f) { return f.key === out.f; })) out.f = '';
      fams.forEach(function (f) { var fk = nation.key + '-' + f.key; cards.push(fk); (f.citizens || []).forEach(function (c) { cards.push(fk + '-' + c.key); }); });
      if (cards.indexOf(out.card) < 0) out.card = '';
      if (cards.indexOf(out.at) < 0) out.at = '';
    }
    if (!out.card) out.pic = '';
    if (MODES.indexOf(out.mode) < 0) out.mode = '';
    if (d.vocab.worlds.indexOf(out.w) < 0 && out.w !== 'all') out.w = '';
    if (!(doc.s && doc.s.styles && Object.prototype.hasOwnProperty.call(doc.s.styles, out.st))) out.st = '';
    if (VIEWS.indexOf(out.view) < 0) out.view = '';
    if (!out.n) out.mode = ''; else if (!out.mode) out.mode = 'orbit';
    return out;
  }
  /* 옛 주소(hall · gallery · dex) → 새 주소. 끝 파일 이름으로 가른다 */
  function legacyURL(pathname, search) {
    var file = String(pathname || '').split('/').pop(), q = new URLSearchParams(search || ''), g = function (k) { return q.get(k) || ''; }, r = blank();
    if (file === 'gallery.html') {
      r.n = g('n'); r.f = g('f'); r.w = g('w');
      if (g('v') === '1' && g('c')) { r.card = g('c'); if (!r.n) r.n = r.card.split('-')[0]; }
      if (r.n) r.mode = 'orbit';
    } else if (file === 'dex.html') {
      var card = g('card'), pic = g('pic');
      r.n = g('nation') || g('n') || (card ? card.split('-')[0] : '');
      if (!r.n) return 'index.html';
      r.mode = 'list'; r.view = g('view'); r.w = g('w'); r.st = g('st');
      if (card && pic) { r.card = card; r.pic = pic; } else if (card) r.at = card;
    } else return 'index.html';
    return 'index.html' + routeSearch(r);
  }
  function worldOf(r, worlds) { return worlds.indexOf(r.w) >= 0 ? r.w : worlds[0]; }
  /* 가까운 나라 칸 — 주기율표 칸(덮개에선 16px 남짓)이 작아 흐린 칸 위를 눌러도 거리 max 안의 가장 가까운 나라를 잡는다(같으면 앞의 것) */
  function nearestNation(cells, x, y, max) {
    var best = null, bd = Infinity;
    (cells || []).forEach(function (c) { var d = Math.hypot(c.x - x, c.y - y); if (d <= max && d < bd) { bd = d; best = c.key; } });
    return best;
  }
  /* 움직임 판단은 여기 한 곳(사용자 2026-11-12 「움직임 끄기 옵션 넣어줘」) — 기기의 움직임 줄이기가 아니고, 이 기기에서 끄지 않았으면 켜짐.
     효과 다섯 · 층 사이 확대/날아오기 · 세계 전환이 모두 이것을 본다. 끄고 켜기는 도구 상자 설정(lib/toolbox.js) */
  var MOTION = 'element_motion_v1';
  function motionOn() {
    try { if (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) return false; } catch (e) {}
    try { return root.localStorage.getItem(MOTION) !== 'off'; } catch (e) { return true; }
  }
  function setMotion(on) {
    try { if (on) root.localStorage.removeItem(MOTION); else root.localStorage.setItem(MOTION, 'off'); } catch (e) {}
    try { root.dispatchEvent(new Event('element-motion')); } catch (e) {}
  }

  var API = { KEYS: KEYS, GLOBALS: GLOBALS, EMPTY: EMPTY, readRoute: readRoute, routeSearch: routeSearch, layerOf: layerOf, parentOf: parentOf,
    ancestors: ancestors, resolve: resolve, validate: validate, legacyURL: legacyURL, worldOf: worldOf, nearestNation: nearestNation,
    motionOn: motionOn, setMotion: setMotion };
  if (typeof module === 'object' && module.exports) module.exports = API; else root.AtelierWalk = API;
})(this);
