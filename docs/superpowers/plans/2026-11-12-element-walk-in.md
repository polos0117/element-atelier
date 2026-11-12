# 원소 공방 「들어가는 곳」 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 탭 머리(`WorkspaceHeader`)로 넘기던 원소 공방을, 주기율표 → 나라(궤도 · 목록) → 가문 → 한 장으로 확대해 들어가는 한 화면(`index.html`)과 구석의 도구 상자로 바꾼다.

**Architecture:** `index.html` 하나가 껍데기다. 주소 쿼리가 층을 정하고(`lib/walk-core.js` — 순수 함수, node 로도 돈다), 층마다 Preact 모듈 하나(`lib/walk-*.js`)가 그린다. 아래로 들어가면 `pushState`, 옆으로(세계 · 화풍 · 보기 · 앞뒤 나라 · 그림 넘기기) 바꾸면 `replaceState` — 뒤로 가기는 늘 한 층 위. 옛 `hall.html` · `gallery.html` · `dex.html` 은 `legacyURL()` 로 새 주소에 `location.replace` 하는 껍데기만 남는다. 효과는 `lib/walk-fx.js` 한 곳에서 움직임 줄이기 · WebGL 을 보고 켜고, PixiJS 는 함수 안에서만 늦게 불러온다.

**Tech Stack:** 정적 HTML(GitHub Pages, 빌드 없음) · Preact 10.24.3(esm.sh) · `lib/motion-fx.js`(Motion 작은 판) · PixiJS 8.19.0(`lib/holo.js` 의 `PIXI_URL`) · 검사는 node 22 + playwright(브라우저) / node(순수 함수).

**Spec:** `docs/superpowers/specs/2026-11-12-element-walk-in-design.md` — 「검토에서 나온 물음」 1–7 과 「효과 다섯」 까지 이 계획이 따른다. 둘이 갈리면 설계가 이긴다.

---

## 파일 지도

| 파일 | 맡는 일 | 만드는 과제 |
|---|---|---|
| `lib/walk-core.js` | 순수 함수 — 주소 읽기/쓰기 · 층 · 부모/조상 · 검증 · 기억값 채우기 · 옛 주소 · 나라 차례 · 가까운 칸 · 입자 종류/수. 고전 스크립트(`window.AtelierWalk` + `module.exports`, `lib/patch.js` 와 같은 꼴) | 1 (3 · 4 · 5 가 더함) |
| `lib/walk-data.js` | 설계표 · 화풍 · 등록부 읽기, 카드 목록, 그림 고르기(ESM, `window.AtelierImg` 사용) | 1 (4 · 6 이 더함) |
| `lib/walk-fx.js` | 효과 문 — `fx()` 기록 · 누른 자리 넘기기 · 불꽃 · 입자 · 세계 전환. PixiJS 는 함수 안 `import()` 로만 | 3 (4 · 5 · 9 가 더함) |
| `lib/walk.js` | 껍데기 앱 — 문서 읽기 · 주소 ↔ 상태 · 역사 씨앗 · 위 막대 · 층 고르기 · 자연 배경 자리 | 1 |
| `lib/walk-table.js` | 주기율표 층 + 나라 카드 + 범례 | 3 |
| `lib/walk-orbit.js` | 궤도 층 + `ModeSwitch` + `EmptyArt` | 4 |
| `lib/walk-list.js` | 목록 층(옛 도감 몸통) | 6 |
| `lib/walk-family.js` | 가문 층 | 7 |
| `lib/walk-card.js` | 한 장 층(옛 도감 크게 보기 + 전시관 글 판) | 6 (8 이 키움) |
| `lib/toolbox.js` · `lib/toolbox.css` | 도구 상자 단추 · 판, 도구 화면의 가는 막대 | 2 |
| `lib/walk.css` | 새 층들의 어두운 겉모습 | 1 (층마다 더함) |
| `index.html` | 껍데기(타이틀 화면을 갈아치움) | 1 |
| `hall.html` · `dex.html` · `gallery.html` | 옛 주소 → 새 주소 넘김 껍데기 | 3 · 6 · 8 |
| `alchemy.html` · `styles.html` · `prompt.html` | 머리를 `ToolBar` 로 | 2 |
| `tests/lib/harness.cjs` | 브라우저 검사 공용 손(서버 · 경로 가로채기 · 넘침 · 사진) | 1 |
| `tests/walk-*.cjs` | 과제마다 하나 | 각 과제 |

지우는 것: `lib/gallery.css`(8), `lib/workspace-ui.js` 의 안 쓰는 몫 또는 파일 통째(10).

## Global Constraints

- **움직임 끄기 설정(계획 뒤에 더함 — 사용자 요청, 이 줄이 계획의 다른 「prefers-reduced-motion 만」 서술을 이긴다):** 움직임 판단은 한 곳 — `lib/walk-core.js` 의 `motionOn()`(= 기기 `prefers-reduced-motion` 이 아니고 `localStorage.element_motion_v1 !== 'off'`)과 `setMotion(on)`(저장 + `window` 에 `element-motion` 사건). 효과 ①~⑤ · 층 사이 확대/날아오기 · 세계 전환이 모두 `motionOn()` 을 본다. 도구 상자 설정에 「움직임」 켜기/끄기 단추(낱말 `tool.motion` · `tool.motion.on` · `tool.motion.off`, `aria-pressed`) — Task 2 가 만든다. 검사: 끄면 Task 5 · 9 의 Pixi 캔버스/전환 덮개가 안 생기고 새로고침 뒤에도 유지.
- 커밋 메시지 끝 줄: `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`

- **기기:** 폴드 덮개 344×882 터치가 1순위. 누르는 자리 44×44 이상(주기율표 칸만 예외 — 칸 → 큰 나라 카드 두 단계). 344 · 1280 에서 `document.documentElement.scrollWidth <= innerWidth + 1`.
- **말:** 화면 말은 전부 `lib/words.js`(`W('…')`). html/js 에는 주석과 `<title>원소의 공방</title>` 말고 한글이 없다 — `node tests/words.cjs`. 외래어 대신 한국어.
- **사실:** 번호 · 기호 · 이름 · 분류 · 상태는 설계표 `elements` 의 것만(AGENTS 3). 나라 카드에 「대장장이의 나라」 같은 별칭 칸은 없다 — `nation.persona` 를 그대로 쓴다.
- **건드리지 않는 파일:** `lib/casual-tree.js` · `lib/casual-tree-v2.js` · `lib/favorites.js` · `lib/motion-fx.js` · `lib/vendor/` · `lib/holo.js`(pkm 과 같이 쓰는 파일 — 가져다 쓰기만).
- **그림:** 그림 저장소에서만. 궤도 그림 `https://polos0117.github.io/element-atelier-img/backgrounds/orbits/orbit-<나라>.webp`, 큰 고리 반지름(너비 대비) `RING = {fe:.43, h:.407, o:.419, c:.398, na:.43, au:.428, og:.405}`, 없는 나라는 `.41` 로 코드가 그린 점선 고리.
- **PixiJS:** URL 은 `lib/holo.js` 의 `PIXI_URL`(`pixi.js@8.19.0`) 하나. 불러오는 곳은 궤도 층 입자(②) · 세계 전환(③) · 한 장의 홀로(지금 그대로)뿐. 주기율표 · 목록 · 가문 층을 열기만 해서는 요청 0.
- **움직임:** `prefers-reduced-motion: reduce` 면 효과 다섯(①–⑤) 모두 안 하고 바로 바뀐다. 이 저장소에 따로 된 「움직임 끄기」 설정은 없다 — 새로 만들지 않는다. WebGL 이 없거나 PixiJS 를 못 받으면 Pixi 효과는 오류 없이 빠진다(콘솔 오류 0).
- **겉모습:** 새 층(주기율표 · 궤도 · 목록 · 가문 · 한 장)은 어두운 바탕 `#07080c`, `lib/material.css` 의 `--frame` · `--ui-*` 를 쓰지 않는다(`index.html` 이 `material.css` · `room.css` 를 싣지 않는다). 강조색은 공간의 `var(--accent)`(`lib/workspace.css`) 하나만 물든다. 도구 화면(합성 · 화풍 · 프롬프트)은 머리만 바뀌고 나머지 겉모습 그대로.
- **분류 색:** 열 분류(`alkali alkaline_earth transition post_transition metalloid nonmetal halogen noble_gas lanthanide actinide`)의 색은 `lib/walk.css` 의 `.walk [data-cat="…"] {--cat:…}` 한 곳 — 주기율표 칸 · 나라 카드 · 범례가 같이 쓴다.
- **기록:** 커밋마다 `docs/PATCH.md` 맨 위에 한 칸(`## 2026-11-12 · claude · …` + `- 파일 — 왜` 줄, `node tests/patch.cjs`). 공유 파일을 고치면 그 파일을 싣는 모든 화면의 `?v=` 를 지금 가장 큰 수 +1 로(예: `grep -n "words.js?v=" *.html`). 새 파일은 `?v=1`.
- **검사는 바꾼 만큼만**(CLAUDE.md). 과제마다 「돌릴 것」 만 돌린다. 마지막 과제만 전체.
- **커밋:** 과제마다 작업 브랜치에 한 커밋, 한국어 메시지, 끝 줄 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. push 는 묶는 쪽(실행 세션)이 `git pull --rebase` 뒤에.

### 검사 돌리는 법(Git Bash)

처음 한 번 — preact · pixi · phaser 사본(`ESM_DIR`):

```bash
npm install --no-save --prefix "$HOME/.cache/element-esm" preact@10.24.3 pixi.js@8.19.0 phaser@4.2.1
```

그 뒤:

```bash
cd <worktree>
export NODE_PATH=/c/Users/jjshs/atelier/node_modules ESM_DIR="$HOME/.cache/element-esm/node_modules"   # CHROMIUM_PATH 는 사용자 환경에 이미 있다
fnm exec --using=22 node tests/walk-core.cjs
fnm exec --using=22 node tests/walk-shell.cjs
```

통과하면 마지막 줄이 `PASS <이름>: …` 이다. 궤도의 `.w-node` 는 과제 5 부터 돈다 — Playwright 의 「멈춤」 검사를 못 넘으니 노드 누르기는 처음(과제 4)부터 `click({ force: true })` 로 쓴다.

## 공유 약속(과제들이 서로 기대는 이름)

**주소 쿼리(`index.html`)** — 쓰는 차례도 이대로: `n` 나라 열쇠 · `mode` `orbit|list` · `f` 가문 열쇠 · `card` 카드 열쇠 · `pic` 그림 파일 · `at` 목록에서 내려갈 카드 열쇠 · `w` `fantasy|steampunk|mecha|all` · `st` 화풍 열쇠 · `view` `world|casual|all`(목록의 보기).
- 비어 있으면 뺀다. `w` 가 없으면 「전부」(`all`) 와 같다. 목록이 아닌 층은 `worldOf()` 로 그림 세계를 정한다(`all` → `vocab.worlds[0]` = `fantasy`, 고르개도 `fantasy` 가 눌림).
- **전역 값** `GLOBALS = ['mode','w','st','view']` — 뒤로 가기(`popstate`)에도 지금 값이 남고, 주소는 `replaceState` 로 바로잡는다(「세계는 하나의 상태」).

**층** `layerOf(route)`: `card`(n · card 있음) › `family`(n · f) › `list`(n · mode=list) › `orbit`(n) › `table`. 한 장은 부모 층 **위에** 겹쳐 그린다(부모는 붙은 채 `inert` — 스크롤 자리 유지).

**역사:** 내려가기 · 길 표시 · 같은 물질 다른 나라 = `push`, 옆으로(세계 · 화풍 · 보기 · 궤도/목록 · ‹ › · 한 장 넘기기) = `replace`. 처음 열 때 `ancestors(route)` 로 씨앗(첫 칸 `replaceState({walk:0})`, 나머지 `pushState({walk:1})`). 닫기(`back()`)는 `history.state?.walk` 면 `history.back()`, 아니면 `go(parentOf(route), {replace:true})`.

**기기 기억:** `localStorage['element_dex_v1'] = {mode, w, st, view}`(옛 도감 열쇠를 그대로 넓힘) · `sessionStorage['element_walk_last']` = 껍데기의 마지막 `location.search`(도구 막대 「← 돌아가기」) · 즐겨찾기 `atelier_favorites_v1`(공용 모듈) · 홀로 `atelier_holo_v1`(그대로).

