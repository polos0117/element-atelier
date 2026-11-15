/* 일상컷 묶음 계획기(tools/casual-plan.cjs — 2026-11-09 삼국지 공방 계획기를 원소 꼴로) — 대표 카드 넷 × 사는 세계 × 씨앗 하나가 묶음 규칙을 지키고, 기록이 생성기 꼴이다.
   일곱 장(2026-11-11) · 정해 둔 세 갈래(노출 한 장 · 나라 안 한 장 · 게임 코스프레 한 장(2026-11-15 — 전엔 상황 노출), 서로 다른 컷) · 네 시대 · 옷 색 · 데니어 · 상황 줄(이제 필수 아님) · 짧은 일상컷 ·
   게임 코스프레 고르기(1회차 pick · 2회차 again · 주인공 하나 재단 겹침 없음 · 다 찬 게임 빠짐 · 세 공방 기록 읽기 · --check 의 generation.cosplay) · 옛 묶음(상황 노출 필수 시절) 통과 ·
   자유 설계 칸 둘(옷 자유 · 갈래 자유 — FREE DESIGN 덩어리, 갈래 자유는 노출 갈래 컷과 다른 갈래 · 상황 노출 컷과 다른 상황) · 옛 여섯 장 묶음은 그대로 통과하고 일곱째만 짜진다.
   이미 있는 컷(기록) 위에 모자란 번호만 짜는 것도. node tests/casual-plan.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm');
const C = require('../tools/casual-plan.cjs');
const R = path.join(__dirname, '..');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, TS = ctx.window.AtelierSpec;
const D = JSON.parse(fs.readFileSync(path.join(R, 'data/element-design.json'), 'utf8'));
const SJ = JSON.parse(fs.readFileSync(path.join(R, 'data/style.json'), 'utf8')), SHORT = P.casualShortOn(SJ, C.STYLE);
/* 대표 카드 넷 × 씨앗 하나(2026-11-12 검사 정리 — 전엔 카드 열 × 씨앗 둘, 52 묶음 40초). 상황 넷(strap · wet · undone · wind) · adventure · drape 계열 · 데니어 비율이 이 넷에서 다 나온다 */
const keys = P.cards(D), pickKeys = ['fe-magnet', 'h-oil', 'c-graphite', 'c-oil-oillamp'];
for (const k of pickKeys) assert(keys.includes(k), '대표 카드 ' + k);
const SIX = [1, 2, 3, 4, 5, 6], SEVEN = [1, 2, 3, 4, 5, 6, 7], FD = TS.FREE_DESIGN;
let n = 0; const dn = { fit: 0, set: 0 }, situSeen = new Set(), famSeen = new Set(), cosSeen = new Set();
for (const key of pickKeys) {
  const card = C.cardOf(key);
  for (const w of card.worlds) for (const seed of [3]) {
    card.world = w;
    const res = C.plan(card, SEVEN, [], { seed, recent: ['a test place — standing'] });
    assert.equal(res.cuts.length, 7, key + ' ' + w + ' 일곱 장');
    assert.deepEqual(C.check(res.cuts, card, []), [], key + ' ' + w + ' 묶음 규칙');
    const ex = res.cuts.filter(c => C.EXPOSE_TYPES.includes(C.requiredType(c))), inw = res.cuts.filter(c => C.requiredType(c) === 'nation');
    assert(ex.length && inw.length, key + ' ' + w + ' 정해 둔 갈래 — 노출 한 장 · 나라 안 한 장');
    /* 셋째 필수 — 게임 코스프레 한 장(2026-11-15): 지금 현실 · 무대·환상, 표의 코스프레 장소, 얼굴 클로즈업 아님, 재단 = 옷, 물가면 수영복 재단, 옷 색 · 데니어 · 상황 없음 */
    const cos = res.cuts.filter(C.isCosplay);
    assert.equal(cos.length, 1, key + ' ' + w + ' 게임 코스프레 한 장');
    { const c = cos[0], g = C.COSPLAY.games.find(x => x.key === c.cosplay.game);
      assert(g && ['now', 'fantasy'].includes(c.era) && C.cosPlace(c.place) && c.frame !== 'face_close' && c.cosplay.cut === C.cutOfItem(c.item) && !c.color && !c.denier && !c.situ && !c.hair, key + ' ' + w + ' 코스프레 컷 ' + JSON.stringify(c.cosplay) + ' ' + c.place);
      assert(g.many ? (c.cosplay.character === '' && Array.isArray(c.cosplay.used)) : c.cosplay.character === g.character, key + ' ' + w + ' 코스프레 캐릭터');
      if (/^water_/.test(c.place)) assert(C.COS_SWIM.includes(c.cosplay.cut), key + ' 물가엔 수영복 재단'); cosSeen.add(c.cosplay.game); }
    /* 상황 노출은 필수가 아니다 — 있으면 한 장, 정해 둔 칸 · 코스프레가 아닌 장면 컷에 */
    const si = res.cuts.filter(c => c.situ);
    assert(si.length <= 1, key + ' ' + w + ' 상황 노출 한 장까지');
    if (si.length) { assert(!C.requiredType(si[0]) && !C.isCosplay(si[0]) && si[0].frame !== 'face_close' && P.situFits(si[0].situ, C.outfitEn(si[0])), key + ' ' + w + ' 상황 컷'); situSeen.add(si[0].situ); }
    res.cuts.forEach(c => famSeen.add(c.ofam));
    { const fr = res.cuts.filter(c => c.ofree); assert.equal(fr.length, 1, key + ' ' + w + ' 옷 자유 한 장(2026-11-09)');
      assert(fr[0].sfree && !fr[0].gfree && !fr[0].situ && !fr[0].place && !fr[0].frame && !fr[0].color && !fr[0].denier, key + ' ' + w + ' 옷 자유 컷 — 장면 통째 자유(2026-11-11)'); }
    { const gf = res.cuts.filter(c => c.gfree); assert.equal(gf.length, 1, key + ' ' + w + ' 갈래 자유 한 장(2026-11-11)');
      const g = gf[0]; assert(g.sfree && !g.ofree && !g.situ && !g.place && !g.color && C.EXPOSE_TYPES.includes(g.gfree) && g.gsitu === 'free', key + ' ' + w + ' 갈래 자유 컷 — 상황은 열기(2026-11-11 「상황도 열어주자」)');
      assert(!ex.some(c => c.ofam === g.gfree), key + ' ' + w + ' 갈래 자유는 노출 갈래 컷과 다른 갈래');
      assert.deepEqual(res.cuts.filter(c => c.sfree).map(c => c.n), [6, 7], '자유 설계 칸은 맨 뒤 번호');
      assert(g.recent.includes('a test place — standing') && g.recent.length === 6, key + ' 최근 장면 + 같은 묶음 장면 다섯'); }
    assert.equal(new Set(res.cuts.filter(c => !c.sfree).map(c => c.era)).size, 4, key + ' ' + w + ' 네 시대 다');
    { const cs = res.cuts.map(c => c.color).filter(Boolean); assert.equal(new Set(cs).size, cs.length, key + ' ' + w + ' 옷 색 갈래가 겹치지 않는다'); }
    dn.fit += res.cuts.filter(c => P.denierFits(C.outfitEn(c))).length; dn.set += res.cuts.filter(c => c.denier).length;
    for (const c of res.cuts) {
      const rec = C.record(card, w, c);
      assert.equal(rec.file, `${key}_${w}_${C.STYLE}_f_casual${c.n}.webp`);
      assert.equal(rec.record, `records/${key}/${w}-casual${c.n}.${C.STYLE}-ui.json`);
      assert.equal(rec.ref, `${key}_${w}_${C.STYLE}_f.webp`, '참고 그림은 그 세계 그림');
      assert(rec.prompt.length > 500 && rec.treeV === 2 && rec.world === w);
      if (SHORT) assert(rec.prompt.includes(TS.CASUAL.short.face) && rec.prompt.includes('1024×1536') && /\n\nStyle: /.test(rec.prompt) && rec.prompt.includes(C.isCosplay(c) ? TS.CASUAL.cosplay.short : TS.CASUAL.short.headwear) && !/^(?:WARDROBE|ANGLE|OUTPUT|AGE|ANATOMY):/m.test(rec.prompt), '짧은 일상컷');
      const ol = (rec.prompt.match(/^Outfit: .*$/m) || [''])[0], CL = TS.CASUAL.colors.find(x => x.key === c.color);
      if (C.isCosplay(c)) {   /* 코스프레 Outfit 줄 — 목록 글(게임 이름), 원소 옷 줄 없음 */
        const g = C.COSPLAY.games.find(x => x.key === c.cosplay.game);
        assert(ol.includes(' from ' + g.en) && (g.many ? ol.startsWith('Outfit: … (') : ol.includes(g.character)) && !rec.prompt.includes("may show in the outfit's details") && !/-denier yarn|reads clearly at first glance|; right now — /.test(ol), key + ' 코스프레 Outfit 줄 ' + ol.slice(0, 120));
        continue;
      }
      if (c.sfree) {   /* 자유 설계 덩어리 — 장면 줄 없이, 얼굴 · 화풍 · 몸 줄은 그대로 */
        assert(rec.prompt.includes(FD.head + '\nRecent scenes to avoid: ' + c.recent.join('; ') + '.\n' + FD.lines.join('\n') + '\n'), key + ' 자유 설계 덩어리');
        assert(!/^(?:POSTURE|COMPOSITION|PROP|RIGHT HAND|LEFT HAND|BOTH HANDS|EXPRESSION|GAZE|Place: [^…]|Lens)/m.test(rec.prompt), key + ' 장면 줄 없음');
        assert(rec.scene.sfree && !rec.scene.place && !rec.scene.era, key + ' 기록 장면은 트리로 채우지 않는다');
        if (c.ofree) assert(ol.startsWith(FD.outfitFree + ', ') && !rec.prompt.includes('Outfit family (required)'), key + ' 옷 자유 Outfit 줄');
        else {
          assert(ol.startsWith(FD.outfit + ', '), key + ' 갈래 자유 Outfit 줄');
          const fam = JSON.parse(fs.readFileSync(path.join(R, 'data/casual-tree.json'), 'utf8')).outfits.find(o => o.key === c.gfree);
          assert(rec.prompt.includes('\nOutfit family (required): ' + TS.FREE_DESIGN.familyNames[c.gfree] + ' — any ' + TS.FREE_DESIGN.familyNames[c.gfree] + ' outfit; ') && rec.prompt.includes('\n' + FD.situFree + '\nOutfit: ') && rec.prompt.includes('prefer one that is not in it'), key + ' 갈래(큰 범위) · 열린 상황 줄(2026-11-11)');
        }
        assert(!/-denier yarn|reads clearly at first glance/.test(ol), key + ' 자유 칸엔 옷 색 · 데니어 없음');
        continue;
      }
      if (P.colorFixed(C.outfitEn(c))) assert(!c.color, key + ' 색이 박힌 옷엔 색 없음'); else assert(CL && ol.includes(CL.en), key + ' 옷 색 줄');
      if (c.denier) assert(ol.includes(TS.CASUAL.deniers.find(x => x.key === c.denier).top + '-denier yarn'), key + ' 데니어 줄'); else assert(!/-denier yarn/.test(ol));
      if (c.situ) { const SI = TS.CASUAL.situations.find(x => x.key === c.situ); assert(ol.includes('; right now — ' + SI.en) || (!!SI.enIn && ol.includes('; right now — ' + SI.enIn)), key + ' 상황 줄(실내면 물 튐 글 enIn — 2026-11-13)'); } else assert(!/; right now — /.test(ol));
    }
    n++;
  }
}
assert(situSeen.size >= 2, '상황 둘 넘게(2026-11-15 상황 노출이 필수에서 빠져 묶음의 반쯤에만) — ' + [...situSeen]);
assert(cosSeen.size >= 3, '코스프레 게임이 여럿 — ' + [...cosSeen]);
assert(['adventure', 'drape', 'resort', 'workwear'].filter(f => famSeen.has(f)).length >= 1, '새 계열 넷 가운데 하나 넘게(2026-11-13 — 계열이 늘고 장소 종류 조건이 생겨 표본 묶음에 넷이 다 들지는 않는다 · 2026-11-15 장면 컷 한 장이 코스프레로 정해져 둘 → 하나) — ' + [...famSeen]);
assert(dn.fit > 5 && dn.set / dn.fit > 0.3 && dn.set / dn.fit < 0.9, '데니어 비율 ' + dn.set + '/' + dn.fit);
/* 셋째 필수 — 코스프레가 없으면 잡는다 · 옛 묶음(상황 노출 필수 시절 — 코스프레 없이 상황 노출 컷)은 통과 · 옛 다섯 장 묶음은 셋째 없이 맞다 */
{ const cd = C.cardOf('fe'); cd.world = 'fantasy'; const cuts = C.plan(cd, SIX, [], { seed: 4 }).cuts, gen = cuts.find(c => !c.sfree && !C.requiredType(c) && !C.isCosplay(c) && c.frame !== 'face_close' && P.situFits('wet', C.outfitEn(c)));
  assert(cuts.some(C.isCosplay), '여섯 장 묶음에 코스프레');
  const noCos = cuts.filter(c => !C.isCosplay(c)).map(c => { const x = { ...c }; delete x.situ; return x; });
  assert(C.check([...noCos, { ...noCos[0], n: 9, place: noCos[0].place }].slice(0, 6), cd, []).some(e => /게임 코스프레 컷이 없다/.test(e)), '코스프레(옛 묶음은 상황 노출)가 없으면 잡는다');
  /* 옛 묶음 — 코스프레 자리에 상황 노출을 얹은 장면 컷(그때 꼴) */
  const oldSix = cuts.map(c => C.isCosplay(c) ? null : c === gen ? { ...c, situ: 'wet' } : (() => { const x = { ...c }; delete x.situ; return x; })()).filter(Boolean);
  assert(gen, '상황을 얹을 장면 컷');
  assert.deepEqual(C.check(oldSix, cd, []).filter(e => /코스프레|상황/.test(e)), [], '옛 묶음(상황 노출 필수 시절) 통과');
  const more = C.plan(cd, [7, 8], oldSix.map(c => ({ ...c, old: true })), { seed: 6 });
  assert(!more.cuts.some(C.isCosplay), '옛 묶음 위에 더 짜도 코스프레를 더하지 않는다');
  assert.deepEqual(C.check(cuts.filter(c => !C.isCosplay(c)).slice(0, 5).map(c => { const x = { ...c }; delete x.situ; return x; }), cd, []).filter(e => /상황|코스프레/.test(e)), [], '옛 다섯 장 묶음');
  /* 코스프레 컷 규칙 — 얼굴 클로즈업 · 옷 색 · 물가의 코르셋 · 표에 없는 장소 · 재단과 옷이 다름 */
  const cc = cuts.find(C.isCosplay), rest = cuts.filter(c => c !== cc);
  const errs = x => C.check([{ ...cc, ...x }], cd, rest);
  assert.deepEqual(errs({}), [], '코스프레 컷 그대로는 통과');
  assert(errs({ frame: 'face_close' }).some(e => /코스튬이 안 보인다/.test(e)), '얼굴 클로즈업을 잡는다');
  assert(errs({ color: 'vivid' }).some(e => /옷 색 · 데니어 · 상황/.test(e)), '옷 색을 잡는다');
  assert(errs({ place: 'water_pool', item: 'gc_corset', cosplay: { ...cc.cosplay, cut: 'corset' } }).some(e => /수영복 재단/.test(e)), '물가의 코르셋을 잡는다');
  assert(errs({ place: 'car_seat' }).some(e => /표에 그 계열이 없다/.test(e)), '표에 없는 장소를 잡는다');
  assert(errs({ cosplay: { ...cc.cosplay, cut: cc.cosplay.cut === 'knit' ? 'idol' : 'knit' } }).some(e => /재단/.test(e)), '재단과 옷이 다르면 잡는다');
  assert(C.check([cc, { ...cc, n: 9 }], cd, rest).some(e => /게임 코스프레 cosplay 가 2 번/.test(e)), '코스프레는 묶음에 한 장'); }
