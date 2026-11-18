#!/usr/bin/env node
/* 비슷한 등록작 찾기(2026-11-18 사용자 「응 허용하고 이순서대로 진행해줘」 — 세계컷 GPT 설계안 3단계, 삼국지 공방과 같은 꼴).
   GPT 설계 주문(lib/prompt-element.js buildWorldFree)에 「우리 설계와 가장 비슷한 등록작 — 이것들과도 다르게」 줄을 넣으려고,
   이 카드 · 세계의 우리 설계(designKeys — 얼굴형 · 눈 · 눈썹 · 표정 · 머리 · 실루엣)와 등록된 다른 카드의 그 세계 대표컷을 견준다.
     - 우리 설계로 등록된 컷: 설계표 열쇠가 같은 칸 수(여섯 칸 중)
     - GPT 설계로 등록된 컷(기록 generation.design gpt_free): 기록의 설계 요약(generation.summary — 없으면 free_prompt 의 SUMMARY: 줄)과 우리 요약의 낱말 겹침 × 6
   점수 3 이상에서 높은 차례로 n 개(기본 3). 기록은 옆의 element-atelier-img/records/<카드>/<세계>.<화풍>-ui.json

   node tools/design-near.cjs <카드> <세계> [--n 3]
   require('./design-near.cjs').near(<카드>, <세계>, { n }) → ['<영어 이름> — <요약>', …] */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), REC = path.join(ROOT, '..', 'element-atelier-img', 'records');
let ENV = null;
function env() {
  if (ENV) return ENV;
  const ctx = { window: {}, console }; vm.createContext(ctx);
  for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/prompt-element.js']) vm.runInContext(read(f), ctx);
  ENV = { P: ctx.window.AtelierPrompt, D: JSON.parse(read('data/element-design.json')), IMG: JSON.parse(read('data/img.json')) };
  return ENV;
}
const KEYS = ['face_shape', 'eyes', 'brows', 'expr', 'hair', 'sil'];
const words = t => new Set(String(t || '').toLowerCase().replace(/[^a-z ]+/g, ' ').split(/\s+/).filter(w => w.length > 2 && !/^(and|the|with|her|face|eyes|brows|expression|hair|costume|outline|shape)$/.test(w)));
const jac = (a, b) => { const A = words(a), B = words(b); if (!A.size || !B.size) return 0; let n = 0; A.forEach(w => { if (B.has(w)) n++; }); return n / (A.size + B.size - n); };
function summaryOf(rec) {
  const g = rec.generation || {};
  if (g.summary) return String(g.summary);
  const m = /^SUMMARY:\s*(.+)$/m.exec(String(g.free_prompt || rec.prompt || ''));
  return m ? m[1].trim() : '';
}
function registered(IMG, key, world) {
  const v = ((IMG.img || {})[key] || {}).byStyle || {};
  return Object.keys(v).filter(st => ((v[st].byForm || {})[world] || {}).f).map(st => ({ style: st }));
}
function gptRecord(key, world, style) {
  const f = path.join(REC, key, `${world}.${style}-ui.json`);
  if (!fs.existsSync(f)) return null;
  try { const r = JSON.parse(fs.readFileSync(f, 'utf8')); return ((r.generation || {}).design || r.design) === 'gpt_free' ? r : null; } catch (e) { return null; }
}
function near(key, world, o = {}) {
  const { P, D, IMG } = env(), n = o.n || 3, me = P.card(D, key); if (!me) return [];
  const mk = P.designKeys(me, world), ms = P.designSummary(me, world), out = [];
  for (const k of P.cards(D)) {
    if (k === key) continue;
    const regs = registered(IMG, k, world); if (!regs.length) continue;
    const c = P.card(D, k); if (!c) continue;
    for (const r of regs) {
      const rec = gptRecord(k, world, r.style);
      let score, text;
      if (rec) { text = summaryOf(rec); if (!text) continue; score = jac(ms, text) * KEYS.length; }
      else { const kk = P.designKeys(c, world); score = KEYS.filter(x => kk[x] && kk[x] === mk[x]).length; text = P.designSummary(c, world); }
      if (score >= 3) out.push({ score, line: (c.en || (c.element || {}).en || k) + ' (' + world + ') — ' + text });
    }
  }
  out.sort((a, b) => b.score - a.score);
  return [...new Set(out.map(x => x.line))].slice(0, n);
}
module.exports = { near, summaryOf };
if (require.main === module) {
  const a = process.argv.slice(2), i = a.indexOf('--n'), n = i >= 0 ? Number(a[i + 1]) : 3;
  const r = near(a[0], a[1], { n }); console.log(r.length ? r.map((x, j) => (j + 1) + ') ' + x).join('\n') : '(비슷한 등록작 없음 — 점수 3 미만)');
}
