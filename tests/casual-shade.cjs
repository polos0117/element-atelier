/* 일상컷 옷 색 shade(2026-11-16 — 사용자 「수영복 중에 색이 분홍색으로 지정되어 있는게 있어?」 → 「응 너무 많아」 → 「응 그렇게 진행해줘」).
   색 묶음(CASUAL.colors)마다 구체 색 여럿 · 계획기가 묶음 안 하나(덜 쓴 것 먼저 · 머리색 갈래 피함 · 묶음 안 겹침 없음) · 지시문은 「such as」 예시 대신 그 shade 글 ·
   shade 없는 옛 장면은 조립부가 카드 | 세계 | 번호로 늘 같은 하나 · 색 고정 옷 · 코스프레엔 없음 · 기록 · 계획 파일에서 쓴 수 읽기 · 옛 기록 · 옛 계획 통과. node tests/casual-shade.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm');
const C = require('../tools/casual-plan.cjs'), PK = require('../tools/prompt-pack.cjs');
const R = path.join(__dirname, '..');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, T = ctx.window.AtelierSpec, CL = T.CASUAL;
const J = f => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const D = J('data/element-design.json'), S = J('data/style.json'), tree = J('data/casual-tree.json'), tree2 = J('data/casual-tree-v2.json');
const SEVEN = [1, 2, 3, 4, 5, 6, 7];

/* 1. 표 — 여덟 묶음, shade 마다 key · ko · en(그 색 하나, such as 없음) · hue(열둘 중 하나), 열쇠는 묶음 안에서 하나 */
assert.deepEqual([...CL.colors.map(g => g.key)], ['pastel', 'vivid', 'earth', 'mono', 'jewel', 'denim', 'pattern', 'neutral']);
for (const g of CL.colors) {
  assert(g.shades.length >= 4, g.key + ' shade 넷 넘게');
  assert.equal(new Set(g.shades.map(s => s.key)).size, g.shades.length, g.key + ' 열쇠 겹침 없음');
  for (const s of g.shades) assert(s.key && s.ko && s.en && !/such as|\bor\b/.test(s.en) && CL.hues.includes(s.hue), g.key + ' ' + JSON.stringify(s));
}
assert.deepEqual([...CL.hairHue.map(r => r[0])], [...CL.hues], '머리색 정규식 차례 = hue 열쇠');

/* 2. 머리색 hue — 설계 머리색 영어 글에서 위부터 처음 걸린 것 */
const he = P.card(D, 'he');
assert.equal(P.hairHue(he, 'fantasy'), 'pink', '헬륨 — pale peach-pink');
assert.equal(P.hairHue(P.card(D, 'fe'), 'fantasy'), 'grey', '철 — iron-grey');
assert.equal(P.hairHue(P.card(D, 'hg'), 'fantasy'), '', '못 읽으면 빈 칸(quicksilver)');

/* 3. 계획기 — 분홍 머리 캐릭터: shade 는 그 묶음 안 · 묶음 안 겹침 없음 · 분홍 갈래 없음 · 같은 hue 도 되도록 · 기록에 scene.shade · 지시문은 shade 글 */
{ const card = C.cardOf('he'); let pinkSeen = 0, sh = 0;
  for (const w of card.worlds) for (const seed of [1, 2, 3]) {
    card.world = w;
    const res = C.plan(card, SEVEN, [], { seed });
    assert.deepEqual(C.check(res.cuts, card, []), [], 'he ' + w + ' 묶음 규칙');
    const col = res.cuts.filter(c => c.color);
    assert(col.every(c => c.shade && P.shadesOf(c.color).some(s => s.key === c.shade)), 'he ' + w + ' shade 는 그 묶음 안');
    assert.equal(new Set(col.map(c => c.shade)).size, col.length, 'he ' + w + ' shade 겹침 없음');
    const hues = col.map(c => P.shadesOf(c.color).find(s => s.key === c.shade).hue);
    pinkSeen += hues.filter(h => h === 'pink').length; sh += col.length;
    for (const c of res.cuts) {
      if (C.isCosplay(c) || P.colorFixed(C.outfitEn(c)) || c.sfree) assert(!c.shade, 'he 코스프레 · 색 고정 옷 · 자유 칸엔 shade 없음');
      if (!c.shade) continue;
      const rec = C.record(card, w, c), ol = (rec.prompt.match(/^Outfit: .*$/m) || [''])[0], row = P.shadesOf(c.color).find(s => s.key === c.shade);
      assert(rec.scene.shade === c.shade && ol.includes(' — in ' + row.en + '; the outfit colour reads clearly at first glance') && !/such as/.test(rec.prompt), 'he 기록 · 지시문 shade ' + ol);
    }
  }
  assert(sh > 10 && pinkSeen === 0, `분홍 머리 — 분홍 shade 없음(${pinkSeen}/${sh})`); }

