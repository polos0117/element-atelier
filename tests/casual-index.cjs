/* 일상컷 색인(2026-11-17 — 사용자 「허브에서 간단하게만. 필수컷 만들 때 뜬 갈래랑 의상이랑, 게임코스튬 때 쓴 게임, 케릭터, 의상갈래 정도만」 → 「응 그렇게 진행해줘.
   우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」). tools/casual-index.cjs 를 가짜 그림 저장소로:
   꼴(칸 다 있음 · 우리 값은 한글) · 곁가지 기록 합치기 · 계획 파일의 필수 표시 읽기 · 코스프레 by · 캐릭터 한글 · 자유 설계 Outfit 줄 · 차례 · 같으면 안 씀.
   옆에 그림 저장소(../element-atelier-img)가 있으면 한 번 돌려 수를 찍는다. node tests/casual-index.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const I = require('../tools/casual-index.cjs');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-index-')), img = path.join(tmp, 'element-atelier-img'), rec = path.join(img, 'records');
const put = (card, name, obj) => { fs.mkdirSync(path.join(rec, card), { recursive: true }); fs.writeFileSync(path.join(rec, card, name), JSON.stringify(obj)); };
const AX = { overall_intensity: 'strong', skin_exposure: 'bold' };
const R = (world, n, date, scene, generation = {}, extra = {}) => ({ atelier: 'element', card: extra.card, world, style: 'jp_paint_anime', date, scene: { treeV: 2, axes: AX, ...scene }, generation, ...extra });

/* 철 판타지 — 새 묶음(코스프레 있음) */
put('fe', 'fantasy-casual-plan.json', { card: 'fe', world: 'fantasy', style: 'jp_paint_anime', required: 'lingerie · nation · cosplay:war_of_genesis_3/crop_set · situ:wet · ofree · gfree:swimwear+free',
  cuts: [{ n: 1, era: 'now', place: 'street_mall', ofam: 'lingerie', item: 'open_shirt_lingerie' }, { n: 2, era: 'nation', place: 'nation_room', ofam: 'homewear', item: 'satin_lounge' },
    { n: 3, ofam: 'game_cosplay' }, { n: 4, era: 'now', place: 'street_mall', ofam: 'everyday', item: 'jeans_tee', situ: 'wet' }, { n: 6, sfree: true, ofree: true }, { n: 7, sfree: true, gfree: 'swimwear', gsitu: 'free' }] });
put('fe', 'fantasy-casual1.jp_paint_anime-ui.json', R('fantasy', 1, '2026-11-16', { era: 'now', place: 'street_mall', ofam: 'lingerie', item: 'open_shirt_lingerie', shade: 'baby_blue', color: 'pastel' }, {}, { card: 'fe' }));
put('fe', 'fantasy-casual2.jp_paint_anime-ui.json', R('fantasy', 2, '2026-11-16', { era: 'nation', place: 'nation_room', ofam: 'homewear', item: 'satin_lounge' }, {}, { card: 'fe' }));
/* 곁가지 — 꼬리 붙은 기록 둘은 같은 컷 */
put('fe', 'fantasy-casual2.jp_paint_anime-ui.redraw.json', R('fantasy', 2, '2026-11-17', { era: 'now', place: 'street_mall', ofam: 'everyday', item: 'jeans_tee' }, {}, { card: 'fe' }));
put('fe', 'fantasy-casual2.jp_paint_anime.bold-ui.json', R('fantasy', 2, '2026-11-17', { era: 'now', place: 'street_mall', ofam: 'everyday', item: 'jeans_tee' }, {}, { card: 'fe' }));
put('fe', 'fantasy-casual2.blocked.json', { why: 'blocked' });   /* -ui 가 아니다 — 컷이 아니다 */
/* 코스프레 — 계획기가 정한 캐릭터(목록 ko 있음, 대소문자 달라도) */
put('fe', 'fantasy-casual3.jp_paint_anime-ui.json', R('fantasy', 3, '2026-11-16', { era: 'now', place: 'home_living', ofam: 'game_cosplay', item: 'gc_crop_set', cosplay: { game: 'war_of_genesis_3', character: 'scheherazade', cut: 'crop_set', round: 1 } },
  { cosplay: { game: 'war_of_genesis_3', character: 'scheherazade', cut: 'crop_set' } }, { card: 'fe' }));
