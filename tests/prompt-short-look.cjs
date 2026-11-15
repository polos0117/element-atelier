/* 짧은 세계 그림(기본 화풍 짧은 판)의 외형 칸 — 2026-11-11 사용자 「응 둘 다 고쳐줘」.
   1) 생성기에서 직접 고른 외형(머리색 등)이 짧은 판 지시문에 실린다 — 전엔 고르면 설계의 그 칸이 빠지는데 고른 값이 안 실렸다.
   2) 얼굴 싣기를 끄면 「Her: . 」 처럼 앞 찌꺼기가 남지 않는다.
   Run: node tests/prompt-short-look.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, D = JSON.parse(fs.readFileSync('data/element-design.json', 'utf8')), S = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
assert(P.worldShortOn(S, S['default']), '기본 화풍은 짧은 판');
/* 칸 꼴(2026-11-11 3단계)에선 줄이 칸 안에 한 줄씩 — 줄로 나눠 본다. 얼굴 줄은 「Face — her own: 」(칸 꼴) 또는 「Her: 」(짧은 판) */
const blocks = t => t.split(/\n+/), her = t => blocks(t).find(x => x.startsWith('Her: ') || x.startsWith('Body and hair: '));
let n = 0;
for (const key of ['fe', 'fe-steel', 'fe-steel-sword', 'og']) for (const w of P.worldsOf(D, key)) {
  const base = P.build(D, S, key, w, {});
  assert(!/Chosen look/.test(base), key + ' ' + w + ' 고른 것이 없으면 Chosen 줄 없음');
  const pick = P.build(D, S, key, w, { look: { params: { 'hair color': 'silver' } } });
  assert(blocks(pick).includes('Chosen look (overrides the automatic look): hair color: silver.'), key + ' ' + w + ' 고른 머리색이 실린다');
  const off = P.build(D, S, key, w, { look: { faceDesignOn: false } });
  assert(/^(?:Her|Body and hair): [^.\s]/.test(her(off)) && !/^(?:Her|Body and hair): \./.test(her(off)) && !/^Face — her own: *\.?$/m.test(off), key + ' ' + w + ' 얼굴 끄면 찌꺼기 없음: ' + her(off).slice(0, 30));
  assert(!/\. \./.test(off) && !/\.\./.test(off), key + ' ' + w + ' 마침표 겹침 없음');
  n++;
}
console.log('PASS 짧은 판 외형 칸: ' + n + '장 — 고른 외형 줄 · 얼굴 끈 Her 줄');
/* 일상컷 체형 줄(2026-11-15, 삼국지와 같이) — 우리 설계 그림이면 설계표 체형 글, GPT 임의 설계 그림(refFree)이면 체형 글 없이 그림의 몸만. 짧은 꼴(기본) · 긴 꼴 */
{ const C = require('../tools/casual-plan.cjs'), T = ctx.window.AtelierSpec, tree = JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8')), tree2 = JSON.parse(fs.readFileSync('data/casual-tree-v2.json', 'utf8'));
  const card = C.cardOf('fe'); card.world = 'fantasy'; const { n: _n, ...sc } = C.plan(card, [1], [], { seed: 5 }).cuts[0];
  const body = T.VOCAB_EN.body[D.nations.find(x => x.key === 'fe').look.silhouette.body];
  const LONG = JSON.parse(JSON.stringify(S)); for (const st of Object.values(LONG.styles)) for (const v of st.versions) v.casualShort = false;
  for (const [nm, SS] of [['짧은 꼴', S], ['긴 꼴', LONG]]) {
    const fig = rf => { const r = P.casualRecord(D, SS, 'fe', sc, { world: 'fantasy', tree, tree2, refFree: rf }, 1); return [(r.prompt.match(/^(?:FIGURE|Figure): .*$/m) || [''])[0], r.refDesign]; };
    const [ours, d0] = fig(false), [free, d1] = fig(true);
    assert(ours.includes(body) && /neither slimmer nor fuller/.test(ours) && !d0, nm + ' 우리 설계 — 체형 글: ' + ours);
    assert(!free.includes(body) && /^(?:FIGURE|Figure): keep her exact build from the attached image/.test(free) && d1 === 'gpt_free', nm + ' GPT 설계 — 그림의 몸만: ' + free);
  }
  console.log('PASS 일상컷 체형 줄: 우리 설계 = 체형 글 · GPT 설계 = 그림의 몸만(짧은 꼴 · 긴 꼴)');
}
