/* 전경 지시문(2026-11-24 — city-atelier 의 전경을 옮김, 철 시험. lib/prompt-element.js buildVista, 글은 lib/prompt-spec.js T.VISTA, 도구 tools/vista-prompt.cjs).
   설계된 나라 모두 × 설계된 세계 × 살아 있는 화풍으로 짓고 본다:
   (a) 머리 줄 = 그 원소 en · 기호 + 세계 결 이름, 장소 줄 = 설계표 worlds.<세계>.en(그녀 마디를 덜어 낸 것), 3:2 Output 줄이 맨 끝 · 아래 1/4 잔잔하게(카드 자리) · 「No people … no text …」 줄 · 화풍 줄
   (b) 날 열쇠가 없다(「{…}」 · undefined · 밑줄 낀 열쇠) (c) 그녀(she · her)가 지시문 어디에도 없다 — 사람이 없는 그림
   (d) 그 세계 옷 줄의 금지 낱말은 Avoid 줄에만 — 옷 낱말은 Avoid 에도 없다
   (e) 400 낱말 이하 (f) 파일 이름 <나라>_<세계>_<화풍>_vista.webp 가 등록기의 전경 꼴 · 기록 바탕
   (g) 가문 · 주민 카드 · 없는 세계는 던진다
   (h) 그림 저장소가 옆에 있으면 철 기록(records/fe/<세계>-vista.<화풍>-api.json)의 prompt 가 지금 조립기 글과 글자 하나까지 같다 — 그린 글과 조립기가 갈라지면 잡는다.
   Run: node tests/prompt-vista.cjs */
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/prompt-element.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const T = ctx.window.AtelierSpec, P = ctx.window.AtelierPrompt;
const D = JSON.parse(fs.readFileSync('data/element-design.json', 'utf8')), S = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), word = (w, flags) => new RegExp('\\b' + esc(w) + '\\b', flags);
const VISTA_RE = /^(.+)_vista\.webp$/;   /* tools/register-images.py VISTA 와 같은 꼴 */
const reg = fs.readFileSync('tools/register-images.py', 'utf8');
assert(reg.includes('VISTA = re.compile(r"^(.+)_vista\\.webp$")'), '등록기의 전경 꼴이 이 검사와 같다');