/* 상황 노출 — 코스프레가 있는 묶음이라 필수 아님 */
put('fe', 'fantasy-casual4.jp_paint_anime-ui.json', R('fantasy', 4, '2026-11-16', { era: 'now', place: 'street_mall', ofam: 'everyday', item: 'jeans_tee', situ: 'wet',
  posture: 'stand', frame: 'waist_up', body: 'front', camera: 'eye', gaze: 'camera', expr: 'calm', use: 'cup_hold', prop: 'cup', time: 'night', light: 'side', ostyle: { material: 'satin', acc: 'nope' }, aspect: '2:3', right: 'prop', left: 'out', support: 'none', head: 'tilt' }, {}, { card: 'fe' }));
/* 자유 설계 — 옷 자유(덩어리 글의 채운 Outfit 줄) · 갈래 자유(칸 묶음 꼴) */
put('fe', 'fantasy-casual6.jp_paint_anime-ui.json', R('fantasy', 6, '2026-11-16', { sfree: true, ofree: true },
  { free_design: 'FREE DESIGN: …\nPlace: a kiosk\nOutfit: A plum cropped mechanic romper.', free_prompt: 'x\nOutfit: A plum cropped mechanic romper. (a revealing …)' }, { card: 'fe' }));
put('fe', 'fantasy-casual7.jp_paint_anime-ui.json', R('fantasy', 7, '2026-11-16', { sfree: true, gfree: 'swimwear', gsitu: 'free' },
  { free_design: { Place: 'a dock', Outfit: 'A slate-blue tankini' }, free_prompt: 'Outfit family (required): swimwear — any\nOutfit: A slate-blue tankini' }, { card: 'fe' }));
/* 캐릭터만의 컷 */
put('fe', 'fantasy-casual90.jp_paint_anime-ui.json', R('fantasy', 90, '2026-11-16', { era: 'nation', place: 'nation_kitchen', ofam: 'everyday', own: 'fantasy' }, { own: { level: 'bold' } }, { card: 'fe', own: { job_ko: '파티시에', level: 'bold' } }));

/* 강철 메카 — 옛 묶음(상황 노출이 셋째 필수 · GPT 가 고른 옛 pick 코스프레 없음), 옛 다섯 장 묶음의 계획(roleplay 하나만 필수) */
put('fe-steel', 'mecha-casual-plan.json', { card: 'fe-steel', world: 'mecha', style: 'jp_paint_anime', required: 'roleplay · nation · situ:wind · ofree',
  cuts: [{ n: 1, era: 'now', place: 'street_mall', ofam: 'everyday', item: 'jeans_tee', situ: 'wind' }, { n: 2, era: 'now', place: 'street_mall', ofam: 'everyday', item: 'knit_skirt', ofree: true }] });
put('fe-steel', 'mecha-casual1.jp_paint_anime-ui.json', R('mecha', 1, '2026-11-12', { era: 'now', place: 'street_mall', ofam: 'everyday', item: 'jeans_tee', situ: 'wind' }, {}, { card: 'fe-steel' }));
/* 옛 옷 자유(장면은 짜고 Outfit 줄만 GPT) — free_outfit */
put('fe-steel', 'mecha-casual2.jp_paint_anime-ui.json', R('mecha', 2, '2026-11-12', { era: 'now', place: 'street_mall', ofam: 'everyday', item: 'knit_skirt', ofree: true },
  { free_outfit: 'a coral-pink bandeau playsuit', free_prompt: 'Outfit: a coral-pink bandeau playsuit — absent' }, { card: 'fe-steel' }));
put('fe-steel', 'steampunk-casual-plan.json', { card: 'fe-steel', world: 'steampunk', style: 'game_keyart', required: 'roleplay', cuts: [{ n: 1, era: 'now', place: 'street_mall', ofam: 'lingerie', item: 'open_shirt_lingerie' }, { n: 2, ofam: 'game_cosplay' }, { n: 3, sfree: true, ofree: true }] });
put('fe-steel', 'steampunk-casual1.game_keyart-ui.json', { ...R('steampunk', 1, '2026-11-01', { era: 'now', place: 'street_mall', ofam: 'lingerie', item: 'open_shirt_lingerie' }, {}, { card: 'fe-steel' }), style: 'game_keyart' });
/* 옛 pick 코스프레 — 장면엔 캐릭터 빈 칸, 그린 기록에만 */
put('fe-steel', 'steampunk-casual2.game_keyart-ui.json', { ...R('steampunk', 2, '2026-11-15', { era: 'now', place: 'fx_studio', ofam: 'game_cosplay', item: 'gc_bodysuit', cosplay: { game: 'final_fantasy_7', character: '', cut: 'bodysuit', round: 1, used: [] } },
  { cosplay: { game: 'final_fantasy_7', character: 'Tifa Lockhart', cut: 'bodysuit' } }, { card: 'fe-steel' }), style: 'game_keyart' });
