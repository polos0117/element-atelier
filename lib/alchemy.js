/* 원소 합성(2026-11-12 사용자 「Phaser — 그림으로 놀기 … 원소 둘을 붙여 물질 만들기 … 이것도 해볼까?」 → 「합성 + 수집」).
   설계표의 「같은 물질을 두 나라가 나눈다」 구조 그대로: 가문(물질)마다 elements(그 물질을 이루는 원소)가 있다.
   근본 원소를 하나 ~ 셋 골라 합성로에 넣으면, 그 원소 묶음과 elements 가 똑같은 가문이 나라마다 열린다
   (H + O → 수소의 물 · 산소의 물, Fe + O → 녹 · 피 넷). 한 원소만 넣으면 그 나라 혼자 가진 물질(자석 · 다이아몬드 …).
   모으는 것은 가문주 카드. 찾은 것은 이 기기에(element_alchemy_v1). 그림은 기본 화풍의 세계 그림(판타지 → 스팀펑크 → 메카), 없으면 다른 화풍.
   화면(alchemy.html, Phaser)과 node 검사(tests/alchemy.cjs)가 같이 쓴다 — 화면 말은 W(), 이 파일엔 자료와 규칙만. */
(function (root) {
  'use strict';
  var KEY = 'element_alchemy_v1', MAX = 3, WORLDS = ['fantasy', 'steampunk', 'mecha'];

  /* 그 카드의 그림 한 장 — 기본 화풍의 세계 그림 차례대로, 없으면 다른 화풍. 없으면 null */
  function picOf(img, styleDefault, key) {
    var e = img && img[key], by = e && e.byStyle;
    if (!by) return null;
    var styles = [styleDefault].concat(Object.keys(by).filter(function (s) { return s !== styleDefault; }));
    for (var i = 0; i < styles.length; i++) {
      var forms = by[styles[i]] && by[styles[i]].byForm;
      if (!forms) continue;
      for (var j = 0; j < WORLDS.length; j++) if (forms[WORLDS[j]] && forms[WORLDS[j]].f) return forms[WORLDS[j]].f;
    }
    return null;
  }
  var combo = function (keys) { return keys.slice().sort().join('+'); };

  /* 설계표 · 그림 표 → 원소 패(roots) · 모을 카드(lords) · 조합표(recipes: '원소+원소' → 카드 열쇠들) */
  function build(design, img, styleDefault) {
    var E = {};
    (design.elements || []).forEach(function (e) { E[e.key] = e; });
    var roots = [], lords = [], recipes = {};
    (design.nations || []).forEach(function (n) {
      var e = E[n.key] || {};
      roots.push({ key: n.key, symbol: e.symbol || n.key, ko: e.ko || n.key, en: e.en || '', number: e.number || 0, category: e.category || 'unknown', pic: picOf(img, styleDefault, n.key) });
      (n.families || []).forEach(function (f) {
        var els = (f.elements && f.elements.length ? f.elements : [n.key]).slice().sort(), key = n.key + '-' + f.key;
        lords.push({ key: key, nation: n.key, nationKo: e.ko || n.key, family: f.key, ko: f.ko, en: f.en || '', elements: els, pic: picOf(img, styleDefault, key) });
        (recipes[els.join('+')] = recipes[els.join('+')] || []).push(key);
      });
    });
    /* 패는 주기율표 번호 차례 */
    roots.sort(function (a, b) { return a.number - b.number; });
    /* 조합 안의 원소가 모두 나라로 있어야 만들 수 있다(염소 나라가 없던 때의 소금 같은 것은 빼지 않는다 — 지금은 다 있다) */
    var have = {};
    roots.forEach(function (r) { have[r.key] = 1; });
    Object.keys(recipes).forEach(function (k) { if (!k.split('+').every(function (x) { return have[x]; })) delete recipes[k]; });
    return { roots: roots, lords: lords, recipes: recipes, byKey: lords.reduce(function (m, l) { m[l.key] = l; return m; }, {}), rootByKey: roots.reduce(function (m, r) { m[r.key] = r; return m; }, {}) };
  }

  function blank() { return { found: [], tries: 0, hints: 0 }; }
  function load(store) {
    try { var s = JSON.parse((store || root.localStorage).getItem(KEY) || 'null'); if (s && Array.isArray(s.found)) return { found: s.found.filter(function (x) { return typeof x === 'string'; }), tries: +s.tries || 0, hints: +s.hints || 0 }; } catch (e) {}
    return blank();
  }
  /* 저장된 열쇠 가운데 지금 설계표에 있는 카드만 — 가문을 고치거나 지우면 옛 열쇠가 남아 「수집 25 / 24」 가 되던 것(2026-11-12 점검) */
  function tidy(game, state) { state.found = state.found.filter(function (k, i, a) { return game.byKey[k] && a.indexOf(k) === i; }); return state; }
  function save(state, store) { try { (store || root.localStorage).setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  /* 합성 — picks: 원소 열쇠 하나 ~ 셋(겹치지 않게). 돌려주는 것:
     { ok, lords: 열린 카드 열쇠들(이 조합의 전부), fresh: 이번에 처음 찾은 것, why: 'inert'(비활성 기체가 섞였다) · 'none'(아무 일 없음) · 'empty' } */
  function combine(game, state, picks) {
    var ks = (picks || []).filter(function (k, i, a) { return game.rootByKey[k] && a.indexOf(k) === i; }).slice(0, MAX);
    if (!ks.length) return { ok: false, lords: [], fresh: [], why: 'empty' };
    state.tries++;
    var hit = game.recipes[combo(ks)] || [];
    if (!hit.length) {
      var inert = ks.some(function (k) { return game.rootByKey[k].category === 'noble_gas'; });
      return { ok: false, lords: [], fresh: [], why: inert ? 'inert' : 'none' };
    }
    var fresh = hit.filter(function (k) { return state.found.indexOf(k) < 0; });
    state.found = state.found.concat(fresh);
    return { ok: true, lords: hit.slice(), fresh: fresh, why: '' };
  }

  /* 힌트 — 아직 못 찾은 조합 하나: 원소 몇 개, 그중 하나의 기호. 같은 조합을 거듭 고르지 않게 차례로 돈다 */
  function hint(game, state) {
    var left = Object.keys(game.recipes).filter(function (k) { return game.recipes[k].some(function (l) { return state.found.indexOf(l) < 0; }); }).sort();
    if (!left.length) return null;
    var k = left[state.hints % left.length], els = k.split('+'), one = els[state.hints % els.length];
    state.hints++;
    return { count: els.length, symbol: game.rootByKey[one].symbol, ko: game.rootByKey[one].ko, materials: game.recipes[k].map(function (l) { return game.byKey[l].ko; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).length };
  }

  var api = { KEY: KEY, MAX: MAX, build: build, combine: combine, hint: hint, load: load, save: save, tidy: tidy, blank: blank, picOf: picOf, combo: combo };
  root.AtelierAlchemy = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