**효과 기록(검사 손잡이):** `window.AtelierWalkFx = {fired: string[], particles: null | {kind, count, running}}` — 효과가 **실제로 돈** 때만 `fired` 에 `'spark' | 'enter' | 'family' | 'shift:<world>'` 를 더한다.

**DOM(검사가 잡는 이름):** `html[data-layer]` · `header.w-bar` · `nav.w-crumbs button` · `.w-worlds button[data-w][aria-pressed]` · `[data-step="prev"|"next"]` · `.w-scenery` · `section.w-layer[data-layer]` · `button.tb-open` · `.tb-sheet[role=dialog]` · `[data-tool]` · `.tb-backdrop` · `header.tb-bar a.tb-back` · `h1.tb-name` · `.w-table .pcell(.on[data-n])` · `.w-legend [data-cat]` · `.w-ncard[data-n] [data-act="enter"|"list"]` · `.w-spark` · `.w-stage` · `img.w-orbit-img` · `.w-ring-line` · `.w-ring-dash` · `.w-orbit-ring` · `.w-nucleus(.empty)` · `.w-node[data-f](.empty)` · `.w-mode button[data-mode]` · `canvas.w-particles` · `.w-hero(.empty)` · `.w-cit[data-c](.empty)` · `.w-shared button[data-n]` · `.lightbox.w-card` (안의 `.lb-top` `.lb-stage img` `.lb-nav.prev/.next` `.lb-n` `.bar` `#dex-holo` `#dex-fav` `.lb-ghost` `.w-lore`) · `.w-shift[data-to]`. 목록은 옛 도감 이름 그대로(`.dex-toc` `.toc-row` `.toc-jump` `#dex-style` `[data-view]` `#c-<카드>` `.worlds.main .slot` `a.slot`).

## Review Focus

설계가 말하지 않았지만 실제로 쓰다 걸릴 다섯 — 각각 맡은 과제의 검사가 붙든다.

1. **목록 깊이에서 그림을 열었다 닫으면 제자리.** 철 목록을 한참 내려 주민 그림을 열고 뒤로 가기 → 같은 스크롤 자리(±2px). 처음으로 튀면 「빈 칸 채우기」가 지금보다 힘들어진다. → 과제 6 `list scroll kept`.
2. **바깥에서 깊이 들어온 주소의 뒤로 가기.** 즐겨찾기 link · 옛 `dex.html?…&card=&pic=` · 옛 `gallery.html?…&v=1` 로 들어와 뒤로 가기 → 한 장 → 목록/가문 → 나라 → 주기율표 순서로 올라간 뒤에야 공방을 나간다. → 과제 1 `deep URL back steps up`, 과제 6 `old favorite back`, 과제 8 `old gallery back`.
3. **낡은 열쇠.** 주소나 기기 기억에 없는 나라 · 지운 가문 · 다른 나라 카드 · 모르는 `mode`/`w`/`st` → 빈 화면 없이 가장 가까운 맞는 층. → 과제 1 `validate` · `stale keys`.
4. **효과 도는 중 두 번 누르기.** 「들어가기」 두 번 · 세계를 빠르게 세 번 → 역사 한 칸만 늘고, 덮개는 하나뿐이며 누르기를 막지 않고(pointer-events none), 마지막 고른 세계로 끝난다. → 과제 3 `double enter`, 과제 9 `rapid shifts`.
5. **망이 나쁠 때.** PixiJS CDN 실패 · 궤도 그림 404 → 오류 없이 Pixi 효과만 빠지고, 궤도는 점선 고리로 그대로 보인다. → 과제 4 `orbit image fails`, 과제 5 `pixi blocked`.

---

### Task 1: 순수 주소 모듈 · 한 화면 껍데기 · 검사 손

**Files:**
- Create: `lib/walk-core.js`, `lib/walk-data.js`, `lib/walk.js`, `lib/walk.css`, `tests/walk-core.cjs`, `tests/lib/harness.cjs`, `tests/walk-shell.cjs`
- Modify: `index.html`(타이틀 화면을 껍데기로 통째 갈아치움), `lib/words.js`, 그것을 싣는 화면들의 `?v=`, `tests/screen.cjs`(타이틀 블록 지움 — 58–69줄 「타이틀(2026-11-02)」 묶음과 끝 PASS 줄의 그 몫), `docs/PATCH.md`

**Interfaces:**
- Consumes: 없음(첫 과제). `window.AtelierImg`(`lib/img.js`), `window.AtelierAppearance`(`lib/workspace-theme.js`), `window.W`.
- Produces:
  - `lib/walk-core.js` → `window.AtelierWalk` / `module.exports`:
    - `type Route = {n,mode,f,card,pic,at,w,st,view}` (모두 문자열, 없으면 `''`); `EMPTY: Route`; `GLOBALS = ['mode','w','st','view']`
    - `readRoute(search: string): Route` — 위 아홉 열쇠만 읽는다
    - `routeSearch(route: Route): string` — `''` 또는 `'?'` + 위 차례
    - `layerOf(route): 'table'|'orbit'|'list'|'family'|'card'`
    - `parentOf(route): Route|null` — card → card · pic 지움 / family → f 지움 / orbit · list → `w` · `st` · `view` 만 남김 / table → null
    - `ancestors(route): Route[]` — 주기율표가 맨 앞, route 가 맨 끝
    - `resolve(route, pref: {mode?,w?,st?,view?}): Route` — 빈 전역 값만 기억값으로 채운다(mode 는 n 이 있을 때만). 맞는 값인지는 보지 않는다 — 뒤의 `validate` 가 본다
    - `validate(route, doc: {d, s}): Route` — 없는 n → n · mode · f · card · pic · at 지움 / 그 나라에 없는 f → f 지움 / 그 나라 카드가 아닌 card → card · pic 지움 / 없는 at 지움 / `mode ∉ {orbit,list}` → `''` / `w ∉ vocab.worlds ∪ {all}` → `''` / `st ∉ s.styles` → `''` / `view ∉ {world,casual,all}` → `''` / n 이 없으면 mode `''`, n 이 있는데 mode 가 비면 `'orbit'`. 나라 카드 열쇠 = `n`, `n-f`, `n-f-c`. 껍데기의 차례는 늘 `validate(resolve(readRoute(search), pref), doc)`
    - `legacyURL(pathname: string, search: string): string` — 끝 파일 이름으로 가른다. `hall.html` → `'index.html'`. `gallery.html` → n · f · w 그대로, n 이 있으면 `mode=orbit`, `v=1` 이고 `c` 면 `card=c`(n 이 없으면 c 의 첫 `-` 앞). `dex.html` → n = `nation` ‖ `n` ‖ card 앞머리, 없으면 `'index.html'`; `mode=list`; view · w · st 그대로; card 와 pic 이 둘 다면 card · pic, card 만이면 `at=card`. 그 밖 → `'index.html'`. 결과는 `'index.html' + routeSearch(…)`
    - `worldOf(route, worlds: string[]): string`
  - `lib/walk-data.js`: `loadDocs(): Promise<{d, s, img} | {failed: true}>`(`gallery.html` 의 `useDocs` 안 Promise 를 그대로 — 설계표 · `data/style.json` · `IMG.DATA`, `setShards` · `setAdded`)
  - `lib/walk.js`: `App` — 상태 `route`(resolve · validate 거친 것), `go(patch: Partial<Route>, opt?: {replace?: boolean})` — 주소를 바로(같은 틱에) 쓰고, **새 주소가 지금 주소와 같으면 아무것도 안 한다**(두 번 눌러도 역사 한 칸), `back()`. 층 컴포넌트는 `{doc, route, go, back}` 를 받는다. `LAYERS = {table, orbit, list, family, card}` — 이 과제에선 다섯 다 `h('section', {class:'w-layer', 'data-layer': name})` 빈 자리. `document.documentElement.dataset.layer = layerOf(route)`, `dataset.world = worldOf(route, worlds)`. 바뀔 때마다 `sessionStorage['element_walk_last'] = location.search`, `localStorage['element_dex_v1'] = {mode, w, st, view}`(try/catch). `history.scrollRestoration = 'manual'`; push 할 때 `scrollTo(0,0)` — 단 `card` 층으로 들어갈 때는 하지 않는다(부모 층이 그대로 아래 있다).
  - 위 막대 `Bar({doc, route, go})`: `nav.w-crumbs` — 「주기율표」(`W('walk.table')`) · 나라면 `` `${el.ko} ${el.symbol}` `` · 가문이면 `W('walk.family',{family:f.ko})` · 한 장이면 카드 이름. 누르면 그 층으로 `go` (push). `.w-worlds` — `vocab.worlds` 셋(목록 층의 「전부」는 과제 6). 누르면 `go({w}, {replace:true})`. 오른쪽 끝에 도구 상자 자리(과제 2 가 채움).
  - `.w-scenery` — 화면 아래 세계 · 테마 배경 자리(지금은 `html[data-world]` 마다 다른 색 그라데이션 한 겹, `aria-hidden`, pointer-events none).
  - `tests/lib/harness.cjs`: `COVER = {width:344, height:882}`, `WIDE = {width:1280, height:900}`, `serve(): Promise<{base, close()}>`(빈 자리 포트), `launch(): Promise<Browser>`, `open(browser, base, url, opt?: {viewport=COVER, reduced=false, noWebGL=false, blockPixi=false, failURL?: RegExp, pref?: object, slowImg=0}): Promise<{ctx, page, errors, requests}>`, `noOverflow(page): Promise<boolean>`, `shot(page, name)`(환경 `SHOT_DIR` 이 있을 때만 PNG). `open` 은 `tests/screen.cjs` 8–40줄의 서버 · 경로 가로채기를 옮긴 것에 더해: 바깥 `.webp/.png` → 은빛 SVG(`Access-Control-Allow-Origin: *`, `tests/dex-holo.cjs` 의 `SVG`), `ESM_DIR` 표에 `pixi.js/dist/pixi.min.mjs` · `phaser/dist/phaser.esm.min.js` 더함, `blockPixi` 면 pixi 요청 abort, `failURL` 맞으면 404, `noWebGL` 면 `addInitScript` 로 `HTMLCanvasElement.prototype.getContext` 가 `webgl` · `webgl2` · `experimental-webgl` 에 `null`, `pref` 면 `addInitScript` 로 `localStorage['element_dex_v1']`(그 맥락의 첫 문서에서만 — 뒤 문서에서 껍데기가 쓴 기억값을 덮지 않게), `requests` 는 요청 URL 전부, `errors` 는 pageerror + 망 실패가 아닌 console.error.
  - 낱말: `'walk.table':'주기율표'`, `'walk.crumbs':'지금 자리'`, `'walk.world':'세계'`, `'walk.family':'{family} 가문'`, `'walk.loading':'공방을 여는 중'`, `'walk.fail':'설계표를 읽지 못했다 — data/element-design.json'`.

- [ ] **Step 1: 순수 함수 검사를 쓴다** — `tests/walk-core.cjs`(`require('../lib/walk-core.js')`, 설계표 · 화풍 판은 `data/*.json` 을 읽는다)

