# 작업 지침

**뼈대 · 설계표(일곱 나라) · 생성기 · 도감 · 그림 등록 자동화** 까지 왔다(2026-10-30). 지금은 철나라를 끝까지 그리는 단계 — `docs/ELEMENT_CONCEPT.md` 6절.
껍데기는 game-atelier 에서 가져왔다 — 무엇을 어디서 가져왔는지는 `docs/PORT_NOTES.md`.

## 먼저 읽을 것

| 문서 | 무엇 |
|---|---|
| 이 문서 | 규칙과 자리 |
| `docs/ELEMENT_CONCEPT.md` | 기획 — 왜 세 층인가·세계 셋·설계표 칸·지시문·첫 묶음·만드는 차례 |
| `data/element-design.json` | 설계표. 나라(원소) › 가문(물질) › 주민(물건) |
| `IMAGE_RULES.md` | 그림 만들기·파일 이름·기록·올리기 — 그림 작업 전에 |
| `docs/IMAGE_AUTOMATION.md` | GPT 세션(사람이 안 지켜보는) 이미지 작업 — 잠금(`tools/image-claim.cjs`) · 일상컷 계획기(`tools/casual-plan.cjs`, 세계마다 다섯 장) · 지시문 묶음(`tools/prompt-pack.cjs`) · 검수 · 묻지 않고 올리기 |
| `data/style.json` | 화풍 판 — 세계 그림은 `text`, 일상컷은 `casual` |
| `docs/PORT_NOTES.md` | 어디서 무엇을 가져왔고, 무엇을 아직 안 가져왔나 |
| `docs/PATCH.md` | 무엇을 고쳤나 — 고친 쪽이 직접 적는다 (아래 규칙 6) |

## 화면

| 화면 | 파일 | 무엇 |
|---|---|---|
| 타이틀 | `index.html` · `lib/material.css` | 게임 첫 진입 화면처럼(2026-11-02 「메인화면 구성을 지금 삼국지처럼」): 공간의 배경 장면을 화면 가득, 공간마다 생성한 그림 현판 · 단추(그림 저장소 `backgrounds/ui/`)로 메뉴 넷(머리 메뉴와 같은 차례 — 주기율표 · 전시관 · 도감 · 프롬프트, 강조는 전시관), ◀ ▶ · ← → 로 공간 넘기기, 빈 곳을 누르면 배경만 |
| 전시관 | `gallery.html` · `lib/gallery.css` | 감상용(2026-11-02 「감상용 디지털 아카이브 — 레이어 줌인 · 원형」). 그려진 카드만 건다 — 섬(나라들) → 나라(원소마다 생성한 궤도 그림 — 그림 저장소 `backgrounds/orbits/orbit-<나라>.webp`, 큰 고리 반지름은 기록 `ring` · `gallery.html` 의 `RING` — 위에 가문 이름표만, 누르면 큰 그림 미리 보기 → 「크게 보기」(한 장) · 「주민 보기」(가문)) → 가문(가문주 크게 · 주민은 장식 틀 액자) → 한 장(화면 가득 · ← → 세계 · Esc). 세계(판타지 · 스팀펑크 · 메카)는 위 막대에 늘 있고 바꾸면 같은 카드가 그 세계 그림으로(새 그림이 스르르 — 뷰 전환은 폰에서 터치를 3초 넘게 붙잡아 뺐다). 그 세계 그림이 없으면 다른 세계 것을 「…의 그림」 표시로. 사실 칸은 elements 의 것만. 주소 `?n=&f=&c=&w=&v=1`, 층마다 뒤로 가기. 도감은 그림을 채우는 작업 화면으로 그대로 |
| 주기율표 | `hall.html` · `lib/element.css` | 주기율표 118칸(설계된 나라만 색·누르면 도감) · 첫 묶음 나라 카드(인격·가문·주민·그림 수) · 패치 기록 · 공간 |
| 도감 | `dex.html` · `lib/img.js` · `lib/element.css` | 나라 하나 — 사실 칸·인격·성질 · 근본 세 세계 · 가문마다 가문주 세 세계 + 주민들(사는 세계만) · 같은 물질 다른 나라 잇기 · 크게 보기 · 빈 자리를 누르면 그 카드의 생성기. 등록부 `data/img.json` 에 적힌 것만 |
| 프롬프트 | `prompt.html` · `lib/studio.js` · `lib/studio.css`(판) · `lib/prompt-spec.js`(표) · `lib/prompt-element.js`(조립) · `lib/casual-tree.js` · `lib/casual-tree-v2.js` · `data/casual-tree.json` · `data/casual-tree-v2.json`(일상컷 트리) | 생성기 — 공방 모음 통합 생성기 꼴(한 단계씩, 칩·판·폰 아래 막대·시트). 나라 › 카드(근본·가문주·주민) › 갈래(세계 그림 · 일상컷) › 단계 → 지시문·올릴 파일 이름·기록 JSON. 세계 그림은 세계 → 덧붙임. 일상컷은 트리 버전2 — 시대 → 장소 → 계절·날씨 → 의상 → 옷 → 자세 추천 → 몸 자세 → 받침 → 프레이밍 → 몸·머리 방향 → 카메라 → 오른손·왼손 → 소품 동작 → 다리 → 시선 → 표정 → 덧붙임. 해방(트리 밖 + 까닭)·랜덤·여기부터 다시·처음부터. 고른 것은 이 브라우저에(`element_studio_v1`), 주소 `?card=&o=&world=` |

