/* 일상컷 묶음 계획기(tools/casual-plan.cjs — 2026-11-09 삼국지 공방 계획기를 원소 꼴로) — 대표 카드 넷 × 사는 세계 × 씨앗 하나가 묶음 규칙을 지키고, 기록이 생성기 꼴이다.
   일곱 장(2026-11-11) · 정해 둔 세 갈래(노출 한 장 · 나라 안 한 장 · 상황 노출 한 장, 서로 다른 컷) · 네 시대 · 옷 색 · 데니어 · 상황 줄 · 짧은 일상컷 ·
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
let n = 0; const dn = { fit: 0, set: 0 }, situSeen = new Set(), famSeen = new Set();
for (const key of pickKeys) {
  const card = C.cardOf(key);
  for (const w of card.worlds) for (const seed of [3]) {
    card.world = w;
    const res = C.plan(card, SEVEN, [], { seed, recent: ['a test place — standing'] });
    assert.equal(res.cuts.length, 7, key + ' ' + w + ' 일곱 장');
    assert.deepEqual(C.check(res.cuts, card, []), [], key + ' ' + w + ' 묶음 규칙');
    const ex = res.cuts.filter(c => C.EXPOSE_TYPES.includes(C.requiredType(c))), inw = res.cuts.filter(c => C.requiredType(c) === 'nation');
    assert(ex.length && inw.length, key + ' ' + w + ' 정해 둔 갈래 — 노출 한 장 · 나라 안 한 장');
    const si = res.cuts.filter(c => c.situ);
    assert.equal(si.length, 1, key + ' ' + w + ' 상황 노출 한 장');
    assert(!C.requiredType(si[0]) && si[0].frame !== 'face_close' && P.situFits(si[0].situ, C.outfitEn(si[0])), key + ' ' + w + ' 상황 컷');
    situSeen.add(si[0].situ); res.cuts.forEach(c => famSeen.add(c.ofam));
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
      if (SHORT) assert(rec.prompt.includes(TS.CASUAL.short.face) && rec.prompt.includes('1024×1536') && /\n\nStyle: /.test(rec.prompt) && rec.prompt.includes(TS.CASUAL.short.headwear) && !/^(?:WARDROBE|ANGLE|OUTPUT|AGE|ANATOMY):/m.test(rec.prompt), '짧은 일상컷');
      const ol = (rec.prompt.match(/^Outfit: .*$/m) || [''])[0], CL = TS.CASUAL.colors.find(x => x.key === c.color);
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
      if (c.situ) assert(ol.includes('; right now — ' + TS.CASUAL.situations.find(x => x.key === c.situ).en), key + ' 상황 줄'); else assert(!/; right now — /.test(ol));
    }
    n++;
  }
}
assert.equal(situSeen.size, 4, '상황 넷 — ' + [...situSeen]);
assert(['adventure', 'drape'].every(f => famSeen.has(f)), '새 계열 — ' + [...famSeen]);
assert(dn.fit > 15 && dn.set / dn.fit > 0.3 && dn.set / dn.fit < 0.9, '데니어 비율 ' + dn.set + '/' + dn.fit);
/* 옛 다섯 장 묶음은 상황 없이 맞다 · 상황 컷이 없으면 잡는다 */
{ const cd = C.cardOf('fe'); cd.world = 'fantasy'; const cuts = C.plan(cd, SIX, [], { seed: 4 }).cuts;
  assert(C.check(cuts.map(c => { const x = { ...c }; delete x.situ; return x; }), cd, []).some(e => /상황 노출 컷이 없다/.test(e)), '상황 컷이 없으면 잡는다');
  assert.deepEqual(C.check(cuts.slice(0, 5).map(c => { const x = { ...c }; delete x.situ; return x; }), cd, []).filter(e => /상황/.test(e)), [], '옛 다섯 장 묶음'); }
/* 옛 여섯 장 묶음(갈래 자유 없이)은 그대로 통과하고, 다음 계획 때 일곱째 칸만 짜진다 · 새 규칙을 잡는다 */
{ const cd = C.cardOf('au'); cd.world = 'fantasy'; const all = C.plan(cd, SEVEN, [], { seed: 8 }).cuts, six = all.filter(c => !c.gfree);
  assert.deepEqual(C.check(six, cd, []), [], '옛 여섯 장 묶음 통과');
  const old = six.map(c => ({ ...c, old: true })), more = C.plan(cd, [7], old, { seed: 2 });
  assert.equal(more.cuts.length, 1); assert(more.cuts[0].n === 7 && more.cuts[0].gfree && more.cuts[0].sfree, '일곱째 칸만 — 갈래 자유');
  assert.deepEqual(C.check(more.cuts, cd, old), [], '옛 여섯 장 + 일곱째');
  const g = all.find(c => c.gfree), ex = all.find(c => C.EXPOSE_TYPES.includes(C.requiredType(c))), su = all.find(c => c.situ);
  assert(C.check([{ ...g, gfree: ex.ofam }], cd, six).some(e => /노출 갈래 컷과 같다/.test(e)), '같은 갈래를 잡는다');
  assert(C.check([{ ...g, gsitu: su.situ }], cd, six).some(e => /상황 노출 컷과 같다/.test(e)), '같은 상황을 잡는다');
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
console.log(`PASS 일상컷 묶음 계획기: ${n} 묶음(카드 ${pickKeys.length} × 세계 × 씨앗 하나)이 일곱 장 · 묶음 규칙 · 정해 둔 세 갈래(노출 · 나라 안 · 상황 노출 — 상황 넷 다) · 자유 설계 칸 둘(옷 자유 · 갈래 자유) · 옛 여섯 장 + 일곱째 · 새 계열 · 네 시대 · 옷 색 · 데니어 · 상황 줄 · 짧은 일상컷 · 기록 꼴, 있는 두 장 위에 세 장 · 같은 씨앗 같은 답`);