/* 게임 코스프레 고르기 — 세 공방 기록을 합쳐 센다(pickCosplay · cosplayAgain · cosplayUsage) */
{ const G = C.COSPLAY.games, CUTS = C.COSPLAY.cuts.map(c => c.key), fill = (keep, n = 30) => G.filter(g => g.key !== keep).flatMap(g => Array.from({ length: n }, () => ({ game: g.key, character: '', cut: CUTS[0] })));
  const r0 = () => 0.42, zelda = G.find(g => g.key === 'legend_of_zelda'), sf = G.find(g => g.key === 'street_fighter_2');
  /* 1. 덜 쓴 게임 먼저 */
  assert.equal(C.pickCosplay(fill('legend_of_zelda'), r0).game, 'legend_of_zelda', '덜 쓴 게임 먼저');
  /* 2. 주인공 하나 — 안 입은 재단만(열 개를 입었으면 남은 하나) · 열하나를 다 입으면 빠진다 */
  const ten = CUTS.slice(0, 10).map(cut => ({ game: 'legend_of_zelda', character: 'link', cut }));
  for (let i = 0; i < 5; i++) { const p = C.pickCosplay([...fill('legend_of_zelda', 30), ...ten], () => (i + 0.5) / 5); assert(p.game === 'legend_of_zelda' && p.character === zelda.character && p.cut === CUTS[10] && p.round === 1, '주인공 하나 재단 겹침 없음 ' + JSON.stringify(p)); }
  const eleven = CUTS.map(cut => ({ game: 'legend_of_zelda', character: 'Link', cut }));
  assert(C.cosplayFull(zelda, C.cosplayTally(eleven).legend_of_zelda) && C.pickCosplay([...fill('legend_of_zelda', 30), ...eleven], r0).game !== 'legend_of_zelda', '다 찬 게임은 빠진다');
  /* 3. 등장인물 많은 게임 1회차 — 캐릭터 빈 칸 · 쓴 캐릭터 목록 · 재단은 그 게임에서 덜 쓴 것 */
  const sfUsed = [{ game: 'street_fighter_2', character: 'Chun-Li', cut: CUTS[0] }, { game: 'street_fighter_2', character: 'Cammy', cut: CUTS[1] }];
  const p1 = C.pickCosplay([...fill('street_fighter_2', 30), ...sfUsed], r0);
  assert(p1.game === 'street_fighter_2' && p1.character === '' && p1.round === 1 && JSON.stringify(p1.used) === '["Cammy","Chun-Li"]' && !CUTS.slice(0, 2).includes(p1.cut), '1회차 pick ' + JSON.stringify(p1));
  const a1 = C.withAgain(p1, sfUsed, 'stage_convention', r0);
  assert(a1.again && ['Chun-Li', 'Cammy'].includes(a1.again.character) && a1.again.cut === p1.cut, '1회차 칸의 2회차 몫 — 같은 재단 먼저');
  const aw = C.withAgain({ ...p1, cut: 'bikini' }, sfUsed, 'water_pool', r0);
  assert(C.COS_SWIM.includes(aw.again.cut), '물가면 2회차 몫도 수영복 재단');
  assert(!C.withAgain({ ...p1, used: [] }, [], 'stage_convention', r0).again, '쓴 캐릭터가 없으면 2회차 몫 없음');
  /* 4. 2회차 — 쓴 캐릭터 ≥ roster: 덜 입은 캐릭터 · 안 입은 재단 → again(캐릭터가 찬다) */
  const roster = Array.from({ length: sf.roster }, (_, i) => ({ game: 'street_fighter_2', character: 'Fighter ' + i, cut: CUTS[i % 3] })).concat([{ game: 'street_fighter_2', character: 'fighter 0', cut: CUTS[5] }]);
  const p2 = C.pickCosplay([...fill('street_fighter_2', 40), ...roster], r0);
  assert(p2.game === 'street_fighter_2' && p2.round === 2 && /^Fighter \d+$/.test(p2.character) && p2.character !== 'Fighter 0' && p2.cut !== CUTS[Number(p2.character.split(' ')[1]) % 3], '2회차 again ' + JSON.stringify(p2));
  /* 지시문 — 2회차 몫 */
  const cd = C.cardOf('fe'); cd.world = 'fantasy';
  const cut = C.plan(cd, SEVEN, [], { seed: 3, cosplayUsed: [...fill('street_fighter_2', 30), ...sfUsed] }).cuts.find(C.isCosplay);
  assert(cut.cosplay.game === 'street_fighter_2' && cut.cosplay.character === '' && cut.cosplay.again, '계획기가 쓴 기록대로 — 1회차 칸 + 2회차 몫');
  const ap = C.againPrompt(cd, 'fantasy', cut), pp = C.record(cd, 'fantasy', cut).prompt;
  assert(pp.includes('not any of these already used: Cammy, Chun-Li;') && ap.includes('a daring adult cosplay of ' + cut.cosplay.again.character + ' from Street Fighter II'), '1회차 지시문 · 2회차 몫 지시문');
  /* 세 공방 기록 읽기 — generation.cosplay 먼저, 없으면 scene.cosplay 의 character 가 찬 것 */
  const tmpR = fs.mkdtempSync(path.join(os.tmpdir(), 'cosplay-use-'));
  try {
    fs.mkdirSync(path.join(tmpR, 'a-img', 'records', 'x'), { recursive: true }); fs.mkdirSync(path.join(tmpR, 'b-img', 'records', 'y-2026'), { recursive: true });
    fs.writeFileSync(path.join(tmpR, 'a-img/records/x/fantasy-casual3.s-ui.json'), JSON.stringify({ scene: { cosplay: { game: 'overwatch', character: '', cut: 'idol' } }, generation: { cosplay: { game: 'overwatch', character: 'Tracer', cut: 'idol' } } }));
    fs.writeFileSync(path.join(tmpR, 'a-img/records/x/mecha-casual3.s-ui.json'), JSON.stringify({ scene: { cosplay: { game: 'overwatch', character: '', cut: 'knit' } } }));
    fs.writeFileSync(path.join(tmpR, 'b-img/records/y-2026/casual4-ui.json'), JSON.stringify({ scene: { cosplay: { game: 'tomb_raider', character: 'Lara Croft', cut: 'corset' } } }));
    const u = C.cosplayUsage([path.join(tmpR, 'a-img'), path.join(tmpR, 'b-img'), path.join(tmpR, 'none')]);
    assert.deepEqual(u.map(x => x.game + '/' + x.character + '/' + x.cut).sort(), ['overwatch/Tracer/idol', 'tomb_raider/Lara Croft/corset'], '세 공방 기록 읽기 ' + JSON.stringify(u));
  } finally { fs.rmSync(tmpR, { recursive: true, force: true }); }
  /* --check — 코스프레 칸은 그린 코스프레(generation.cosplay)가 기록에 있어야 한다 */
  const tmpC = fs.mkdtempSync(path.join(os.tmpdir(), 'cosplay-check-'));
  try {
    const all = C.plan(cd, SEVEN, [], { seed: 3, cosplayUsed: [...fill('street_fighter_2', 30), ...sfUsed] }).cuts;
    const put = gen => { for (const c of all) { const rec = C.record(cd, 'fantasy', c); rec.generation = c.sfree ? { free_prompt: 'FREE DESIGN: x\nPlace: a pier.\nActivity: fishing\nPose: sitting\nFraming: wide\nOutfit: a dress' } : C.isCosplay(c) ? gen : {}; fs.writeFileSync(path.join(tmpC, `fantasy-casual${c.n}.${C.STYLE}-ui.json`), JSON.stringify(rec)); } };
    const run = () => require('node:child_process').spawnSync(process.execPath, [path.join(R, 'tools/casual-plan.cjs'), 'fe', '--world', 'fantasy', '--check', tmpC], { encoding: 'utf8' });
    put({}); let o = run(); assert(o.status === 1 && /그린 코스프레가 기록에 없다/.test(o.stdout), '--check 가 빈 generation.cosplay 를 잡는다');
    put({ cosplay: { game: 'street_fighter_2', character: cut.cosplay.used.find(x => x !== cut.cosplay.again.character), cut: cut.cosplay.cut } }); o = run(); assert(o.status === 1 && /이미 쓴 캐릭터/.test(o.stdout), '--check 가 이미 쓴 캐릭터를 잡는다');
    put({ cosplay: { game: 'street_fighter_2', character: 'Ryu', cut: cut.cosplay.cut } }); o = run(); assert.equal(o.status, 0, '--check 통과(새 캐릭터) ' + o.stdout);
    put({ cosplay: { game: 'street_fighter_2', character: cut.cosplay.again.character, cut: cut.cosplay.again.cut } }); o = run(); assert.equal(o.status, 0, '--check 통과(2회차 몫) ' + o.stdout);
  } finally { fs.rmSync(tmpC, { recursive: true, force: true }); }
  console.log('PASS 게임 코스프레 고르기: 덜 쓴 게임 · 주인공 하나 재단 겹침 없음 · 다 찬 게임 빠짐 · 1회차 pick · 2회차 몫(물가 수영복) · 2회차 again · 세 공방 기록 읽기 · --check');
}
/* 옛 여섯 장 묶음(갈래 자유 없이)은 그대로 통과하고, 다음 계획 때 일곱째 칸만 짜진다 · 새 규칙을 잡는다 */
{ const cd = C.cardOf('au'); cd.world = 'fantasy'; const all = C.plan(cd, SEVEN, [], { seed: 8 }).cuts, six = all.filter(c => !c.gfree);
  assert.deepEqual(C.check(six, cd, []), [], '옛 여섯 장 묶음 통과');
  const old = six.map(c => ({ ...c, old: true })), more = C.plan(cd, [7], old, { seed: 2 });
  assert.equal(more.cuts.length, 1); assert(more.cuts[0].n === 7 && more.cuts[0].gfree && more.cuts[0].sfree, '일곱째 칸만 — 갈래 자유');
  assert.deepEqual(C.check(more.cuts, cd, old), [], '옛 여섯 장 + 일곱째');
  const g = all.find(c => c.gfree), ex = all.find(c => C.EXPOSE_TYPES.includes(C.requiredType(c)));
  assert(C.check([{ ...g, gfree: ex.ofam }], cd, six).some(e => /노출 갈래 컷과 같다/.test(e)), '같은 갈래를 잡는다');
  const sixS = six.map(c => ({ ...c })), gen = sixS.find(c => !c.sfree && !C.requiredType(c) && !C.isCosplay(c)); sixS.forEach(c => delete c.situ); gen.situ = 'wet';
  assert(C.check([{ ...g, gsitu: 'wet' }], cd, sixS).some(e => /상황 노출 컷과 같다/.test(e)), '같은 상황을 잡는다');
  assert(C.check(six.concat([{ ...six[0], n: 7, place: 'x' }]).slice(0, 7).map((c, i) => ({ ...c, n: i + 1 })), cd, []).some(e => /갈래 자유 컷이 없다/.test(e)), '일곱 장에 갈래 자유가 없으면 잡는다');
  /* 실제 그림 저장소의 여섯 장 묶음 */
  const img = path.join(R, '../element-atelier-img/records/cl');
  if (fs.existsSync(img)) { const c2 = C.cardOf('cl'); c2.world = 'fantasy'; const o = C.oldCuts(img, c2, 'fantasy'); if (o.length === 6) { const m = C.plan(c2, [7], o, { seed: 1 }); assert(m.cuts.length === 1 && m.cuts[0].gfree, '그림 저장소의 여섯 장 위에 일곱째'); } }
  assert.equal(C.freeText('FREE DESIGN: x\nPlace: a rooftop greenhouse.\nActivity: repotting a fern\nPose: …'), 'a rooftop greenhouse — repotting a fern'); assert.equal(C.freeText('Place: …\nActivity: …'), ''); }