머리·항해·⚙ 설정은 `lib/workspace-ui.js`, 공간(테마)은 `lib/workspace-theme.js`·`lib/workspace.css`·`lib/room.css` — 공간 다섯(실험실·천문대·연금술 공방·광산·제어실)은 색과 배경 그림(그림 저장소 `backgrounds/room-<공간>.webp`, 기록 `records/backgrounds/`)을 원소에 맞게 새로 짰다(2026-10-30).
`lib/casual-tree.js`·`lib/casual-tree-v2.js` 는 game·book·myth·pkm 이 글자 하나 다르지 않게 복사해 쓰는 공용 모듈이다 — 여기서 따로 고치지 않는다(고치면 다섯 저장소에 같이). 트리 표(`data/casual-tree*.json`)는 원소 몫 — 시대는 지금 현실·쓰임의 현장·나라 안·무대·환상, 원소의 현장(`site_*`)·나라 안(`nation_*`) 장소. 무엇을 바꿨나는 `docs/CASUAL_TREE_PORT.md`, 설계는 game 의 `docs/CASUAL_TREE_V2.md`.
화면 차례는 `lib/workspace-ui.js` 의 `PAGES` 한 곳이다 — 화면을 붙이면 거기 더한다.
`lib/favorites.js` 는 공방 모음(polos0117.github.io)의 `favorites.js` 를 글자 하나 다르지 않게 복사한 공용 모듈이다. 여기서 따로 고치지 않는다.

## 꾸밈 · 글꼴

- 공간 다섯의 장식 틀(`--frame`, 그림 저장소 `backgrounds/frames/frame-<공간>.webp` — 투명 여백을 잘라낸 9칸 틀, 자르기 %는 기록 `processing`), 그림 단추(`--ui-*`, 그림 저장소 `backgrounds/ui/ui-<공간>-<title|main|btn|round>.webp`)와 제목 글꼴(`--gallery-serif` — 실험실 · 제어실 Orbit · 천문대 Hahmlet · 연금술 공방 Song Myung · 광산 Black Han Sans)은 `lib/material.css` 한 곳. 본문 글꼴은 IBM Plex Sans KR(400 · 700 두 굵기). 제목 글꼴은 `lib/workspace-theme.js` 가 지금 공간의 것 하나만 붙이고, 글꼴 줄은 전부 화면 그리기를 막지 않는다(`media="print"` → onload — 2026-11-02 「화면 로딩이 엄청 느린데」 — 다섯 글꼴을 모든 화면이 받아 글꼴 목록만 514KB 였다).
- 디자인 점검 skill: `.claude/skills/frontend-design`(방향 · 글꼴 · 테두리), `.claude/skills/ui-ux-pro-max`(글꼴 짝 · 스타일 · UX 규칙 검색 — `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<질문>" --domain typography`), `.claude/skills/web-design-guidelines`(규칙 점검). sam-atelier 에서 옮겼다(2026-11-02).

## 지켜야 할 것

### 1. 주민은 물건이다