/* 주인공 하나 게임 — character_ko, 자유 설계 칸이 「…」 그대로 */
put('fe-steel', 'steampunk-casual3.game_keyart-ui.json', { ...R('steampunk', 3, '2026-11-15', { sfree: true, ofree: true }, { free_design: 'Place: …\nOutfit: …' }, { card: 'fe-steel' }), style: 'game_keyart' });
put('fe-steel', 'steampunk-casual4.game_keyart-ui.json', { ...R('steampunk', 4, '2026-11-15', { era: 'now', place: 'home_living', ofam: 'game_cosplay', item: 'gc_bikini', cosplay: { game: 'legend_of_zelda', character: 'Link', cut: 'bikini', round: 1 } }, {}, { card: 'fe-steel' }), style: 'game_keyart' });
fs.mkdirSync(path.join(rec, 'fe', 'history'), { recursive: true }); fs.writeFileSync(path.join(rec, 'fe', 'history', 'fantasy-casual1.jp_paint_anime-ui.json'), '{}');   /* 아래 폴더는 안 본다 */

const ix = I.build({ img });
const at = (card, world, n) => ix.rows.find(r => r.card === card && r.world === world && r.n === n);

/* 1. 꼴 — 칸 다 있음(빼지 않고 null) */
assert.equal(ix.version, 1); assert.equal(ix.atelier, 'element'); assert.deepEqual(ix.source, ['element-atelier-img']); assert(!isNaN(Date.parse(ix.built)));
const KEYS = ['card', 'name', 'world', 'worldKo', 'n', 'date', 'style', 'path', 'required', 'requiredKo', 'family', 'familyKo', 'item', 'itemKo', 'shade', 'shadeKo', 'cosplay', 'free'];
/* 장면 풀이 s(2026-11-25) — 줄 끝, 있을 때만. 칸은 짧은 열쇠, 빈 칸 · undefined 없음, 우리 값은 한글(en: 1 이면 GPT 가 지은 영어) */
const S_KEYS = ['pl', 'act', 'fr', 'ex', 'gz', 'bd', 'cam', 'ln', 'lt', 'mo', 'cp', 'si', 'os', 'tm', 'ss', 'wt', 'era', 'ar', 'en'];
function sShape(r) {
  if (!('s' in r)) return;
  assert.ok(r.s && Object.keys(r.s).length, r.path + ' s 가 있으면 비지 않는다');
  for (const [k, v] of Object.entries(r.s)) {
    assert.ok(S_KEYS.includes(k), r.path + ' s 칸 ' + k);
    if (k === 'en') { assert.equal(v, 1); continue; }
    assert.equal(typeof v, 'string'); assert.ok(v.trim() && !/undefined|null|\[object/.test(v), r.path + ' s.' + k + ' = ' + v);
    if (!['ln', 'ar'].includes(k) && !(r.s.en && ['pl', 'act', 'fr'].includes(k))) assert.match(v, v === '3/4' ? /^3\/4$/ : /[가-힣]/, r.path + ' s.' + k + ' 한글');
  }
}
for (const r of ix.rows) {
  sShape(r);
  assert.deepEqual(Object.keys(r).filter(k => k !== 's'), KEYS, r.path);
  if ('s' in r) assert.equal(Object.keys(r).pop(), 's', 's 는 줄 끝');
  if (r.cosplay) assert.deepEqual(Object.keys(r.cosplay), ['game', 'gameKo', 'character', 'characterKo', 'cut', 'cutKo', 'by', 'round']);
  if (r.free) assert.deepEqual(Object.keys(r.free), ['kind', 'kindKo', 'outfit']);
}
assert.equal(ix.rows.length, 13, '컷 열셋(곁가지 · 막힘 · history 빼고)');

/* 2. 한글 — 우리 값은 표의 ko */
const ko = s => typeof s === 'string' && /[가-힣]/.test(s);
const a1 = at('fe', 'fantasy', 1);
assert.equal(a1.name, '철'); assert.equal(a1.worldKo, '판타지'); assert.equal(a1.familyKo, '란제리풍'); assert.equal(a1.itemKo, '란제리 위 오픈 셔츠'); assert.equal(a1.shade, 'baby_blue'); assert.equal(a1.shadeKo, '베이비 블루');
assert.equal(a1.path, 'element-atelier-img/records/fe/fantasy-casual1.jp_paint_anime-ui.json');
assert(ko(at('fe-steel', 'mecha', 1).name) && at('fe-steel', 'mecha', 1).name !== 'fe-steel', '가문주 이름 한글');
for (const r of ix.rows) {
  for (const [k, v] of [['family', 'familyKo'], ['item', 'itemKo'], ['shade', 'shadeKo'], ['world', 'worldKo'], ['required', 'requiredKo']]) if (r[k]) assert(ko(r[v]), r.path + ' ' + v);
  if (r.cosplay) { assert(ko(r.cosplay.gameKo) && ko(r.cosplay.cutKo), r.path + ' 게임 · 재단 한글'); }
}

/* 3. 곁가지 합치기 — 꼬리 없는 기록이 그 컷 */
const a2 = at('fe', 'fantasy', 2);
assert.equal(ix.rows.filter(r => r.card === 'fe' && r.world === 'fantasy' && r.n === 2).length, 1, '곁가지 셋 → 한 줄');
assert.equal(a2.path.endsWith('/fantasy-casual2.jp_paint_anime-ui.json'), true); assert.equal(a2.item, 'satin_lounge'); assert.equal(a2.date, '2026-11-16');

/* 4. 필수 표시 — 계획 파일의 required 글 */
assert.equal(a1.required, 'lingerie'); assert.equal(a1.requiredKo, '노출 갈래(란제리풍)');
assert.equal(a2.required, 'nation'); assert.equal(a2.requiredKo, '나라 안');
assert.equal(at('fe', 'fantasy', 3).required, 'cosplay'); assert.equal(at('fe', 'fantasy', 3).requiredKo, '게임 코스프레');
assert.equal(at('fe', 'fantasy', 4).required, null, '코스프레 있는 묶음의 상황 노출은 필수 아님');
assert.equal(at('fe-steel', 'mecha', 1).required, 'situ', '옛 묶음(코스프레 없음)의 상황 노출은 셋째 필수'); assert.match(at('fe-steel', 'mecha', 1).requiredKo, /^상황 노출\(.+\)$/);
assert.equal(at('fe-steel', 'steampunk', 1).required, null, '계획 required 에 없는 노출 갈래(옛 묶음 — roleplay 만)는 필수 아님');
assert.equal(at('fe', 'fantasy', 90).required, 'own'); assert.equal(at('fe', 'fantasy', 90).requiredKo, '캐릭터만의 컷'); assert.equal(at('fe', 'fantasy', 90).itemKo, '파티시에');
assert.equal(at('fe', 'fantasy', 6).required, null); assert.equal(at('fe', 'fantasy', 7).required, null);

/* 5. 코스프레 by · 캐릭터 한글 */
const c3 = at('fe', 'fantasy', 3).cosplay;
assert.deepEqual(c3, { game: 'war_of_genesis_3', gameKo: '창세기전 3 · 파트 2', character: 'scheherazade', characterKo: '셰라자드', cut: 'crop_set', cutKo: '크롭 투피스', by: 'planner', round: 1 });
const c2 = at('fe-steel', 'steampunk', 2).cosplay;
assert.equal(c2.by, 'gpt', '장면 캐릭터 빈 칸 → GPT'); assert.equal(c2.character, 'Tifa Lockhart', 'GPT 가 고른 이름은 영어 그대로');
assert.equal(c2.characterKo, I.characterKo('final_fantasy_7', 'Tifa Lockhart'), '목록 ko 가 있으면 그것, 없으면 null');
const c4 = at('fe-steel', 'steampunk', 4).cosplay;
assert.equal(c4.by, 'planner'); assert.equal(c4.characterKo, '링크', '주인공 하나 게임은 character_ko');
assert.equal(I.characterKo('league_of_legends', 'No Such Champion'), null); assert.equal(I.characterKo('war_of_genesis_3', '  SCHEHERAZADE '), '셰라자드', '대소문자 · 빈칸 무시');

/* 6. 자유 설계 — Outfit 줄(영어 그대로), 우리 갈래는 한글 */
assert.deepEqual(at('fe', 'fantasy', 6).free, { kind: 'ofree', kindKo: '옷 자유', outfit: 'A plum cropped mechanic romper.' });
assert.equal(at('fe', 'fantasy', 6).family, null, '옷 자유 칸 — 우리 갈래 · 옷 없음');
const g7 = at('fe', 'fantasy', 7);
assert.deepEqual(g7.free, { kind: 'gfree', kindKo: '갈래 자유', outfit: 'A slate-blue tankini' }); assert.equal(g7.family, 'swimwear'); assert.equal(g7.familyKo, '수영복');
const m2 = at('fe-steel', 'mecha', 2);
assert.deepEqual(m2.free, { kind: 'ofree', kindKo: '옷 자유', outfit: 'a coral-pink bandeau playsuit' }, '옛 옷 자유 — free_outfit'); assert.equal(m2.item, null, '옛 옷 자유의 장면 옷은 쓰지 않았다');
assert.equal(at('fe-steel', 'steampunk', 3).free.outfit, null, '「…」 그대로면 null');
assert.equal(I.outfitLine({ free_prompt: 'Outfit family (required): lingerie\nOutfit: a red slip' }), 'a red slip', 'Outfit family 줄은 아니다');

/* 6-1. 장면 풀이 — 둘째 줄(장소 · 하는 일 · 구도) + 더 보기. 손 · 받침 · 고개는 싣지 않는다, 표에 없는 값(acc nope)은 뺀다. 자유 설계 컷은 GPT 가 채운 줄만(영어, en) */
assert.deepEqual(at('fe', 'fantasy', 4).s, { pl: '쇼핑몰', act: '잔을 든다', fr: '허리 위', ex: '차분함', gz: '카메라', bd: '정면', cam: '눈높이', ln: '50mm 표준', lt: '옆 빛', si: '젖은 옷', os: '윤기 나는 새틴', tm: '밤', era: '지금 현실', ar: '2:3' });
assert.deepEqual(at('fe', 'fantasy', 6).s, { pl: 'a kiosk', en: 1 }, '장면 자유 — 채운 Place 줄만');
assert.deepEqual(at('fe', 'fantasy', 7).s, { pl: 'a dock', en: 1 });
assert.equal('s' in at('fe-steel', 'steampunk', 3), false, '「…」 빈 틀뿐 — s 없음');
assert.deepEqual(at('fe', 'fantasy', 1).s, { pl: '쇼핑몰', era: '지금 현실' }, '옛 기록 — 있는 칸만');

/* 7. 차례 — 날짜 새것 먼저, 같으면 카드 · 세계 · 번호 */
const order = ix.rows.map(r => r.date + ' ' + r.card + ' ' + r.world + ' ' + r.n);
assert.equal(order[0], '2026-11-16 fe fantasy 1'); assert.equal(order[order.length - 1], '2026-11-01 fe-steel steampunk 1');
for (let i = 1; i < ix.rows.length; i++) assert(ix.rows[i - 1].date >= ix.rows[i].date, '날짜 차례');
const fe16 = ix.rows.filter(r => r.card === 'fe' && r.date === '2026-11-16').map(r => r.n); assert.deepEqual(fe16, [...fe16].sort((a, b) => a - b), '번호 차례');

/* 8. 쓰기 — 한 줄 JSON, 내용이 같으면 다시 쓰지 않는다(built 만 다름) */
const out = path.join(tmp, 'casual-index.json');
assert.equal(I.write(ix, out), true); assert.equal(fs.readFileSync(out, 'utf8').trim().split('\n').length, 1, '한 줄');
assert.equal(I.write({ ...I.build({ img }), built: '2099-01-01T00:00:00.000Z' }, out), false, '같으면 안 씀');
fs.rmSync(tmp, { recursive: true, force: true });

/* 9. 실제 그림 저장소 */
const real = path.join(__dirname, '..', '..', 'element-atelier-img');
if (fs.existsSync(path.join(real, 'records'))) console.log('  실제: ' + I.summary(I.build({ img: real })));
console.log('PASS 일상컷 색인 — 꼴 · 한글 · 곁가지 합치기 · 필수 표시 · 코스프레 by · 캐릭터 한글 · 자유 설계 Outfit 줄 · 차례 · 같으면 안 씀');
