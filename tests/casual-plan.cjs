/* 일상컷 묶음 계획기(tools/casual-plan.cjs — 2026-11-09 삼국지 공방 계획기를 원소 꼴로) — 대표 카드 넷 × 사는 세계 × 씨앗 하나가 묶음 규칙을 지키고, 기록이 생성기 꼴이다.
   일곱 장(2026-11-11) · 정해 둔 세 갈래(노출 한 장 · 나라 안 한 장 · 게임 코스프레 한 장(2026-11-15 — 전엔 상황 노출), 서로 다른 컷) · 네 시대 · 옷 색 · 데니어 · 상황 줄(이제 필수 아님) · 짧은 일상컷 ·
   게임 코스프레 고르기(1회차 assigned — 계획기가 캐릭터를 정한다 · 여자 무게 · 예약도 쓴 것 · 2회차 again · 주인공 하나 재단 겹침 없음 · 다 찬 게임 빠짐 · 세 공방 기록 읽기 · --check 의 generation.cosplay ·
   옛 pick 칸 지시문 그대로 · --recosplay 는 안 그린 칸만 · --recosplay-list) · 옛 묶음(상황 노출 필수 시절) 통과 ·
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
      assert(g.many ? (g.characters.some(x => x.name === c.cosplay.character) && !c.cosplay.used) : c.cosplay.character === g.character, key + ' ' + w + ' 코스프레 캐릭터 — 등장인물 많은 게임도 계획기가 정한다(2026-11-16)');
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
        assert(ol.includes(' from ' + g.en) && ol.includes(c.cosplay.character) && !ol.startsWith('Outfit: … (') && !rec.prompt.includes("may show in the outfit's details") && !/-denier yarn|reads clearly at first glance|; right now — /.test(ol), key + ' 코스프레 Outfit 줄 ' + ol.slice(0, 120));
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
/* 게임 코스프레 고르기 — 세 공방 기록 + 계획 예약을 합쳐 센다(pickCosplay · cosplayAgain · cosplayUsage) */
{ const G = C.COSPLAY.games, CUTS = C.COSPLAY.cuts.map(c => c.key);
  /* 다른 게임을 다 채운 기록 — 남은 게임 하나만 고를 수 있게 */
  const full = g => (g.many ? g.characters.map(x => x.name) : [g.character]).flatMap(name => CUTS.map(cut => ({ game: g.key, character: name, cut })));
  const fill = keep => G.filter(g => g.key !== keep).flatMap(full);
  const r0 = () => 0.42, zelda = G.find(g => g.key === 'legend_of_zelda'), sf = G.find(g => g.key === 'street_fighter_2'), SFN = sf.characters.map(x => x.name);
  assert(G.filter(g => g.many).every(g => g.characters.length === g.roster && g.characters.every(x => x.name && typeof x.female === 'boolean')), '등장인물 많은 게임의 목록 — roster = characters 수');
  /* 1. 무게 고르기 — 남은 인원의 제곱근. 빈 기록에서 LoL 이 주인공 하나 게임보다 훨씬 자주, 그래도 주인공 하나 게임도 나온다 */
  { let x = 123; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280, cnt = {}; for (let i = 0; i < 4000; i++) { const k = C.pickCosplay([], rnd).game; cnt[k] = (cnt[k] || 0) + 1; }
    assert((cnt.league_of_legends || 0) > 5 * (cnt.legend_of_zelda || 0) && (cnt.legend_of_zelda || 0) > 0 && (cnt.league_of_legends || 0) > (cnt.street_fighter_2 || 0), '무게 고르기 ' + JSON.stringify(cnt)); }
  assert.equal(C.pickCosplay(fill('legend_of_zelda'), r0).game, 'legend_of_zelda', '다른 게임이 다 차면 남은 게임');
  /* 2. 주인공 하나 — 안 입은 재단만(열 개를 입었으면 남은 하나) · 열하나를 다 입으면 빠진다 */
  const ten = CUTS.slice(0, 10).map(cut => ({ game: 'legend_of_zelda', character: 'link', cut }));
  for (let i = 0; i < 5; i++) { const p = C.pickCosplay([...fill('legend_of_zelda'), ...ten], () => (i + 0.5) / 5); assert(p.game === 'legend_of_zelda' && p.character === zelda.character && p.cut === CUTS[10] && p.round === 1, '주인공 하나 재단 겹침 없음 ' + JSON.stringify(p)); }
  const eleven = CUTS.map(cut => ({ game: 'legend_of_zelda', character: 'Link', cut }));
  assert(C.cosplayFull(zelda, C.cosplayTally(eleven).legend_of_zelda) && C.pickCosplay([...fill('street_fighter_2'), ...eleven], r0).game !== 'legend_of_zelda', '다 찬 게임은 빠진다');
  /* 3. 등장인물 많은 게임 1회차 — 계획기가 목록에서 안 쓴 캐릭터를 정한다(2026-11-16) · 재단은 그 게임에서 덜 쓴 것 · 이름은 글자 크기 · 빈칸 무시 */
  const sfUsed = [{ game: 'street_fighter_2', character: 'chun-li ', cut: CUTS[0] }, { game: 'street_fighter_2', character: 'Cammy', cut: CUTS[1] }];
  for (let i = 0; i < 20; i++) { const p1 = C.pickCosplay([...fill('street_fighter_2'), ...sfUsed], () => (i + 0.5) / 20);
    assert(p1.game === 'street_fighter_2' && SFN.includes(p1.character) && !['Chun-Li', 'Cammy'].includes(p1.character) && p1.round === 1 && !p1.used && !CUTS.slice(0, 2).includes(p1.cut), '1회차 assigned ' + JSON.stringify(p1)); }
  /* 여자 무게 2 · 남자 1 — 4000 번에 여자 비율이 목록 비율보다 높다 */
  { let x = 7; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280, rest = fill('street_fighter_2'); let fem = 0;
    for (let i = 0; i < 4000; i++) { const p = C.pickCosplay(rest, rnd); if (sf.characters.find(c => c.name === p.character).female) fem++; }
    const listRate = sf.characters.filter(c => c.female).length / sf.characters.length;
    assert(fem / 4000 > listRate * 1.5, `여자 무게 — ${(fem / 40).toFixed(1)}% · 목록 ${(listRate * 100).toFixed(1)}%`); }
  /* 빈 기록에서 오버워치를 20 번 차례로 뽑으면 캐릭터가 겹치지 않는다(같은 배치의 앞 칸을 센다) */
  { const used = fill('overwatch'), got = []; for (let i = 0; i < 20; i++) { const p = C.pickCosplay(used, () => ((i * 0.618) % 1)); got.push(p.character); used.push(p); }
    assert.equal(new Set(got).size, 20, '오버워치 20 번 — 겹침 없음 ' + got.join(', ')); }
  /* 4. 2회차 — 목록을 다 쓰거나 예약했을 때: 덜 입은 캐릭터 · 안 입은 재단 → again · 다 차면 빠진다 */
  const roster = sf.characters.map((c, i) => ({ game: 'street_fighter_2', character: c.name, cut: CUTS[i % 3] })).concat([{ game: 'street_fighter_2', character: SFN[0].toUpperCase(), cut: CUTS[5] }]);
  const p2 = C.pickCosplay([...fill('street_fighter_2'), ...roster], r0), i2 = SFN.indexOf(p2.character);
  assert(p2.game === 'street_fighter_2' && p2.round === 2 && i2 > 0 && p2.cut !== CUTS[i2 % 3], '2회차 again ' + JSON.stringify(p2));
  assert(C.cosplayFull(sf, C.cosplayTally(full(sf)).street_fighter_2) && C.pickCosplay([...fill('overwatch'), ...full(sf)], r0).game === 'overwatch' && !C.pickCosplay([...fill(''), ...full(sf)], r0), '다 찬 게임은 빠진다 · 다 차면 null');
  /* 지시문 — 계획기가 정한 1회차는 assigned(캐릭터 이름), 2회차는 again */
  const cd = C.cardOf('fe'); cd.world = 'fantasy';
  const cut = C.plan(cd, SEVEN, [], { seed: 3, cosplayUsed: [...fill('street_fighter_2'), ...sfUsed] }).cuts.find(C.isCosplay);
  assert(cut.cosplay.game === 'street_fighter_2' && SFN.includes(cut.cosplay.character) && !['Chun-Li', 'Cammy'].includes(cut.cosplay.character) && cut.cosplay.round === 1 && !cut.cosplay.again && !C.againPrompt(cd, 'fantasy', cut), '계획기가 쓴 기록대로 — 1회차 칸에 캐릭터');
  const pp = C.record(cd, 'fantasy', cut).prompt;
  assert(pp.includes('\nOutfit: ' + C.COSPLAY.text.assigned.replace('{character}', cut.cosplay.character).replace('{game}', 'Street Fighter II').replace('{cut}', C.COSPLAY.cuts.find(c => c.key === cut.cosplay.cut).en)) && !pp.includes('of your choice'), '1회차 assigned 지시문');
  /* 옛 계획의 pick 칸(캐릭터 빈 칸) — 지시문 · 2회차 몫은 그대로 */
  const oldPick = { ...cut, cosplay: { game: 'street_fighter_2', character: '', cut: cut.cosplay.cut, round: 1, used: ['Cammy', 'Chun-Li'] } };
  const a1 = { ...oldPick, cosplay: C.withAgain(oldPick.cosplay, sfUsed, cut.place, r0) };
  assert(a1.cosplay.again && ['chun-li', 'Cammy'].includes(a1.cosplay.again.character), '옛 pick 칸의 2회차 몫');
  assert(C.record(cd, 'fantasy', oldPick).prompt.includes('Outfit: … (a daring adult cosplay of one character of your choice from Street Fighter II — not any of these already used: Cammy, Chun-Li;') && C.againPrompt(cd, 'fantasy', a1).includes('a daring adult cosplay of ' + a1.cosplay.again.character + ' from Street Fighter II'), '옛 pick 칸 지시문 그대로 · 2회차 몫 지시문');
  /* 세 공방 기록 + 예약 읽기 — generation.cosplay 먼저, 없으면 scene.cosplay 의 character 가 찬 것 · 계획 파일의 cosplay(그린 번호는 빼고, replan 이 이긴다) · pkm 예약(나이와 상관없이 — 2026-11-16, 등록된 캐릭터는 빼고) */
  const tmpR = fs.mkdtempSync(path.join(os.tmpdir(), 'cosplay-use-'));
  try {
    const put = (f, x) => { fs.mkdirSync(path.dirname(path.join(tmpR, f)), { recursive: true }); fs.writeFileSync(path.join(tmpR, f), JSON.stringify(x)); };
    put('a-img/records/x/fantasy-casual3.s-ui.json', { scene: { cosplay: { game: 'overwatch', character: '', cut: 'idol' } }, generation: { cosplay: { game: 'overwatch', character: 'Tracer', cut: 'idol' } } });
    put('a-img/records/x/mecha-casual3.s-ui.json', { scene: { cosplay: { game: 'overwatch', character: '', cut: 'knit' } } });
    put('b-img/records/y-2026/casual4-ui.json', { scene: { cosplay: { game: 'tomb_raider', character: 'Lara Croft', cut: 'corset' } } });
    const pc = (n, game, character, cut) => ({ n, ofam: 'game_cosplay', cosplay: { game, character, cut, round: 1 } });
    put('a-img/records/x/fantasy-casual-plan.json', { card: 'x', world: 'fantasy', cuts: [pc(3, 'overwatch', 'Mercy', 'idol')] });   /* 3번은 그렸다 — 안 센다 */
    put('a-img/records/x/steampunk-casual-plan.json', { card: 'x', world: 'steampunk', cuts: [pc(3, 'overwatch', 'Kiriko', 'knit'), pc(4, 'overwatch', '', 'knit')] });   /* 빈 캐릭터(옛 pick)는 안 센다 */
    put('a-img/records/x/steampunk-casual3-replan.json', { card: 'x', world: 'steampunk', cuts: [pc(3, 'street_fighter_2', 'Ryu', 'bikini')] });   /* 다시 짠 것이 이긴다 */
    put('a-img/records/x/steampunk-casual-plan.initial.json', { card: 'x', world: 'steampunk', cuts: [pc(5, 'overwatch', 'Ana', 'knit')] });   /* 지난 판 */
    put('a-img/records/z/mecha-casual-plan.json', { card: 'z', world: 'mecha', cuts: [pc(2, 'overwatch', 'Sombra', 'lingerie')] });
    const now = Date.parse('2026-11-16T10:00:00Z');
    put('b-img/records/casual-ledger.json', { entries: [{ card: '등록됨', status: 'done', cuts: [] }] });
    put('b-img/records/casual-reservations/s1.json', { session: 's1', characters: [{ card: '피카', at: '2026-11-16T09:00:00Z', cuts: [{ cut: 2, cosplay: { game: 'overwatch', character: 'D.Va', cut: 'bikini' } }] },
      { card: '등록됨', at: '2026-11-16T09:00:00Z', cuts: [{ cut: 2, cosplay: { game: 'overwatch', character: 'Ashe', cut: 'bikini' } }] },
      { card: '옛예약', at: '2026-11-14T09:00:00Z', cuts: [{ cut: 2, cosplay: { game: 'overwatch', character: 'Echo', cut: 'bikini' } }] }] });
    const roots = [path.join(tmpR, 'a-img'), path.join(tmpR, 'b-img'), path.join(tmpR, 'none')], row = x => x.game + '/' + x.character + '/' + x.cut + (x.plan ? '*' : '');
    const u = C.cosplayUsage(roots, { now });
    assert.deepEqual(u.map(row).sort(), ['overwatch/D.Va/bikini*', 'overwatch/Echo/bikini*', 'overwatch/Sombra/lingerie*', 'overwatch/Tracer/idol', 'street_fighter_2/Ryu/bikini*', 'tomb_raider/Lara Croft/corset'], '기록 + 예약 읽기(오래된 pkm 예약 Echo 도 센다 — 2026-11-16 pkm · 삼국지와 같게) ' + JSON.stringify(u.map(row)));
    assert.deepEqual(C.cosplayUsage(roots, { now, plans: false }).map(row).sort(), ['overwatch/Tracer/idol', 'tomb_raider/Lara Croft/corset'], '기록만');
    assert(!C.cosplayUsage(roots, { now, skip: ['z|mecha'] }).some(x => x.character === 'Sombra'), '지금 다시 짜는 카드 · 세계의 옛 계획은 안 센다');
    /* 예약 — 계획 파일에만 있는 캐릭터가 빠진다: 스트리트 파이터의 남은 둘(Ryu · Guile) 가운데 Ryu 는 예약 → 늘 Guile */
    const sfRest = SFN.filter(nm => !['Ryu', 'Guile'].includes(nm)).map(nm => ({ game: 'street_fighter_2', character: nm, cut: 'knit' }));
    for (let i = 0; i < 6; i++) assert.equal(C.pickCosplay([...fill('street_fighter_2'), ...sfRest, ...u], () => (i + 0.5) / 6).character, 'Guile', '예약한 캐릭터는 빠진다');
    { const recOnly = C.cosplayUsage(roots, { now, plans: false }), got = new Set(); for (let i = 0; i < 12; i++) got.add(C.pickCosplay([...fill('street_fighter_2'), ...sfRest, ...recOnly], () => (i + 0.5) / 12).character);
      assert.deepEqual([...got].sort(), ['Guile', 'Ryu'], '예약을 빼면 Ryu 도 후보'); }
    /* 주인공 하나 게임은 기록 이름이 달라도(Geralt · Geralt of Rivia) 그 주인공으로 센다 — 같은 재단이 다시 안 나온다 */
    { const T = C.cosplayTally([{ game: 'witcher_3', character: 'Geralt', cut: 'one_piece' }, { game: 'witcher_3', character: 'Geralt of Rivia', cut: 'bikini' }]).witcher_3;
      assert.equal(Object.keys(T.chars).length, 1, '주인공 이름 하나로 ' + JSON.stringify(Object.keys(T.chars))); }
  } finally { fs.rmSync(tmpR, { recursive: true, force: true }); }
  /* --check — 코스프레 칸은 그린 코스프레(generation.cosplay)가 기록에 있어야 한다 */
  const tmpC = fs.mkdtempSync(path.join(os.tmpdir(), 'cosplay-check-'));
  try {
    const all = C.plan(cd, SEVEN, [], { seed: 3, cosplayUsed: [...fill('street_fighter_2'), ...sfUsed] }).cuts;
    const put = (gen, swap = null) => { for (const c0 of all) { const c = swap && C.isCosplay(c0) ? swap : c0, rec = C.record(cd, 'fantasy', c); rec.generation = c.sfree ? { free_prompt: 'FREE DESIGN: x\nPlace: a pier.\nActivity: fishing\nPose: sitting\nFraming: wide\nOutfit: a dress' } : C.isCosplay(c) ? gen : {}; fs.writeFileSync(path.join(tmpC, `fantasy-casual${c.n}.${C.STYLE}-ui.json`), JSON.stringify(rec)); } };
    const run = () => require('node:child_process').spawnSync(process.execPath, [path.join(R, 'tools/casual-plan.cjs'), 'fe', '--world', 'fantasy', '--check', tmpC], { encoding: 'utf8' });
    put({}); let o = run(); assert(o.status === 1 && /그린 코스프레가 기록에 없다/.test(o.stdout), '--check 가 빈 generation.cosplay 를 잡는다');
    const other = SFN.find(nm => nm !== cut.cosplay.character);
    put({ cosplay: { game: 'street_fighter_2', character: other, cut: cut.cosplay.cut } }); o = run(); assert(o.status === 1 && /정해 둔 코스프레는/.test(o.stdout), '--check 가 정해 둔 것과 다른 캐릭터를 잡는다');
    put({ cosplay: { game: 'street_fighter_2', character: cut.cosplay.character, cut: cut.cosplay.cut } }); o = run(); assert.equal(o.status, 0, '--check 통과(정해 둔 캐릭터) ' + o.stdout);
    /* 옛 pick 칸 — 그리는 쪽이 채운 새 캐릭터 · 2회차 몫 */
    put({ cosplay: { game: 'street_fighter_2', character: a1.cosplay.used.find(x => x.toLowerCase() !== a1.cosplay.again.character.toLowerCase()), cut: cut.cosplay.cut } }, a1); o = run(); assert(o.status === 1 && /이미 쓴 캐릭터/.test(o.stdout), '--check 가 옛 pick 칸의 이미 쓴 캐릭터를 잡는다');
    put({ cosplay: { game: 'street_fighter_2', character: 'Ryu', cut: cut.cosplay.cut } }, a1); o = run(); assert.equal(o.status, 0, '--check 통과(옛 pick — 새 캐릭터) ' + o.stdout);
  } finally { fs.rmSync(tmpC, { recursive: true, force: true }); }
  /* --recosplay — 계획 파일의 안 그린 코스프레 칸만 다시 정한다(장소가 받는 재단) · 그린 칸 · 다른 칸은 그대로 · --recosplay-list */
  const tmpP = fs.mkdtempSync(path.join(os.tmpdir(), 'recosplay-'));
  try {
    const dir = path.join(tmpP, 'img', 'records', 'fe'), out = path.join(tmpP, 'out'); fs.mkdirSync(dir, { recursive: true });
    const plans = {};
    for (const [w, seed] of [['fantasy', 3], ['steampunk', 4]]) { const cw = C.cardOf('fe'); cw.world = w;
      const cuts = C.plan(cw, SEVEN, [], { seed }).cuts.map(c => C.isCosplay(c) ? { ...c, cosplay: { game: 'overwatch', character: '', cut: c.cosplay.cut, round: 1, used: ['Tracer'] } } : c);
      plans[w] = { card: 'fe', world: w, seed, tree: 2, style: C.STYLE, required: '', slots: SEVEN, fresh: false, cuts };
      fs.writeFileSync(path.join(dir, `${w}-casual-plan.json`), JSON.stringify(plans[w], null, 1) + '\n'); }
    const sn = plans.steampunk.cuts.find(C.isCosplay).n;
    fs.writeFileSync(path.join(dir, `steampunk-casual${sn}.${C.STYLE}-ui.json`), JSON.stringify({ scene: plans.steampunk.cuts.find(C.isCosplay), generation: { cosplay: { game: 'overwatch', character: 'Mercy', cut: 'idol' } } }));   /* 스팀펑크 코스프레 칸은 그렸다 */
    const cli = (...a) => require('node:child_process').spawnSync(process.execPath, [path.join(R, 'tools/casual-plan.cjs'), ...a], { encoding: 'utf8' });
    let o = cli('--recosplay-list', '--img', path.join(tmpP, 'img'));
    assert(o.status === 0 && o.stdout.includes(`fe\tfantasy\t${plans.fantasy.cuts.find(C.isCosplay).n}\toverwatch/`) && !o.stdout.includes('steampunk'), '--recosplay-list — 안 그린 pick 칸만 ' + o.stdout);
    o = cli('fe', '--world', 'all', '--recosplay', '--records', dir, '--cosplay-usage', 'none', '--seed', '5', '--out', out);
    assert.equal(o.status, 0, '--recosplay ' + o.stderr);
    const after = w => JSON.parse(fs.readFileSync(path.join(dir, `${w}-casual-plan.json`), 'utf8'));
    const fa = after('fantasy'), was = plans.fantasy.cuts.find(C.isCosplay), now = fa.cuts.find(C.isCosplay), gm = G.find(g => g.key === now.cosplay.game);
    assert(now.n === was.n && now.cosplay.character && (gm.many ? gm.characters.some(x => x.name === now.cosplay.character) : now.cosplay.character === gm.character) && now.item === 'gc_' + now.cosplay.cut && now.place === was.place && now.preset === was.preset && !now.cosplay.used, '안 그린 칸 — 새 규칙의 캐릭터 ' + JSON.stringify(now.cosplay));
    assert(C.cosPlace(now.place) && (!/^water_/.test(now.place) || C.COS_SWIM.includes(now.cosplay.cut)), '장소가 받는 재단');
    assert.deepEqual(fa.cuts.filter(c => c.n !== was.n), JSON.parse(JSON.stringify(plans.fantasy.cuts.filter(c => c.n !== was.n))), '다른 칸은 그대로');
    assert(fa.recosplay && fa.recosplay[0].n === was.n && fa.recosplay[0].was.character === '', '다시 정한 기록');
    assert.deepEqual(after('steampunk'), JSON.parse(JSON.stringify(plans.steampunk)), '그린 칸만 있는 계획은 그대로');
    const pr = fs.readFileSync(path.join(out, `fantasy-casual${was.n}-prompt.txt`), 'utf8');
    assert(pr.includes(' a daring adult cosplay of ' + now.cosplay.character + ' from ' + gm.en) && !pr.includes('of your choice'), '--out 에 새 지시문');
    o = cli('--recosplay-list', '--img', path.join(tmpP, 'img')); assert(/pick 칸 없음/.test(o.stdout), '다시 정한 뒤 목록이 빈다');
    /* 물가 장소면 수영복 재단만 */
    const wc = C.recosplayCut(cd, 'fantasy', { ...was, place: 'water_pool', era: 'now' }, [], r0); assert(wc && C.COS_SWIM.includes(wc.cosplay.cut), '물가면 수영복 재단 ' + JSON.stringify(wc && wc.cosplay));
  } finally { fs.rmSync(tmpP, { recursive: true, force: true }); }
  console.log('PASS 게임 코스프레 고르기: 무게 고르기 · 주인공 하나 재단 겹침 없음 · 다 찬 게임 빠짐 · 1회차 assigned(목록 안 · 쓴/예약 아님) · 여자 무게 · 오버워치 20 번 겹침 없음 · 2회차 again · 기록 + 예약 읽기 · 옛 pick 지시문 · --check · --recosplay(안 그린 칸만) · --recosplay-list');
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