```js
const R = require('../lib/walk-core.js'), D = require('../data/element-design.json'), S = require('../data/style.json');
const doc = { d: D, s: S }, r = s => R.readRoute(s);
// 읽고 쓰기 — 차례 고정, 빈 값 뺌, 모르는 열쇠 버림
assert.equal(R.routeSearch(r('?w=mecha&zz=1&n=fe&card=fe-steel&f=steel')), '?n=fe&f=steel&card=fe-steel&w=mecha');
assert.equal(R.routeSearch(R.EMPTY), '');
// 층
assert.equal(R.layerOf(r('')), 'table'); assert.equal(R.layerOf(r('?n=fe')), 'orbit');
assert.equal(R.layerOf(r('?n=fe&mode=list')), 'list'); assert.equal(R.layerOf(r('?n=fe&f=steel')), 'family');
assert.equal(R.layerOf(r('?n=fe&mode=list&card=fe&pic=a.webp')), 'card');
// 부모 · 조상 — 전역 값은 따라간다
assert.equal(R.routeSearch(R.parentOf(r('?n=fe&f=steel&card=fe-steel&pic=a.webp&w=mecha'))), '?n=fe&f=steel&w=mecha');
assert.equal(R.routeSearch(R.parentOf(r('?n=fe&mode=list&w=mecha&view=casual'))), '?w=mecha&view=casual');
assert.equal(R.parentOf(r('')), null);
assert.deepEqual(R.ancestors(r('?n=fe&f=steel&card=fe-steel')).map(R.layerOf), ['table', 'orbit', 'family', 'card']);
// 기억값 채우기
assert.equal(R.resolve(r('?n=fe'), { mode: 'list' }).mode, 'list'); assert.equal(R.resolve(r('?n=fe'), {}).mode, '');
assert.equal(R.resolve(r(''), { mode: 'list' }).mode, ''); assert.equal(R.resolve(r('?w=mecha'), { w: 'fantasy' }).w, 'mecha');
// 검증(Review Focus 3)
const v = s => R.routeSearch(R.validate(r(s), doc));
assert.equal(v('?n=zz&f=steel&w=mecha'), '?w=mecha');
assert.equal(v('?n=fe&f=nope'), '?n=fe&mode=orbit'); assert.equal(v('?n=fe&card=h-water&pic=x.webp'), '?n=fe&mode=orbit');
assert.equal(v('?n=fe&mode=weird&w=moon&st=nope&view=odd&at=fe-zz'), '?n=fe&mode=orbit');
assert.equal(v('?mode=list'), '');
assert.equal(v('?n=fe&mode=list&f=steel&card=fe-steel-sword&w=all&st=' + S.default), '?n=fe&mode=list&f=steel&card=fe-steel-sword&w=all&st=' + S.default);
// 옛 주소 — 셋
assert.equal(R.legacyURL('/element-atelier/hall.html', '?x=1'), 'index.html');
assert.equal(R.legacyURL('/gallery.html', ''), 'index.html');
assert.equal(R.legacyURL('/gallery.html', '?n=h&f=water&w=mecha'), 'index.html?n=h&mode=orbit&f=water&w=mecha');
assert.equal(R.legacyURL('/gallery.html', '?n=h&f=water&c=h-water-bottle&w=mecha&v=1'), 'index.html?n=h&mode=orbit&f=water&card=h-water-bottle&w=mecha');
assert.equal(R.legacyURL('/dex.html', ''), 'index.html');
assert.equal(R.legacyURL('/dex.html', '?nation=fe&card=fe&pic=fe_a.webp&st=game_keyart'), 'index.html?n=fe&mode=list&card=fe&pic=fe_a.webp&st=game_keyart');
assert.equal(R.legacyURL('/dex.html', '?nation=fe&card=fe-steel'), 'index.html?n=fe&mode=list&at=fe-steel');
assert.equal(R.legacyURL('/dex.html', '?card=h-water-bottle&pic=b.webp'), 'index.html?n=h&mode=list&card=h-water-bottle&pic=b.webp');
assert.equal(R.legacyURL('/dex.html', '?nation=fe&view=casual&w=mecha'), 'index.html?n=fe&mode=list&w=mecha&view=casual');
// 세계
assert.equal(R.worldOf(r('?w=all'), D.vocab.worlds), 'fantasy'); assert.equal(R.worldOf(r('?w=mecha'), D.vocab.worlds), 'mecha');
console.log('PASS walk-core: …');
```

- [ ] **Step 2: 돌려 실패를 본다** — `fnm exec --using=22 node tests/walk-core.cjs` → `Cannot find module '../lib/walk-core.js'`.

- [ ] **Step 3: `lib/walk-core.js` 를 쓴다** — 위 Interfaces 그대로. 고전 스크립트 꼴은 `lib/patch.js` 를 따른다(`(function(root){…; if (typeof module==='object') module.exports=API; else root.AtelierWalk=API;})(this)`). DOM · 저장소 손대지 않는다.

- [ ] **Step 4: 돌려 통과를 본다** — 같은 명령 → `PASS walk-core: …`.

- [ ] **Step 5: 껍데기 브라우저 검사를 쓴다** — `tests/lib/harness.cjs` 를 Interfaces 대로 만들고, `tests/walk-shell.cjs`:

```js
// 덮개(COVER)
let { page: p, errors } = await open(br, base, '/index.html');
await p.waitForSelector('header.w-bar');
assert.equal(await p.evaluate(() => document.documentElement.dataset.layer), 'table');
assert.equal(await p.locator('.workspace-nav, .menu-btn, .title-plaque').count(), 0, '탭 줄 · 타이틀 단추 없음');
assert.equal(await p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(7, 8, 12)');
assert.equal(await p.locator('.w-scenery').count(), 1);
assert.deepEqual(await p.locator('.w-worlds button').evaluateAll(b => b.map(x => x.dataset.w)), ['fantasy', 'steampunk', 'mecha']);
// deep URL back steps up(Review Focus 2) — 씨앗이 층마다 한 칸
await p.goto(base + '/index.html?n=fe&f=steel&card=fe-steel');
await p.waitForFunction(() => document.documentElement.dataset.layer === 'card');
for (const [layer, search] of [['family', '?n=fe&mode=orbit&f=steel'], ['orbit', '?n=fe&mode=orbit'], ['table', '']]) {
  await p.goBack(); await p.waitForFunction(l => document.documentElement.dataset.layer === l, layer);
  assert.equal(new URL(p.url()).pathname, '/index.html'); assert.equal(new URL(p.url()).search, search);
}
// stale keys(Review Focus 3) — 빈 화면 없이, 주소도 바로잡힌다
for (const [u, layer, search] of [['?n=zz', 'table', ''], ['?n=fe&f=nope', 'orbit', '?n=fe&mode=orbit'], ['?n=fe&card=h-water', 'orbit', '?n=fe&mode=orbit'], ['?n=fe&mode=weird', 'orbit', '?n=fe&mode=orbit']]) {
  await p.goto(base + '/index.html' + u); await p.waitForFunction(l => document.documentElement.dataset.layer === l, layer);
  assert.equal(new URL(p.url()).search, search, u);
}
// 기억된 보기 — 다음에 들어오면 그 보기로, 엉뚱한 기억값은 궤도
({ page: p } = await open(br, base, '/index.html?n=fe', { pref: { mode: 'list' } }));
await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
({ page: p } = await open(br, base, '/index.html?n=fe', { pref: { mode: 'garbage' } }));
await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
// 세계는 하나의 상태 — 뒤로 가도 남는다, 옆으로 바꾸기는 역사를 늘리지 않는다
await p.goto(base + '/index.html?n=fe&f=steel'); await p.waitForSelector('.w-worlds');
const len = await p.evaluate(() => history.length);
await p.click('.w-worlds [data-w="mecha"]');
assert.equal(await p.evaluate(() => history.length), len); assert.match(p.url(), /w=mecha/);
await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
assert.equal(await p.getAttribute('.w-worlds [data-w="mecha"]', 'aria-pressed'), 'true'); assert.match(p.url(), /w=mecha/);
// 길 표시
await p.goto(base + '/index.html?n=fe&f=steel'); await p.waitForSelector('.w-crumbs button');
assert.deepEqual(await p.locator('.w-crumbs button').allTextContents(), ['주기율표', '철 Fe', '강철 가문']);
await p.click('.w-crumbs button >> nth=0'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
assert.equal(await p.evaluate(() => sessionStorage.getItem('element_walk_last')), await p.evaluate(() => location.search));
assert(await noOverflow(p)); assert.deepEqual(errors, []);
// WIDE — 열고 넘침 · 오류만
```

`PASS walk-shell: …` 로 끝낸다. 마지막 화면마다 `shot(p, 'shell-table')`.

- [ ] **Step 6: 돌려 실패를 본다** — `fnm exec --using=22 node tests/walk-shell.cjs` → `header.w-bar` 를 기다리다 시간 초과(지금 `index.html` 은 타이틀).

- [ ] **Step 7: 껍데기를 쓴다**
  - `index.html`: `<title>원소의 공방</title>`, `<meta name="theme-color" content="#07080c">`, 지금 머리의 공방 지도 페이드 줄(`@view-transition` · `pageswap`) · 글꼴 줄은 그대로, `lib/workspace.css` · `lib/workspace-theme.js` · `lib/words.js` · `lib/img.js` · `lib/fresh.js` · `lib/favorites.js` · `lib/walk-core.js?v=1` · `lib/walk.css?v=1`, `<body class="walk"><div id="app"></div>`, 모듈은 `import {App} from './lib/walk.js?v=1'` 을 그리고 `AtelierFresh.watch()`. `room.css` · `material.css` 는 싣지 않는다.
  - `lib/walk.js`: Interfaces 대로. 처음 그릴 때 한 번 — `resolve(readRoute(location.search), pref)` → (문서가 오면) `validate` → 주소가 달라졌으면 `replaceState` → `ancestors` 로 씨앗. `popstate` — `readRoute` 의 GLOBALS 아닌 열쇠 + 지금 GLOBALS → `validate` → 주소가 다르면 `replaceState`.
  - `lib/walk.css`: `.walk {--w-bg:#07080c; …}` 어두운 바탕 · 막대 · 길 표시 · 세계 고르개(44px) · `.w-scenery`. 막대의 꼴은 `lib/gallery.css` 의 `.g-bar` · `.g-crumbs` · `.g-worlds` 를 옮겨 이름만 바꿔 써도 된다(그 파일은 아직 지우지 않는다).
  - `lib/words.js` 에 낱말 여섯, 그 파일을 싣는 화면의 `?v=` 올림.
  - `tests/screen.cjs` 에서 타이틀 묶음을 지운다(그 화면이 없어졌다 — 같은 몫은 `walk-shell.cjs` 가 본다).

- [ ] **Step 8: 돌려 통과를 본다** — `walk-core.cjs` · `walk-shell.cjs` · `node tests/words.cjs` · `node tests/patch.cjs` → 모두 `PASS`. `tests/screen.cjs` 는 남은 몫이 지금 그대로인지 한 번(`PASS 화면: …`).

- [ ] **Step 9: 커밋** — `docs/PATCH.md` 맨 위 한 칸(사용자 「이대로 진행해줘」 · 설계 경로), `git add lib/walk-core.js lib/walk-data.js lib/walk.js lib/walk.css index.html lib/words.js tests/walk-core.cjs tests/lib/harness.cjs tests/walk-shell.cjs tests/screen.cjs docs/PATCH.md <?v= 바꾼 화면들>` → `git commit -m "원소 「들어가는 곳」 1 — 한 화면 껍데기 · 주소 층 · 뒤로 가기 한 층씩" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`.

---

### Task 2: 도구 상자 · 도구 화면의 가는 막대

왜 여기(설계 순서보다 앞): 목록 층이 즐겨찾기 수를 도구 상자로 옮기고(과제 6), 새 층에는 ⚙ 가 없어 공간 · 밀도 설정이 도구 상자에만 있다. 먼저 있어야 뒤 과제들이 기댄다.

**Files:**
- Create: `lib/toolbox.js`, `lib/toolbox.css`, `tests/walk-tools.cjs`
- Modify: `lib/walk.js`(막대 끝에 `Toolbox`), `index.html`(`toolbox.css` · `lib/patch.js` 싣기), `alchemy.html` · `styles.html` · `prompt.html`(`WorkspaceHeader` → `ToolBar`, `favorites.js` · `patch.js` · `toolbox.css` 싣기), `lib/words.js`, `tests/screen.cjs`(223줄 「화풍 탭」 단언), `tests/alchemy.cjs`(77줄 「메뉴의 합성」 단언), `docs/PATCH.md`

