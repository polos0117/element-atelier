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

/* ══ 일상컷(트리 버전2) ══ 공용 모듈·표는 이 저장소 것을 먼저, 아직 없으면 game-atelier 것으로(알림을 찍는다) */
const GAME = '../game-atelier/';
const pick = f => fs.existsSync(f) ? f : GAME + f;
const borrowed = ['lib/casual-tree.js', 'lib/casual-tree-v2.js', 'data/casual-tree.json', 'data/casual-tree-v2.json'].filter(f => !fs.existsSync(f));
if (borrowed.length) console.log('  (알림) 아직 없어 game-atelier 것을 빌렸다: ' + borrowed.join(', '));
for (const f of ['lib/casual-tree.js', 'lib/casual-tree-v2.js']) vm.runInContext(fs.readFileSync(pick(f), 'utf8'), ctx);
const C2 = ctx.window.AtelierCasualTreeV2, C1 = ctx.window.AtelierCasualTree;
const tree = JSON.parse(fs.readFileSync(pick('data/casual-tree.json'), 'utf8')), tree2 = JSON.parse(fs.readFileSync(pick('data/casual-tree-v2.json'), 'utf8'));
const ownTables = !borrowed.includes('data/casual-tree.json');
const t2 = C2.make(tree2, tree), opts = { tree, tree2 }, CL = T.CASUAL, cur = S.styles[S.default].versions[0];
const words = s => (String(s).match(/\S+/g) || []).length;
const eras = tree.eras.map(e => e.key);
if (ownTables) assert(same(eras, ['now', 'site', 'nation', 'fantasy']), '원소 트리의 시대 넷 ' + eras);
/* 시대마다 그 시대에 나오는 장소 하나 — 표에서 읽는다(열쇠를 박지 않는다) */
const placeOf = era => (tree.places.find(p => p.eras.includes(era) && !C1.screens(tree, p.key)) || tree.places.find(p => p.eras.includes(era))).key;
const famOf = era => tree.eras.find(e => e.key === era).outfits[0];
const base = era => ({ treeV: 2, era, place: placeOf(era), ofam: famOf(era) });
/* 지시문 공통 검사 — 뼈대 줄, 고정값, 첨부 그림 말 없음, 한국어 없음(괄호 밖), 게임 말 없음(화풍 문장은 뺀다 — 「game key art」) */
const GAME_WORDS = /\b(game|games|gaming|arcade|game console|games console)\b/i;   // 「console of dials」(제어실)은 게임 말이 아니다
const checkCasual = (key, sc, txt, label) => {
  const c = P.card(D, key), scene = (txt.split('SCENE (chosen):\n')[1] || '').split('\n\n')[0];
  assert(txt.startsWith(CL.input) && txt.includes('CHARACTER: one adult woman — ') && !/attached image|same woman/i.test(txt), label + ' 글만 — 첨부 그림 말이 없다');
  assert(txt.includes('STYLE: ' + cur.casual) && !txt.includes('STYLE: ' + cur.text), label + ' 화풍은 판의 casual 문장');
  assert(txt.includes('FRAME: a vertical 2:3 (1024×1536) image.'), label + ' FRAME 2:3');
  assert(/overall_intensity: strong — /.test(txt) && /skin_exposure: bold — /.test(txt), label + ' 고정값 두 축');
  for (const line of [CL.output, CL.angle, CL.figure, CL.body, CL.hands, 'SCENE (chosen):\n']) assert(txt.includes(line), label + ' 에 ' + line.slice(0, 20) + ' 가 없다');
  assert(scene.includes('POSTURE: ') && scene.includes('COMPOSITION: ') && /^(RIGHT|LEFT|BOTH) HANDS?: /m.test(scene) || !(sc.right || sc.left), label + ' 자세·구도·손 줄');
  assert(txt.includes(c.element.en), label + ' 나라 이름 ' + c.element.en);
  if (c.tier === 'citizen') assert(txt.includes(c.citizen.object.en.trim()) && txt.includes('a citizen of the ' + c.element.en + ' Nation'), label + ' 주민의 물건');
  if (c.tier === 'lord') assert(txt.includes('the personification of ' + c.family.en + ', of the ' + c.element.en + ' Nation'), label + ' 가문주');
  if (c.tier === 'root') assert(txt.includes('the personification of ' + c.element.en + ' (' + c.element.symbol + ')'), label + ' 근본');
  assert(!/[가-힣]/.test(txt.replace(/\([^)]*\)/g, '')), label + ' 한국어(괄호 밖)');
  const noStyle = txt.split('\n\n').filter(l => !l.startsWith('STYLE: ')).join('\n\n');
  if (ownTables || !sc.random) assert(!GAME_WORDS.test(noStyle), label + ' 게임 말 — ' + (noStyle.match(GAME_WORDS) || [])[0]);
  assert(words(txt) <= 1200, label + ' 길이 ' + words(txt) + ' 낱말');
  const close = T.CLOSE_FRAMES.includes(sc.frame);
  assert.equal(txt.includes('CROP: '), close, label + ' 가까운 컷만 CROP');
  assert.equal(txt.includes(CL.anatomyClose), close, label + ' 가까운 컷 몸 줄');
};

