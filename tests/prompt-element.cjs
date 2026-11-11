/* 지시문 조립 — 모든 카드 × 사는 세계가 지어지고, 뼈대 줄이 다 있고, 현대 세계는 없다.
   Run: node tests/prompt-element.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, T = ctx.window.AtelierSpec;
const D = JSON.parse(fs.readFileSync('data/element-design.json', 'utf8')), SN = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
/* 영어 틀 검사는 옛 화풍 판으로(2026-11-04 기본이 구조판 semireal 이 됐다) — 구조판 검사는 파일 끝에서 SN 으로 */
/* 옛 꼴(긴 줄 지시문) 검사 — 짧은 판(2026-11-09)은 끈 사본으로. 짧은 판은 파일 끝에서 따로 본다 */
const LONG = (() => { const x = JSON.parse(JSON.stringify(SN)); x.worldShort = false; for (const st of Object.values(x.styles)) for (const v of st.versions) { v.casualShort = false; v.worldShort = false; } return x; })();
const S = Object.assign({}, LONG, { default: 'game_keyart' });

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
    assert(t.length > 900 && t.length < 5100, key + ' ' + w + ' 길이 ' + t.length);   // 외형 줄(나이·실루엣·얼굴·노출)이 더해져 길어졌다(2026-10-30) · 얼굴 설계 · 기본 표정(2026-11-01) · 화풍 v3 문장 · FACE 끝 한 마디(2026-11-02)
    assert(t.startsWith('CONCEPT: '), key + ' ' + w + ' CONCEPT 첫 줄');
    assert(t.includes("except her element's own chemical symbol (" + c.element.symbol + ') and atomic number (' + c.element.number + ')') && !t.includes('no text, no lettering, no numbers'), key + ' ' + w + ' 기호 · 원자 번호만 허용(2026-10-31)');
    for (const line of ['ELEMENT TRAITS of ', 'AGE: ', 'SILHOUETTE: ', 'FACE — she must read as her own person', 'WORLD — ', 'STYLE: ', 'EXPOSURE (bold)', 'OUTPUT: ', 'BODY: ', 'ONE FIGURE ONLY', 'ANATOMY: ']) assert(t.includes(line), key + ' ' + w + ' 에 ' + line + ' 가 없다');
    /* 외형 줄은 설계표 look(나라 ← 가문) 의 어휘 — 가문이 덮어쓴 머리색이 실리고, 직접 고른 것은 없으니 IDENTITY 가 없다 */
    const dz = P.lookOf(c, w), silLine = t.split('\n').find(l => l.startsWith('SILHOUETTE: ')), faceLine = t.split('\n').find(l => l.startsWith('FACE'));
    assert(silLine.includes(T.VOCAB_EN.hair_color[dz.silhouette.hair_color]) && silLine.includes(T.VOCAB_EN.body[dz.silhouette.body] + ' build') && silLine.includes(T.VOCAB_EN.hair[dz.silhouette.hair]), key + ' ' + w + ' 실루엣 줄 ' + silLine);
    /* 화풍 판의 얼굴 낱말(v3 — 2026-11-02)이 있으면 그 글로 바뀌어 실린다 */
    const FW = (S.styles[S.default].versions.find(v => v.v === S.styles[S.default].current) || {}).face || {}, fw = (k, v) => FW[k + '.' + v];
    for (const k of Object.keys(T.FACE_PARAM)) assert(faceLine.includes(fw(k, dz.face[k]) || T.VOCAB_EN[k][dz.face[k]]), key + ' ' + w + ' 얼굴 줄에 ' + k);
    /* 얼굴 설계(2026-11-01 — 얼굴 느낌이 비슷하게 나왔다) — 나이감 · 인상 · 피부 · 눈 크기 · 눈꼬리 · 표식이 실리고, 기본 표정 · 앞머리도. 모두에게 같던 「soft full cheeks · soft smile」 은 없다 */
    const FD = T.FACE_DESIGN;
    assert(t.includes(FD.age[dz.face.age]) && faceLine.startsWith(FD.head.split(':')[0]) && faceLine.includes('first impression — ' + (fw('impression', dz.face.impression) || FD.impression[dz.face.impression])), key + ' ' + w + ' 나이감 · 인상');
    for (const k of ['skin_tone', 'eye_size', 'eye_tilt', 'mark']) assert(faceLine.includes(fw(k, dz.face[k]) || FD[k][dz.face[k]]), key + ' ' + w + ' 얼굴 줄에 ' + k);
    assert(t.includes(T.EXPR_HEAD + (((S.styles[S.default].versions.find(v => v.v === S.styles[S.default].current) || {}).expr || {})[dz.face.expr] || T.EXPRESSION_DETAIL[dz.face.expr]) + '.') && silLine.includes(' with ' + FD.bangs[dz.silhouette.bangs]), key + ' ' + w + ' 기본 표정 · 앞머리');
    assert(!t.includes('soft full cheeks') && !t.includes('controlled anime facial design'), key + ' ' + w + ' 얼굴을 하나로 만들던 말');
    assert(!t.includes('IDENTITY ('), key + ' ' + w + ' 고른 외형이 없으면 IDENTITY 가 없다');
    const order = ['HOUSE TRAITS', 'AGE: ', 'SILHOUETTE: ', 'FACE — ', 'WORLD — ', 'STYLE: ', 'EXPOSURE (', 'OUTPUT: '].map(x => t.indexOf(x)).filter(i => i >= 0);
    assert(same(order, order.slice().sort((a, b) => a - b)), key + ' ' + w + ' 외형 줄 차례');
    /* 과감 노출은 세계마다 — 판타지·스팀펑크는 제 문장(코르셋 없이), 메카는 공용 겉옷 문장. 세계 옷 뼈대가 서로 다르다(2026-10-30 — 둘이 같은 코르셋 옷으로 나왔다) */
    /* 주민은 물건이 먼저(2026-10-31) — 세계 옷 뼈대 대신 citizenTail · 주민 과감(옷 뼈대 말 없이) · 메카는 물건이 설계를 이끈다 */
    const cit = c.tier === 'citizen';
    if (cit && w !== 'mecha') assert(t.includes('COSTUME (citizen, ' + w + '): her object leads') && t.includes(T.CITIZEN_EXPOSURE_BOLD) && !t.includes('pauldron') && !t.includes('high-necked blouse') && !/corset-like/.test(t), key + ' ' + w + ' 주민 옷·과감');
    else if (w === 'fantasy') assert(t.includes('between pauldron and bracer') && t.includes('COSTUME (fantasy)') && t.includes('No corset, no bustle') && !/corset-like/.test(t), key + ' 판타지 옷·과감');
    else if (w === 'steampunk') assert(t.includes('sleeves rolled above the elbow') && t.includes('COSTUME (steampunk)') && t.includes('high-necked blouse') && !/corset-like/.test(t), key + ' 스팀펑크 옷·과감');
    else assert(t.includes('her outer layer (coat, cloak, robe or armor) stays on both shoulders') && t.includes(T.CITIZEN_MECHA) === cit, key + ' 메카 과감은 겉옷 · 주민은 물건이 설계를 이끈다');
    if (w !== 'mecha') assert(/LIGHT: .*unless TIME & WEATHER says otherwise/.test(t), key + ' ' + w + ' 기본 빛');
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
  assert.equal(P.fileName(key, 'fantasy', 'game_keyart', 3), key + '_fantasy_game_keyart_f_casual3.webp');
}
assert(byTier.root >= 5 && byTier.lord >= 8 && byTier.citizen >= 20, JSON.stringify(byTier));

