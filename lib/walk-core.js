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
  /* 나라 차례 — 주기율표 번호 차례(나라 층의 ‹ ›). 앞뒤는 끝에서 처음으로 돈다 */
  function nationOrder(d) {
    var num = {}; d.elements.forEach(function (e) { num[e.key] = e.number; });
    return d.nations.map(function (n) { return n.key; }).sort(function (a, b) { return num[a] - num[b]; });
  }
  function neighbors(order, key) {
    var i = order.indexOf(key), L = order.length;
    return { prev: order[(i - 1 + L) % L], next: order[(i + 1) % L] };
  }
  /* 궤도 입자(효과 ②) — 분류마다 한 종류: 금속은 불티, 비금속 · 할로젠(기체)은 바람결, 비활성 기체는 빛 알갱이, 준금속은 결정 반짝임, 란타넘 · 악티늄은 푸른 깜빡임.
     수 상한은 폴드 덮개에서 끊기지 않게 좁으면 24, 넓으면 48 */
  var KIND = { alkali: 'ember', alkaline_earth: 'ember', transition: 'ember', post_transition: 'ember', nonmetal: 'breeze', halogen: 'breeze',
    noble_gas: 'mote', metalloid: 'glint', lanthanide: 'flicker', actinide: 'flicker' };
  function particleKind(category) { return Object.prototype.hasOwnProperty.call(KIND, category) ? KIND[category] : 'mote'; }
  function particleCap(width) { return width <= 400 ? 24 : 48; }
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

  /* 땅(테마) — 원소가 자연에서 있는 곳 여섯. 주기율표 갈래 열이 하나씩 묶인다(원소를 더해도 갈래로 정해진다). 보는 원소를 따라 바뀌지 않고 사용자가 고른다
     (사용자 2026-11-13 「여섯 개로 가자」). 그림은 땅 x 세계 = 열여덟 장(둘째 그림 저장소 themes/). 기기 기억 element_land_v1, 바뀌면 element-land */
  var LANDS = ['metal', 'breath', 'salt', 'crystal', 'sky', 'deep'], LAND = 'element_land_v1';
  var LAND_OF = { transition: 'metal', post_transition: 'metal', nonmetal: 'breath', alkali: 'salt', alkaline_earth: 'salt', halogen: 'salt',
    metalloid: 'crystal', noble_gas: 'sky', lanthanide: 'deep', actinide: 'deep' };
  function landOf(cat) { return LAND_OF[cat] || LANDS[0]; }
  function getLand() { try { var v = root.localStorage.getItem(LAND); return LANDS.indexOf(v) >= 0 ? v : LANDS[0]; } catch (e) { return LANDS[0]; } }
  function setLand(k) {
    if (LANDS.indexOf(k) < 0) return;
    try { root.localStorage.setItem(LAND, k); } catch (e) {}
    try { root.dispatchEvent(new Event('element-land')); } catch (e) {}
  }
  var SCENES = 'https://polos0117.github.io/element-atelier-img-2/themes/';
  function sceneURL(land, world, thumb) { return SCENES + (thumb ? 'thumb/' : '') + land + '_' + world + '.webp'; }

  var API = { KEYS: KEYS, GLOBALS: GLOBALS, EMPTY: EMPTY, readRoute: readRoute, routeSearch: routeSearch, layerOf: layerOf, parentOf: parentOf,
    ancestors: ancestors, resolve: resolve, validate: validate, legacyURL: legacyURL, worldOf: worldOf, nearestNation: nearestNation, nationOrder: nationOrder, neighbors: neighbors, particleKind: particleKind, particleCap: particleCap,
    motionOn: motionOn, setMotion: setMotion, LANDS: LANDS, landOf: landOf, getLand: getLand, setLand: setLand, sceneURL: sceneURL };
  if (typeof module === 'object' && module.exports) module.exports = API; else root.AtelierWalk = API;
})(this);