const LIVE = Object.keys(S.styles).filter(k => !S.styles[k].retired), DESIGNED = D.nations.filter(n => Object.keys(n.worlds || {}).length);
assert(DESIGNED.length >= 100 && LIVE.includes(S.default), '설계된 나라 · 기본 화풍');
const CLOTH = new RegExp('\\b(?:' + T.VISTA.cloth.map(esc).join('|') + ')s?\\b', 'i');
let n = 0, maxWords = 0, cut = 0;
for (const nt of DESIGNED) for (const w of D.vocab.worlds.filter(k => nt.worlds[k])) for (const st of LIVE) {
  const id = `${nt.key}/${w}/${st}`, t = P.buildVista(D, S, nt.key, w, { style: st }), el = D.elements.find(e => e.key === nt.key);
  const B = t.split('\n\n');
  /* (a) 줄 */
  assert.equal(B[0], T.VISTA.head.replace(/\{nation_en\}/g, el.en).replace('{symbol}', el.symbol).replace('{genre}', T.VISTA.genre[w]), id + ' 머리 줄');
  const place = P.herCut(nt.worlds[w].en).replace(/[.;:]+$/, '');
  assert.equal(B[1], 'The place: ' + place + '.', id + ' 장소 줄 = 설계표 세계 글');
  if (place !== nt.worlds[w].en.trim().replace(/[.;:]+$/, '')) cut++;
  assert(B.includes(T.VISTA.composition) && /lower quarter of the picture calm/.test(t) && /interface cards can sit over it/.test(t), id + ' 아래 1/4 카드 자리');
  assert(B.includes(T.VISTA.none) && /^No people, no characters/.test(T.VISTA.none) && /no text, letters, numbers/.test(T.VISTA.none), id + ' 사람 · 글자 없음');
  assert.equal(B[B.length - 1], 'Output: one horizontal 3:2 image, 1536×1024.', id + ' 3:2 Output 줄이 맨 끝');
  assert(B.some(b => /^Style: \S/.test(b)), id + ' 화풍 줄');
  if (st === S.default) assert(B.includes('Style: ' + S.styles[st].versions.find(v => v.v === S.styles[st].current).vista), id + ' 기본 화풍은 판의 vista 칸 그대로');
  if ((nt.palette || {}).en) assert(B.includes('Colour key: ' + nt.palette.en.trim().replace(/[.;:]+$/, '') + '.'), id + ' 색 줄 = 설계표 palette');
  /* (b) 날 열쇠 */
  assert(!/\{\w+\}|undefined|\bnull\b|NaN|\[object/.test(t), id + ' 날 자리표시');
  assert(!/\b[a-z0-9]+_[a-z0-9_]+\b/.test(t), id + ' 밑줄 낀 열쇠 ' + (t.match(/\b[a-z0-9]+_[a-z0-9_]+\b/) || [])[0]);
  assert(!/[가-힣]/.test(t), id + ' 한글');
  /* (c) 그녀 */
  assert(!/\b(?:she|her|hers|herself)\b/i.test(t), id + ' (c) 그녀를 가리키는 말 「' + (t.match(/[^.;,]*\b(?:she|her|hers|herself)\b[^.;,]*/i) || [])[0] + '」');
  /* (d) 금지 낱말 */
  const avoid = B.find(b => /^Avoid: /.test(b)) || '', body = t.replace(avoid, '');
  const banHere = ctx.window.AtelierPrompt.splitNo(T.WORLDS.find(x => x.key === w).tail).avoid;
  const wantAvoid = banHere.filter(b => !CLOTH.test(b));
  for (const b of wantAvoid) assert(!word(b, 'i').test(body), id + ' (d) 금지 낱말 「' + b + '」 이 Avoid 밖에');
  assert.equal(avoid, wantAvoid.length ? 'Avoid: ' + wantAvoid.join(', ') + '.' : '', id + ' Avoid = 금지 낱말 − 옷 낱말');
  for (const b of banHere.filter(b => CLOTH.test(b))) assert(!word(b, 'i').test(avoid), id + ' 옷 낱말 「' + b + '」 은 Avoid 에 없다');
  /* (e) 길이 */
  const words = t.split(/\s+/).length; maxWords = Math.max(maxWords, words);
  assert(words <= 400, id + ' 400 낱말 이하 — ' + words);
  /* (f) 파일 이름 · 기록 바탕 */
  const file = P.vistaFile(nt.key, w, st);
  assert.equal(file, `${nt.key}_${w}_${st}_vista.webp`, id + ' 파일 이름');
  assert.equal(VISTA_RE.exec(file)[1], `${nt.key}_${w}_${st}`, id + ' 등록기 전경 꼴');
  const rec = P.vistaRecord(D, S, nt.key, w, { style: st });
  assert(rec.kind === 'vista' && rec.atelier === 'element' && rec.file === file && rec.prompt === t && rec.size.join('x') === '1536x1024' && rec.styleVersion === S.styles[st].current, id + ' 기록 바탕');
  n++;
}
/* 철 — 옷 거르기가 실제로 돈다(판타지 옷 줄의 corset · bustle · tailoring 은 빠지고 machinery 는 남는다), 곁 장소의 「behind her」 는 덜어 낸다 */
const ff = P.buildVista(D, S, 'fe', 'fantasy');
assert(/^Avoid: modern material, machinery\.$/m.test(ff) && /a river of molten iron glowing in a channel;/.test(ff), '철 판타지 — Avoid · 그녀 꼬리 덜기');
assert.equal(P.herCut('a hall where she waits, a gate; she stands, a road'), 'a gate', '첫 마디는 조각만, 뒤 마디는 통째로');
assert.equal(P.herCut('a pool that sinks away from her, sea foam at her feet'), 'a pool that sinks away, sea foam', '꼬리 마디(from her · at her feet)는 지운다');
/* (g) 가문 · 주민 · 없는 세계 */
assert.throws(() => P.buildVista(D, S, 'fe-steel', 'fantasy'), /nation keys only/, '가문주 카드에는 전경이 없다');
assert.throws(() => P.buildVista(D, S, 'fe-steel-sword', 'fantasy'), /nation keys only/, '주민 카드에는 전경이 없다');
assert.throws(() => P.buildVista(D, S, 'fe', 'cyberpunk'), /unknown world/, '없는 세계는 던진다');
const D2 = JSON.parse(JSON.stringify(D)); D2.nations.find(x => x.key === 'fe').worlds.mecha.en = '';
assert.equal(P.buildVista(D2, S, 'fe', 'mecha'), '', '세계 글이 빈 나라는 빈 글');
/* (h) 그린 글 = 조립기 글(그림 저장소가 옆에 있을 때) */
const recDir = path.join('..', 'element-atelier-img', 'records', 'fe');
let drawn = 0;
for (const w of D.vocab.worlds) {
  const f = path.join(recDir, `${w}-vista.${S.default}-api.json`); if (!fs.existsSync(f)) continue;
  const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  assert.equal(r.prompt, P.buildVista(D, S, 'fe', w), 'fe/' + w + ' 기록의 지시문 = 지금 조립기');
  assert.equal(r.file, `fe_${w}_${S.default}_vista.webp`, 'fe/' + w + ' 기록의 파일 이름');
  drawn++;
}
console.log(`PASS 전경 지시문: ${DESIGNED.length}개 나라 × 세계 × 화풍 ${LIVE.length} = ${n}장(가장 긴 것 ${maxWords} 낱말 · 그녀 마디 덜어 낸 세계 글 ${cut / LIVE.length}) · 머리 · 장소 · 색 · 화풍 · 아래 1/4 · 사람 · 글자 없음 · 3:2 · 날 열쇠 · 그녀 없음 · 금지 낱말 · 옷 낱말 · 가문 · 주민 · 없는 세계`
  + (drawn ? ` · 철 그린 글 ${drawn}장 = 조립기` : ' · (그림 저장소 기록 없음 — 그린 글 견주기 건너뜀)'));