/* 외형 칸 — 직접 고른 항목이 설계 묶음을 이기고 IDENTITY 에 실린다 · 끄기 · 노출 · 나이 · 직접 입력 · 모르는 열쇠 버림 */
{
  const dz = P.lookOf(P.card(D, 'fe-rust'));
  assert.equal(dz.silhouette.hair_color, 'rust_orange'); assert.equal(dz.face.eye_color, 'rust_amber');
  /* 가문주 · 주민은 근본을 따라가지 않고 제 물질 · 물건에서 떠오르는 외형(사용자 2026-11-01 「각자 그 물질이나 물건을 생각했을 때 떠오르는 이미지로」) —
     설계표에 적은 칸이 그대로 지시문 값이 된다. 체형은 글래머러스한 쪽이 많고(「hourglass, voluptuous 등 글래머러스한 몸매가 더 많았으면」) 한쪽으로 몰리지 않는다 */
  {
    const GLAM = ['curvy', 'hourglass', 'voluptuous', 'busty_slender', 'curvy_athletic'], bodies = {};
    for (const g of GLAM) assert(T.VOCAB_EN.body[g], g + ' 체형이 어휘에 없다');
    for (const k of P.cards(D)) {
      const c = P.card(D, k); if (c.tier === 'root') continue;
      const own = c.tier === 'lord' ? c.family.look : c.citizen.look, l0 = P.lookOf(c);
      bodies[l0.silhouette.body] = (bodies[l0.silhouette.body] || 0) + 1;
      for (const [g, a] of [['silhouette', 'body'], ['silhouette', 'hair_color'], ['face', 'brows'], ['face', 'nose'], ['face', 'lips']]) assert.equal(l0[g][a], own[g][a], k + ' ' + a + ' 는 설계표 값');
      assert.equal(l0.face.eye_color, c.family.look.face.eye_color, k + ' 눈 색은 가문(핏줄)');
      const ws = P.worldsOf(D, k), sig = l => [l.silhouette.hair, l.face.face_shape, l.face.eyes].join('/');
      for (const w of ws) {
        const l = P.lookOf(c, w), ow = own.worlds[w];
        assert.equal(sig(l), [ow.silhouette.hair, ow.face.face_shape, ow.face.eyes].join('/'), k + ' ' + w + ' 머리 · 얼굴형 · 눈은 설계표의 그 세계 값');
        if (w === 'steampunk') assert.notEqual(l.silhouette.hair, 'updo_bun', k + ' 스팀펑크 올림머리');
      }
      assert.equal(new Set(ws.map(w => sig(P.lookOf(c, w)))).size, ws.length, k + ' 세계끼리 다른 사람');
    }
    const most = Math.max(...Object.values(bodies)), all = Object.values(bodies).reduce((x, y) => x + y, 0), glam = GLAM.reduce((x, g) => x + (bodies[g] || 0), 0);
    assert(glam > all / 2 && most <= all * 0.3 && Object.keys(bodies).length >= 6, '체형 ' + JSON.stringify(bodies));
    assert.notEqual(P.lookOf(P.card(D, 'fe-steel')).silhouette.body, P.lookOf(P.card(D, 'fe')).silhouette.body, '가문주 체형이 근본과 다르다');
  }
  /* 설계표에 안 적은 칸만 대비로 돌린다 — 가문주는 근본과, 주민은 가문주 · 근본과 다르게 */
  {
    const D2 = JSON.parse(JSON.stringify(D)), fe = D2.nations.find(n => n.key === 'fe'), rust = fe.families.find(f => f.key === 'rust'), armor = rust.citizens.find(c => c.key === 'armor');
    rust.look = { face: { eye_color: rust.look.face.eye_color }, silhouette: { hair_color: rust.look.silhouette.hair_color } }; armor.look = { silhouette: { hair_color: armor.look.silhouette.hair_color } };
    for (const w of worlds) {
      const r = P.lookOf(P.card(D2, 'fe'), w), l = P.lookOf(P.card(D2, 'fe-rust'), w), c = P.lookOf(P.card(D2, 'fe-rust-armor'), w);
      for (const [g, a] of [['silhouette', 'body'], ['silhouette', 'hair'], ['face', 'face_shape'], ['face', 'eyes'], ['face', 'brows'], ['face', 'nose'], ['face', 'lips']]) {
        assert.notEqual(l[g][a], r[g][a], 'fe-rust ' + w + ' ' + a + ' 대비 돌림이 근본과 같다');
        assert(c[g][a] !== l[g][a] && c[g][a] !== r[g][a], 'fe-rust-armor ' + w + ' ' + a + ' 대비 돌림');
      }
      if (w === 'steampunk') assert(l.silhouette.hair !== 'updo_bun' && c.silhouette.hair !== 'updo_bun', '스팀펑크 대비 돌림에 올림머리 없음');
    }
  }
  assert(same(P.lookOf(P.card(D, 'fe-rust-armor'), 'mecha'), P.lookOf(P.card(D, 'fe-rust-armor'), 'mecha')), '같은 값이 늘 같다');
  /* 세계마다 다른 사람 — 나라마다 세 세계의 (머리·얼굴형·눈) 이 서로 다르고, 색·체형은 같다. 가문의 세계 값이 나라의 세계 값을 이긴다 */
  for (const n of D.nations) {
    const sig = w => { const l = P.lookOf(P.card(D, n.key), w); return [l.silhouette.hair, l.face.face_shape, l.face.eyes].join('/'); };
    assert.equal(new Set(worlds.map(sig)).size, 3, n.key + ' 세 세계가 다른 사람 ' + worlds.map(sig));
    const col = w => { const l = P.lookOf(P.card(D, n.key), w); return [l.silhouette.hair_color, l.face.eye_color, l.silhouette.body].join('/'); };
    assert.equal(new Set(worlds.map(col)).size, 1, n.key + ' 색·체형은 공통');
  }
  const steelW = P.card(D, 'fe-steel').family.look.worlds;
  assert.equal(P.lookOf(P.card(D, 'fe-steel'), 'fantasy').silhouette.hair, steelW.fantasy.silhouette.hair); assert.equal(P.lookOf(P.card(D, 'fe-steel'), 'mecha').silhouette.hair, steelW.mecha.silhouette.hair);
  assert(P.build(D, S, 'fe', 'steampunk', {}).includes(T.VOCAB_EN.hair.updo_bun) && !P.build(D, S, 'fe', 'steampunk', {}).includes(T.VOCAB_EN.hair.braids), '지시문이 그 세계의 머리');
  assert.equal(P.record(D, S, 'fe-steel', 'fantasy', {}).design.silhouette.hair, steelW.fantasy.silhouette.hair, '기록의 design 은 그 세계 값');
  const t1 = P.build(D, S, 'fe-rust', 'fantasy', { look: { params: { 'hair color': 'silver', 'eye shape': 'sharp', 'apparent age': '30s', 'body type': '__custom__', 'body type_custom': 'wiry and tall', zzz: 'x' } } });
  const sil1 = t1.split('\n').find(l => l.startsWith('SILHOUETTE: ')), face1 = t1.split('\n').find(l => l.startsWith('FACE'));
  const dzF = P.lookOf(P.card(D, 'fe-rust'), 'fantasy');
  assert(!sil1.includes('rust-orange hair') && !sil1.includes(' build') && sil1.includes(T.VOCAB_EN.hair[dzF.silhouette.hair]), '머리색·체형을 고르면 실루엣에서 빠진다 ' + sil1);
  assert(!face1.includes(T.VOCAB_EN.eyes[dzF.face.eyes]) && face1.includes(T.VOCAB_EN.face_shape[dzF.face.face_shape]), '눈을 고르면 얼굴 줄에서 빠진다 ' + face1);
  assert(t1.includes('AGE: a woman in her thirties'), '나이');
  assert(t1.includes('IDENTITY (chosen details override the automatic look)\nhair color: silver') && t1.includes('eye shape: sharp — ') && t1.includes('body type: wiry and tall') && t1.includes('body scope: ') && !t1.includes('zzz') && !t1.includes('apparent age:'), 'IDENTITY 목록 ' + t1.split('IDENTITY')[1]);
  const t2 = P.build(D, S, 'fe-rust', 'mecha', { look: { faceDesignOn: false, silhouetteOn: false, exposure: '' } });
  assert(!/^SILHOUETTE: /m.test(t2) && !t2.includes('FACE') && !t2.includes('EXPOSURE') && !t2.includes('EXPRESSION: ') && t2.includes('AGE: in her twenties'), '끄면 빠진다(얼굴 설계 · 기본 표정도), 노출 비우면 안 싣는다');
  assert(P.build(D, S, 'fe', 'mecha', { look: { exposure: 'low' } }).includes('EXPOSURE (low): a mostly covered version of the costume WORLD describes'), '노출 적게');
  assert(P.build(D, S, 'fe', 'mecha', { look: { exposure: 'nope' } }).includes('EXPOSURE (bold)'), '모르는 노출은 기본');
  const nl = P.normLook({ params: { 'hair color': 'silver', bogus: 'x', 'hair color_custom': '' }, exposure: 'moderate', faceDesignOn: false });
  assert(same(nl, { params: { 'hair color': 'silver' }, faceDesignOn: false, silhouetteOn: true, exposure: 'moderate' }), '외형 칸 바로잡기 ' + JSON.stringify(nl));
  const rec = P.record(D, S, 'fe-rust', 'fantasy', { look: { params: { 'hair color': 'silver' } } });
  assert.equal(rec.look.params['hair color'], 'silver'); assert.equal(rec.design.silhouette.hair_color, 'rust_orange'); assert.equal(rec.look.exposure, 'bold', '기록에 외형 칸과 설계 look');
}
/* 장면·시간대·자세·표정(opts.shot) — 설계표 scenes(나라마다 세계마다 둘 이상), 비우면 세계 글의 장소·카드 자세, 모르는 열쇠는 비운다 */
{
  for (const n of D.nations) for (const w of worlds) assert(P.scenesOf(P.card(D, n.key), w).length >= 2, n.key + ' ' + w + ' 장면 변주');
  assert(same(P.scenesOf(P.card(D, 'fe-steel-sword'), 'mecha'), P.scenesOf(P.card(D, 'fe'), 'mecha')), '가문이 세계 글을 안 덮어썼으면 나라의 장면');
  const base = P.build(D, S, 'fe', 'fantasy', {});
  assert(base.includes(T.POSE_DEFAULT) && !base.includes('SETTING (this card)') && !base.includes('TIME & WEATHER: ') && base.includes('EXPRESSION: ' + T.EXPRESSION_DETAIL[P.lookOf(P.card(D, 'fe')).face.expr] + '.'), '비우면 카드 자세, 장면·시간대 줄 없음, 표정은 설계표 기본 표정(2026-11-01)');
  const sc = P.scenesOf(P.card(D, 'fe'), 'fantasy')[1], shot = { scene: sc.key, time: 'night', pose: 'stride', expr: 'confident', zzz: 1 };
  const t3 = P.build(D, S, 'fe', 'fantasy', { shot });
  assert(t3.includes('SETTING (this card): ' + sc.en + '.') && t3.includes(T.WORLD_TIMES.find(r => r.key === 'night').en) && t3.includes(T.WORLD_POSES.find(r => r.key === 'stride').en) && !t3.includes(T.POSE_DEFAULT) && t3.includes('EXPRESSION: ' + T.EXPRESSION_DETAIL.confident + '.'), '장면·시간대·자세·표정 줄 ' + t3.slice(-900));
  const order3 = ['WORLD — ', 'SETTING (this card)', 'TIME & WEATHER: ', 'STYLE: ', 'OUTPUT: ', 'EXPRESSION: ', 'BODY: '].map(x => t3.indexOf(x)); assert(same(order3, order3.slice().sort((a, b) => a - b)), '줄 차례 ' + order3);
  assert(same(P.normShot(D, 'fe', 'mecha', shot), { scene: '', time: 'night', pose: 'stride', expr: 'confident', frame: '' }), '다른 세계의 장면 열쇠는 비운다');
  assert(same(P.normShot(D, 'fe', 'fantasy', { scene: 'nope', time: 'x', pose: 'y', expr: 'z', frame: 'nope' }), { scene: '', time: '', pose: '', expr: '', frame: '' }), '모르는 열쇠는 비운다');
  assert.equal(P.record(D, S, 'fe', 'fantasy', { shot }).shot.scene, sc.key, '기록에 shot');
}
/* 덧붙임이 실린다 · 기록 꼴 */
const t = P.build(D, S, 'fe-steel-sword', 'fantasy', { notes: { scene: 'a windy ridge', outfit: 'red sash', custom: 'low angle' } });
assert(t.includes('SCENE NOTE: a windy ridge') && t.includes('OUTFIT NOTE: red sash') && t.includes('EXTRA: low angle'));
const r = P.record(D, S, 'og', 'steampunk', {});
assert.equal(r.atelier, 'element'); assert.equal(r.tier, 'root'); assert.equal(r.file, 'og_steampunk_' + S.default + '_f.webp'); assert.equal(r.styleVersion, S.styles[S.default].current); assert.equal(r.prompt, P.build(D, S, 'og', 'steampunk', {}));
/* 같은 물질 다른 나라 — 수소의 물과 산소의 물은 다른 지시문 */
assert.notEqual(P.build(D, S, 'h-water', 'fantasy', {}), P.build(D, S, 'o-water', 'fantasy', {}));
/* 없는 열쇠·없는 세계 */
assert.equal(P.card(D, 'xx'), null); assert.equal(P.card(D, 'fe-nope'), null); assert.equal(P.card(D, 'fe-steel-sword-x'), null);
assert.equal(P.build(D, S, 'fe', 'modern', {}), '');
/* 화풍 v3(2026-11-02 「원소 공방 화풍이 2d 식으로 나오는 경우가」) — 문장이 바뀌고, 귀여운 얼굴 낱말은 v3 에서만 바꿔 적는다. v2 로 돌리면 옛 지시문 그대로.
   v4d(2026-11-03 「지금은 3d 쪽 실사로 많이 치우친 것 같아」) — 기록 판(2026-11-04 기본은 v2 로 되돌림). 선은 아주 가늘게 눈 · 눈썹 · 입술에만, 형태는 칠, 에어브러시 · 3D 렌더 · 반실사 아님. v3 얼굴 고침은 남기고 실사 쪽 낱말 둘을 바꾼다 */
{
  const GK = S.styles.game_keyart, ver = k => GK.versions.find(v => v.v === k), v3 = ver('v3'), v2 = ver('v2'), v4d = ver('v4d');
  const at = k => { const X = JSON.parse(JSON.stringify(S)); X.styles.game_keyart.current = k; return X; }, S3 = at('v3'), S2 = at('v2');
  assert(v3.text.includes('Not flat cel-shaded 2D anime') && !v3.text.includes('clean linework') && !v3.text.includes('cel-to-soft'), 'v3 문장');
  const t3 = P.build(D, S3, 'o-blood-cell', 'mecha', { style: 'game_keyart' }), f3 = t3.split('\n').find(l => l.startsWith('FACE'));
  assert(t3.includes('STYLE: ' + v3.text) && f3.includes(v3.face['impression.cute']) && f3.includes(v3.face['eye_size.large']) && f3.includes(v3.face['nose.small_button']) && f3.includes(v3.face['mark.blush']), '적혈구 v3 얼굴 낱말 ' + f3);
  assert(!f3.includes('a cute, bright-eyed sweetness') && !f3.includes('rosy flushed cheeks'), '옛 낱말은 빠진다');
  const t2 = P.build(D, S2, 'o-blood-cell', 'mecha', { style: 'game_keyart' });
  assert(t2.includes('STYLE: ' + v2.text) && t2.includes('a cute, bright-eyed sweetness') && t2.includes('small button nose') && t2.includes('rosy flushed cheeks'), 'v2 는 옛 지시문 그대로');
  /* v3b — 놀람을 낮추고 FACE 끝에 한 마디(같은 날 「2번은 넣어주고」) */
  const m3 = P.build(D, S3, 'o-fire-match', 'mecha', { style: 'game_keyart' });
  assert(m3.includes(v3.expr.surprised) && !m3.includes('mouth open in a small round shape') && m3.split('\n').find(l => l.startsWith('FACE')).includes(v3.face_tail), '성냥 v3 놀람 · FACE 끝');
  assert(P.build(D, S2, 'o-fire-match', 'mecha', { style: 'game_keyart' }).includes('lightly raised brows, lips slightly parted'), 'v2 놀람은 공통 표정 표(core v1, 2026-11-11 — 전엔 원소 옛 글 「mouth open in a small round shape」)');
  const c3 = P.build(D, S3, 'na', 'fantasy', { style: 'game_keyart' });
  assert(c3.includes(v3.face['eyes.round_large']) && !c3.includes('large round eyes'), '나트륨 둥근 큰 눈');
  /* v2 — 기본 판(2026-11-04 「v2 로 바꿔줘」 — v3 · v4d 가 세션 · API 어디서도 v2 만큼 맞지 않았다) */
  assert.equal(GK.current, 'v2');
  assert(v2.readopted && v2.readopted.startsWith('2026-11-04'), 'v2 로 되돌린 까닭');
  const h2 = P.build(D, S, 'he', 'fantasy', { style: 'game_keyart' });
  assert(h2.includes('STYLE: ' + v2.text) && !h2.includes(v4d.text), '헬륨 기본 = v2 문장');
  /* v4d — 기록 판(돌려 보면 그 판의 지시문) */
  const S4 = at('v4d');
  assert(v4d.text.includes('very fine, thin linework') && v4d.text.includes('not airbrushed') && v4d.text.includes('without outlines') && v4d.text.includes('not semi-realistic') && !v4d.text.includes('volumetric'), 'v4d 문장');
  const h = P.build(D, S4, 'he', 'fantasy', { style: 'game_keyart' }), fh = h.split('\n').find(l => l.startsWith('FACE'));
  assert(h.includes('STYLE: ' + v4d.text) && !h.includes('realistically proportioned') && !h.includes('glossy nude lips') && fh.includes(v4d.face_tail) && !v4d.face_tail.includes('semi-realistic'), '헬륨 v4d ' + fh);
  const m4 = P.build(D, S4, 'o-fire-match', 'mecha', { style: 'game_keyart' }), b4 = P.build(D, S4, 'o-blood-cell', 'mecha', { style: 'game_keyart' });
  assert(m4.includes(v4d.expr.surprised) && b4.includes(v4d.face['impression.cute']) && !b4.includes('rosy flushed cheeks'), 'v3 얼굴 고침은 v4d 에도');
}
console.log('PASS 지시문: 카드 ' + cards.length + ' · 지시문 ' + n + ' · 근본 ' + byTier.root + ' 가문주 ' + byTier.lord + ' 주민 ' + byTier.citizen + ' · 뼈대 줄 · 외형(나이·실루엣·얼굴·노출 — 설계표 look, 직접 고른 것이 이김, IDENTITY) · 장면·시간대·자세·표정 · 입는 물건 · 메카 설계 · 덧붙임 · 기록 · 파일 이름');