/* 4. shadeize — 덜 쓴 shade 먼저(분포). 빈 기록이면 고르게, 앞서 많이 쓴 shade 는 덜 */
{ const card = C.cardOf('fe'); card.world = 'fantasy';   /* 철 — grey 머리(파스텔엔 grey 가 없다) */
  let x = 11; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  const run = counts => { const cnt = {}; for (let i = 0; i < 1000; i++) { const c = { n: 1, color: 'pastel' }; C.shadeize([c], card, [], counts, rnd); cnt[c.shade] = (cnt[c.shade] || 0) + 1; } return cnt; };
  const even = run({}), keys = P.shadesOf('pastel').map(s => s.key);
  assert.deepEqual(Object.keys(even).sort(), [...keys].sort(), '빈 기록 — 여섯 다 ' + JSON.stringify(even));
  assert(keys.every(k => even[k] > 1000 / keys.length * 0.7 && even[k] < 1000 / keys.length * 1.3), '빈 기록 — 고르게 ' + JSON.stringify(even));
  const lean = run({ powder_pink: 5, baby_blue: 2, mint: 1 });
  assert(!lean.powder_pink && !lean.baby_blue && !lean.mint && lean.lavender > 250 && lean.butter > 250 && lean.peach > 250, '많이 쓴 shade 는 덜 ' + JSON.stringify(lean));
  /* 같은 batch 안에서 쓴 수를 더해 가면 shade 가 돌아간다 */
  const counts = {}, got = []; for (let i = 0; i < 12; i++) { const c = { n: 1, color: 'pastel' }; C.shadeize([c], card, [], counts, rnd); counts[c.shade] = (counts[c.shade] || 0) + 1; got.push(c.shade); }
  assert(keys.every(k => counts[k] === 2), '열두 번 — 여섯이 두 번씩 ' + got.join(','));
  /* 분홍 머리 — 1000 번에 분홍 갈래 없음 · 다 피하면 피하지 않는다(데님은 다 blue — 파란 머리여도 고른다) */
  const hc = C.cardOf('he'); hc.world = 'fantasy'; const pk = {}; for (let i = 0; i < 1000; i++) { const c = { n: 1, color: 'vivid' }; C.shadeize([c], hc, [], {}, rnd); pk[c.shade] = (pk[c.shade] || 0) + 1; }
  assert(!pk.fuchsia && Object.keys(pk).length === 5, '분홍 머리 — 비비드에서 푸크시아 없음 ' + JSON.stringify(pk));
  const blue = P.cards(D).map(k => C.cardOf(k)).flatMap(cd => cd.worlds.map(w => ({ cd, w }))).find(({ cd, w }) => P.hairHue(cd.c, w) === 'blue');
  blue.cd.world = blue.w; const dc = { n: 1, color: 'denim' }; C.shadeize([dc], blue.cd, [], {}, rnd); assert(dc.shade, '파란 머리 — 데님(다 blue)도 고른다');
  /* 한 묶음 안 — 같은 shade 금지 · 같은 hue 되도록(옛 컷 포함) */
  const two = [{ n: 1, color: 'denim' }, { n: 2, color: 'denim' }]; C.shadeize(two, card, [{ n: 9, color: 'denim', shade: 'indigo' }], {}, rnd);
  assert(two[0].shade !== two[1].shade && !two.some(c => c.shade === 'indigo'), '옛 컷 · 같은 묶음과 shade 겹침 없음 ' + two.map(c => c.shade));
  const hv = [{ n: 1, color: 'vivid' }, { n: 2, color: 'jewel' }]; for (let i = 0; i < 200; i++) { C.shadeize(hv, card, [], {}, rnd); const h = hv.map(c => P.shadesOf(c.color).find(s => s.key === c.shade).hue); assert(h[0] !== h[1], '같은 hue 되도록 피함 ' + h); }
  /* 색 묶음 없는 칸은 shade 없음 */
  const nc = { n: 1 }; C.shadeize([nc], card, [], {}, rnd); assert(!('shade' in nc)); }