**Interfaces:**
- Consumes: `sessionStorage['element_walk_last']`(과제 1), `window.AtelierAppearance`, `window.AtelierFavorites`, `window.AtelierPatch`(`PATH` · `parse`).
- Produces:
  - `Toolbox({here?: 'alchemy'|'styles'|'prompt'})` — 오른쪽 아래 떠 있는 `button.tb-open`(`W('tool.open')`, 44×44 이상, `aria-expanded`). 열면 `.tb-backdrop` + 아래에서 오르는 `.tb-sheet[role=dialog][aria-modal=true]`, 차례대로 `[data-tool="alchemy"]` `[data-tool="styles"]` `[data-tool="prompt"]`(링크 `<key>.html`, `here` 면 `aria-current="page"`) · `[data-tool="fav"]`(`/favorites.html`, `W('tool.fav',{n})`, n = `FAV.list()` 중 `a==='element'` 수, 없으면 0) · `[data-tool="settings"]`(`select#tb-theme` — `AtelierAppearance.themes`, `W('theme.'+k)`; `select#tb-density` — `compact|relaxed`, `W('ui.density.'+k)`) · `[data-tool="patch"]`(누르면 판 안에 `.patch-entry` 목록 — `hall.html` 의 `Patch` 컴포넌트를 옮긴 것).
  - 닫기 셋: 판 밖(`.tb-backdrop` — 위 막대까지 덮는다) · Esc · 뒤로 가기. 열 때 `history.pushState({tb:1}, '', location.href)`, `popstate` 에서 `!history.state?.tb` 면 닫음. Esc · 판 밖은 `history.state?.tb` 면 `history.back()`.
  - 판 안 링크를 누르면 그 `{tb:1}` 칸을 먼저 걷고 간다(`history.back()` → 다음 `popstate` 에서 `location.assign(href)`) — 돌아왔을 때 「아무 일 없는 뒤로 가기」 한 번이 남지 않게.
  - `ToolBar({tool: 'alchemy'|'styles'|'prompt'})` — `header.tb-bar`: `a.tb-back`(href = `'index.html' + (sessionStorage['element_walk_last'] || '')`, 저장소가 막히면 `'index.html'`, 글 `W('tool.back')`) · `h1.tb-name`(`W('tool.'+tool)`) · `Toolbox({here: tool})`.
  - 낱말: `'tool.open':'도구'`, `'tool.sheet':'도구 상자'`, `'tool.back':'← 돌아가기'`, `'tool.alchemy':'합성'`, `'tool.styles':'화풍'`, `'tool.prompt':'프롬프트'`, `'tool.fav':'즐겨찾기 {n}'`, `'tool.settings':'설정'`, `'tool.patch':'패치 기록'`, `'tool.close':'닫기'`. 공간 · 밀도 이름은 있는 `ui.theme` · `ui.density.*` · `theme.*`.

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-tools.cjs`(덮개 · WIDE 둘 다 열고 넘침 · 오류, 흐름은 덮개)

```js
for (const t of ['alchemy', 'styles', 'prompt']) {
  const { page: p, errors } = await open(br, base, '/' + t + '.html');
  await p.waitForSelector('header.tb-bar');
  assert.equal(await p.locator('.workspace-nav, .workspace-heading').count(), 0, t + ' 탭 줄 없음');
  assert.equal(await p.locator('h1.tb-name').textContent(), { alchemy: '합성', styles: '화풍', prompt: '프롬프트' }[t]);
  assert.equal(await p.getAttribute('a.tb-back', 'href'), 'index.html', '처음엔 주기율표로');
  assert(await noOverflow(p)); assert.deepEqual(errors, []);
}
// 들어오기 전 층으로
const { page: p } = await open(br, base, '/index.html?n=fe&mode=list');
await p.waitForSelector('button.tb-open');
await p.click('button.tb-open'); await p.click('[data-tool="prompt"]'); await p.waitForURL(/prompt\.html/);
assert.equal(await p.getAttribute('a.tb-back', 'href'), 'index.html?n=fe&mode=list');
// 도구 칸을 지나와도 뒤로 가기가 헛돌지 않는다
await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
// 판 — 여섯 칸, 44px, 닫기 셋
await p.click('button.tb-open');
assert.deepEqual(await p.locator('.tb-sheet [data-tool]').evaluateAll(e => e.map(x => x.dataset.tool)), ['alchemy', 'styles', 'prompt', 'fav', 'settings', 'patch']);
assert.deepEqual(await p.locator('.tb-sheet a[data-tool]').evaluateAll(e => e.map(x => x.getAttribute('href'))), ['alchemy.html', 'styles.html', 'prompt.html', '/favorites.html']);
for (const b of await p.locator('.tb-sheet a, .tb-sheet button, .tb-sheet select, button.tb-open').all()) assert((await b.boundingBox()).height >= 44);
await p.keyboard.press('Escape'); await p.waitForSelector('.tb-sheet', { state: 'detached' });
await p.click('button.tb-open'); await p.mouse.click(10, 10); await p.waitForSelector('.tb-sheet', { state: 'detached' });
const url = p.url(); await p.click('button.tb-open'); await p.goBack(); await p.waitForSelector('.tb-sheet', { state: 'detached' });
assert.equal(p.url(), url, '뒤로 가기는 판만 닫는다');
// 설정 · 즐겨찾기 수 · 패치 기록
await p.evaluate(() => localStorage.setItem('atelier_favorites_v1', JSON.stringify([{ a: 'element', key: 'fe', file: 'x.webp' }, { a: 'pkm', key: 'y', file: 'y.webp' }])));
await p.reload(); await p.click('button.tb-open');
assert.match(await p.locator('[data-tool="fav"]').textContent(), /즐겨찾기 1/);
const t0 = await p.evaluate(() => document.documentElement.dataset.theme);
const other = (await p.locator('#tb-theme option').evaluateAll(o => o.map(x => x.value))).find(v => v !== t0);
await p.selectOption('#tb-theme', other); assert.equal(await p.evaluate(() => document.documentElement.dataset.theme), other);
await p.click('[data-tool="patch"]'); await p.waitForSelector('.patch-entry');
```

- [ ] **Step 2: 돌려 실패를 본다** — `node tests/walk-tools.cjs` → `header.tb-bar` 시간 초과.

- [ ] **Step 3: `lib/toolbox.js` · `lib/toolbox.css` 를 쓰고 붙인다** — Interfaces 대로. 판은 아래에서 오르는 시트(폰) / 오른쪽 아래 붙은 판(PC 768 넘으면), 어두운 바탕은 새 층과 같은 토큰을 `toolbox.css` 안에 따로 둔다(도구 화면은 `walk.css` 를 싣지 않는다). 세 도구 화면은 `render(h(ToolBar,{tool:'…'}), #app)` 로 바꾸고 `lib/workspace-ui.js` import 를 뺀다. `alchemy.html` 의 `fitTop` 은 그대로 둔다(막대 높이를 잰다). `lib/walk.js` 는 `Bar` 끝에 `h(Toolbox)`.

- [ ] **Step 4: 옛 단언을 옮긴다** — `tests/screen.cjs` 「화풍 탭」 은 `h1.tb-name` 이 `화풍`, `tests/alchemy.cjs` 「메뉴의 합성」 은 `h1.tb-name` 이 `합성`.

- [ ] **Step 5: 돌려 통과를 본다** — `walk-tools.cjs` · `walk-shell.cjs` · `alchemy.cjs` · `prompt-pack-screen.cjs` · `screen.cjs` · `words.cjs` · `patch.cjs` → 모두 `PASS`.

- [ ] **Step 6: 커밋** — PATCH 한 칸, `"원소 「들어가는 곳」 2 — 도구 상자 · 도구 화면은 가는 막대(탭 줄 걷기)"` + Co-Authored-By 줄.

---

### Task 3: 주기율표 첫 화면 · 나라 카드 · 효과 ④

**Files:**
- Create: `lib/walk-table.js`, `lib/walk-fx.js`, `tests/walk-table.cjs`
- Modify: `lib/walk-core.js`(+`nearestNation`), `tests/walk-core.cjs`, `lib/walk.js`(`LAYERS.table`), `lib/walk.css`, `hall.html`(넘김 껍데기로), `lib/words.js`, `tests/screen.cjs`(「주기율표(옛 첫 화면, hall.html)」 묶음 지움), `docs/PATCH.md`

**Interfaces:**
- Consumes: `go`, `route`, `doc`(과제 1), `legacyURL`(과제 1).
- Produces:
  - `walk-core`: `nearestNation(cells: {key, x, y}[], x: number, y: number, max: number): string|null` — 거리 `max` 안에서 가장 가까운 칸 열쇠(같으면 앞의 것).
  - `lib/walk-fx.js`(ESM, `import * as FX from './motion-fx.js?v=1'`): `fx(name: string, fn: () => void): boolean` — `FX.reduce()` 면 아무것도 안 하고 `false`; 아니면 `window.AtelierWalkFx.fired.push(name)` 후 `fn()`. `markFrom(el: Element)` · `takeFrom(): DOMRect|null`(누른 자리를 다음 층에 넘긴다, 한 번 쓰면 비움). `spark(el: Element)` — `fx('spark', …)` 로 그 칸 둘레에 `.w-spark` 8개(색 `var(--cat)`), 700ms 뒤 지움. 모듈이 처음 읽힐 때 `window.AtelierWalkFx = {fired: [], particles: null}`.
  - `TableLayer({doc, route, go})`: `.w-table` — 18열 7줄 + 란타넘 · 악티늄 두 줄(옛 `hall.html` `Table` 의 칸 배치 그대로), 118 `.pcell`, 나라만 `.pcell.on[data-n][data-cat]`, 나머지는 흐림. **가로 스크롤 없이** 폭에 맞춘다: 덮개는 옆 여백 12px · 칸 사이 2px(칸 ≈ 16px), 넓으면 칸 최대 56px 로 가운데. 누르기는 `.w-table` 한 곳에서 받아 `nearestNation(빛나는 칸들의 가운데, x, y, 1.5 × 칸 너비)` — 흐린 칸 위를 눌러도 가까운 나라가 잡힌다.
  - 고른 나라 → `.w-ncard[data-n][data-cat]`(덮개는 아래에 붙는 큰 카드, Esc 로 닫힘, 역사는 안 늘림): `el.symbol` · `el.ko` · `el.en` · `W('cat.'+category)` · `nation.persona` · `W('walk.counts', {f, c})` · `[data-act="enter"]`(`W('walk.enter')`) → `markFrom(그 칸)` 후 `go({n, mode: route.mode || pref 의 mode || 'orbit'})` · `[data-act="list"]`(`W('walk.list')`) → `go({n, mode:'list'})`. 단추 44px.
  - `.w-legend [data-cat]` 열 개(`W('cat.'+k)`), 색은 분류 색 토큰.
  - ④: `.pcell.on` 은 `animation-name: w-breathe`(은은한 빛, 2.8s 안팎 무한), 고르면 `spark(칸)`. 움직임 줄이기면 `animation-name: none` · 불꽃 없음.
  - `hall.html` → 머리에 `lib/walk-core.js` 만 싣고 `location.replace(AtelierWalk.legacyURL(location.pathname, location.search))`(`<title>원소의 공방</title>`, 한글 없음).
  - 낱말: `'walk.enter':'들어가기'`, `'walk.list':'목록'`, `'walk.counts':'가문 {f} · 주민 {c}'`, `'walk.legend':'분류'`, `'walk.table.note':'빛나는 칸이 나라다 — 누르면 나라 카드'`.

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-core.cjs` 에 더함:

```js
const cells = [{ key: 'fe', x: 100, y: 50 }, { key: 'cu', x: 154, y: 50 }];
assert.equal(R.nearestNation(cells, 114, 52, 27), 'fe'); assert.equal(R.nearestNation(cells, 140, 50, 27), 'cu');
assert.equal(R.nearestNation(cells, 100, 120, 27), null);
```

`tests/walk-table.cjs`(D = 설계표):

```js
const { page: p, errors, requests } = await open(br, base, '/index.html');
await p.waitForSelector('.w-table .pcell');
assert.equal(await p.locator('.w-table .pcell').count(), 118);
assert.equal(await p.locator('.w-table .pcell.on').count(), D.nations.length, '나라 칸 수 = 설계표 나라 수');
assert.equal(await p.locator('.w-legend [data-cat]').count(), 10);
assert(await p.evaluate(() => { const t = document.querySelector('.w-table'); return t.scrollWidth <= t.clientWidth + 1; }), '표 안 가로 스크롤 없음');
assert.equal(await p.locator('.pcell.on >> nth=0').evaluate(e => getComputedStyle(e).animationName), 'w-breathe');
// 흐린 칸(코발트) 쪽을 눌러도 철이 잡힌다
const fe = await p.locator('.pcell.on[data-n="fe"]').boundingBox();
await p.mouse.click(fe.x + fe.width * 1.4, fe.y + fe.height / 2);
await p.waitForSelector('.w-ncard[data-n="fe"]');
assert(await p.locator('.w-spark').count() >= 1, '④ 불꽃'); await p.waitForTimeout(1000);
assert.equal(await p.locator('.w-spark').count(), 0, '불꽃은 사라진다');
const n = D.nations.find(x => x.key === 'fe'), cit = n.families.reduce((s, f) => s + f.citizens.length, 0);
assert((await p.locator('.w-ncard').textContent()).includes('가문 ' + n.families.length + ' · 주민 ' + cit));
for (const a of ['enter', 'list']) assert((await p.locator('.w-ncard [data-act="' + a + '"]').boundingBox()).height >= 44);
// double enter(Review Focus 4) — 역사는 한 칸만
const len = await p.evaluate(() => history.length);
await p.locator('.w-ncard [data-act="enter"]').evaluate(b => { b.click(); b.click(); });   // 다시 그리기 전에 두 번
await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
assert.equal(await p.evaluate(() => history.length), len + 1); assert.match(p.url(), /\?n=fe&mode=orbit/);
await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
await p.locator('.pcell.on[data-n="h"]').click(); await p.click('.w-ncard [data-act="list"]');
await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
assert.equal(requests.filter(u => /pixi/.test(u)).length, 0, '주기율표 · 목록은 PixiJS 를 받지 않는다');
assert(await noOverflow(p)); assert.deepEqual(errors, []);
// 옛 주소
const h = await open(br, base, '/hall.html?x=1'); await h.page.waitForSelector('.w-table');
assert.equal(new URL(h.page.url()).pathname + new URL(h.page.url()).search, '/index.html');
// 움직임 줄이기 — 숨쉬기 · 불꽃 없음
const r = await open(br, base, '/index.html', { reduced: true }); await r.page.waitForSelector('.pcell.on');
assert.equal(await r.page.locator('.pcell.on >> nth=0').evaluate(e => getComputedStyle(e).animationName), 'none');
await r.page.locator('.pcell.on[data-n="fe"]').click(); await r.page.waitForSelector('.w-ncard');
assert.equal(await r.page.locator('.w-spark').count(), 0); assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []);
// WIDE — 118 · 나라 수 · 넘침 · 오류
```

- [ ] **Step 2: 돌려 실패를 본다** — `walk-core.cjs` → `R.nearestNation is not a function`; `walk-table.cjs` → `.w-table .pcell` 시간 초과.

- [ ] **Step 3: 만든다** — Interfaces 대로. 「들어가기」 두 번 눌림은 과제 1 의 `go` 가 같은 주소를 다시 쓰지 않는 것으로 막힌다 — 따로 잠금을 두지 않는다. `hall.html` 의 옛 `Table` · `Patch` 코드는 지운다(패치 기록은 도구 상자로 옮겨 갔다). `tests/screen.cjs` 의 hall 묶음과 PASS 줄 몫을 지운다.

- [ ] **Step 4: 돌려 통과를 본다** — `walk-core.cjs` · `walk-table.cjs` · `walk-shell.cjs` · `words.cjs` · `patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 3 — 첫 화면 주기율표 · 나라 카드 · 칸 숨쉬기와 불꽃"`.