/* ══ 일상컷(트리 버전2) ══ 공용 모듈·표는 이 저장소 것을 먼저, 아직 없으면 game-atelier 것으로(알림을 찍는다) */
const GAME = '../game-atelier/';
const pick = f => fs.existsSync(f) ? f : GAME + f;
const borrowed = ['lib/casual-tree.js', 'lib/casual-tree-v2.js', 'data/casual-tree.json', 'data/casual-tree-v2.json'].filter(f => !fs.existsSync(f));
if (borrowed.length) console.log('  (알림) 아직 없어 game-atelier 것을 빌렸다: ' + borrowed.join(', '));
for (const f of ['lib/casual-tree.js', 'lib/casual-tree-v2.js']) vm.runInContext(fs.readFileSync(pick(f), 'utf8'), ctx);
const C2 = ctx.window.AtelierCasualTreeV2, C1 = ctx.window.AtelierCasualTree;
const tree = JSON.parse(fs.readFileSync(pick('data/casual-tree.json'), 'utf8')), tree2 = JSON.parse(fs.readFileSync(pick('data/casual-tree-v2.json'), 'utf8'));
const ownTables = !borrowed.includes('data/casual-tree.json');
/* 참고 그림의 세계 — 근본·가문주는 판타지로, 주민(검)은 메카로. 일상컷은 그 세계 그림의 그 사람(사용자 2026-10-30) */
const t2 = C2.make(tree2, tree), opts = { world: 'fantasy', tree, tree2 }, CL = T.CASUAL, cur = S.styles[S.default].versions.find(v => v.v === S.styles[S.default].current);
const words = s => (String(s).match(/\S+/g) || []).length;
const eras = tree.eras.map(e => e.key);
if (ownTables) assert(same(eras, ['now', 'site', 'nation', 'fantasy']), '원소 트리의 시대 넷 ' + eras);
/* 시대마다 그 시대에 나오는 장소 하나 — 표에서 읽는다(열쇠를 박지 않는다) */
const placeOf = era => (tree.places.find(p => p.eras.includes(era) && !C1.screens(tree, p.key)) || tree.places.find(p => p.eras.includes(era))).key;
const famOf = era => tree.eras.find(e => e.key === era).outfits[0];
const base = era => ({ treeV: 2, era, place: placeOf(era), ofam: famOf(era) });
/* 지시문 공통 검사 — 뼈대 줄, 고정값, 첨부 그림(그 세계 그림) 말, 한국어 없음(괄호 밖), 게임 말 없음(화풍 문장은 뺀다 — 「game key art」) */
const GAME_WORDS = /\b(game|games|gaming|arcade|game console|games console)\b/i;   // 「console of dials」(제어실)은 게임 말이 아니다
const WORLD_EN = { fantasy: 'Fantasy', steampunk: 'Steampunk', mecha: 'Mecha' };
/* 카드가 안 사는 세계면(물병은 판타지에 없다) 사는 첫 세계를 참고 그림으로 */
const wOf = key => P.worldsOf(D, key).includes(opts.world) ? opts.world : P.worldsOf(D, key)[0], optsFor = key => ({ ...opts, world: wOf(key) });
const checkCasual = (key, sc, txt, label, world) => {
  const c = P.card(D, key), scene = (txt.split('SCENE (chosen):\n')[1] || '').split('\n\n')[0], wk = world || wOf(key);
  assert(txt.startsWith('INPUT: the attached image is the approved character — her ' + WORLD_EN[wk] + ' card; keep her.'), label + ' 첨부 그림은 그 세계 그림');
  assert(txt.includes('CHARACTER: the same woman as the attached image — ') && txt.includes('Keep her face, eye and hair colors'), label + ' 첨부의 그 여자');
  assert(txt.includes('WARDROBE: change her clothes completely. From the attached image take only her face, hair and body') && txt.includes('ANGLE: the attached image fixes who she is'), label + ' 옷·각도 줄이 첨부를 말한다');
  assert(!/natural human's/.test(txt), label + ' 피부·머리·눈은 첨부 그대로');
  /* 일상컷 얼굴 · 화풍은 첨부 그림에 맡긴다(2026-11-03) — 판의 casual 문장 · 나이 줄 대신 「첨부 그림 그대로」 · FACE 줄, 표정은 얼굴 안에서만 */
  assert(txt.includes("STYLE: keep the attached image's rendering exactly") && !txt.includes(cur.casual) && !txt.includes('STYLE: ' + cur.text), label + ' 화풍은 첨부 그림 그대로');
  assert(txt.includes('FACE: exactly the face of the attached image') && !txt.includes(CL.age) && !txt.includes('soft full cheeks') && !txt.includes('soft smile'), label + ' 얼굴은 첨부 그림 그대로');
  assert(!/EXPRESSION: /.test(txt) || /EXPRESSION: [^\n]*Show it mildly, only with her brows, eyelids and mouth corners/.test(txt), label + ' 표정은 얼굴 안에서만');
  assert(txt.includes('FRAME: a vertical 2:3 (1024×1536) image.'), label + ' FRAME 2:3');
  assert(/overall_intensity: strong — /.test(txt) && /skin_exposure: bold — /.test(txt), label + ' 고정값 두 축');
  /* 그 원소의 기호 · 원자 번호만 읽혀도 된다(사용자 2026-10-31) — ONE MAIN FIGURE 줄이 그 둘을 채워 싣는다 */
  const fig = CL.figure.replace('{symbol}', c.element.symbol).replace('{number}', c.element.number);
  assert(fig.includes('(' + c.element.symbol + ') and atomic number (' + c.element.number + ')') && !/No text, no lettering, no numbers/.test(txt), label + ' 기호 · 원자 번호만 허용');
  for (const line of [CL.output, CL.angle, fig, CL.body, CL.hands, 'SCENE (chosen):\n']) assert(txt.includes(line), label + ' 에 ' + line.slice(0, 20) + ' 가 없다');
  assert(scene.includes('POSTURE: ') && scene.includes('COMPOSITION: ') && /^(RIGHT|LEFT|BOTH) HANDS?: /m.test(scene) || !(sc.right || sc.left), label + ' 자세·구도·손 줄');
  assert(txt.includes(c.element.en), label + ' 나라 이름 ' + c.element.en);
  if (c.tier === 'citizen') assert(txt.includes(c.citizen.object.en.trim()) && txt.includes('a citizen of the ' + c.element.en + ' Nation'), label + ' 주민의 물건');
  if (c.tier === 'lord') assert(txt.includes('the personification of ' + c.family.en + ', of the ' + c.element.en + ' Nation'), label + ' 가문주');
  if (c.tier === 'root') assert(txt.includes('the personification of ' + c.element.en + ' (' + c.element.symbol + ')'), label + ' 근본');
  assert(!/[가-힣]/.test(txt.replace(/\([^)]*\)/g, '')), label + ' 한국어(괄호 밖)');
  const noStyle = txt.split('\n\n').filter(l => !l.startsWith('STYLE: ')).join('\n\n');
  if (ownTables || !sc.random) assert(!GAME_WORDS.test(noStyle), label + ' 게임 말 — ' + (noStyle.match(GAME_WORDS) || [])[0]);
  assert(words(txt) <= 1250, label + ' 길이 ' + words(txt) + ' 낱말');   /* 1200 → 1250(2026-11-07 — 일상컷 얼굴 길이 문장이 더해졌다) */
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
  const sc = { ...base(era), ...full }, txt = P.buildCasual(D, S, key, sc, optsFor(key));
  checkCasual(key, sc, txt, key + ' ' + era);
  assert(txt.includes('GAZE: ') && txt.includes('EXPRESSION: ') && !/EXPRESSION: .*gaze/.test(txt), key + ' ' + era + ' 시선·표정(시선 말 없음)');
  assert(txt.includes('RIGHT HAND: ') && txt.includes('LEFT HAND: '), key + ' ' + era + ' 두 손 줄');
  assert(txt.includes('Scene note: late afternoon') && txt.includes('Note: a thin iron ring'), key + ' ' + era + ' 덧붙임');
  const eraLine = txt.split('\n\n').find(l => /^(ERA|SETTING|WORLD): /.test(l)); assert(eraLine, key + ' ' + era + ' 시대 줄');
  eraLines[era] = eraLine; nc++;
}
assert.equal(new Set(Object.values(eraLines)).size, eras.length, '시대마다 시대 줄이 다르다');
/* 일상컷 얼굴 길이(2026-11-07 「원소공방에는 일상컷 근거리때 얼굴길이 줄이는게 없나?」 → 「응 적용해줘」) — 영어 틀 · kv 판 일상컷은 FACE 줄에 짧은 중안부 · 하관 길이 두 문장(삼국지와 같이), 구조판은 faceLock 이 따로 */
for (const st of Object.keys(LONG.styles)) {
  const txt = P.buildCasual(D, LONG, 'og', { ...base('now'), ...full, frame: 'face_close' }, { ...optsFor('og'), style: st });
  assert(/jaw length and face length-to-width ratio/.test(txt), st + ' 일상컷 하관 길이 문장');
  if (!P.structVer(LONG, st)) assert(/the same short midface \(eyes to mouth\)/.test(txt), st + ' 일상컷 짧은 중안부 문장');
}
if (ownTables) {
  const fe = era => P.buildCasual(D, S, 'fe', { ...base(era), ...full }, opts);
  assert(fe('now').includes('ERA: the present-day real world'), '지금 현실');
  assert(fe('site').includes('SETTING: a real present-day place where Iron (Fe) is actually made, worked or used'), '쓰임의 현장');
  assert(fe('nation').includes('WORLD: this scene happens inside her own kingdom, the Iron Nation') && fe('nation').includes(D.nations.find(x => x.key === 'fe').worlds.fantasy.en.trim()), '나라 안 — 참고 그림(판타지)의 세계 글');
  const feM = P.buildCasual(D, S, 'fe', { ...base('nation'), ...full }, { ...opts, world: 'mecha' });
  assert(feM.includes(D.nations.find(x => x.key === 'fe').worlds.mecha.en.trim()) && !feM.includes(D.nations.find(x => x.key === 'fe').worlds.fantasy.en.trim()), '나라 안 — 참고 그림이 메카면 메카 세계 글');
  /* 손에 드는 그 원소의 물건 — 근본·가문주는 설계표 hold.en, 주민은 object.en. 소품 동작 sig_hold 가 PROP 줄에 그 물건을 싣는다 */
  assert.equal(P.holdOf(P.card(D, 'fe')), D.nations.find(x => x.key === 'fe').hold.en.trim()); assert.equal(P.holdOf(P.card(D, 'fe-rust')), 'a flake of rust-orange iron on a leather cord'); assert.equal(P.holdOf(P.card(D, 'fe-steel-sword')), P.card(D, 'fe-steel-sword').citizen.object.en.trim());
  for (const key of ['fe', 'fe-rust', 'h-water-bottle']) {
    const sig = { ...base(wOf(key) && eras[0]), posture: 'stand', support: 'none', frame: 'waist_up', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'prop', left: 'natural', use: 'sig_hold', gaze: 'camera' };
    const st = P.buildCasual(D, S, key, sig, optsFor(key));
    assert(st.includes('PROP: with her own right hand she holds ' + P.holdOf(P.card(D, key)) + ' at chest height; it is all she holds.'), key + ' 손에 드는 물건 ' + (st.split('PROP: ')[1] || '').slice(0, 120));
    assert(C2.useFits(t2, sig, C2.use(t2, 'sig_hold'), 1, { key, signature: [P.holdOf(P.card(D, key))], signature_hold: [0] }), key + ' 트리가 그 물건 동작을 허락한다');
  }
  assert(!C2.useFits(t2, { ...base(eras[0]), posture: 'stand', frame: 'waist_up', right: 'prop', left: 'natural' }, C2.use(t2, 'sig_hold'), 1, { key: 'x', signature: [], signature_hold: [] }), '물건이 없는 카드는 못 든다');
  /* 시간대 · 머리 변화 — 비우면 없고, 고르면 SCENE 에 */
  const th = P.buildCasual(D, S, 'fe', { ...base(eras[0]), ...full, time: 'neon', hair: 'tied' }, opts);
  assert(th.includes('Time of day: ' + CL.times.find(r => r.key === 'neon').en + '.') && th.includes('Hair: ' + CL.hairs.find(r => r.key === 'tied').en + '.'), '시간대·머리 줄');
  assert(!fe('now').includes('Time of day: ') && !fe('now').includes('Hair: '), '비우면 없다');
  assert(th.includes("her hair may be worn differently only as SCENE's Hair line says"), 'CHARACTER 가 머리 변화를 허락한다');
  assert(fe('fantasy').includes(CL.era.fantasy), '무대·환상');
}
/* 2. 트리의 랜덤 장면 — 카드마다 몇 번(정해진 난수) */
let seed = 7; const rnd = () => { seed = (seed * 48271) % 2147483647; return (seed - 1) / 2147483646; };
for (const key of CARDS) for (let i = 0; i < 6; i++) {
  const sc = C2.random(t2, { treeV: 2 }, null, rnd), txt = P.buildCasual(D, S, key, sc, optsFor(key));
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
assert.equal(P.exprNoGaze('one mouth corner lifted higher than the other, lips closed, gaze slightly to the side'), 'one mouth corner lifted higher than the other, lips closed');   /* 옛 글로 시선 떼기를 본다 — 표정 표는 core v1(2026-11-11, 시선 말 없음) */
assert.equal(P.exprNoGaze('level brow, direct unhurried gaze, chin slightly raised, mouth closed and composed'), 'level brow, unhurried eyes, chin slightly raised, mouth closed and composed');
assert.equal(P.exprNoGaze(T.EXPRESSION_DETAIL.half_smile), T.EXPRESSION_DETAIL.half_smile, 'core 표정 글은 시선 말이 없어 그대로');
/* 고정값 — 비우거나 AUTO 면 strong · bold · 2:3, 손으로 고른 값은 그대로 */
assert(same(P.casualFixed({}), { axes: { overall_intensity: 'strong', skin_exposure: 'bold' }, aspect: '2:3' }), '빈 장면은 고정값');
assert(same(P.casualFixed({ axes: { skin_exposure: 'moderate', overall_intensity: 'AUTO' }, aspect: '3:2' }), { axes: { skin_exposure: 'moderate', overall_intensity: 'strong' }, aspect: '3:2' }), '고른 값은 그대로, AUTO 만 고정값');
assert(P.buildCasual(D, S, 'fe', { ...base(eras[0]), ...full, aspect: '1:1' }, opts).includes('FRAME: a square 1:1 (1024×1024) image.'), '화면비를 고르면 그 FRAME');
/* 세계마다 — 세 세계의 일상컷은 INPUT 만 다르고(첨부가 그 세계 그림), 주민은 사는 세계만 */
for (const wk of ['steampunk', 'mecha']) checkCasual('fe', { ...base(eras[0]), ...full }, P.buildCasual(D, S, 'fe', { ...base(eras[0]), ...full }, { ...opts, world: wk }), 'fe ' + wk, wk);
assert.equal(P.casualWorld(D, 'fe', 'mecha'), 'mecha'); assert.equal(P.casualWorld(D, 'fe', 'modern'), ''); assert.equal(P.casualWorld(D, 'fe', ''), '');
const sword = P.card(D, 'fe-steel-sword'), swordOut = D.vocab.worlds.find(w => !sword.citizen.worlds.includes(w));
if (swordOut) assert.equal(P.buildCasual(D, S, 'fe-steel-sword', { ...base(eras[0]), ...full }, { ...opts, world: swordOut }), '', '주민이 안 사는 세계의 그림은 참고 그림이 될 수 없다');
assert.equal(P.buildCasual(D, S, 'fe', { ...base(eras[0]), ...full }, { tree, tree2 }), '', '참고 그림의 세계가 없으면 지시문이 없다');
/* 파일 이름 · 기록 — 세계를 탄다, ref 는 참고 그림 */
assert.equal(P.casualFile('fe-steel-sword', 'mecha', 'game_keyart', 2), 'fe-steel-sword_mecha_game_keyart_f_casual2.webp');
const cr = P.casualRecord(D, S, 'og', { ...base(eras[0]), ...full }, { ...opts, world: 'mecha' }, 3);
assert.equal(cr.atelier, 'element'); assert.equal(cr.slot, 'casual3'); assert.equal(cr.treeV, 2); assert.equal(cr.tier, 'root'); assert.equal(cr.world, 'mecha');
assert.equal(cr.file, 'og_mecha_' + S.default + '_f_casual3.webp'); assert.equal(cr.ref, 'og_mecha_' + S.default + '_f.webp');
assert.equal(cr.scene.treeV, 2); assert.equal(cr.scene.aspect, '2:3'); assert.equal(cr.scene.axes.overall_intensity, 'strong'); assert.equal(cr.prompt, P.buildCasual(D, S, 'og', { ...base(eras[0]), ...full }, { ...opts, world: 'mecha' }));
const cr0 = P.casualRecord(D, S, 'og', { ...base(eras[0]), ...full }, { tree, tree2 }, 1); assert.equal(cr0.world, ''); assert.equal(cr0.file, ''); assert.equal(cr0.ref, ''); assert.equal(cr0.prompt, '');
/* 없는 카드 · 표 없음 */
assert.equal(P.buildCasual(D, S, 'xx', { ...base(eras[0]) }, opts), '');
assert.throws(() => P.buildCasual(D, S, 'fe', { ...base(eras[0]) }, { tree, world: 'fantasy' }), /Casual tree v2/);
/* 표 파일은 함수가 없고, 조립기는 표정 표를 다 가진다 */
assert(same(Object.keys(T.EXPRESSION_DETAIL).sort(), T.EXPRESSION_OPTIONS.map(o => o[0]).filter(Boolean).sort()), '표정 선택지와 풀이가 같다');
console.log('PASS 일상컷: 지시문 ' + nc + ' · 카드 ' + CARDS.length + ' × 시대 ' + eras.length + ' · 참고 그림 = 세계 그림(세 세계·안 사는 세계 거름·나라 안은 그 세계) · 손에 드는 물건 · 시간대·머리 · 랜덤 · 해방 · 돌아보기 · 클로즈업 · 두 손 소품 · 고정값 · 파일 이름 · 기록(world·ref)' + (ownTables ? ' · 원소 표' : ' · (game 표를 빌림)'));

const SNS = Object.assign({}, SN, { default: 'mmorpg2d' });   /* 구조판 검사 — 기본이 짧은 판 mmorpg_cg(2026-11-09)가 돼서 구조판 열쇠를 바로 준다 */
/* ══ 구조판(2026-11-04 — 기본 화풍 semireal) ══ 공통 적용 규칙 → [일상컷 규칙] → 1절 → 2~4절 칸. 칸 값: 기본 → 카드의 손글(struct) → 직접 고른 것 */
{
  const SV = P.structVer(SNS, SNS.default), ST = T.STRUCT;
  assert(SV && SV.rules.startsWith('공통 적용 규칙:') && SV.section1.startsWith('1.작화 스타일') && SV.casual_rule, '기본 화풍이 구조판');
  assert.equal(P.structVer(S, 'game_keyart'), null, '옛 화풍은 구조판이 아니다');
  /* 검사기(tools/element-design.py)의 칸 이름이 표와 같다 */
  const py = JSON.parse(require('node:child_process').execFileSync('python3', ['-c', 'import importlib,json,sys;sys.path.insert(0,"tools");m=importlib.import_module("element-design");print(json.dumps(m.STRUCT_FIELDS,ensure_ascii=False))']).toString());
  const noHead = l => l.filter(x => !ST.heading.includes(x));
  assert(same(py['2'], noHead(ST.s2)) && same(py['3'], ST.s3) && same(py['4'], ST.s4) && same(py.c2, noHead(ST.s2)), '검사기 칸 이름 = 표 STRUCT');
  const rowsIn = (txt, title, names) => { const part = txt.split(title)[1] || ''; let at = -1; for (const nm of names) { const re = ST.heading.includes(nm) ? '\n' + nm + ':\n' : '\n' + nm + ': ['; const i = part.indexOf(re); if (i <= at) return nm; at = i; } return ''; };
  const fieldOf = (txt, name) => { const m = txt.match(new RegExp('^' + name.replace(/[/·]/g, '.') + ': \\[(.*)\\]$', 'm')); return m ? m[1] : null; };
  let ns = 0;
  for (const key of cards) for (const w of P.worldsOf(D, key)) {
    const c = P.card(D, key), t = P.build(D, SNS, key, w, {}), lab = key + ' ' + w;
    assert(t.startsWith(SV.rules + '\n\n' + SV.section1 + '\n\n' + SV.sections[0]), lab + ' 머리 — 공통 규칙 · 1절 · 2절');
    assert(!t.includes('일상컷 규칙:'), lab + ' 세계 그림엔 일상컷 규칙이 없다');
    for (const [i, names] of [[0, ST.s2], [1, ST.s3], [2, ST.s4]]) assert.equal(rowsIn(t, SV.sections[i], names), '', lab + ' ' + SV.sections[i] + ' 칸 차례');
    assert(!/: \[\s*\]/.test(t), lab + ' 빈 칸');
    assert(!/\b(CONCEPT|STYLE|OUTPUT|ONE FIGURE ONLY|ANATOMY|WORLD|SCENE|PROP|CROP|GAZE|COMPOSITION)\b/.test(t.split(SV.sections[0])[1]), lab + ' 옛 영어 머리말이 칸에 남았다');
    const e = c.element;
    assert(fieldOf(t, '배경').includes('글자는 "' + e.symbol + '"와 "' + e.number + '" 말고는 쓰지 않는다'), lab + ' 글자 규칙');
    const own = (((c.citizen || c.family || c.nation).struct || {})[w]) || {};
    for (const s of ['2', '3', '4']) for (const [k, v] of Object.entries(own[s] || {})) assert.equal(fieldOf(t, k), v, lab + ' 손글 칸 ' + k);
    if (!Object.keys(own).length) {
      const dz = P.lookOf(c, w);
      assert(fieldOf(t, '얼굴형') === ST.ko.face_shape[dz.face.face_shape] && fieldOf(t, '헤어스타일').startsWith(ST.ko.hair[dz.silhouette.hair]) && fieldOf(t, '머리색') === ST.ko.hair_color[dz.silhouette.hair_color] && fieldOf(t, '눈색') === ST.ko.eye_color[dz.face.eye_color], lab + ' 설계 외형(한글)');
      assert(!/[A-Za-z]/.test(['성별·나이대', '얼굴형', '눈 형태', '눈색', '코', '입술', '피부색', '머리색', '헤어스타일', '전체 골격·비례'].map(k => fieldOf(t, k)).join(' ').replace(/\([^)]*\)/g, '')), lab + ' 2절은 한글(괄호 밖)');
      if (ST.body[dz.silhouette.body]) assert(fieldOf(t, '전체 실루엣') === ST.body[dz.silhouette.body][7] && fieldOf(t, '전체 골격·비례').startsWith(ST.body[dz.silhouette.body][0]), lab + ' 체형 여덟 칸');
      assert(fieldOf(t, '장비·소품').startsWith('없음'), lab + ' 세계 그림은 손에 든 것이 없다');
      if (w === 'mecha') assert(fieldOf(t, '상의').includes(String((c.family && c.family.worlds && c.family.worlds.mecha && c.family.worlds.mecha.design) || c.nation.worlds.mecha.design).replace(/\.$/, '').slice(0, 40)), lab + ' 메카 설계');
    }
    ns++;
  }
  /* 체형 표 — 체형 열쇠마다 여덟 칸, 근육 과장 없음 */
  assert(same(Object.keys(ST.body).sort(), Object.keys(T.VOCAB_EN.body).sort()) && Object.values(ST.body).every(r => r.length === ST.bodyKeys.length), '체형 표가 어휘와 같다');
  assert(!Object.values(ST.body).flat().some(s => /근육 결|탄탄/.test(s)), '체형 표에 「근육 결 · 탄탄」 이 없다(규소에서 보디빌더로 넘쳤다)');
  /* 받침 — 원자 번호 뒤 을/를 */
  /* 손글 칸이 없는 카드(그 나라 첫 가문주)의 기본 액세서리 글 — 근본은 손글 칸이 쥔다(2026-11-04) */
  const lordOf = nk => { const n = D.nations.find(x => x.key === nk); return n.families && n.families.length ? nk + '-' + n.families[0].key : null; };
  for (const [nk, num, p] of [['fe', 26, '을'], ['h', 1, '을'], ['au', 79, '를'], ['cu', 29, '를'], ['c', 6, '을']]) { const k = lordOf(nk); if (k) assert(fieldOf(P.build(D, SNS, k, 'fantasy', {}), '액세서리').includes('"' + num + '"' + p), k + ' ' + num + p); }
  /* 손글 칸이 있는 카드(규소)에서도 직접 고른 외형 · 자세 · 시간대 · 장소 · 덧붙임이 이긴다 */
  const sc0 = P.scenesOf(P.card(D, 'si'), 'fantasy')[0];
  const ch = P.build(D, SNS, 'si', 'fantasy', { look: { params: { 'hair color': '__custom__', 'hair color_custom': 'jet black hair', 'eye size': 'large' }, exposure: 'low' },
    shot: { pose: 'stride', time: 'night', scene: sc0.key, expr: 'confident' }, notes: { scene: 'a windy ridge', outfit: 'red sash', custom: 'low angle' } });
  assert.equal(fieldOf(ch, '머리색'), 'hair color: jet black hair', '고른 머리색이 손글 칸을 이긴다');
  assert(fieldOf(ch, '눈 형태').startsWith('eye size: large') && fieldOf(ch, '눈 형태').includes(D.nations.find(n => n.key === 'si').struct.fantasy['2']['눈 형태']), '더하는 외형은 앞에 붙는다');
  assert(fieldOf(ch, '액션') === ST.ko.pose.stride && fieldOf(ch, '손동작') === ST.fixed.handsPose && fieldOf(ch, '광원') === ST.ko.time.night && fieldOf(ch, '표정') === ST.ko.expr.confident, '자세 · 시간대 · 표정(한글)');
  assert(fieldOf(ch, '배경').includes('이번 장소: ' + sc0.ko) && fieldOf(ch, '배경').includes('장면 메모: a windy ridge') && fieldOf(ch, '부가 요소').startsWith('red sash') && fieldOf(ch, '덧붙임') === 'low angle', '장소 · 덧붙임');
  assert(fieldOf(ch, '철학').includes('노출(고른 것): ' + T.EXPOSURE.low.replace(/^EXPOSURE \(low\): /, '').replace('the costume WORLD describes', 'the costume in 상의')), '기본이 아닌 노출은 손글 철학 뒤에');
  /* 기록 · 파일 이름은 기본 화풍 열쇠 */
  const r2 = P.record(D, SNS, 'si', 'mecha', {}); assert.equal(r2.file, 'si_mecha_' + SNS.default + '_f.webp'); assert.equal(r2.prompt, P.build(D, SNS, 'si', 'mecha', {}));
  /* 일상컷 구조판 — 일상컷 규칙이 붙고, 2절은 첨부 그림 그대로(카드의 c2 가 덮어쓴다), 장면 줄이 칸에 나뉜다 */
  let nc2 = 0; const optsN = key => ({ ...optsFor(key), style: SNS.default });
  for (const key of CARDS.concat(['he', 'si'])) for (const era of eras) {
    const scene = { ...base(era), ...full }, txt = P.buildCasual(D, SNS, key, scene, optsN(key)), lab = 'casual ' + key + ' ' + era;
    if (!txt) continue;
    /* 일상컷만 — 일상컷 규칙 끝에 얼굴 고정 문장, 1절 NEGATIVE 줄 끝에 금지 낱말(2026-11-06) */
    const negLine = SV.section1.split('\n').filter(l => l.startsWith('02 NEGATIVE - ')).pop();
    assert(negLine && txt.startsWith(SV.rules + '\n\n일상컷 규칙: ' + SV.casual_rule + ' ' + ST.casual.faceLock + '\n\n' + SV.section1.replace(negLine, negLine + ', ' + ST.casual.negative)), lab + ' 머리 · 얼굴 고정');
    assert(!P.build(D, SNS, key === 'he' || key === 'si' ? key : 'he', 'fantasy', {}).includes(ST.casual.negative), lab + ' 세계 그림엔 안 싣는다');
    for (const [i, names] of [[0, ST.s2], [1, ST.s3], [2, ST.s4]]) assert.equal(rowsIn(txt, SV.sections[i], names), '', lab + ' 칸 차례 ' + i);
    assert(!/: \[\s*\]/.test(txt) && !/\.\./.test(txt), lab + ' 빈 칸 · 마침표 둘');
    assert(!/\b(INPUT|CHARACTER|STYLE|OUTPUT|WARDROBE|SCENE|PROP|CROP|GAZE|COMPOSITION|WORLD)\b/.test(txt.split(SV.sections[0])[1]), lab + ' 옛 영어 머리말');
    assert.equal(fieldOf(txt, '얼굴형'), ST.casual.same, lab + ' 얼굴은 첨부 그림 그대로');
    assert(fieldOf(txt, '표정').endsWith(ST.casual.exprTail.replace(/^ — /, '')) || fieldOf(txt, '표정').endsWith(ST.casual.exprTail.trim()), lab + ' 표정 꼬리');
    nc2++;
  }
  const hf = P.buildCasual(D, SNS, 'he', { ...base(eras[0]), ...full }, { ...optsN('he'), world: 'fantasy' });
  assert.equal(fieldOf(hf, '얼굴 크기'), D.nations.find(n => n.key === 'he').struct.fantasy.c2['얼굴 크기'], '헬륨 판타지 일상컷 — 얼굴 길이 줄(c2)');
  assert.equal(fieldOf(P.buildCasual(D, SNS, 'he', { ...base(eras[0]), ...full }, { ...optsN('he'), world: 'mecha' }), '얼굴 크기'), ST.casual.same, 'c2 는 그 세계만');
  const hh = P.buildCasual(D, SNS, 'fe', { ...base(eras[0]), ...full, hair: 'tied' }, optsN('fe'));
  assert(fieldOf(hh, '헤어스타일').includes(ST.ko.chair.tied), '머리를 바꾸는 장면이면 그 줄(한글)');
  /* 한글 낱말 표 — 외형 · 얼굴 설계 · 표정 · 자세 · 시간대 열쇠가 다 있고, 괄호 밖은 한글 */
  const need = { face_shape: T.VOCAB_EN.face_shape, eyes: T.VOCAB_EN.eyes, brows: T.VOCAB_EN.brows, nose: T.VOCAB_EN.nose, lips: T.VOCAB_EN.lips, eye_color: T.VOCAB_EN.eye_color, hair_color: T.VOCAB_EN.hair_color, hair: T.VOCAB_EN.hair,
    bangs: T.FACE_DESIGN.bangs, impression: T.FACE_DESIGN.impression, skin_tone: T.FACE_DESIGN.skin_tone, eye_size: T.FACE_DESIGN.eye_size, eye_tilt: T.FACE_DESIGN.eye_tilt, mark: T.FACE_DESIGN.mark, age: T.FACE_DESIGN.age,
    expr: T.EXPRESSION_DETAIL, pose: Object.fromEntries(T.WORLD_POSES.map(x => [x.key, 1])), time: Object.fromEntries(T.WORLD_TIMES.map(x => [x.key, 1])),
    ctime: Object.fromEntries(T.CASUAL.times.map(x => [x.key, 1])), chair: Object.fromEntries(T.CASUAL.hairs.map(x => [x.key, 1])) };
  for (const [axis, keys] of Object.entries(need)) {
    assert(same(Object.keys(ST.ko[axis] || {}).sort(), Object.keys(keys).sort()), '한글 표 ' + axis + ' 열쇠');
    for (const [k, v] of Object.entries(ST.ko[axis])) assert(/[가-힣]/.test(v) && !/[A-Za-z]/.test(v.replace(/\([^)]*\)/g, '')), '한글 표 ' + axis + '.' + k + ' — 괄호 밖은 한글');
  }
  console.log('PASS 구조판: 세계 그림 ' + ns + ' · 일상컷 ' + nc2 + ' · 칸 차례 · 손글 칸 · 설계 외형 · 체형 여덟 칸 · 받침 · 고른 것이 이김 · 노출 · 기록 · 일상컷 c2 · 머리 · 검사기 칸 이름');
}