/* 5. check — 그 묶음에 없는 shade · 겹침 · 코스프레 · 색 고정 옷 · 머리 갈래 */
{ const card = C.cardOf('he'); card.world = 'fantasy'; const cuts = C.plan(card, SEVEN, [], { seed: 4 }).cuts, c0 = cuts.find(c => c.shade), rest = cuts.filter(c => c !== c0);
  const errs = x => C.check([{ ...c0, ...x }], card, rest);
  assert.deepEqual(errs({}), [], 'shade 그대로 통과');
  assert(errs({ shade: 'nope' }).some(e => /묶음 .* 에 없다/.test(e)), '묶음에 없는 shade');
  const pink = P.shadesOf(c0.color).find(s => s.hue === 'pink'); if (pink) assert(errs({ shade: pink.key }).some(e => /머리색과 같은 갈래/.test(e)), '머리색 갈래');
  assert(C.check([c0, { ...c0, n: 9, place: 'x_other' }], card, rest).some(e => /옷 색 shade .* 2 번/.test(e)), 'shade 겹침');
  const cc = cuts.find(C.isCosplay); assert(C.check([{ ...cc, shade: 'cobalt' }], card, cuts.filter(c => c !== cc)).some(e => /옷 색 · 데니어 · 상황/.test(e)), '코스프레의 shade');
  /* 옛 기록 · 옛 계획(shade 없이 color 만) 통과 */
  assert.deepEqual(C.check(cuts.map(c => { const x = { ...c }; delete x.shade; return x; }), card, []), [], '옛 묶음(shade 없음) 통과'); }

/* 6. 조립부 — shade 없는 옛 장면은 결정적(카드 | 세계 | 번호) · 머리 hue 피함 · 직접 고른 shade · 묶음에 없는 shade 는 결정적 · 색 묶음 없는 장면은 그대로 */
{ const opts = (w, n) => ({ world: w, style: S['default'], tree, tree2, n });
  const scene = C.plan((() => { const cd = C.cardOf('he'); cd.world = 'fantasy'; return cd; })(), SEVEN, [], { seed: 5 }).cuts.find(c => c.shade);
  const old = { ...scene, color: 'pastel' }; delete old.n; delete old.shade;
  const ol = t => (t.match(/^Outfit: .*$/m) || [''])[0];
  const a = P.buildCasual(D, S, 'he', old, opts('fantasy', 3)), b = P.buildCasual(D, S, 'he', old, opts('fantasy', 3));
  assert.equal(a, b, '같은 입력 같은 색');
  const auto = P.autoShade('pastel', 'he', 'fantasy', 3, 'pink');
  assert(auto && auto.hue !== 'pink' && ol(a).includes(' — in ' + auto.en + '; ') && !/such as/.test(a), '옛 장면 — 결정적 shade(머리 hue 피함) ' + ol(a));
  const seen = new Set(); for (let n = 1; n <= 40; n++) { const s = P.shadeFor(he, 'fantasy', old, n); assert(s.hue !== 'pink'); seen.add(s.key); }
  assert(seen.size >= 4, '번호마다 다른 색 ' + [...seen]);
  assert(ol(P.buildCasual(D, S, 'he', { ...old, shade: 'butter' }, opts('fantasy', 3))).includes(' — in soft pastel butter yellow; '), '직접 고른 shade');
  assert(ol(P.buildCasual(D, S, 'he', { ...old, shade: 'cobalt' }, opts('fantasy', 3))).includes(' — in ' + auto.en + '; '), '그 묶음에 없는 shade 는 결정적으로');
  const rec = P.casualRecord(D, S, 'he', old, opts('fantasy'), 3); assert(rec.prompt === a && !rec.scene.shade, '기록(번호 3) — 같은 글, 장면엔 정한 shade 를 적지 않는다(옛 계획 그대로)');
  const nocol = { ...old }; delete nocol.color; assert(!/reads clearly at first glance/.test(ol(P.buildCasual(D, S, 'he', nocol, opts('fantasy', 3)))), '색 묶음 없는 장면은 그대로(색 줄 없음)');
  /* 긴 꼴 · 구조판도 같은 shade 글 */
  for (const st of Object.keys(S.styles).filter(k => !S.styles[k].retired)) {
    const t = P.buildCasual(D, S, 'he', { ...old, shade: 'mint' }, { ...opts('fantasy', 3), style: st });
    if (!t || P.colorFixed(C.outfitEn(old))) continue;
    assert(t.includes('soft pastel mint green') && !t.includes('such as powder pink'), st + ' — shade 글');
  } }