---

### Task 4: 나라 · 궤도 층 · 앞뒤 나라 · 효과 ①

**Files:**
- Create: `lib/walk-orbit.js`, `tests/walk-orbit.cjs`
- Modify: `lib/walk-core.js`(+`nationOrder` · `neighbors`), `tests/walk-core.cjs`, `lib/walk-data.js`(+`cardsOf` · `pick` · `hasArt`), `lib/walk-fx.js`, `lib/walk.js`(`LAYERS.orbit`, 막대의 ‹ ›), `lib/walk.css`, `lib/words.js`, `docs/PATCH.md`

**Interfaces:**
- Consumes: `fx` · `takeFrom` · `markFrom`(과제 3), `go` · `back`(과제 1), `worldOf`.
- Produces:
  - `walk-core`: `nationOrder(d): string[]`(나라 열쇠를 `elements[].number` 차례로), `neighbors(order, key): {prev, next}`(끝에서 처음으로 돈다).
  - `walk-data`: `type Card = {key, tier:'root'|'lord'|'citizen', name, en, worlds, nation, family|null, citizen|null, el}`; `cardsOf(doc, nation): Card[]`(근본 → 가문마다 가문주 → 그 주민, 이름은 `dex.html` `cardsOf` 와 같은 규칙 — 가문주 이름 `W('dex.lord.name',{family})`); `pick(doc, card, world, style): {file, world, style, from: boolean}|null` — 고른 화풍 → 다른 화풍(기본 먼저) 차례로 그 세계, 없으면 다른 세계(`from: true`)(`gallery.html` `fileOf` · `pick` 을 화풍 하나 앞세워 넓힌 것); `hasArt(doc, card): boolean`.
  - `OrbitLayer({doc, route, go})`: `.w-stage` — 궤도 그림이 있는 일곱(`RING` 열쇠)은 `img.w-orbit-img`(`onError` → 점선으로 갈아탐), 나머지는 `svg .w-ring-dash`(시안처럼 점선 고리). 둘 다 그 위에 `pathLength="1"` 인 고리 선 `.w-ring-line`. 가운데 `button.w-nucleus`(근본 — 그림이면 둥근 그림, 없으면 `.empty`), 고리 위 `.w-orbit-ring` 안에 **설계된 가문 전부** `button.w-node[data-f]`(가문 이름 + `W('gallery.citizens',{n})` 주민 수; 가문주 그림이 없으면 `.empty` + `W('walk.noart')`). 배치는 `gallery.html` `Nation` 의 각도 · `RING` 반지름 식 그대로. 아래에 사실 칸 · 인격 · 그 세계의 나라 글 · 성질(옛 `.g-text` 몫).
  - 누르기: 그림 있는 근본 → `go({card: n, pic: pick(…).file})`; 그림 있는 가문주 → `markFrom(그 원)` 후 `go({f})`; 그림 없는 근본 · 가문주 → `go({mode:'list', at: card.key, f:'', card:''})`. 
  - `EmptyArt({card, onClick})` — 흐린 빈 원(이름 · `W('walk.noart')`), 가문 층도 쓴다.
  - `ModeSwitch({route, go})` — `.w-mode` 의 `button[data-mode="orbit"|"list"]`(`W('walk.mode.orbit')` · `W('walk.mode.list')`), `go({mode}, {replace: true})`. 궤도 층 그림 아래, 목록 층 머리에(과제 6).
  - 막대: 층이 orbit · list 면 길 표시 옆 `button[data-step="prev"|"next"]`(‹ ›, `W('walk.prev')` · `W('walk.next')` 를 aria-label), `go({n: 옆 나라}, {replace: true})`.
  - ①: 궤도 층이 붙을 때 `const r = takeFrom()` 이 있으면 `fx('enter', () => { FX.flyFrom(r, nucleus); FX.draw(ringLine); FX.burst(nodes, nucleus rect) })`. 주소로 바로 열면(`r` 없음) 안 한다.
  - 낱말: `'walk.mode':'보기'`, `'walk.mode.orbit':'궤도로 보기'`, `'walk.mode.list':'목록으로 보기'`, `'walk.noart':'아직 그림 없음'`, `'walk.prev':'앞 나라'`, `'walk.next':'다음 나라'`.

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-core.cjs` 에 더함:

```js
const order = R.nationOrder(D);
assert.deepEqual(order.slice(0, 3), ['h', 'he', 'li']); assert.equal(order.at(-1), 'og'); assert.equal(order.length, D.nations.length);
assert.deepEqual(R.neighbors(order, 'h'), { prev: 'og', next: 'he' }); assert.deepEqual(R.neighbors(order, 'fe'), { prev: 'ca', next: 'cu' });
```

`tests/walk-orbit.cjs`(`anyPic(k)` 은 `tests/screen.cjs` 의 것 — 등록부 어느 화풍이든 세계 그림이 있나):

```js
const ORB = ['fe', 'h', 'o', 'c', 'na', 'au', 'og'], fe = D.nations.find(n => n.key === 'fe');
let { page: p, errors, requests } = await open(br, base, '/index.html?n=fe&mode=orbit');
await p.waitForSelector('.w-stage');
assert.equal(await p.locator('.w-node').count(), fe.families.length, '설계된 가문 전부');
assert.equal(await p.locator('.w-node.empty').count(), fe.families.filter(f => !anyPic('fe-' + f.key)).length);
for (const e of await p.locator('.w-node.empty').all()) assert.match(await e.textContent(), /아직 그림 없음/);
assert.match(await p.getAttribute('img.w-orbit-img', 'src'), /orbits\/orbit-fe\.webp$/);
assert.equal(await p.locator('.w-ring-dash').count(), 0); assert.equal(await p.locator('.w-ring-line').count(), 1);
for (const b of await p.locator('.w-node, .w-nucleus, .w-mode button, [data-step]').all()) { const r = await b.boundingBox(); assert(r.width >= 44 && r.height >= 44); }
// 코드가 그린 고리 — 그림이 없는 나라는 그 그림을 부르지도 않는다
const noOrb = D.nations.find(n => !ORB.includes(n.key)).key;
await p.goto(base + '/index.html?n=' + noOrb + '&mode=orbit'); await p.waitForSelector('.w-ring-dash');
assert.equal(await p.locator('img.w-orbit-img').count(), 0); assert.equal(requests.filter(u => u.includes('orbit-' + noOrb + '.webp')).length, 0);
// 가문 없는 나라 · 그림 없는 나라도 들어간다
await p.goto(base + '/index.html?n=og&mode=orbit'); await p.waitForSelector('.w-nucleus'); assert.equal(await p.locator('.w-node').count(), 0);
const bare = D.nations.find(n => !anyPic(n.key)).key;     // 지금 ne
await p.goto(base + '/index.html?n=' + bare + '&mode=orbit'); await p.click('.w-nucleus.empty');
await p.waitForFunction(() => document.documentElement.dataset.layer === 'list'); assert.match(p.url(), new RegExp('mode=list&at=' + bare));
// 그림 있는 근본 → 한 장, 가문주 → 가문
await p.goto(base + '/index.html?n=fe&mode=orbit'); await p.click('.w-nucleus');
await p.waitForFunction(() => document.documentElement.dataset.layer === 'card'); assert.match(p.url(), /card=fe&pic=/);
await p.goBack(); const lord = fe.families.find(f => anyPic('fe-' + f.key));
await p.click('.w-node[data-f="' + lord.key + '"]', { force: true }); await p.waitForFunction(() => document.documentElement.dataset.layer === 'family');
await p.goBack(); await p.waitForSelector('.w-stage');
// ‹ › — 주기율표 번호 차례, 역사는 그대로, 뒤로 가기는 주기율표
assert.deepEqual(await p.locator('.w-crumbs button').allTextContents(), ['주기율표', '철 Fe']);
const len = await p.evaluate(() => history.length);
await p.click('[data-step="next"]'); await p.waitForURL(/n=cu/); assert.equal(await p.evaluate(() => history.length), len);
// 궤도로 / 목록으로 — 역사 그대로, 기기에 기억
await p.click('.w-mode [data-mode="list"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
assert.equal(await p.evaluate(() => history.length), len); assert.equal(JSON.parse(await p.evaluate(() => localStorage.getItem('element_dex_v1'))).mode, 'list');
await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
// ① — 주기율표에서 들어가면 돈다
await p.locator('.pcell.on[data-n="fe"]').click(); await p.click('.w-ncard [data-act="enter"]'); await p.waitForSelector('.w-stage');
assert(await p.evaluate(() => AtelierWalkFx.fired.includes('enter')));
// 펼침 — 덮개 → 넓게 바꿔도 원이 무대 안, 넘침 없음
await p.setViewportSize({ width: 884, height: 1104 }); await p.waitForTimeout(300);
const st = await p.locator('.w-stage').boundingBox();
for (const b of await p.locator('.w-node').all()) { const r = await b.boundingBox(); assert(r.x >= st.x - 30 && r.x + r.width <= st.x + st.width + 30); }
assert(await noOverflow(p)); assert.deepEqual(errors, []);
// orbit image fails(Review Focus 5)
const f = await open(br, base, '/index.html?n=fe&mode=orbit', { failURL: /orbit-fe\.webp/ });
await f.page.waitForSelector('.w-ring-dash'); assert.equal(await f.page.locator('.w-ring-line').count(), 1);
// 움직임 줄이기 — 주기율표에서 들어가도 ① 없음
const r = await open(br, base, '/index.html', { reduced: true });
await r.page.locator('.pcell.on[data-n="fe"]').click(); await r.page.click('.w-ncard [data-act="enter"]'); await r.page.waitForSelector('.w-stage');
assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []);
// WIDE — 열고 노드 수 · 넘침 · 오류
```

- [ ] **Step 2: 돌려 실패를 본다** — `walk-core.cjs` → `R.nationOrder is not a function`; `walk-orbit.cjs` → `.w-stage` 시간 초과.

- [ ] **Step 3: 만든다** — Interfaces 대로. 궤도 무대의 꼴은 `lib/gallery.css` 의 `.g-stage` · `.g-nucleus` · `.g-node` · `.g-text` 를 옮겨 이름을 바꾼다. 그림 세계는 `worldOf(route, worlds)`, 화풍은 `route.st || doc.s.default`.

- [ ] **Step 4: 돌려 통과를 본다** — `walk-core.cjs` · `walk-orbit.cjs` · `walk-shell.cjs` · `words.cjs` · `patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 4 — 나라 궤도 층(설계된 가문 전부 · 점선 고리 · 빈 원) · 앞뒤 나라 · 들어가기 확대"`.

