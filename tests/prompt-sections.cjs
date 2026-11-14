/* 칸 꼴 세계 그림 — 기본 화풍이 core 칸 틀(AtelierSpec.CORE_FRAME, 화풍공방 core v4~)로 짓는다(사용자 2026-11-11 「다른거 먼저 3단계 진행해줘」 → 「응 네 안대로 하고 기존 화풍 열쇠로 해줘」).
   글은 짧은 판 그대로 칸에 나눠 싣고, 걸림 다섯은 사용자가 고른 안대로: ① 빛 한 줄 ② 얼굴 비율 줄 「described below」 ③ 노출 줄 「keep the costume above」
   ④ 「No …」 금지는 5칸 Avoid ⑤ 5칸에서 손가락 말 빼기(해부 줄과 겹침). 옛 줄 이름(WORLD · SILHOUETTE · CONCEPT · TIME & WEATHER · EXPOSURE …)이 남지 않는다.
   Run: node tests/prompt-sections.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const T = ctx.window.AtelierSpec, P = ctx.window.AtelierPrompt, CF = T.CORE_FRAME;
const D = JSON.parse(fs.readFileSync('data/element-design.json', 'utf8')), S = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
assert(CF && CF.s1 && CF.anatomy && CF.avoid, 'core 칸 틀(CORE_FRAME) — core v4 블록');
assert(P.worldSectionsOn(S, S['default']), '기본 화풍은 칸 꼴');
const style = P.shortStyle(S, S['default']), styleNo = P.splitNo(style);
assert(styleNo.avoid.length && !/(^|\. )No /.test(styleNo.text), '화풍 글의 「No …」 는 Avoid 로');
let n = 0, maxW = 0;
for (const key of P.cards(D)) for (const w of P.worldsOf(D, key)) {
  const t = P.build(D, S, key, w, {}), B = t.split('\n\n'), id = key + ' ' + w, lines = t.split('\n');
  assert.equal(B.length, 6, id + ' 머리말 + 다섯 칸');
  assert(B[0].startsWith('A full-body vertical 2:3 (1024×1536) character card image of an adult woman — ') && !/ Age: /.test(B[0]), id + ' 머리말(나이는 2칸)');
  assert.deepEqual(B.slice(1).map(b => b.split('\n')[0]), [CF.s1, CF.s2, CF.s3.replace('{costume}', 'COSTUME').replace('{genre}', T.WORLDS.find(x => x.key === w).en), CF.s4, CF.s5], id + ' 칸 머리 차례');
  assert(B[1].includes(styleNo.text) && B[1].includes('described below') && !B[1].includes('described above'), id + ' 1칸 — 화풍 · 얼굴 비율(②)');
  assert(/^Age: /m.test(B[2]) && /^Body and hair: /m.test(B[2]) && /^Her element, carried in her design: /m.test(B[2]) && B[2].endsWith(CF.anatomy), id + ' 2칸 — 나이 · 몸과 머리 · 원소 · 해부');
  assert(/^Costume: /m.test(B[3]) && /^Colours: /m.test(B[3]) && /^Exposure \(/m.test(B[3]) && !B[3].includes('WORLD describes'), id + ' 3칸 — 의상 · 색 · 노출(③)');
  assert(/^World: /m.test(B[4]) && /^Pose: /m.test(B[4]) && /^Composition: /m.test(B[4]), id + ' 4칸 — 세계 · 자세 · 구도');
  assert.equal(lines.filter(l => /^Light: /.test(l)).length, 1, id + ' 빛 줄 하나(①)');
  assert(/^One figure only; no text/m.test(B[5]) && !/five fingers/.test(B[5]) && /^Avoid: /m.test(B[5]), id + ' 5칸 — 손가락 말 없음 · Avoid(④⑤)');
  assert(!lines.some(l => !/^Avoid: /.test(l) && /(?:^|[.;:] )No [a-z]/.test(l) && !/unless/.test(l)), id + ' 「No …」 금지 문장은 Avoid 로(조건 unless 마디만 남김)');
  assert(!/\b(?:CONCEPT|WORLD|SILHOUETTE|TIME & WEATHER|TRAITS|EXPOSURE|IDENTITY)\b/.test(t) && !/\.\./.test(t) && !/: \./.test(t), id + ' 옛 줄 이름 · 찌꺼기 없음');
  const wc = t.split(/\s+/).length; maxW = Math.max(maxW, wc); assert(wc > 450 && wc < 1000, id + ' 낱말 ' + wc);   /* 900 → 1000(2026-11-14 근본 스물넷 더(2) — 갈륨 스팀펑크 902, 글은 줄이지 않고 상한을 올린다) */
  n++;
}
/* 스팀펑크 HAIR 조각은 2칸 Hair 줄로, 고른 시간대가 있으면 빛 줄이 그것을 가리킨다 */
const sp = P.build(D, S, 'fe-rust', 'steampunk', {});
assert(/^Hair: her hair is worn exactly as described above/m.test(sp) && /^Costume: late-Victorian/m.test(sp) && /^Avoid: [^\n]*armor plates/m.test(sp), 'fe-rust 스팀펑크 — Hair 줄 · 의상 글 소문자 · 금지는 Avoid');
const times = T.WORLD_TIMES || [];
if (times.length) {
  const tt = P.build(D, S, 'fe-rust', 'steampunk', { shot: { time: times[0].key } });
  assert(tt.includes(times[0].en.replace(/^TIME & WEATHER:/, 'Time & weather:')) && /unless the time and weather above say otherwise/.test(tt), '시간대를 고르면 빛 줄이 그것을 따른다');
  /* 시간대 · 덧붙임을 고른 판 — 4칸 줄 이름도 칸 꼴(2026-11-12, 위 루프는 장면을 안 고른 판만 봐서 놓쳤다). 칸 꼴을 끈 옛 꼴은 옛 이름 그대로 */
  const ts = P.build(D, S, 'fe-rust', 'steampunk', { shot: { time: times[0].key }, notes: { scene: 'a windy ridge' } }), T4 = ts.split('\n\n')[4];
  assert(/^Time & weather: /m.test(T4) && /^Scene note: a windy ridge$/m.test(T4) && !/TIME & WEATHER|SCENE NOTE/.test(ts), '시간대 · 덧붙임 — 4칸에 칸 꼴 이름');
  const SO = Object.assign({}, S, { worldSections: false }), to = P.build(D, SO, 'fe-rust', 'steampunk', { shot: { time: times[0].key }, notes: { scene: 'a windy ridge' } });
  assert(!P.worldSectionsOn(SO, SO['default']) && to.includes(times[0].en) && to.includes('SCENE NOTE: a windy ridge'), '칸 꼴을 끈 옛 꼴 — 옛 이름 그대로');
}
/* 메카 의상 줄 — 틀 꼬리(「…carry the motif.」) 뒤 설계 글이 새 문장으로 대문자 시작(2026-11-12 「…motif. heavy dark-iron…」 고침) */
for (const key of P.cards(D)) if (P.worldsOf(D, key).includes('mecha')) {
  const mc = P.build(D, S, key, 'mecha', {}).split('\n').filter(l => /^Costume: /.test(l))[0] || '';
  assert(/carry the motif\. [A-Z]/.test(mc) && !/[a-z]\. [a-z]/.test(mc), key + ' 메카 의상 줄 문장 이음');
}
assert(/carry the motif\. Heavy dark-iron plating/.test(P.build(D, S, 'fe', 'mecha', {})), 'fe 메카 — 「motif. Heavy dark-iron」');
console.log('PASS 칸 꼴 세계 그림: ' + n + '장 · 칸 머리 = core 칸 틀 · 걸림 다섯 · 옛 줄 이름 없음 · 가장 긴 것 ' + maxW + '낱말');
