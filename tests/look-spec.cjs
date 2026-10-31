/* 외형 표 — lib/look-spec.js 는 game-atelier 의 외형 선택지를 글자 그대로 옮긴 것(원소 몫 색만 더함)이고, 설계표의 look 값은 전부 그 어휘에 있다.
   Run: node tests/look-spec.cjs   (옆에 ../game-atelier 가 있으면 game 표와 대조, 없으면 스스로만 본다) */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const load = files => { const ctx = { window: {} }; vm.createContext(ctx); for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx); return ctx.window; };
const S = load(['lib/prompt-spec.js', 'lib/look-spec.js']).AtelierSpec;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* 1. 표가 다 있다 */
for (const k of ['PARAM_DEFS', 'IDENTITY_GROUPS', 'IDENTITY_EXCLUDED', 'FACE_KEYS', 'FACE_PARAM', 'SIL_PARAM', 'LOOK_KO', 'VOCAB_EN', 'PARAM_GUIDES', 'PARAM_GROUP_HELP', 'HAIR_LENGTH_LIMITS', 'EYE_CONTOURS', 'COLOR_HEX', 'COLOR_KEYS', 'AGE_DEFAULT', 'AGE_LINES', 'EXPOSURE', 'EXPOSURE_KEYS', 'EXPOSURE_DEFAULT', 'EXPOSURE_LAYER', 'LOOK_LINES'])
  assert(S[k] != null, k + ' 가 없다');
assert(S.PARAM_DEFS.length >= 30 && same(S.IDENTITY_GROUPS, ['base', 'build', 'face', 'hair']), '외형 선택지 네 묶음');
assert(!JSON.stringify(S.PARAM_DEFS).includes('게임') && !JSON.stringify(S.PARAM_GUIDES).includes('게임'), '게임 말이 남았다');
for (const w of ['fantasy', 'steampunk', 'mecha']) assert(['outer', 'open'].includes(S.EXPOSURE_LAYER[w]), w + ' 노출 갈래');
assert(!JSON.stringify(S.EXPOSURE).includes('FORM'), '노출 문장에 FORM 이 남았다');
/* 혼자 실려도 표만 든다(tests/words.cjs 가 그렇게 돌린다) */
assert(load(['lib/look-spec.js']).AtelierSpec.PARAM_DEFS.length === S.PARAM_DEFS.length, '혼자 실리기');

/* 2. game 표와 글자 그대로(원소 몫 EXTRA 만 더해졌다) */
const GAME = path.join('..', 'game-atelier', 'lib', 'prompt-spec.js');
if (fs.existsSync(GAME)) {
  const G = load([GAME]).AtelierSpec, neutral = s => s.replace(/게임 설계표/g, '나라 설계표').replace(/게임 팔레트/g, '나라 팔레트');
  for (const k of ['IDENTITY_GROUPS', 'IDENTITY_EXCLUDED', 'FACE_KEYS', 'FACE_PARAM', 'SIL_PARAM', 'PARAM_GROUP_HELP', 'HAIR_LENGTH_LIMITS', 'EYE_CONTOURS', 'COLOR_HEX', 'COLOR_KEYS', 'AGE_DEFAULT', 'AGE_LINES'])
    assert.equal(JSON.stringify(S[k]), neutral(JSON.stringify(G[k])), k + ' 가 game 표와 다르다 — node tools/port-look-spec.cjs');
  assert.equal(JSON.stringify(S.PARAM_DEFS), neutral(JSON.stringify(G.PARAM_DEFS)), 'PARAM_DEFS 가 game 표와 다르다');
  assert.equal(JSON.stringify(S.PARAM_GUIDES), neutral(JSON.stringify(G.PARAM_GUIDES)), 'PARAM_GUIDES 가 game 표와 다르다');
  for (const axis of Object.keys(S.VOCAB_EN)) for (const [k, v] of Object.entries(G.VOCAB_EN[axis] || {})) assert.equal(S.VOCAB_EN[axis][k], v, axis + '.' + k + ' 가 game 어휘와 다르다');
  for (const k of ['silhouette', 'face', 'identity', 'measurement']) assert.equal(S.LOOK_LINES[k], G.GAME_LINES[k], k + ' 줄');
  console.log('  game 표와 같다(PARAM_DEFS ' + S.PARAM_DEFS.length + ' · 어휘 ' + Object.keys(S.VOCAB_EN).length + ' 묶음)');
} else console.log('  (알림) ../game-atelier 가 없어 game 표와 대조하지 않았다');