---

### Task 5: 궤도에 머무는 동안 — 천천히 도는 가문주 · 분류 입자(효과 ②)

**Files:**
- Create: `tests/walk-particles.cjs`
- Modify: `lib/walk-core.js`(+`particleKind` · `particleCap`), `tests/walk-core.cjs`, `lib/walk-fx.js`(+`loadPixi` · `mountParticles`), `lib/walk-orbit.js`, `lib/walk.css`, `docs/PATCH.md`

**Interfaces:**
- Consumes: `OrbitLayer`(과제 4), `PIXI_URL` from `./holo.js?v=3`.
- Produces:
  - `walk-core`: `particleKind(category): 'ember'|'breeze'|'mote'|'glint'|'flicker'` — `alkali alkaline_earth transition post_transition` → `ember`(불티) · `nonmetal halogen` → `breeze`(바람결) · `noble_gas` → `mote`(빛 알갱이) · `metalloid` → `glint`(결정 반짝임) · `lanthanide actinide` → `flicker`(푸른 깜빡임) · 그 밖 → `mote`. `particleCap(width): number` — `width <= 400 ? 24 : 48`.
  - `walk-fx`: `loadPixi(): Promise<PIXI>`(한 번만 `import(PIXI_URL)`, 실패하면 다음에 다시 시도), `mountParticles(host: HTMLElement, {kind, cap}): Promise<{destroy(), state(): {kind, count, running}} | null>` — `FX.reduce()` · WebGL 없음 · Pixi 실패면 `null`(오류를 던지지 않는다). `canvas.w-particles`(`aria-hidden`, pointer-events none, `host` 크기에 맞춰 ResizeObserver), 입자 수 = `cap`, `document.hidden` 이거나 IntersectionObserver 가 화면 밖이라 하면 ticker 를 멈추고 `running:false`. 살아 있는 동안 `window.AtelierWalkFx.particles = state()`, `destroy()` 는 `null` 로 되돌리고 캔버스 · 앱을 놓는다(`holo.js` 의 `app.destroy({removeView:true, releaseGlobalResources:true}, …)` 와 같은 꼴). WebGL 판정과 `app.init({preference:['webgl']})` 실패 처리는 `lib/holo.js` 를 따른다.
  - 궤도 층: 붙으면 `mountParticles(.w-stage, {kind: particleKind(el.category), cap: particleCap(innerWidth)})`, 떨어지면 `destroy()`.
  - 도는 고리: `.w-orbit-ring { animation: w-spin 180s linear infinite }`, 노드 글은 거꾸로 같은 속도로 돌아 똑바로 선다. `.w-stage` 에 pointerdown 이면 `.held`(→ `animation-play-state: paused`), pointerup · pointercancel 2000ms 뒤 뗀다. 움직임 줄이기면 `animation: none`.

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-core.cjs`:

```js
const K = { transition: 'ember', alkali: 'ember', alkaline_earth: 'ember', post_transition: 'ember', nonmetal: 'breeze', halogen: 'breeze',
  noble_gas: 'mote', metalloid: 'glint', lanthanide: 'flicker', actinide: 'flicker', unknown: 'mote' };
for (const [c, k] of Object.entries(K)) assert.equal(R.particleKind(c), k, c);
assert.equal(R.particleCap(344), 24); assert.equal(R.particleCap(1280), 48);
```

`tests/walk-particles.cjs`:

```js
const part = p => p.evaluate(() => AtelierWalkFx.particles);
let { page: p, errors, requests } = await open(br, base, '/index.html?n=fe&mode=orbit');
await p.waitForSelector('canvas.w-particles', { timeout: 20000 });
let s = await part(p); assert.equal(s.kind, 'ember'); assert(s.count <= 24 && s.running);
assert.equal(requests.filter(u => /pixi/.test(u)).length, 1);
for (const [n, k] of [['h', 'breeze'], ['og', 'mote'], ['si', 'glint'], ['u', 'flicker']]) {
  await p.goto(base + '/index.html?n=' + n + '&mode=orbit'); await p.waitForSelector('canvas.w-particles', { timeout: 20000 });
  assert.equal((await part(p)).kind, k, n);
}
// 숨은 탭에선 멈춘다
await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
assert.equal((await part(p)).running, false);
await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
assert.equal((await part(p)).running, true);
// 도는 고리 — 손대면 멈춤
const play = () => p.locator('.w-orbit-ring').evaluate(e => [getComputedStyle(e).animationName, getComputedStyle(e).animationPlayState].join(' '));
assert.equal(await play(), 'w-spin running');
const st = await p.locator('.w-stage').boundingBox(); await p.mouse.move(st.x + 5, st.y + 5); await p.mouse.down();
assert.equal(await play(), 'w-spin paused'); await p.mouse.up(); await p.waitForTimeout(2200); assert.equal(await play(), 'w-spin running');
// 떠나면 정리
await p.click('.w-crumbs button >> nth=0'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'table');
assert.equal(await p.locator('canvas.w-particles').count(), 0); assert.equal(await part(p), null);
assert.deepEqual(errors, []);
// 넓으면 상한 48
const w = await open(br, base, '/index.html?n=fe&mode=orbit', { viewport: WIDE }); await w.page.waitForSelector('canvas.w-particles', { timeout: 20000 });
assert((await part(w.page)).count <= 48);
// 움직임 줄이기 · WebGL 없음 · pixi blocked(Review Focus 5) — 조용히 빠진다, 궤도는 그대로 쓴다
for (const opt of [{ reduced: true }, { noWebGL: true }, { blockPixi: true }]) {
  const o = await open(br, base, '/index.html?n=fe&mode=orbit', opt); await o.page.waitForSelector('.w-stage'); await o.page.waitForTimeout(1500);
  assert.equal(await o.page.locator('canvas.w-particles').count(), 0, JSON.stringify(opt)); assert.equal(await part(o.page), null);
  if (opt.reduced) assert.equal(await o.page.locator('.w-orbit-ring').evaluate(e => getComputedStyle(e).animationName), 'none');
  await o.page.click('.w-node:not(.empty) >> nth=0', { force: true }); await o.page.waitForFunction(() => document.documentElement.dataset.layer === 'family');
  assert.deepEqual(o.errors, [], JSON.stringify(opt));
}
```

- [ ] **Step 2: 돌려 실패를 본다** — `walk-core.cjs` → `R.particleKind is not a function`; `walk-particles.cjs` → `canvas.w-particles` 시간 초과.

- [ ] **Step 3: 만든다** — Interfaces 대로. 입자 모양은 종류마다 Pixi `Graphics` 한두 개를 텍스처로 구워 `Sprite` 로 쓴다: 불티(주황 점, 위로 오르며 흐려짐) · 바람결(가는 흰 선, 옆으로 흐름) · 빛 알갱이(작은 빛 점, 천천히 떠다님) · 결정 반짝임(마름모 반짝, 깜빡) · 푸른 깜빡임(푸른 점, 켜졌다 꺼짐). 색 · 속도는 만드는 쪽 판단.

- [ ] **Step 4: 돌려 통과를 본다** — `walk-core.cjs` · `walk-particles.cjs` · `walk-orbit.cjs` · `walk-table.cjs`(주기율표에서 pixi 0 그대로) · `patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 5 — 궤도가 천천히 돌고(손대면 멈춤) 분류마다 입자(PixiJS 늦게 불러오기)"`.

---

### Task 6: 목록 보기 — 지금 도감을 껍데기 안으로 · 조작 줄 · 세계 하나 · 한 장 층

**Files:**
- Create: `lib/walk-list.js`, `lib/walk-card.js`, `tests/walk-list.cjs`
- Modify: `lib/walk-data.js`(+`fileOf` · `styleList` · `picsOf` · `styleOfPic`), `lib/walk.js`(`LAYERS.list` · `LAYERS.card`, 막대의 「전부」), `lib/walk.css`, `index.html`(`lib/element.css` · `lib/prompt-spec.js` · `lib/prompt-element.js` 싣기 — 옛 `dex.html` 머리와 같은 버전), `dex.html`(넘김 껍데기로), `lib/words.js`, `tests/screen.cjs`(도감 묶음을 `walk-list.cjs` 로 옮기고 지움 — 「도감 — 철(2026-10-31 판)」 부터 「물 가문은 산소나라와 나눈다」 까지), `tests/dex-holo.cjs` · `tests/dex-turn.cjs`(여는 주소만), `docs/PATCH.md`

**Interfaces:**
- Consumes: `ModeSwitch`(과제 4), `cardsOf`(과제 4), `Toolbox` 의 즐겨찾기 수(과제 2), `go` · `back`.
- Produces:
  - `walk-data`(옛 `dex.html` 의 같은 이름 함수를 옮김, 몸은 그대로): `fileOf(doc, key, world, style): string|null`(고른 화풍만), `styleList(doc): string[]`, `picsOf(doc, card, style): {file, kind:'world'|'casual', world, label, long?}[]`, `styleOfPic(doc, card, file): string|null`.
  - `ListLayer({doc, route, go})` = 옛 `dex.html` 의 `Nation` · `Card` · `WorldSlot` · `PicSlot` · `Toc` 를 `lib/walk-list.js` 로 옮긴 것. 바뀌는 것만:
    - 위 원소 알약 줄(`.dex-pick`) 없음.
    - `.dex-toc` 의 `.toc-row` 는 **두 줄**: 첫 줄 화풍 고르개(`#dex-style`, 한 줄 가득), 둘째 줄 보기(`[data-view]` 세계 그림 / 일상컷 / 전부). 세계 거르기 줄(`[data-wf]`)과 즐겨찾기 수(`#dex-fav-count`)는 없다. 아무것도 옆으로 잘리지 않는다(`flex-wrap`, 344 에서 각 줄 안).
    - 세계 거르기 = 막대의 세계 고르개. 목록 층에서만 `.w-worlds` 끝에 `button[data-w="all"]`(`W('walk.world.all')`) — `w` 가 비었거나 `all` 이면 눌림, 나머지는 그 세계만 거른다(옛 `wf`).
    - `.toc-jump`(근본 · 가문 바로 가기 띠)는 옆으로 구르고 양끝을 `mask-image: linear-gradient(…)` 로 흐린다.
    - 머리에 `ModeSwitch`. `route.at` 이 있으면 그려진 뒤 `#c-<at>` 로 내려간다(`scrollIntoView({block:'start'})`).
    - 보기 · 화풍 바꾸기 → `go({view})` · `go({st})`, `{replace:true}`(옛 `remember` 대신 — 기억은 껍데기가 한다).
    - 그림을 누르면 → `go({card: card.key, pic: file})`(push). 빈 칸 → 생성기 링크 그대로(`prompt.html?card=&world=`, 기본 화풍일 때만).
  - `CardLayer({doc, route, go, back})` = 옛 `dex.html` `Lightbox` 를 주소 층으로: 뿌리 `div.lightbox.w-card`, 안의 이름(`.lb-top` `.lb-stage` `.lb-nav` `.lb-n` `.bar` `#dex-holo` `#dex-fav` `.lb-ghost`)과 홀로 · 넘기기 전환 코드는 그대로. 바뀌는 것만: 상자 상태(`box`) 대신 `route.card` · `route.pic`. `pic` 이 비었거나 어느 화풍에도 없으면 `pick(doc, card, worldOf(route), route.st || 기본).file` 로 정해 `go({pic}, {replace:true})`, 그림이 하나도 없는 카드면 `go({card:'', pic:'', mode:'list', at: card.key}, {replace:true})`. 화풍은 `pic` 이 든 화풍(`styleOfPic`)이 `route.st` 와 다르면 `go({st}, {replace:true})`; 넘기기 → `go({pic}, {replace:true})`; 닫기 · Esc · 바깥 → `back()`; 옛 `elementLb` 역사 칸 코드는 지운다(껍데기 역사가 대신). 즐겨찾기 link = `new URL('index.html', location.href).pathname + routeSearch({n, mode:'list', card, pic, st: 기본 화풍이 아니면 st})`.
  - 껍데기: 층이 `card` 면 `parentOf(route)` 의 층을 먼저 그리고(그대로 붙은 채 `inert`) 그 위에 `CardLayer`.
  - `dex.html` → `hall.html` 과 같은 넘김 껍데기(즐겨찾기 link 도 이 길로 산다).
  - 낱말: `'walk.world.all':'전부'`.

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-list.cjs`: 먼저 `tests/screen.cjs` 의 도감 묶음을 그대로 옮겨 다음만 바꾼다 — 여는 주소 `/dex.html?nation=fe` → `/index.html?n=fe&mode=list`; `[data-wf="mecha"]` → `.w-worlds [data-w="mecha"]`, `[data-wf="all"]` → `.w-worlds [data-w="all"]`; `#dex-fav-count` 두 단언 → 도구 상자 `[data-tool="fav"]` 글이 `즐겨찾기 1`, href `/favorites.html`; 하트 link 정규식 → `/\/index\.html\?n=fe&mode=list&card=fe&pic=.+&st=game_keyart$/`; 「뒤로 가기 — 팝업이 닫힌다」 는 `html[data-layer]` 가 `list` 로, 「닫기가 기록 칸을 지웠다」 단언은 지운다; 즐겨찾기 link 로 다시 여는 줄의 `.replace(/^.*dex\.html/, '/dex.html')` → `.replace(/^.*index\.html/, '/index.html')`. 그리고 더한다:

```js
// 조작 줄 — 두 줄, 잘리지 않는다
assert.equal(await pg.locator('.dex-pick, [data-wf], #dex-fav-count').count(), 0);
assert.equal(await pg.locator('.dex-toc .toc-row').count(), 2);
assert.deepEqual(await pg.locator('.w-worlds button').evaluateAll(b => b.map(x => x.dataset.w)), ['fantasy', 'steampunk', 'mecha', 'all']);
for (const e of await pg.locator('.dex-toc .toc-row > *, .dex-toc .toc-row select, .dex-toc [data-view]').all()) {
  const r = await e.boundingBox(); assert(r.x >= -1 && r.x + r.width <= 344 + 1, '조작 줄이 344 안');
}
assert.match(await pg.locator('.toc-jump').evaluate(e => getComputedStyle(e).maskImage || getComputedStyle(e).webkitMaskImage), /linear-gradient/);
assert(await noOverflow(pg));
// 세계는 하나 — 목록의 「전부」 는 다른 층에선 판타지로 보인다
await pg.click('.w-worlds [data-w="all"]'); await pg.click('.w-mode [data-mode="orbit"]');
await pg.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
assert.equal(await pg.locator('.w-worlds [data-w="all"]').count(), 0); assert.equal(await pg.getAttribute('.w-worlds [data-w="fantasy"]', 'aria-pressed'), 'true');
await pg.click('.w-mode [data-mode="list"]');
// at= — 그 칸으로 내려간다
const tgt = 'fe-' + fe.families[2].key;
await pg.goto(base + '/index.html?n=fe&mode=list&at=' + tgt); await pg.waitForSelector('#c-' + tgt);
await pg.waitForFunction(k => { const t = document.getElementById('c-' + k).getBoundingClientRect().top; return t >= -2 && t < 200; }, tgt);
// list scroll kept(Review Focus 1)
await pg.goto(base + '/index.html?n=fe&mode=list&st=game_keyart'); await pg.waitForSelector('.worlds.main button.slot');
const last = pg.locator('.worlds.main button.slot').last(); await last.scrollIntoViewIfNeeded();
const y0 = await pg.evaluate(() => scrollY); assert(y0 > 800, '충분히 내려왔다 ' + y0);
await last.click(); await pg.waitForFunction(() => document.documentElement.dataset.layer === 'card');
await pg.goBack(); await pg.waitForFunction(() => document.documentElement.dataset.layer === 'list');
assert(Math.abs((await pg.evaluate(() => scrollY)) - y0) <= 2, '닫으면 제자리');
// 옛 주소 — 셋 중 도감
await pg.goto(base + '/dex.html?nation=fe&view=casual&w=mecha'); await pg.waitForSelector('.dex-toc');
assert.equal(new URL(pg.url()).search, '?n=fe&mode=list&w=mecha&view=casual');
assert.equal(await pg.getAttribute('[data-view="casual"]', 'aria-pressed'), 'true');
// old favorite back(Review Focus 2) — 옛 즐겨찾기 link: 그 그림 → 뒤로 목록 → 뒤로 주기율표
await pg.goto(base + '/dex.html?nation=fe&card=fe&pic=' + encodeURIComponent(pic) + '&st=game_keyart'); await pg.waitForSelector('.lightbox img');
assert((await pg.getAttribute('.lightbox img', 'src')).endsWith(pic)); assert.equal(await pg.inputValue('#dex-style'), 'game_keyart');
await pg.goBack(); await pg.waitForFunction(() => document.documentElement.dataset.layer === 'list');
await pg.goBack(); await pg.waitForFunction(() => document.documentElement.dataset.layer === 'table');
```

(`pic` 은 옮겨 온 묶음이 하트로 담은 그 그림.)

- [ ] **Step 2: 돌려 실패를 본다** — `walk-list.cjs` → `.dex-head` 시간 초과(목록 층은 아직 빈 자리).

- [ ] **Step 3: 만든다** — Interfaces 대로. `dex.html` 의 몸 코드를 옮기며 위 「바뀌는 것만」 밖은 손대지 않는다. 옛 도감 겉모습 클래스(`lib/element.css` 의 `.dex-*` `.ek-card` `.slot` `.lightbox` …)는 `index.html` 이 `lib/element.css` 를 싣고 `lib/walk.css` 에서 어두운 바탕에 맞게 덮는다(`.walk .ek-card {…}` 등) — `element.css` 는 도구 화면도 쓰니 고치지 않는다. `tests/dex-holo.cjs` · `tests/dex-turn.cjs` 는 `page.goto(BASE + '/dex.html?nation=fe')` → `'/index.html?n=fe&mode=list'` 만 바꾼다.

- [ ] **Step 4: 돌려 통과를 본다** — `walk-list.cjs` · `dex-holo.cjs` · `dex-turn.cjs` · `walk-shell.cjs` · `walk-orbit.cjs` · `walk-table.cjs`(목록에서 pixi 0) · `screen.cjs`(남은 생성기 몫) · `words.cjs` · `patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 6 — 목록 보기(지금 도감) · 조작 줄 두 줄 · 세계 하나 · 크게 보기를 주소 층으로"`.

---

### Task 7: 가문 층 · 효과 ⑤

**Files:**
- Create: `lib/walk-family.js`, `tests/walk-family.cjs`
- Modify: `lib/walk.js`(`LAYERS.family`), `lib/walk.css`, `docs/PATCH.md`

**Interfaces:**
- Consumes: `cardsOf` · `pick` · `hasArt`(과제 4), `EmptyArt`(과제 4), `fx` · `takeFrom`(과제 3), `go`.
- Produces: `FamilyLayer({doc, route, go})` — 옛 `gallery.html` `Family` 를 바탕으로: `.w-hero`(가문주 크게 — 그림이면 누르면 `go({card, pic})`, 없으면 `.w-hero.empty` → `go({mode:'list', at, f:'', card:''})`) · 글(층 · 이름 · 인격 · 성질) · **설계된 주민 전부** `.w-cit[data-c]`(그림이면 `go({card, pic})`, 없으면 `.empty` + `W('walk.noart')` → 목록 그 칸) · 같은 물질의 다른 나라 `.w-shared button[data-n]` → `go({n: other, f})`(push). ⑤: 붙을 때 `takeFrom()` 이 있으면 `fx('family', () => FX.flyFrom(r, .w-hero 그림))` 후 주민 `FX.stagger`.

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-family.cjs`:

```js
const fe = D.nations.find(n => n.key === 'fe'), steel = fe.families.find(f => f.key === 'steel');
let { page: p, errors } = await open(br, base, '/index.html?n=fe&f=steel');
await p.waitForSelector('.w-hero');
assert.deepEqual(await p.locator('.w-crumbs button').allTextContents(), ['주기율표', '철 Fe', '강철 가문']);
assert.equal(await p.locator('.w-cit').count(), steel.citizens.length, '설계된 주민 전부');
assert.equal(await p.locator('.w-cit.empty').count(), steel.citizens.filter(c => !anyPic('fe-steel-' + c.key)).length);
const others = steel.elements.filter(k => k !== 'fe' && D.nations.find(n => n.key === k)?.families.some(f => f.key === 'steel'));
assert.deepEqual(await p.locator('.w-shared button').evaluateAll(b => b.map(x => x.dataset.n)), others);   // ['c']
const drawn = steel.citizens.find(c => anyPic('fe-steel-' + c.key)), blank = steel.citizens.find(c => !anyPic('fe-steel-' + c.key));
if (drawn) { await p.click('.w-cit[data-c="fe-steel-' + drawn.key + '"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'card');
  assert.match(p.url(), new RegExp('card=fe-steel-' + drawn.key + '&pic=')); await p.goBack(); await p.waitForSelector('.w-hero'); }
if (blank) { await p.click('.w-cit[data-c="fe-steel-' + blank.key + '"]'); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
  assert.match(p.url(), new RegExp('mode=list&at=fe-steel-' + blank.key)); await p.goBack(); await p.waitForSelector('.w-hero'); }
await p.click('.w-shared button[data-n="c"]'); await p.waitForURL(/n=c&mode=\w+&f=steel/); await p.goBack(); await p.waitForURL(/n=fe/);
// ⑤ — 궤도에서 들어오면 날아온다, 뒤로 가기는 궤도
await p.goto(base + '/index.html?n=fe&mode=orbit'); await p.click('.w-node[data-f="steel"]', { force: true }); await p.waitForSelector('.w-hero');
assert(await p.evaluate(() => AtelierWalkFx.fired.includes('family')));
await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'orbit');
assert(await noOverflow(p)); assert.deepEqual(errors, []);
const r = await open(br, base, '/index.html?n=fe&mode=orbit', { reduced: true });
await r.page.click('.w-node[data-f="steel"]', { force: true }); await r.page.waitForSelector('.w-hero');
assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []);
// WIDE — 열고 주민 수 · 넘침 · 오류
```

(강철 가문주 그림이 없어지면 궤도의 강철 원은 빈 원이 된다 — 그때는 그림 있는 가문을 고르게 `fe.families.find(f => anyPic('fe-' + f.key))` 로 바꾼다.)

- [ ] **Step 2: 돌려 실패를 본다** — `.w-hero` 시간 초과.

- [ ] **Step 3: 만든다** — Interfaces 대로. 꼴은 `lib/gallery.css` 의 `.g-family` · `.g-hero` · `.g-cits` 를 옮긴다.

- [ ] **Step 4: 돌려 통과를 본다** — `walk-family.cjs` · `walk-orbit.cjs` · `walk-shell.cjs` · `patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 7 — 가문 층(주민 전부 · 빈 원은 목록 그 칸으로) · 가문주가 날아와 머리 그림으로"`.

---

### Task 8: 한 장 하나로 — 글 판 · 세계 넘기기 · 전시관 옛 주소

**Files:**
- Create: `tests/walk-card.cjs`
- Modify: `lib/walk-card.js`, `lib/walk.css`, `gallery.html`(넘김 껍데기로), `tests/screen.cjs`(전시관 묶음 지움), `docs/PATCH.md`
- Delete: `lib/gallery.css`(옮길 몫은 과제 4 · 7 에서 다 옮겼다 — 남은 것 중 한 장 글 판 몫만 `walk.css` 로)