/* 7. 쓴 수 읽기 — 그린 기록 scene.shade + 안 그린 계획 파일(그린 번호 · 지난 판 · 지금 다시 짜는 카드 세계는 빼고, replan 이 이긴다) */
{ const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shade-use-'));
  try {
    const put = (f, x) => { fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true }); fs.writeFileSync(path.join(tmp, f), JSON.stringify(x)); };
    put('img/records/x/fantasy-casual1.s-ui.json', { scene: { color: 'pastel', shade: 'mint' } });
    put('img/records/x/fantasy-casual2.s-ui.json', { scene: { color: 'pastel' } });   /* 옛 기록 — shade 없음 */
    put('img/records/x/fantasy-casual-plan.json', { card: 'x', world: 'fantasy', cuts: [{ n: 1, color: 'pastel', shade: 'peach' }, { n: 4, color: 'vivid', shade: 'cobalt' }] });   /* 1번은 그렸다 */
    put('img/records/x/mecha-casual-plan.json', { card: 'x', world: 'mecha', cuts: [{ n: 2, color: 'earth', shade: 'camel' }] });
    put('img/records/x/mecha-casual2-replan.json', { card: 'x', world: 'mecha', cuts: [{ n: 2, color: 'earth', shade: 'rust' }] });
    put('img/records/x/mecha-casual-plan.initial.json', { card: 'x', world: 'mecha', cuts: [{ n: 3, color: 'mono', shade: 'jet' }] });
    put('img/records/y/steampunk-casual-plan.json', { card: 'y', world: 'steampunk', cuts: [{ n: 5, color: 'mono', shade: 'jet' }] });
    const roots = [path.join(tmp, 'img'), path.join(tmp, 'none')];
    assert.deepEqual(C.shadeUsage(roots), { mint: 1, cobalt: 1, rust: 1, jet: 1 }, '기록 + 예약 ' + JSON.stringify(C.shadeUsage(roots)));
    assert.deepEqual(C.shadeUsage(roots, { plans: false }), { mint: 1 }, '기록만');
    assert.deepEqual(C.shadeUsage(roots, { skip: ['y|steampunk'] }), { mint: 1, cobalt: 1, rust: 1 }, '지금 다시 짜는 카드 · 세계는 안 센다');
    /* CLI — --shade-usage 로 읽고 plan.json 에 shade 가 적힌다 */
    const out = path.join(tmp, 'out'), o = require('node:child_process').spawnSync(process.execPath, [path.join(R, 'tools/casual-plan.cjs'), 'he', '--world', 'fantasy', '--slots', '1,2,3,4,5,6,7', '--records', path.join(tmp, 'none'), '--usage', 'none', '--cosplay-usage', 'none', '--shade-usage', roots[0], '--seed', '3', '--out', out], { encoding: 'utf8' });
    assert.equal(o.status, 0, o.stderr);
    const plan = JSON.parse(fs.readFileSync(path.join(out, 'plan.json'), 'utf8')), cs = plan.cuts.filter(c => c.color);
    assert(cs.length && cs.every(c => c.shade) && !cs.some(c => ['mint', 'cobalt', 'rust', 'jet'].includes(c.shade)) && plan.shadeRead === roots[0], '계획에 shade · 쓴 shade 는 뒤로 ' + cs.map(c => c.shade));
    const rec = JSON.parse(fs.readFileSync(path.join(out, `fantasy-casual${cs[0].n}.${C.STYLE}-ui.json`), 'utf8')); assert.equal(rec.scene.shade, cs[0].shade, '기록에 scene.shade');
    /* 지시문 묶음 — 계획 shade 그대로 · settings 로 묶음을 바꾸면 shade 를 버리고 조립부가 정한다 */
    fs.renameSync(path.join(out, 'plan.json'), path.join(tmp, 'plan-fantasy.json'));
    const card = PK.cardOf('he'), set = PK.initSettings(card, [path.join(tmp, 'plan-fantasy.json')]), pl = [{ ...plan, path: path.join(tmp, 'plan-fantasy.json') }];
    const s0 = PK.slots(card, pl).find(s => s.cut && s.cut.n === cs[0].n), r0 = PK.recordOf(card, set, s0);
    assert(r0.scene.shade === cs[0].shade && r0.storage.scenes.he.shade === cs[0].shade, '묶음 — 계획 shade');
    const other = CL.colors.map(g => g.key).find(k => k !== cs[0].color); set.casual[s0.slot].color = other;
    const r1 = PK.recordOf(card, set, s0), want = P.shadeFor(he, 'fantasy', { color: other }, cs[0].n);
    assert(!r1.scene.shade && r1.scene.color === other && (r1.prompt.match(/^Outfit: .*$/m) || [''])[0].includes(' — in ' + want.en + '; '), '묶음 — 갈래를 바꾸면 조립부가 정한 shade');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); } }

console.log('PASS 옷 색 shade: 표 여덟 묶음 · 머리 hue 읽기 · 계획(묶음 안 · 겹침 없음 · 분홍 머리에 분홍 없음 · 기록 · 지시문) · 덜 쓴 shade 먼저(1000 번) · 같은 hue 되도록 · check · 옛 장면 결정적 · 긴 꼴 · 구조판 · 쓴 수 읽기 · CLI · 지시문 묶음');
