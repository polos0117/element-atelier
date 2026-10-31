/* 즐겨찾기 — lib/favorites.js 는 공방 모음(polos0117.github.io/favorites.js)과 글자 하나 다르지 않다. 옆에 받아 둔 공방 모음이 없으면 건너뛴다.
   Run: node tests/favorites.cjs */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const hub = path.join(__dirname, '..', '..', 'polos0117.github.io', 'favorites.js');
const mine = fs.readFileSync(path.join(__dirname, '..', 'lib', 'favorites.js'), 'utf8');
assert(/atelier_favorites_v1/.test(mine), '열쇠 atelier_favorites_v1');
if (!fs.existsSync(hub)) { console.log('(공방 모음 저장소가 옆에 없어 견주기를 건너뜀)'); process.exit(0); }
assert.equal(mine, fs.readFileSync(hub, 'utf8'), 'lib/favorites.js 가 공방 모음 favorites.js 와 다르다 — 원본을 그대로 복사할 것');
console.log('PASS 즐겨찾기: lib/favorites.js = 공방 모음 favorites.js');