**Interfaces:**
- Consumes: `CardLayer`(과제 6), `cardsOf` · `pick` · `styleOfPic`, `worldOf`, `go`.
- Produces: `CardLayer` 에 더함 —
  - `.w-lore` 글 판(옛 `gallery.html` `Lore` 의 글 몫): 층 · 기호 이름(주민이면 가문) · 이름 · 영어 · 근본이면 사실 칸 · 인격 · 근본이면 그 세계의 나라 글 · 주민이면 모티브 · 사는 세계. 덮개에선 그림 아래, 넓으면 옆.
  - 세계 넘기기: 막대의 세계를 바꾸면(`route.w` 가 바뀌면) 지금 화풍에서 그 카드의 그 세계 그림이 있으면 `go({pic: 그 파일}, {replace:true})`, 없으면 그림은 그대로 두고 글 판만 그 세계로.
  - 궤도 · 가문에서 들어올 때 `pic` 은 그 자리에 보이던 파일(`pick(...).file`) — 그 그림이 든 화풍으로 고르개도 옮긴다(과제 6 의 `styleOfPic` 규칙).
  - `gallery.html` → 넘김 껍데기.

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-card.cjs`(`threeWorlds` = 등록부에서 한 화풍에 세 세계 그림이 다 있는 첫 카드와 그 화풍 — 없으면 이 몫을 건너뛰고 그 사실을 PASS 줄에 적는다):

```js
// 어디서 눌러도 같은 한 장
for (const [from, sel] of [['/index.html?n=fe&mode=orbit', '.w-nucleus'], ['/index.html?n=fe&mode=list&st=game_keyart', '#c-fe .worlds.main button.slot >> nth=0']]) {
  const { page: p, errors } = await open(br, base, from); await p.click(sel);
  await p.waitForSelector('.lightbox.w-card .lb-stage img');
  assert.equal(await p.locator('.w-lore h1').evaluate(e => e.firstChild.textContent), '철');
  assert.equal(await p.locator('#dex-fav, #dex-holo, .lb-n').count(), 3);
  await p.keyboard.press('Escape'); await p.waitForFunction(() => document.documentElement.dataset.layer !== 'card');
  assert.deepEqual(errors, []);
}
// 세계 넘기기 — 위 고르개 하나로
const [ck, cst] = threeWorlds, cn = ck.split('-')[0];
const { page: p } = await open(br, base, '/index.html?n=' + cn + '&mode=list&st=' + cst + '&w=fantasy&card=' + ck);
await p.waitForSelector('.lb-stage img');
await p.click('.w-worlds [data-w="mecha"]'); await p.waitForFunction(() => /_mecha_/.test(document.querySelector('.lb-stage img').src));
assert.match(p.url(), /pic=[^&]*_mecha_/);
// 화풍(st)은 층을 건너 이어진다
await p.goBack(); await p.waitForFunction(() => document.documentElement.dataset.layer === 'list');
assert.equal(await p.inputValue('#dex-style'), cst);
// old gallery back(Review Focus 2) — 옛 전시관 한 장 주소: 한 장 → 가문 → 궤도 → 주기율표
const h = D.nations.find(n => n.key === 'h'), fam = h.families.find(f => f.citizens.some(c => anyPic('h-' + f.key + '-' + c.key)));
const cit = 'h-' + fam.key + '-' + fam.citizens.find(c => anyPic('h-' + fam.key + '-' + c.key)).key;
await p.goto(base + '/gallery.html?n=h&f=' + fam.key + '&c=' + cit + '&w=mecha&v=1'); await p.waitForSelector('.lb-stage img');
for (const l of ['family', 'orbit', 'table']) { await p.goBack(); await p.waitForFunction(x => document.documentElement.dataset.layer === x, l); }
await p.goto(base + '/gallery.html'); await p.waitForSelector('.w-table');
assert(await noOverflow(p));
// WIDE — 한 장 열고 넘침 · 오류
```

- [ ] **Step 2: 돌려 실패를 본다** — `.w-lore h1` 시간 초과.

- [ ] **Step 3: 만든다** — Interfaces 대로. `lib/gallery.css` 를 지우고, 쓰는 곳이 없는지 `grep -rn "gallery.css" *.html lib tests` 로 본다. `tests/screen.cjs` 의 전시관 묶음 · PASS 줄 몫을 지운다(궤도 · 가문 · 한 장 검사가 같은 것을 본다).

- [ ] **Step 4: 돌려 통과를 본다** — `walk-card.cjs` · `walk-list.cjs` · `dex-holo.cjs` · `dex-turn.cjs` · `walk-family.cjs` · `walk-orbit.cjs` · `screen.cjs` · `patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 8 — 한 장 하나로(글 판 · 세계 넘기기) · 전시관 옛 주소 이어 주기"`.

---

### Task 9: 세계 바꾸기 전환(효과 ③)

**Files:**
- Create: `tests/walk-world.cjs`
- Modify: `lib/walk-fx.js`(+`playShift`), `lib/walk.js`(세계 고르개가 부름), `lib/walk.css`, `docs/PATCH.md`

**Interfaces:**
- Consumes: `fx` · `loadPixi`(과제 3 · 5), 막대의 세계 고르개(과제 1).
- Produces: `playShift(host: HTMLElement, world: 'fantasy'|'steampunk'|'mecha'): Promise<void>` — `fx('shift:' + world, …)` 안에서: `host` 위에 `.w-shift[data-to=world]` 하나(이미 있으면 그것을 지우고 새로 — 늘 하나), `pointer-events:none`, `aria-hidden`. CSS 가면 움직임(판타지 — 가루가 흩어지듯 점무늬 가면 · 스팀펑크 — 아래에서 김이 훅 올랐다 걷히듯 흐린 가면 · 메카 — 가로 주사선이 지나며 띠가 어긋났다 맞춰지듯), 600ms. WebGL · Pixi 가 되면 같은 덮개 안 캔버스에 그 세계 입자 한 번(가루 · 김 · 주사선 잡음) — 안 되면 CSS 만. 900ms 안에 덮개를 지운다. 세계 상태는 효과를 기다리지 않고 바로 바뀐다(`go({w}, {replace:true})` 먼저, 효과는 그 뒤).

- [ ] **Step 1: 검사를 쓴다** — `tests/walk-world.cjs`:

```js
let { page: p, errors, requests } = await open(br, base, '/index.html?n=fe&mode=orbit');
await p.waitForSelector('.w-stage');
await p.click('.w-worlds [data-w="mecha"]');
await p.waitForSelector('.w-shift[data-to="mecha"]');
assert.equal(await p.locator('.w-shift').evaluate(e => getComputedStyle(e).pointerEvents), 'none');
assert(await p.evaluate(() => AtelierWalkFx.fired.includes('shift:mecha')));
await p.waitForSelector('.w-shift', { state: 'detached', timeout: 1200 });
// rapid shifts(Review Focus 4) — 덮개 하나, 마지막 세계, 누르기는 안 막힌다
for (const w of ['fantasy', 'steampunk', 'mecha']) await p.click('.w-worlds [data-w="' + w + '"]');
assert(await p.locator('.w-shift').count() <= 1);
assert.equal(await p.getAttribute('.w-worlds [data-w="mecha"]', 'aria-pressed'), 'true'); assert.match(p.url(), /w=mecha/);
await p.click('.w-node:not(.empty) >> nth=0', { force: true }); await p.waitForFunction(() => document.documentElement.dataset.layer === 'family');
assert.deepEqual(errors, []);
// 목록에서도(세계 전환은 Pixi 를 늦게 부른다 — 바꾸기 전엔 0)
({ page: p, requests } = await open(br, base, '/index.html?n=fe&mode=list'));
await p.waitForSelector('.dex-toc'); assert.equal(requests.filter(u => /pixi/.test(u)).length, 0);
await p.click('.w-worlds [data-w="steampunk"]'); await p.waitForSelector('.w-shift[data-to="steampunk"]');
// 움직임 줄이기 — 덮개 없이 바로
const r = await open(br, base, '/index.html?n=fe&mode=orbit', { reduced: true }); await r.page.waitForSelector('.w-stage');
await r.page.click('.w-worlds [data-w="mecha"]'); await r.page.waitForTimeout(200);
assert.equal(await r.page.locator('.w-shift').count(), 0); assert.deepEqual(await r.page.evaluate(() => AtelierWalkFx.fired), []);
assert.match(r.page.url(), /w=mecha/);
// WebGL 없음 — CSS 덮개만, 캔버스 없음, 오류 없음
const g = await open(br, base, '/index.html?n=fe&mode=orbit', { noWebGL: true }); await g.page.waitForSelector('.w-stage');
await g.page.click('.w-worlds [data-w="mecha"]'); await g.page.waitForSelector('.w-shift');
assert.equal(await g.page.locator('.w-shift canvas').count(), 0); await g.page.waitForTimeout(1000); assert.deepEqual(g.errors, []);
```

- [ ] **Step 2: 돌려 실패를 본다** — `.w-shift[data-to="mecha"]` 시간 초과.

- [ ] **Step 3: 만든다** — Interfaces 대로. 덮개는 `main.w-main` 위(막대는 덮지 않는다).

- [ ] **Step 4: 돌려 통과를 본다** — `walk-world.cjs` · `walk-particles.cjs` · `walk-card.cjs`(한 장 세계 넘기기) · `walk-shell.cjs` · `patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 9 — 세계 바꾸기 전환(가루 · 김 · 주사선)"`.

---

### Task 10: 정리 · 문서 · 전체 검사 · 덮개 사진

**Files:**
- Modify: `lib/workspace-ui.js`(아무도 안 부르면 파일째 지움 — `grep -rn "workspace-ui" *.html lib tests`), `lib/words.js`(쓰는 곳이 없는 열쇠만 지움 — 열쇠마다 `grep -rn "'<열쇠>'" *.html lib` 가 0 일 때. `title.*` · `nav.*` · `home.title` · `home.intro` · `home.tag` · `home.table*` · `home.first*` · `home.themes` · `gallery.island*` · `ui.header.*` 가 후보), `AGENTS.md`(「화면」 표 — 타이틀 · 전시관 · 주기율표 · 도감 네 줄을 「원소 공방(`index.html` · `lib/walk*.js` · `lib/walk.css`) — 주기율표 → 나라(궤도 · 목록) → 가문 → 한 장, 주소 `?n=&mode=&f=&card=&pic=&at=&w=&st=&view=`」 한 줄과 「도구 상자(`lib/toolbox.js`)」 한 줄로; 「화면 차례는 `PAGES`」 문장 지움; 「도감과 즐겨찾기」 절의 link 꼴을 `/element-atelier/index.html?n=&mode=list&card=&pic=` 로, 옛 `dex.html` link 는 넘김으로 산다고; 검사 목록에 `tests/walk-*.cjs` 줄; 「꾸밈」 절에 새 층은 `--frame` · `--ui-*` 를 안 쓴다고), `docs/PATCH.md`

**Interfaces:**
- Consumes: 앞 과제 전부.
- Produces: 없음(정리).

- [ ] **Step 1: 지울 것을 지운다** — 위 grep 결과가 0 인 것만. `lib/workspace-ui.js` 를 지우면 `AppearanceControls` 를 쓰는 곳도 없는지 같이 본다.

- [ ] **Step 2: 전체 검사(여러 화면 구조를 바꿨으니 — CLAUDE.md)** — 브라우저 검사 전부와 node 검사:

```bash
for t in tests/*.cjs; do echo "== $t"; fnm exec --using=22 node "$t" || echo "FAIL $t"; done
```

Expected: `FAIL` 줄 0, 마지막 줄마다 `PASS …`(`favorites.cjs` 는 공방 모음이 옆에 없으면 「건너뜀」 도 통과).

- [ ] **Step 3: 덮개 사진** — `SHOT_DIR="$(mktemp -d)" fnm exec --using=22 node tests/walk-shell.cjs` 처럼 `walk-table` · `walk-orbit` · `walk-list` · `walk-family` · `walk-card` · `walk-tools` 를 `SHOT_DIR` 와 함께 다시 돌려 344×882 사진을 모은다. 실행 세션이 그 경로를 사용자에게 건넨다(커밋하지 않는다).

- [ ] **Step 4: 낱말 · 기록 검사** — `node tests/words.cjs` · `node tests/patch.cjs` → `PASS`.

- [ ] **Step 5: 커밋** — `"원소 「들어가는 곳」 10 — 안 쓰는 탭 머리 · 낱말 정리, AGENTS 화면 표 새로"` + Co-Authored-By 줄.
