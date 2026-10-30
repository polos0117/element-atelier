# 어디서 무엇을 가져왔나 (2026-10-30)

원소의 공방은 game-atelier 를 바탕으로 한다 — 공간·머리·항해·설정·패치 기록·새 판 살피기·그림 자료 계층·그림 등록 자동화를 가져왔고,
세 층(나라·가문·주민) 구조와 세계 셋은 새로 만들었다. 일상컷 트리·도트·결투는 아직.

## 가져온 것

| 파일 | 무엇 | 바꾼 것 |
|---|---|---|
| `lib/workspace.css` · `lib/room.css` | 테마·화면 밀도·껍데기·공간 풍경 | 색은 그대로, 공간 이름만(실험실·천문대·연금술 공방·광산·제어실). 배경 그림 자리는 `element-atelier-img/backgrounds/` |
| `lib/workspace-theme.js` | 테마·배경 고르기 | 열쇠 `element_room_v1`·`element_background_v1` |
| `lib/workspace-ui.js` | 머리·항해·⚙ 설정·머리 접기·공간 고르개 | 문양을 원소 물건(플라스크·궤도·도가니·결정·원자 고리)으로, 접기 열쇠 `element_header_fold`, `PAGES=['index','dex','prompt']` |
| `lib/words.js` · `tests/words.cjs` | 낱말 표 — 화면에 말을 박지 않는다 | 원소 낱말. 표 파일은 `lib/words.js`·`lib/prompt-spec.js` |
| `lib/fresh.js` · `lib/patch.js` · `tests/patch.cjs` | 새 판 살피기 · 패치 기록 | 그대로 |
| `lib/favorites.js` | 즐겨찾기 공용 모듈(공방 모음 원본) | 글자 하나 다르지 않게. 도감에 아직 안 붙였다 |
| `lib/img.js` | 그림 자료 계층 | 그림 저장소 `element-atelier-img`. 폼 = 세계(fantasy·steampunk·mecha), 개방 없음 |
| `tools/roster.py` | 자료 읽기 | 세 층 카드 열쇠(`fe` · `fe-steel` · `fe-steel-sword`), 폼 = 세계 |
| `tools/register-images.py` · `tools/make-thumbs.py` · `tests/register-images.py` · `tests/make-thumbs.py` · `tests/img-shards.cjs` · `.github/workflows/register-images.yml` · 그림 저장소의 `thumbs.yml` | 그림 등록 자동화 | 이름 꼴 `<카드>_<세계>_<화풍>_f.webp` · `<카드>_<화풍>_f_casualN.webp`, 개방·연출컷 없음 |
| `lib/casual-tree.js` · `lib/casual-tree-v2.js` | 일상컷 트리 모듈(버전1 은 버전2 가 시대·장소·의상을 빌린다) | 글자 하나 다르지 않게(공용 모듈). 트리 표 `data/casual-tree.json`·`data/casual-tree-v2.json` 은 game 표에서 원소 몫으로 — `docs/CASUAL_TREE_PORT.md` |
| `tools/casual-tree.py` · `tools/casual-tree-v2.py` · `tests/casual-tree*.{py,cjs}` | 트리 표 검사 | 게임 설계표 의존만 풀었다 |
| 공방 모음 `prompt/hub.js` · `prompt.html` 의 CSS | 통합 생성기 판(칩·단계·폰 막대·시트) | `lib/studio.js`·`lib/studio.css` 로 — 공방 하나라 공방 단계 대신 나라 › 카드 › 갈래, 일상컷은 버전1 단계 대신 버전2 칸 |

## 새로 만든 것

- `data/element-design.json` · `tools/seed-elements.py` · `tools/element-design.py` · `tests/element-design.py` — 설계표(세 층)와 검사.
- `lib/prompt-spec.js` · `lib/prompt-element.js` · `tests/prompt-element.cjs` — 지시문 표·조립. game 의 5,000줄 표를 옮기지 않았다 — 시안이 한 문단 CONCEPT 로 잘 나왔다(myth 공방과 같은 길).
- `index.html`(주기율표·첫 묶음) · `dex.html`(세 층 도감 + 일상컷 줄) · `prompt.html` + `lib/studio.js`(생성기 판) · `lib/element.css` · `tests/screen.cjs`.
- 공간 다섯의 색(`lib/workspace.css`)·배경(`lib/room.css` + 그림 저장소 `backgrounds/room-*.webp`, 도트 공방 호출기로 받은 가로 그림 1536×1024).

## 아직 안 가져온 것

- 일상컷 묶음 계획기(`tools/casual-plan.cjs` · 장부) — 아직 생성기에서 한 장씩.
- 도트(`lib/sprite-actor.js`·`data/sprites.json`) · 즐겨찾기 붙이기 · 결투.
- 공방 모음(polos0117.github.io) 잇기 — 공방 지도 카드·통합 생성기 받침.
