/* 「들어가는 곳」 순수 함수(lib/walk-core.js) — 주소 읽기/쓰기 · 층 · 부모/조상 · 기억값 · 검증 · 옛 주소 · 세계.
   Run: node tests/walk-core.cjs */
const assert = require('node:assert/strict');
const R = require('../lib/walk-core.js'), D = require('../data/element-design.json'), S = require('../data/style.json');
const doc = { d: D, s: S }, r = s => R.readRoute(s);
// 읽고 쓰기 — 차례 고정, 빈 값 뺌, 모르는 열쇠 버림
assert.equal(R.routeSearch(r('?w=mecha&zz=1&n=fe&card=fe-steel&f=steel')), '?n=fe&f=steel&card=fe-steel&w=mecha');
assert.equal(R.routeSearch(R.EMPTY), '');
// 층
assert.equal(R.layerOf(r('')), 'table'); assert.equal(R.layerOf(r('?n=fe')), 'orbit');
assert.equal(R.layerOf(r('?n=fe&mode=list')), 'list'); assert.equal(R.layerOf(r('?n=fe&f=steel')), 'family');
assert.equal(R.layerOf(r('?n=fe&mode=list&card=fe&pic=a.webp')), 'card');
// 부모 · 조상 — 전역 값은 따라간다
assert.equal(R.routeSearch(R.parentOf(r('?n=fe&f=steel&card=fe-steel&pic=a.webp&w=mecha'))), '?n=fe&f=steel&w=mecha');
assert.equal(R.routeSearch(R.parentOf(r('?n=fe&mode=list&w=mecha&view=casual'))), '?w=mecha&view=casual');
assert.equal(R.parentOf(r('')), null);
assert.deepEqual(R.ancestors(r('?n=fe&f=steel&card=fe-steel')).map(R.layerOf), ['table', 'orbit', 'family', 'card']);
// 기억값 채우기
assert.equal(R.resolve(r('?n=fe'), { mode: 'list' }).mode, 'list'); assert.equal(R.resolve(r('?n=fe'), {}).mode, '');
assert.equal(R.resolve(r(''), { mode: 'list' }).mode, ''); assert.equal(R.resolve(r('?w=mecha'), { w: 'fantasy' }).w, 'mecha');
// 검증(Review Focus 3)
const v = s => R.routeSearch(R.validate(r(s), doc));
assert.equal(v('?n=zz&f=steel&w=mecha'), '?w=mecha');
assert.equal(v('?n=fe&f=nope'), '?n=fe&mode=orbit'); assert.equal(v('?n=fe&card=h-water&pic=x.webp'), '?n=fe&mode=orbit');
assert.equal(v('?n=fe&mode=weird&w=moon&st=nope&view=odd&at=fe-zz'), '?n=fe&mode=orbit');
assert.equal(v('?mode=list'), '');
assert.equal(v('?n=fe&mode=list&f=steel&card=fe-steel-sword&w=all&st=' + S.default), '?n=fe&mode=list&f=steel&card=fe-steel-sword&w=all&st=' + S.default);
// 옛 주소 — 셋
assert.equal(R.legacyURL('/element-atelier/hall.html', '?x=1'), 'index.html');
assert.equal(R.legacyURL('/gallery.html', ''), 'index.html');
assert.equal(R.legacyURL('/gallery.html', '?n=h&f=water&w=mecha'), 'index.html?n=h&mode=orbit&f=water&w=mecha');
assert.equal(R.legacyURL('/gallery.html', '?n=h&f=water&c=h-water-bottle&w=mecha&v=1'), 'index.html?n=h&mode=orbit&f=water&card=h-water-bottle&w=mecha');
assert.equal(R.legacyURL('/dex.html', ''), 'index.html');
assert.equal(R.legacyURL('/dex.html', '?nation=fe&card=fe&pic=fe_a.webp&st=game_keyart'), 'index.html?n=fe&mode=list&card=fe&pic=fe_a.webp&st=game_keyart');
assert.equal(R.legacyURL('/dex.html', '?nation=fe&card=fe-steel'), 'index.html?n=fe&mode=list&at=fe-steel');
assert.equal(R.legacyURL('/dex.html', '?card=h-water-bottle&pic=b.webp'), 'index.html?n=h&mode=list&card=h-water-bottle&pic=b.webp');
assert.equal(R.legacyURL('/dex.html', '?nation=fe&view=casual&w=mecha'), 'index.html?n=fe&mode=list&w=mecha&view=casual');
// 세계
assert.equal(R.worldOf(r('?w=all'), D.vocab.worlds), 'fantasy'); assert.equal(R.worldOf(r('?w=mecha'), D.vocab.worlds), 'mecha');
// 가까운 나라 칸 — 흐린 칸 위를 눌러도
const cells = [{ key: 'fe', x: 100, y: 50 }, { key: 'cu', x: 154, y: 50 }];
assert.equal(R.nearestNation(cells, 114, 52, 27), 'fe'); assert.equal(R.nearestNation(cells, 140, 50, 27), 'cu');
assert.equal(R.nearestNation(cells, 100, 120, 27), null);
// 나라 차례 · 앞뒤 나라(끝에서 처음으로 돈다)
const order = R.nationOrder(D);
assert.deepEqual(order.slice(0, 3), ['h', 'he', 'li']); assert.equal(order.at(-1), 'og'); assert.equal(order.length, D.nations.length);
assert.deepEqual(R.neighbors(order, 'h'), { prev: 'og', next: 'he' }); const num = Object.fromEntries(D.elements.map(e => [e.key, e.number])), fi = order.indexOf('fe');   /* 나라가 늘어도 — 원자 번호 차례, 철의 앞뒤는 그 차례의 이웃 */
assert(order.every((k, i) => !i || num[order[i - 1]] < num[k]), '나라 차례는 원자 번호 순'); assert.deepEqual(R.neighbors(order, 'fe'), { prev: order[fi - 1], next: order[fi + 1] });
// 입자 종류 · 상한(효과 ②)
const K = { transition: 'ember', alkali: 'ember', alkaline_earth: 'ember', post_transition: 'ember', nonmetal: 'breeze', halogen: 'breeze',
  noble_gas: 'mote', metalloid: 'glint', lanthanide: 'flicker', actinide: 'flicker', unknown: 'mote' };
for (const [c, k] of Object.entries(K)) assert.equal(R.particleKind(c), k, c);
assert.equal(R.particleCap(344), 24); assert.equal(R.particleCap(1280), 48);
// 합성의 카드 열기는 새 주소로 바로(A9 — 옛 dex.html 넘김을 거치지 않는다)
const ALC = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'alchemy.html'), 'utf8');
assert(!/['"]dex\.html/.test(ALC), 'alchemy.html 에 옛 dex.html 링크가 없다'); assert(ALC.includes("'index.html?n='+l.nation+'&mode=list&'"), 'alchemy.html — 목록의 그 카드로');
console.log('PASS walk-core: 주소 읽기/쓰기 · 층 · 부모/조상 · 기억값 · 검증 · 옛 주소 셋 · 세계 · 가까운 나라 칸 · 나라 차례 · 입자 종류/상한');
