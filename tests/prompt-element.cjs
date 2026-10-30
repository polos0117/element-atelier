/* 지시문 조립 — 모든 카드 × 사는 세계가 지어지고, 뼈대 줄이 다 있고, 현대 세계는 없다.
   Run: node tests/prompt-element.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, T = ctx.window.AtelierSpec;
const D = JSON.parse(fs.readFileSync('data/element-design.json', 'utf8')), S = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));

const worlds = D.vocab.worlds, same = (a, b) => JSON.stringify(a) === JSON.stringify(b);   // vm 쪽 배열은 원형이 달라 deepEqual 이 못 견준다
assert(same(worlds, T.WORLDS.map(w => w.key)), '표의 세계와 설계표의 세계가 같다');
assert(!worlds.includes('modern') && !worlds.includes('now'), '현대 세계는 없다 — 일상컷이 맡는다');

const cards = P.cards(D);
assert(cards.length >= 40, '카드 수 ' + cards.length);
let n = 0, byTier = { root: 0, lord: 0, citizen: 0 };
for (const key of cards) {
  const c = P.card(D, key); assert(c, key + ' 를 못 읽는다'); byTier[c.tier]++;
  const ws = P.worldsOf(D, key); assert(ws.length >= 1, key + ' 는 사는 세계가 없다');
  if (c.tier !== 'citizen') assert(same(ws, worlds), key + ' 근본·가문주는 세 세계 다');
  for (const w of ws) {
    const t = P.build(D, S, key, w, {});
    assert(t.length > 600 && t.length < 3200, key + ' ' + w + ' 길이 ' + t.length);
    assert(t.startsWith('CONCEPT: '), key + ' ' + w + ' CONCEPT 첫 줄');
    for (const line of ['ELEMENT TRAITS of ', 'WORLD — ', 'STYLE: ', 'OUTPUT: ', 'BODY: ', 'ONE FIGURE ONLY', 'ANATOMY: ']) assert(t.includes(line), key + ' ' + w + ' 에 ' + line + ' 가 없다');
    assert(t.includes(c.element.en), key + ' 원소 이름');
    if (c.family) assert(t.includes('HOUSE TRAITS of ' + c.family.en), key + ' 가문 성질');
    if (c.tier === 'citizen') {
      assert(t.includes(c.citizen.object.en.trim()), key + ' 물건 설명');
      if (c.citizen.wear) assert(t.includes('WEARS it'), key + ' 입는 물건'); else assert(t.includes('does NOT hold'), key + ' 들지 않는다');
    }
    if (w === 'mecha') assert(t.includes('MECHA DESIGN:') && /solid armor/.test(t), key + ' 메카 설계 문장');
    else assert(!t.includes('MECHA DESIGN'), key + ' ' + w + ' 에 메카 문장');
    assert(!/[가-힣]/.test(t.replace(/\([^)]*\)/g, '')), key + ' ' + w + ' 지시문에 한국어(괄호 밖)');
    n++;
  }
  /* 파일 이름 — IMAGE_RULES 3절 */
  assert.equal(P.fileName(key, 'mecha', 'game_keyart'), key + '_mecha_game_keyart_f.webp');
  assert.equal(P.fileName(key, '', 'game_keyart', 3), key + '_game_keyart_f_casual3.webp');
}
assert(byTier.root >= 5 && byTier.lord >= 8 && byTier.citizen >= 20, JSON.stringify(byTier));

/* 덧붙임이 실린다 · 기록 꼴 */
const t = P.build(D, S, 'fe-steel-sword', 'fantasy', { notes: { scene: 'a windy ridge', outfit: 'red sash', custom: 'low angle' } });
assert(t.includes('SCENE NOTE: a windy ridge') && t.includes('OUTFIT NOTE: red sash') && t.includes('EXTRA: low angle'));
const r = P.record(D, S, 'og', 'steampunk', {});
assert.equal(r.atelier, 'element'); assert.equal(r.tier, 'root'); assert.equal(r.file, 'og_steampunk_game_keyart_f.webp'); assert.equal(r.styleVersion, 'v1'); assert.equal(r.prompt, P.build(D, S, 'og', 'steampunk', {}));
/* 같은 물질 다른 나라 — 수소의 물과 산소의 물은 다른 지시문 */
assert.notEqual(P.build(D, S, 'h-water', 'fantasy', {}), P.build(D, S, 'o-water', 'fantasy', {}));
/* 없는 열쇠·없는 세계 */
assert.equal(P.card(D, 'xx'), null); assert.equal(P.card(D, 'fe-nope'), null); assert.equal(P.card(D, 'fe-steel-sword-x'), null);
assert.equal(P.build(D, S, 'fe', 'modern', {}), '');
console.log('PASS 지시문: 카드 ' + cards.length + ' · 지시문 ' + n + ' · 근본 ' + byTier.root + ' 가문주 ' + byTier.lord + ' 주민 ' + byTier.citizen + ' · 뼈대 줄 · 입는 물건 · 메카 설계 · 덧붙임 · 기록 · 파일 이름');