/* 이미 있는 두 장 위에 세 장 */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-plan-'));
try {
  const card = C.cardOf(keys[1]); card.world = card.worlds[0];
  const first = C.plan(card, [1, 2], [], { seed: 5 });
  for (const c of first.cuts) fs.writeFileSync(path.join(tmp, `${card.world}-casual${c.n}.${C.STYLE}-ui.json`), JSON.stringify(C.record(card, card.world, c)));
  const old = C.oldCuts(tmp, card, card.world);
  assert.equal(old.length, 2);
  const more = C.plan(card, [3, 4, 5], old, { seed: 9 });
  assert.deepEqual(C.check(more.cuts, card, old), []);
  assert.equal(new Set([...old, ...more.cuts].map(c => c.place)).size, 5, '장소가 있는 컷과도 다르다');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
/* 같은 입력 · 씨앗이면 같은 답, 그림 저장소 기록에서 센다 */
{ const card = C.cardOf('fe'); card.world = 'fantasy';
  assert.deepEqual(C.plan(card, [1, 2, 3], [], { seed: 7 }).cuts, C.plan(card, [1, 2, 3], [], { seed: 7 }).cuts, '같은 답');
  const img = path.join(R, '../element-atelier-img/records');
  if (fs.existsSync(img)) { const u = C.sceneUsage(img, 'fe'); assert(Object.keys(u.place).length > 10 && Object.keys(u.preset).length > 10, '그림 저장소 기록에서 센다');
    const rc = C.recentScenes(img); assert(rc.length === 8 && rc.every(x => typeof x === 'string' && x.length < 200), '최근 장면 여덟 — ' + rc.join(' | ')); } }
console.log(`PASS 일상컷 묶음 계획기: ${n} 묶음(카드 ${pickKeys.length} × 세계 × 씨앗 하나)이 일곱 장 · 묶음 규칙 · 정해 둔 세 갈래(노출 · 나라 안 · 게임 코스프레 — 옛 묶음은 상황 노출) · 자유 설계 칸 둘(옷 자유 · 갈래 자유) · 옛 여섯 장 + 일곱째 · 새 계열 · 네 시대 · 옷 색 · 데니어 · 상황 줄 · 짧은 일상컷 · 기록 꼴, 있는 두 장 위에 세 장 · 같은 씨앗 같은 답`);
