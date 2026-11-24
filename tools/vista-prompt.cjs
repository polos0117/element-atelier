#!/usr/bin/env node
/* 전경 지시문(2026-11-24 — city-atelier 의 전경을 옮김, 철 시험) — 나라 × 세계 풍경 한 장(사람 없음 · 글자 없음 · 3:2 1536×1024). 나라 층 궤도(lib/walk-orbit.js)의 배경.
   조립은 lib/prompt-element.js 의 buildVista 한 곳 — 이 도구는 그 글을 뽑아 보일 뿐이다(생성기 prompt.html 에는 아직 칸이 없다).

     node tools/vista-prompt.cjs <나라> [세계]            지시문(세계 하나면 지시문만 — 그대로 보낸다. 세계를 안 주면 설계된 세계 모두, 세계마다 ── 파일 이름 줄)
     node tools/vista-prompt.cjs <나라> <세계> --record    기록 바탕 JSON(그림 저장소 records/<나라>/<세계>-vista.<화풍>-api.json — 그린 뒤 generation 을 더한다)
     --style <화풍>                                         기본은 data/style.json 의 default

   올릴 파일 이름은 <나라>_<세계>_<화풍>_vista.webp(IMAGE_RULES.md 3절) — 등록기(tools/register-images.py)가 세계 몫의 vista 칸에 적는다. 나라(근본) 열쇠만 — 가문 · 주민에는 전경이 없다. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-element.js']) vm.runInContext(read(f), ctx);
const P = ctx.window.AtelierPrompt;
const D = JSON.parse(read('data/element-design.json')), S = JSON.parse(read('data/style.json'));

function main(argv) {
  const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
  const style = opt('style') || S['default'], [key, world] = argv.filter(a => !a.startsWith('--') && a !== opt('style'));
  const n = D.nations.find(x => x.key === key);
  if (!n) { console.error('나라 열쇠: ' + D.nations.map(x => x.key).join(' · ') + ' (가문 · 주민 카드에는 전경이 없다)'); return 2; }
  if (!S.styles[style]) { console.error('화풍 열쇠가 없다: ' + style); return 2; }
  const worlds = world ? [world] : D.vocab.worlds.filter(w => (n.worlds || {})[w]);
  if (!worlds.length || worlds.some(w => !(n.worlds || {})[w])) { console.error(key + ' — 설계 전(세계 ' + (world || '없음') + ')'); return 2; }
  if (argv.includes('--record')) {
    if (worlds.length !== 1) { console.error('--record 는 세계 하나'); return 2; }
    console.log(JSON.stringify(P.vistaRecord(D, S, key, worlds[0], { style }), null, 1)); return 0;
  }
  /* 세계 하나면 지시문만(그대로 그림 API 에 보낸다 — 도시 공방 대전 전경 때 머리줄이 지시문에 섞여 갔다), 여럿이면 세계마다 ── 파일 이름 줄 */
  console.log(worlds.length === 1 ? P.buildVista(D, S, key, worlds[0], { style }) : worlds.map(w => '── ' + P.vistaFile(key, w, style) + '\n' + P.buildVista(D, S, key, w, { style })).join('\n\n'));
  return 0;
}
if (require.main === module) process.exitCode = main(process.argv.slice(2));
module.exports = { main };
