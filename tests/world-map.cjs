/* 원소 월드맵 배치표(data/world-map.json — 2026-11-24) — 검사기(tools/world-map.py check)가 진짜 표는 통과시키고 규칙마다 망가뜨린 사본은 잡는지,
   그리고 화면이 기대는 자료 꼴(설계표 나라 118 한 번씩 · 지역마다 나라 둘 이상 · 지도 자리 0~1 · 하늘 · 물밑 · 땅속 자리 셋).
   Run: node tests/world-map.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'), { spawnSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..'), TOOL = path.join(ROOT, 'tools', 'world-map.py');
const W = require('../data/world-map.json'), D = require('../data/element-design.json');
const run = file => { const r = spawnSync('python3', [TOOL, 'check', file], { encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };

/* 진짜 표 */
const real = run(path.join(ROOT, 'data', 'world-map.json'));
assert.equal(real.code, 0, '진짜 표가 걸린다:\n' + real.out); assert.match(real.out, /^PASS — 나라 118 · 지역 30 · 대륙 9 · 동맹 8 · 지도 fantasy/m);

/* 화면이 기대는 꼴 */
assert.equal(W.version, 1); assert(W.note && W.note.length > 20, 'note');
assert.deepEqual(Object.keys(W.nations).sort(), D.nations.map(n => n.key).sort(), '설계표 나라 한 번씩');
const per = {}; for (const v of Object.values(W.nations)) per[v.region] = (per[v.region] || 0) + 1;
for (const r of W.regions) assert(per[r.key] >= 2, r.key + ' 나라 둘 이상');
assert.deepEqual(W.continents.filter(c => c.layer !== 'surface').map(c => c.layer).sort(), ['sky', 'underground', 'undersea'], '자리 셋(하늘 · 물밑 · 땅속)');
const M = W.map.fantasy;
assert.equal(M.image, 'backgrounds/maps/world-map_fantasy_jp_paint_anime.webp'); assert.deepEqual(M.size, [1536, 1024]);
for (const c of W.continents) { const b = M.continents[c.key]; assert(b && b.x >= 0 && b.y >= 0 && b.x + b.w <= 1 && b.y + b.h <= 1, c.key + ' 상자'); assert(b.label, c.key + ' 이름 자리'); }
for (const r of W.regions) { const p = M.regions[r.key]; assert(p && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1, r.key + ' 점'); }
/* 같은 대륙 지역 점끼리 너무 붙지 않는다(대륙 판에서 이름 표가 겹치지 않게 — 그림 좌표로 0.05 이상) */
for (const c of W.continents.filter(c => c.layer === 'surface')) {
  const ps = W.regions.filter(r => r.continent === c.key).map(r => [r.key, M.regions[r.key]]);
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) assert(Math.hypot(ps[i][1].x - ps[j][1].x, (ps[i][1].y - ps[j][1].y) * 2 / 3) >= 0.05, ps[i][0] + ' · ' + ps[j][0] + ' 너무 붙음');
}

/* 망가뜨린 사본 — 규칙마다 */
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'world-map-'));
const broken = (name, mut, want) => {
  const d = JSON.parse(JSON.stringify(W)); mut(d);
  const f = path.join(dir, name + '.json'); fs.writeFileSync(f, JSON.stringify(d));
  const r = run(f); assert.equal(r.code, 1, name + ' — 걸려야 한다:\n' + r.out); assert(r.out.includes(want), name + ' — 「' + want + '」 이 없다:\n' + r.out);
};
const reg = (d, k) => d.regions.find(r => r.key === k);
broken('나라 빠짐', d => { delete d.nations.fe; for (const v of Object.values(d.nations)) v.neighbours = v.neighbours.filter(x => x !== 'fe'); }, '나라 차이');
broken('이웃 비대칭', d => { d.nations.fe.neighbours = d.nations.fe.neighbours.filter(x => x !== 'c'); }, '이웃 비대칭 c→fe');
broken('모르는 지역', d => { d.nations.fe.region = 'nowhere'; }, 'fe: 모르는 지역');
broken('나라 하나뿐인 지역', d => { const ks = Object.keys(d.nations).filter(k => d.nations[k].region === 'ug_kobold'); d.nations[ks[0]].region = 'ug_star'; }, '지역 ug_kobold: 나라 1');
broken('안 맞닿은 이웃', d => { d.nations.fe.neighbours.push('og'); d.nations.og.neighbours.push('fe'); }, '안 맞닿음');
broken('인접 비대칭', d => { reg(d, 'c_forge').adjacent.push('n_ice'); }, '지역 인접 비대칭 c_forge→n_ice');
broken('모르는 층', d => { d.continents[0].layer = 'moon'; }, '층');
broken('same_region', d => { d.alliances[0].same_region = !d.alliances[0].same_region; }, 'same_region 틀림');
broken('동맹 빠짐', d => { d.alliances.pop(); }, '동맹 목록 차이');
broken('동맹 나라', d => { d.alliances.find(a => a.family === 'steel').nations = ['fe']; }, '≠ 설계표 가문');
broken('동맹 셈', d => { d.alliance_summary.total = 9; }, 'alliance_summary');
broken('그림 이름', d => { d.map.fantasy.image = 'img/world.webp'; }, '그림 이름');
broken('모르는 세계', d => { d.map.moon = JSON.parse(JSON.stringify(d.map.fantasy)); }, 'map.moon: 모르는 세계');
broken('상자 밖', d => { d.map.fantasy.continents.ore_east.x = .8; }, '상자');
broken('지역 점 빠짐', d => { delete d.map.fantasy.regions.c_forge; }, '지역 차이');
broken('지역 점 상자 밖', d => { d.map.fantasy.regions.c_forge = { x: .95, y: .9 }; }, '지역 c_forge 점');
broken('이름 자리 밖', d => { d.map.fantasy.continents.heartland.label = [.9, .1]; }, '이름 자리');
broken('version', d => { d.version = '1'; }, 'version');
fs.rmSync(dir, { recursive: true, force: true });
console.log('PASS world-map: 진짜 표 통과 · 나라 118 · 지역마다 둘 이상 · 자리 셋 · 지도 자리 · 지역 점 간격 · 망가뜨린 사본 18');