/* 삼국지 공방에서 옮긴 화풍(2026-11-07 「원소공방에도 … 화풍들추가」) — kv 판은 머리말 · STYLE · CHARACTER · COSTUME — 장르 · POSE AND SETTING(+ 끝 줄),
   영어 틀 판(kr_mmorpg · glossy_kr_game)은 STYLE 줄만 다르다. 모든 카드 × 사는 세계, 빈 칸 · 삼국지 말 없음 */
{
  const KV = ['kv_kmmo_lock', 'kv_kmmo_23d', 'kv_jp_mobile', 'kv_jp_paint', 'kv_anime_gloss'], TXT = ['kr_mmorpg', 'glossy_kr_game'];
  let nk = 0;
  for (const st of KV.concat(TXT)) assert(LONG.styles[st], '옮긴 화풍 ' + st);
  for (const key of P.cards(D)) for (const w of P.worldsOf(D, key)) {
    for (const st of KV) {
      const v = LONG.styles[st].versions.find(x => x.v === LONG.styles[st].current), p = P.build(D, LONG, key, w, { style: st });
      assert(p.includes(v.section1) && p.includes('\nCHARACTER:\n') && p.includes('COSTUME AND EQUIPMENT — ' + v.genre[w] + ':') && p.includes('\nPOSE AND SETTING:\n'), key + ' ' + w + ' ' + st + ' 칸');
      assert(!/\{\w+\}|undefined|Three Kingdoms|wuxia/i.test(p), key + ' ' + w + ' ' + st + ' 빈 칸 · 삼국지 말');
      assert(p.includes(P.build(D, LONG, key, w, { style: 'game_keyart' }).split('\n').find(l => l.startsWith('CONCEPT:'))), key + ' ' + w + ' ' + st + ' 설계표 CONCEPT 그대로');
      nk++;
    }
    for (const st of TXT) { const p = P.build(D, LONG, key, w, { style: st }); assert(p.includes('STYLE: ' + LONG.styles[st].versions[0].text), key + ' ' + st); }
  }
  /* ══ 짧은 판(2026-11-09 삼국지 공방에서 — 사용자 「element 쪽도 생성기 구조 sam 쪽에 맞추자. 간결버전에 일상컷도 간결」) ══
   기본 mmorpg_cg · worldShort — 세계 그림은 머리말(1024×1536 · CONCEPT) · 화풍 단락 · 얼굴 · 얼굴 비율 · 원소 · 세계와 차림 · 노출 · 구도 · 빛 · 끝 줄, 400~800낱말. 구조판은 그대로 */
{
  assert.equal(SN.default, 'jp_paint_anime'); assert(P.worldShortOn(SN, SN.default) && P.casualShortOn(SN, SN.default) && !P.worldShortOn(SN, 'mmorpg2d'), '짧은 판 켜짐 · 구조판은 끔');
  /* 기본은 칸 꼴(2026-11-11 3단계 — tests/prompt-sections.cjs). 짧은 판은 worldSections 를 끈 판에서 그대로 본다 */
  assert(P.worldSectionsOn(SN, SN.default), '기본은 칸 꼴'); const SNs = Object.assign({}, SN, { worldSections: false }); assert(!P.worldSectionsOn(SNs, SNs.default) && P.worldShortOn(SNs, SNs.default), '칸 꼴을 끄면 짧은 판');
  let nw = 0;
  for (const key of ['fe', 'fe-steel', 'fe-steel-sword', 'og']) for (const w of P.worldsOf(D, key)) {
    const t = P.build(D, SNs, key, w, {}), wc = t.split(/\s+/).length;
    assert(t.startsWith('A full-body vertical 2:3 (1024×1536) character card image of an adult woman — ') && t.includes('\n\nStyle: ' + P.shortStyle(SN, SN.default)) && t.includes(T.WORLD_SHORT.face) && t.includes(T.WORLD_SHORT.composition) && /\n\nHer element: /.test(t) && /\n\nWorld and costume: /.test(t), key + ' ' + w + ' 짧은 세계 그림');
    assert(!/^(?:CONCEPT|FACE —|WORLD —|OUTPUT|ANATOMY|BODY):/m.test(t) && !/\.\./.test(t), key + ' ' + w + ' 긴 꼴 머리말 없음');
    assert(wc > 350 && wc < 850, key + ' ' + w + ' 낱말 ' + wc);
    nw++;
  }
  console.log('PASS 짧은 세계 그림: ' + nw + '장');
}
/* 실루엣(2026-11-09 「삼국지처럼 세계컷 의상도 다양화 시켜서, 원소 특징에 맞게 분배」) — 근본 · 가문주는 세계마다 설계값(sil), 주민은 없음. 고르면 그 값, free 면 없음 */
{
  let ns = 0;
  for (const key of P.cards(D)) for (const w of P.worldsOf(D, key)) {
    const c = P.card(D, key), t = P.build(D, LONG, key, w, { style: 'kr_mmorpg' }), mf = P.silOf(c, w, {});
    if (c.tier === 'citizen') { assert(!mf && !/(?:OUTFIT|MECHA) SILHOUETTE: /.test(t), key + ' 주민은 설계 실루엣 없음'); continue; }
    assert(mf && t.includes(T.SILHOUETTE_HEAD[w] + mf.en), key + ' ' + w + ' 실루엣 줄');
    const sh = P.build(D, SN, key, w, {}); assert(sh.includes('\nSilhouette: ' + mf.en.replace('where EXPOSURE allows', 'where the exposure below allows')), key + ' ' + w + ' 칸 꼴 실루엣(3칸)');
    ns++;
  }
  const alt = T.SILHOUETTES.steampunk.find(x => x.key === 'aeronaut');
  assert(P.build(D, LONG, 'fe', 'steampunk', { style: 'kr_mmorpg', shot: { frame: 'aeronaut' } }).includes(alt.en), '고른 실루엣');
  assert(!/OUTFIT SILHOUETTE: /.test(P.build(D, LONG, 'fe', 'steampunk', { style: 'kr_mmorpg', shot: { frame: 'free' } })), 'free 면 없음');
  assert(P.build(D, LONG, 'fe-steel-sword', 'fantasy', { style: 'kr_mmorpg', shot: { frame: 'winged' } }).includes(T.SILHOUETTES.fantasy.find(x => x.key === 'winged').en), '주민도 고르면 쓴다');
  console.log('PASS 실루엣: 근본 · 가문주 ' + ns + '장');
}
/* 임의 설계 주문(2026-11-09 — 세계 그림 네 장 중 둘) — 정해 둔 것만, 설계표 얼굴 · 실루엣은 없다, 우리 실루엣 목록 가운데 그 카드 원소 성격 묶음만 싣는다 · 메카는 장갑판 줄 */
{
  for (const key of ['fe', 'fe-steel', 'fe-steel-sword', 'og']) for (const w of P.worldsOf(D, key)) {
    const t = P.buildWorldFree(D, SN, key, w, { style: SN.default }), our = P.build(D, SN, key, w, {}), her = (our.match(/^(?:Her|Face — her own): (.*)$/m) || [])[1] || '';   /* 칸 꼴은 「Face — her own: 」 */
    assert(t.startsWith('Design brief') && t.includes('1024×1536') && t.includes(T.WORLD_FREE.free) && t.includes(T.WORLD_FREE.second) && (P.card(D, key).tier === 'citizen' ? t.includes(T.WORLD_FREE.citizenCostume) : (P.silPool(P.card(D, key), w).length < T.SILHOUETTES[w].length && T.SILHOUETTES[w].every(x => t.includes(x.en.split(' — ')[0].replace(/\.$/, '')) === P.silPool(P.card(D, key), w).includes(x)))) && (w === 'mecha') === t.includes(T.WORLD_FREE.mecha) && /\n\nHair colour \(fixed — ours\): [a-z]/.test(t) && !/hair colour, hairstyle/.test(t) && /\n\nCostume colours \(ours\): /.test(t) && t.includes('Exposure (fixed): bold'), key + ' ' + w + ' 설계 주문');
    assert(her && !t.includes(her.slice(0, 40)) && !/Outfit silhouette:|^Silhouette: /m.test(t), key + ' ' + w + ' 설계표 얼굴 · 실루엣 없음');
  }
  console.log('PASS 임의 설계 주문');
}
console.log('PASS 옮긴 화풍: kv ' + nk + '장 · 영어 틀 ' + TXT.length + '판');
}