/* 1. 다 고른 장면 — 카드 다섯 × 시대 넷 */
const CARDS = ['fe', 'fe-steel', 'fe-steel-sword', 'h-water-bottle', 'og'];
const full = { posture: 'stand', support: 'none', frame: 'waist_up', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'hip', left: 'natural', gaze: 'camera', expr: 'soft_smile',
  scene: 'late afternoon, warm light', custom: 'a thin iron ring on a chain', axes: { overall_intensity: 'strong', skin_exposure: 'bold' }, aspect: '2:3' };
let nc = 0; const eraLines = {};
for (const key of CARDS) for (const era of eras) {
  const sc = { ...base(era), ...full }, txt = P.buildCasual(D, S, key, sc, opts);
  checkCasual(key, sc, txt, key + ' ' + era);
  assert(txt.includes('GAZE: ') && txt.includes('EXPRESSION: ') && !/EXPRESSION: .*gaze/.test(txt), key + ' ' + era + ' 시선·표정(시선 말 없음)');
  assert(txt.includes('RIGHT HAND: ') && txt.includes('LEFT HAND: '), key + ' ' + era + ' 두 손 줄');
  assert(txt.includes('Scene note: late afternoon') && txt.includes('Note: a thin iron ring'), key + ' ' + era + ' 덧붙임');
  const eraLine = txt.split('\n\n').find(l => /^(ERA|SETTING|WORLD): /.test(l)); assert(eraLine, key + ' ' + era + ' 시대 줄');
  eraLines[era] = eraLine; nc++;
}
assert.equal(new Set(Object.values(eraLines)).size, eras.length, '시대마다 시대 줄이 다르다');
if (ownTables) {
  const fe = era => P.buildCasual(D, S, 'fe', { ...base(era), ...full }, opts);
  assert(fe('now').includes('ERA: the present-day real world'), '지금 현실');
  assert(fe('site').includes('SETTING: a real present-day place where Iron (Fe) is actually made, worked or used'), '쓰임의 현장');
  assert(fe('nation').includes('WORLD: this scene happens inside her own kingdom, the Iron Nation') && fe('nation').includes(D.nations.find(x => x.key === 'fe').worlds.fantasy.en.trim()), '나라 안 — 판타지 세계 글');
  assert(fe('fantasy').includes(CL.era.fantasy), '무대·환상');
}
/* 2. 트리의 랜덤 장면 — 카드마다 몇 번(정해진 난수) */
let seed = 7; const rnd = () => { seed = (seed * 48271) % 2147483647; return (seed - 1) / 2147483646; };
for (const key of CARDS) for (let i = 0; i < 6; i++) {
  const sc = C2.random(t2, { treeV: 2 }, null, rnd), txt = P.buildCasual(D, S, key, sc, opts);
  checkCasual(key, { ...sc, random: true }, txt, key + ' 랜덤 ' + i + ' ' + JSON.stringify([sc.era, sc.place, sc.frame]));
  if (sc.gaze) assert(txt.includes('GAZE: '), key + ' 랜덤 시선');
  nc++;
}
/* 3. 해방한 장면 — 거실에서 등을 벽에(장소에 벽 받침이 없어도 unlocked 면 그대로) · 뒤돌아보기 · 두 손 소품 · 가까운 컷 · 얼굴 숨김 */
const livingLike = tree.places.find(p => p.eras.includes(eras[0]) && !(tree2.places[p.key] || []).includes('wall')) || tree.places[0];
const unl = { ...base(eras[0]), place: livingLike.key, posture: 'lean_wall', support: 'back_wall', frame: 'three_quarter', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'natural', left: 'natural', unlocked: ['posture', 'support'] };
const ut = P.buildCasual(D, S, 'fe-steel-sword', unl, opts);
checkCasual('fe-steel-sword', unl, ut, '해방');
assert(ut.includes('SUPPORT: her back rests against the wall.') && ut.includes('POSTURE: '), '해방한 자세·받침이 그대로 실린다');
const back = { ...base(eras[0]), posture: 'stand', support: 'none', frame: 'full_body', body: 'back', head: 'over_shoulder', camera: 'eye', right: 'natural', left: 'natural', gaze: 'camera', expr: 'calm', unlocked: ['body', 'head'] };
const bt = P.buildCasual(D, S, 'og', back, opts);
assert(bt.includes(CL.lookBack) && bt.includes('EXPRESSION: '), '뒤돌아보기 줄 · 얼굴이 보여 표정도');
const hidden = P.buildCasual(D, S, 'og', { ...back, head: 'with_body', gaze: 'horizon' }, opts);
assert(!hidden.includes(CL.lookBack) && !hidden.includes('EXPRESSION: '), '등만 돌리면 돌아보기 줄도 표정도 없다');
const faceClose = P.buildCasual(D, S, 'fe', { ...base(eras[0]), posture: 'stand', support: 'none', frame: 'face_close', body: 'front', head: 'with_body', camera: 'eye', right: 'cheek', left: 'out', gaze: 'camera', axes: { skin_exposure: 'bold' } }, opts);
assert(faceClose.includes('CROP: ' + T.CROP_EDGE.face_close) && faceClose.includes(CL.wardrobeClose) && faceClose.includes(T.CLOSE_AXIS_GUIDES.skin_exposure.bold) && !faceClose.includes('7.5 heads'), '클로즈업 — CROP · 옷 줄 · 노출 풀이 · 몸 줄');
/* 두 손 소품 — 손 줄은 「is in PROP」, PROP 줄 하나 */
const cupUse = tree2.prop_uses.find(u => u.hands === 'both' && !tree2.props.find(p => p.key === u.prop).signature);
const propPlace = tree.places.find(p => p.eras.includes(eras[0]) && C2.useFits(t2, { treeV: 2, era: eras[0], place: p.key, posture: cupUse.postures[0], frame: cupUse.frames[cupUse.frames.length - 1], right: 'prop', left: 'prop' }, cupUse, 2, null));
if (propPlace) {
  const pt = P.buildCasual(D, S, 'fe-steel', { ...base(eras[0]), place: propPlace.key, posture: cupUse.postures[0], support: 'none', frame: cupUse.frames[cupUse.frames.length - 1], body: 'front_3q', head: 'with_body', camera: 'eye', right: 'prop', left: 'prop', use: cupUse.key, unlocked: ['support'] }, opts);
  assert(pt.includes('RIGHT HAND: her own right hand is in PROP.') && pt.includes('LEFT HAND: her own left hand is in PROP.') && pt.includes('PROP: with both hands she '), '두 손 소품 ' + cupUse.key);
}
/* 표정 — 시선 말 떼기 */
assert.equal(P.exprNoGaze(T.EXPRESSION_DETAIL.half_smile), 'one mouth corner lifted higher than the other, lips closed');
assert.equal(P.exprNoGaze(T.EXPRESSION_DETAIL.confident), 'level brow, unhurried eyes, chin slightly raised, mouth closed and composed');
/* 고정값 — 비우거나 AUTO 면 strong · bold · 2:3, 손으로 고른 값은 그대로 */
assert(same(P.casualFixed({}), { axes: { overall_intensity: 'strong', skin_exposure: 'bold' }, aspect: '2:3' }), '빈 장면은 고정값');
assert(same(P.casualFixed({ axes: { skin_exposure: 'moderate', overall_intensity: 'AUTO' }, aspect: '3:2' }), { axes: { skin_exposure: 'moderate', overall_intensity: 'strong' }, aspect: '3:2' }), '고른 값은 그대로, AUTO 만 고정값');
assert(P.buildCasual(D, S, 'fe', { ...base(eras[0]), ...full, aspect: '1:1' }, opts).includes('FRAME: a square 1:1 (1024×1024) image.'), '화면비를 고르면 그 FRAME');
/* 파일 이름 · 기록 */
assert.equal(P.casualFile('fe-steel-sword', 'game_keyart', 2), 'fe-steel-sword_game_keyart_f_casual2.webp');
const cr = P.casualRecord(D, S, 'og', { ...base(eras[0]), ...full }, opts, 3);
assert.equal(cr.atelier, 'element'); assert.equal(cr.slot, 'casual3'); assert.equal(cr.treeV, 2); assert.equal(cr.tier, 'root'); assert.equal(cr.file, 'og_game_keyart_f_casual3.webp');
assert.equal(cr.scene.treeV, 2); assert.equal(cr.scene.aspect, '2:3'); assert.equal(cr.scene.axes.overall_intensity, 'strong'); assert.equal(cr.prompt, P.buildCasual(D, S, 'og', { ...base(eras[0]), ...full }, opts));
/* 없는 카드 · 표 없음 */
assert.equal(P.buildCasual(D, S, 'xx', { ...base(eras[0]) }, opts), '');
assert.throws(() => P.buildCasual(D, S, 'fe', { ...base(eras[0]) }, { tree }), /Casual tree v2/);
/* 표 파일은 함수가 없고, 조립기는 표정 표를 다 가진다 */
assert(same(Object.keys(T.EXPRESSION_DETAIL).sort(), T.EXPRESSION_OPTIONS.map(o => o[0]).filter(Boolean).sort()), '표정 선택지와 풀이가 같다');
console.log('PASS 일상컷: 지시문 ' + nc + ' · 카드 ' + CARDS.length + ' × 시대 ' + eras.length + ' · 랜덤 · 해방 · 돌아보기 · 클로즈업 · 두 손 소품 · 고정값 · 파일 이름 · 기록' + (ownTables ? ' · 원소 표' : ' · (game 표를 빌림)'));