형체 없는 것(물·숨·녹·피)은 가문(물질)으로 두고, 그 아래 주민은 재질·색·형태를 옷과 소품으로 옮길 수 있는 **물건**으로 적는다(물병·산소통·녹슨 갑옷·수혈팩).
주민은 세계 그림에서 물건을 들지 않는다 — 모티브로만. 입는 물건(갑옷·헬멧·금관)은 `wear: true`. 일상컷에서는 든다(설계표 `hold.en`, 주민은 `object.en` — 2026-10-30).
나라마다 세계마다 장소 변주 `scenes` 셋이 있다 — 생성기 「장면」 칸. 새 나라를 설계하면 `scenes`·`hold`·`look` 을 같이 적는다.

### 1-1. 일상컷은 트리 버전2로, 세계마다 다른 사람

일상컷(현대)은 트리 버전2(`lib/casual-tree-v2.js`)로 고른다 — 하는 일 칸이 없고, 구도가 보이는 부위를 정한 뒤 손·다리를 그 안에서만 고른다. 생성기 판이 한 칸씩 연다.
세계 그림은 기준 그림 없이 — 얼굴·생김새·자세는 세계마다 따로(사용자 2026-10-30). 일상컷은 그 세계 그림을 참고 그림으로 붙여 그 사람의 지금 평상시를 그린다 — 세계를 타고 화풍도 그 그림을 따른다(사용자 2026-10-30).
원소 성질은 일상컷에선 장신구·주변 사물로만(옷의 색·무늬로 옮기지 않는다). 화풍은 게임 키아트 2.5D 가 기본(`IMAGE_RULES.md` 1절 — 2026-10-31 CGI 에서 바꿨다).

### 1-2. 외형은 설계표 look 에서 — 팔레트 색이 머리·눈 색

나라마다 `look`(얼굴 여섯 + 실루엣 셋)이 있다. 어휘는 `lib/look-spec.js`(game 의 외형 표를 `tools/port-look-spec.cjs` 로 옮긴 것 — 손으로 고치지 않는다, 원소 몫 색은 스크립트의 EXTRA 에만).
헤어스타일·얼굴형·눈 모양은 `look.worlds.<세계>` 로 세계마다 다르다(세계마다 다른 사람). 가문은 제 팔레트로 머리색·눈 색만 덮어쓰고(머리 모양까지 가르면 그것도 세계마다), 주민은 눈 색·체형을 가문에서 받고, 머리색은 물건 재질 색(설계표), 헤어스타일·얼굴형·눈은 조립기가 가문주와 다르게 돌린다(2026-10-31)(사용자 2026-10-30 「팔레트 색상 속성을 머리·눈 색으로」). 생성기 세계 그림 갈래는 세계 → 설계 줄(실루엣·얼굴 싣기 · 노출) → 외형(game 과 같은 네 묶음, 세계마다 따로) → 덧붙임.
직접 고른 외형이 설계 묶음을 이긴다. 새 나라를 설계하면 `look` 도 같이 적고 `node tests/look-spec.cjs` 로 어휘를 맞춘다.

### 2. 성질은 시각 언어 한 줄, 세계는 연도·장소·기술

나라의 `traits.en` 한 줄이 그림을 정한다 — 색·재질·움직임·냄새까지. 세계 글(`worlds.<세계>.en`)은 연도·장소·기술을 못 박는다.
합성 원소(93번 이후)의 판타지는 「예언된 나라」(별지도의 빈칸). 가벼운 원소의 메카는 「판은 갑옷으로 읽혀야 한다」(표가 늘 싣는다).
설계표를 고치면 `python3 tools/element-design.py check`.

### 3. 사실은 지어내지 않는다

번호·기호·이름·족·주기·분류·상태·합성 여부는 `elements` 칸에만 있고 `tools/seed-elements.py` 가 채운다. 발견 연도·발견자 같은 칸은 아직 없다 — 넣으려면 출처를 함께 둔다.

### 4. 화면에 말을 적지 않는다

사람이 읽는 말은 전부 `lib/words.js` 에서 온다(`W('nav.dex')`). 생성기의 영어 문구는 `lib/prompt-spec.js`, 외형 선택지는 `lib/look-spec.js`. 셋은 한글 검사에서 빠지는 대신 "표뿐인가" 를 따로 본다 — `node tests/words.cjs`. `<title>` 은 `app.title` 과 같아야 한다. 설계표의 글은 자료라서 화면이 그대로 읽는다.

### 5. 그림은 이 저장소에 두지 않는다

