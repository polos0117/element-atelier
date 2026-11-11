/* 짧은 세계 그림(기본 화풍 짧은 판)의 외형 칸 — 2026-11-11 사용자 「응 둘 다 고쳐줘」.
   1) 생성기에서 직접 고른 외형(머리색 등)이 짧은 판 지시문에 실린다 — 전엔 고르면 설계의 그 칸이 빠지는데 고른 값이 안 실렸다.
   2) 얼굴 싣기를 끄면 「Her: . 」 처럼 앞 찌꺼기가 남지 않는다.
   Run: node tests/prompt-short-look.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const P = ctx.window.AtelierPrompt, D = JSON.parse(fs.readFileSync('data/element-design.json', 'utf8')), S = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
assert(P.worldShortOn(S, S['default']), '기본 화풍은 짧은 판');
const blocks = t => t.split('\n\n'), her = t => blocks(t).find(x => x.startsWith('Her: '));
let n = 0;
for (const key of ['fe', 'fe-steel', 'fe-steel-sword', 'og']) for (const w of P.worldsOf(D, key)) {
  const base = P.build(D, S, key, w, {});
  assert(!/Chosen look/.test(base), key + ' ' + w + ' 고른 것이 없으면 Chosen 줄 없음');
  const pick = P.build(D, S, key, w, { look: { params: { 'hair color': 'silver' } } });
  assert(blocks(pick).includes('Chosen look (overrides the automatic look): hair color: silver.'), key + ' ' + w + ' 고른 머리색이 실린다');
  const off = P.build(D, S, key, w, { look: { faceDesignOn: false } });
  assert(/^Her: [^.\s]/.test(her(off)) && !/^Her: \./.test(her(off)), key + ' ' + w + ' 얼굴 끄면 찌꺼기 없음: ' + her(off).slice(0, 30));
  assert(!/\. \./.test(off) && !/\.\./.test(off), key + ' ' + w + ' 마침표 겹침 없음');
  n++;
}
console.log('PASS 짧은 판 외형 칸: ' + n + '장 — 고른 외형 줄 · 얼굴 끈 Her 줄');
