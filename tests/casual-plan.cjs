/* 일상컷 묶음 계획기(tools/casual-plan.cjs — 2026-11-09 삼국지 공방 계획기를 원소 꼴로) — 카드 여럿 × 세계 셋 × 씨앗 둘이 묶음 규칙을 지키고, 기록이 생성기 꼴이다.
   여섯 장 · 정해 둔 세 갈래(노출 한 장 · 나라 안 한 장 · 상황 노출 한 장, 서로 다른 컷) · 네 시대 · 옷 색 · 데니어 · 상황 줄 · 짧은 일상컷.
   이미 있는 컷(기록) 위에 모자란 번호만 짜는 것도. node tests/casual-plan.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm');
const C = require('../tools/casual-plan.cjs');
const R = path.join(__dirname, '..');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, TS = ctx.window.AtelierSpec;
const D = JSON.parse(fs.readFileSync(path.join(R, 'data/element-design.json'), 'utf8'));
const SJ = JSON.parse(fs.readFileSync(path.join(R, 'data/style.json'), 'utf8')), SHORT = P.casualShortOn(SJ, C.STYLE);
const keys = P.cards(D), pickKeys = keys.filter((k, i) => i % Math.max(1, Math.floor(keys.length / 10)) === 0).slice(0, 10);
const SIX = [1, 2, 3, 4, 5, 6];
let n = 0; const dn = { fit: 0, set: 0 }, situSeen = new Set(), famSeen = new Set();
for (const key of pickKeys) {
  const card = C.cardOf(key);
  for (const w of card.worlds) for (const seed of [3, 11]) {
    card.world = w;
    const res = C.plan(card, SIX, [], { seed });
    assert.equal(res.cuts.length, 6, key + ' ' + w + ' 여섯 장');
    assert.deepEqual(C.check(res.cuts, card, []), [], key + ' ' + w + ' 묶음 규칙');
    const ex = res.cuts.filter(c => C.EXPOSE_TYPES.includes(C.requiredType(c))), inw = res.cuts.filter(c => C.requiredType(c) === 'nation');
    assert(ex.length && inw.length, key + ' ' + w + ' 정해 둔 갈래 — 노출 한 장 · 나라 안 한 장');
    const si = res.cuts.filter(c => c.situ);
    assert.equal(si.length, 1, key + ' ' + w + ' 상황 노출 한 장');
    assert(!C.requiredType(si[0]) && si[0].frame !== 'face_close' && P.situFits(si[0].situ, C.outfitEn(si[0])), key + ' ' + w + ' 상황 컷');
    situSeen.add(si[0].situ); res.cuts.forEach(c => famSeen.add(c.ofam));
    { const fr = res.cuts.filter(c => c.ofree); assert.equal(fr.length, 1, key + ' ' + w + ' 옷 자유 한 장(2026-11-09)');
      assert(!C.requiredType(fr[0]) && !fr[0].situ && fr[0].frame !== 'face_close' && !fr[0].color && !fr[0].denier, key + ' ' + w + ' 옷 자유 컷'); }
    assert.equal(new Set(res.cuts.map(c => c.era)).size, 4, key + ' ' + w + ' 네 시대 다');
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
      if (c.ofree) { assert(ol.startsWith(TS.OUTFIT_FREE), key + ' 옷 자유 줄'); continue; }
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
  if (fs.existsSync(img)) { const u = C.sceneUsage(img, 'fe'); assert(Object.keys(u.place).length > 10 && Object.keys(u.preset).length > 10, '그림 저장소 기록에서 센다'); } }
console.log(`PASS 일상컷 묶음 계획기: ${n} 묶음(카드 ${pickKeys.length} × 세계 × 씨앗 둘)이 여섯 장 · 묶음 규칙 · 정해 둔 세 갈래(노출 · 나라 안 · 상황 노출 — 상황 넷 다) · 새 계열 · 네 시대 · 옷 색 · 데니어 · 상황 줄 · 짧은 일상컷 · 기록 꼴, 있는 두 장 위에 세 장 · 같은 씨앗 같은 답`);