그림은 `element-atelier-img` 에 올린다. `img/` 는 `.gitignore` 에 있다. 원본 PNG 는 올리지 않는다.
그림 규칙은 `IMAGE_RULES.md`. 그림 저장소에 올리면 썸네일(`element-atelier-img` 워크플로)과 등록(`그림 등록` 워크플로 · `tools/register-images.py`)이 알아서 된다 — `data/img.json` 은 손으로 고치지 않는다.

### 6. 고쳤으면 적는다

파일을 고쳤으면 `docs/PATCH.md` 맨 위에 한 칸 적는다. 커밋 메시지로 갈음하지 않는다.

```
## 2026-10-30 · claude · 무엇을 바꿨나
- data/foo.json — 왜 고쳤나
```

날짜는 `2026-10-30` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 맨 위로 간다. `node tests/patch.cjs` 가 모양을 본다.

### 7. 올리기

`main` 에 직접 올린다. 작업 브랜치·PR 은 만들지 않는다. 강제 push 와 남의 작업 지우기는 하지 않는다.

## 검사

```bash
python3 tools/element-design.py check   # 설계표 — 빈칸·열쇠 꼴·세계 셋·가문의 원소·겹치는 가문·사실 칸 118
python3 tests/element-design.py         # 검사기가 규칙마다 거는지
node tests/prompt-element.cjs           # 지시문 — 모든 카드 × 사는 세계, 뼈대 줄, 입는 물건, 메카 설계, 덧붙임, 기록, 파일 이름 · 일상컷 버전2 줄
python3 tools/casual-tree.py check      # 일상컷 트리 표(버전1 몫 — 시대·장소·의상) · audit — 하는 일 문장의 고정물이 장소에 없는 쌍
python3 tools/casual-tree-v2.py check   # 일상컷 트리 버전2 표 — 없는 열쇠·두 손 칸·보이는 손 자리·다리 칸·다 되는 장소 없는 자세 추천
python3 tests/casual-tree-v2.py · node tests/casual-tree-v2.cjs   # 검사기·거르기 모듈이 규칙마다 거는지
node tests/casual-plan.cjs              # 일상컷 묶음 계획기 — 카드 × 사는 세계 × 씨앗이 다섯 장 · 묶음 규칙 · 네 시대 · 기록 꼴, 있는 컷 위에 모자란 만큼
node tests/image-claim.cjs              # 이미지 작업 잠금 — bare 저장소로 잡기 · 겹침 · 몫 없음(원소) · push 경합 되돌림
node tests/words.cjs                    # 낱말 표
node tests/patch.cjs                    # 패치 기록 모양
python3 tests/register-images.py        # 그림 등록 — 이름 꼴·자리·등록한 날·틀린 이름은 저장 안 함
python3 tests/make-thumbs.py            # 썸네일 도구
node tests/img-shards.cjs               # 그림 주소·등록기·워크플로·.gitignore 가 같은 저장소 차례

# 브라우저 — ESM_DIR 에 preact 가 든 node_modules, CHROMIUM_PATH 에 브라우저
CHROMIUM_PATH=<chrome> node tests/prompt-pack-screen.cjs   # 지시문 묶음(tools/prompt-pack.cjs)의 기록을 생성기에 넣으면 같은 지시문 · 같은 번호 · 틀린 설정은 안 씀
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/screen.cjs   # 타이틀·주기율표·도감·생성기 — 폰·PC, 118칸, 세 층, 세계 그림·일상컷 버전2 한 칸씩·자세 추천·해방·랜덤·다시, 폰 레일·막대·시트, 콘솔 오류 없음
```

### 도감과 즐겨찾기(2026-10-31)

도감(`dex.html`)은 위에 붙는 판(보기: 세계 그림·일상컷·전부 / 세계 / 바로 가기 / 즐겨찾기 수) 아래 카드마다 세계 그림 셋만 펴고, 일상컷·다른 화풍은 접은 단추로 연다. 크게 보기는 그 카드 그림을 차례로 넘기고(← → · 밀기 · Esc) 하트로 공방 모음 즐겨찾기에 담는다 —
`lib/favorites.js`(공방 모음 `favorites.js` 와 글자 하나 다르지 않게, `node tests/favorites.cjs`), 공방 열쇠 `a: element`, link 는 `/element-atelier/dex.html?nation=&card=&pic=`(그 그림을 크게 보기로 연다). 공방 모음 `favorites.html` 이 「원소의 섬」 칩으로 모아 보인다.