/* 3. 설계표의 look — 나라는 아홉 칸, 가문은 덮어쓸 것만, 값은 전부 어휘에 있고 가문 색은 팔레트와 맞물린다(머리색이 나라와 다르거나 눈 색이 있다) */
const D = JSON.parse(fs.readFileSync('data/element-design.json', 'utf8'));
let nLook = 0;
const checkBox = (where, grp, box, full) => {
  const keys = grp === 'face' ? Object.keys(S.FACE_PARAM) : Object.keys(S.SIL_PARAM);
  for (const k of Object.keys(box)) { assert(keys.includes(k), where + ' look.' + grp + '.' + k + ' 는 모르는 칸'); assert(S.VOCAB_EN[k] && S.VOCAB_EN[k][box[k]], where + ' look.' + grp + '.' + k + ' = ' + box[k] + ' 는 어휘에 없다'); nLook++; }
  if (full) for (const k of keys) assert(box[k], where + ' look.' + grp + '.' + k + ' 가 비었다');
};
for (const n of D.nations) {
  assert(n.look && n.look.face && n.look.silhouette && n.look.why, '나라 ' + n.key + ' look');
  checkBox('나라 ' + n.key, 'face', n.look.face, true); checkBox('나라 ' + n.key, 'silhouette', n.look.silhouette, true);
  /* 세계마다 — 셋 다 있고, 헤어스타일·얼굴형·눈 모양이 있다(값은 어휘에) */
  assert(n.look.worlds && ['fantasy', 'steampunk', 'mecha'].every(w => n.look.worlds[w]), '나라 ' + n.key + ' look.worlds 셋');
  for (const [w, lk] of Object.entries(n.look.worlds)) { checkBox('나라 ' + n.key + ' ' + w, 'face', lk.face || {}, false); checkBox('나라 ' + n.key + ' ' + w, 'silhouette', lk.silhouette || {}, false);
    assert((lk.silhouette || {}).hair && (lk.face || {}).face_shape && (lk.face || {}).eyes, '나라 ' + n.key + ' ' + w + ' 머리·얼굴형·눈'); }
  for (const f of n.families) {
    assert(f.look && f.look.why, '가문 ' + n.key + '-' + f.key + ' look.why');
    if (f.look.face) checkBox('가문 ' + f.key, 'face', f.look.face, false);
    if (f.look.silhouette) checkBox('가문 ' + f.key, 'silhouette', f.look.silhouette, false);
    for (const [w, lk] of Object.entries(f.look.worlds || {})) { assert(['fantasy', 'steampunk', 'mecha'].includes(w), '가문 ' + f.key + ' 모르는 세계 ' + w); checkBox('가문 ' + f.key + ' ' + w, 'face', lk.face || {}, false); checkBox('가문 ' + f.key + ' ' + w, 'silhouette', lk.silhouette || {}, false); }
    assert((f.look.face || {}).eye_color || (f.look.silhouette || {}).hair_color, '가문 ' + n.key + '-' + f.key + ' 은 눈 색이나 머리색 하나는 제 팔레트로');
    /* 주민 look 은 머리색(물건 재질)만 — 헤어스타일·얼굴형·눈 모양은 조립기가 돌린다 */
    for (const c of f.citizens) { assert(c.look && c.look.silhouette && c.look.why, '주민 ' + c.key + ' look'); assert.equal(JSON.stringify(Object.keys(c.look.silhouette)), '["hair_color"]', '주민 ' + c.key + ' 은 머리색만'); assert(!c.look.face && !c.look.worlds, '주민 ' + c.key + ' 얼굴·세계 칸 없음'); checkBox('주민 ' + c.key, 'silhouette', c.look.silhouette, false); }
  }
}
/* 화면 이름(LOOK_KO)은 설계 칸과 같은 열쇠 */
assert(same(Object.keys(S.LOOK_KO.face), Object.keys(S.FACE_PARAM)) && same(Object.keys(S.LOOK_KO.sil), Object.keys(S.SIL_PARAM)), 'LOOK_KO 열쇠');
console.log('PASS 외형 표: 선택지 ' + S.PARAM_DEFS.length + ' · 어휘 ' + Object.keys(S.VOCAB_EN).length + ' 묶음 · 노출 · 설계표 look ' + nLook + '칸(나라 ' + D.nations.length + ' · 가문 ' + D.nations.reduce((s, n) => s + n.families.length, 0) + ') 어휘에 다 있음');
