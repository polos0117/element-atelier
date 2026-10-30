# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-30` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.

## 2026-10-30 · claude · 화풍 시네마틱 키아트(cinematic_keyart) 추가 — 철 근본 판타지·스팀펑크 비교 두 장
- data/style.json — cinematic_keyart v1 을 선택 화풍으로(신화 공방 mecha_cinematic_keyart 문장, 열쇠만 짧게). 사용자가 철 근본 판타지·스팀펑크는 CGI 와 살짝 안 어울린다 해서 비교용. 기본은 아직 game_cgi
- data/img.json — 철 근본 세 장(fe_<세계>_cinematic_keyart_f.webp) 등록. 메카는 화풍 비교 때 뽑은 장을 그대로 썼다. 그림 저장소 기록은 <세계>.cinematic_keyart-ui.json

## 2026-10-30 · claude · 기본 화풍을 게임 시네마틱 CGI(game_cgi)로 — 철 근본 세 장
- data/style.json — game_cgi v1 을 기본으로(철 메카 한 장을 2.5D·시네마틱 키아트·CGI 로 나란히 보고 사용자가 「재질이 테마에 어울린다」). 문장은 신화 공방 game_cgi 에서 weapon → prop, 일상컷은 옷감·장신구·자연광. game_keyart 는 선택지로(시안 열두 장의 열쇠)
- data/img.json — 철 근본 세 장(fe_<세계>_game_cgi_f.webp) 등록. 그림 저장소 기록은 기본 화풍 밖이면 <세계>.<화풍>-ui.json
- IMAGE_RULES.md — 화풍·기록 이름 규칙. tests/screen.cjs · tests/prompt-element.cjs — 기본 화풍 열쇠를 style.json 에서 읽는다

## 2026-10-30 · claude · 생성기를 공방 모음 통합 생성기 꼴로 · 일상컷 트리 버전2 · 공간 다섯 리뉴얼
- prompt.html · lib/studio.js · lib/studio.css — 생성기 판을 공방 모음 통합 생성기(prompt/hub.js) 꼴로 다시 썼다(사용자 「UI 는 허브 통합 생성기」): 나라 › 카드 › 갈래(세계 그림 · 일상컷) › 단계 한 칸씩, 칩·해방(트리 밖 + 까닭)·랜덤·여기부터 다시·처음부터, 폰 레일·아래 막대·시트. 일상컷은 버전2 칸(시대 → 장소 → 계절·날씨 → 의상 → 옷 → 자세 추천 → 몸 자세 → 받침 → 프레이밍 → 몸·머리 방향 → 카메라 → 오른손·왼손 → 소품 동작 → 다리 → 시선 → 표정 → 덧붙임). 고른 것은 element_studio_v1
- lib/casual-tree.js · lib/casual-tree-v2.js — game·pkm 과 같은 공용 모듈(글자 하나 다르지 않게). data/casual-tree.json · data/casual-tree-v2.json — 원소 몫 트리 표(시대 now·site·nation·fantasy, 원소의 현장 site_* 열 곳, 나라 안 nation_* 일곱 곳, 원소 소품 여섯). tools/casual-tree*.py · tests/casual-tree* — 검사. 무엇을 바꿨나는 docs/CASUAL_TREE_PORT.md
- lib/workspace.css · lib/workspace-theme.js · lib/room.css — 공간 다섯(실험실·천문대·연금술 공방·광산·제어실)의 색을 새로 짜고, 배경 그림 다섯(그림 저장소 backgrounds/room-*.webp, 도트 공방 호출기로 받음)을 맨 아래 겹에 깐다
- dex.html — 일상컷 줄을 카드마다(근본만이 아니라 가문주·주민도) 세계 셋 아래에
- lib/words.js — 생성기 판 낱말(studio.*)·프레이밍 이름·트리가 거른 까닭. tests/screen.cjs — 생성기 검사를 새 판에 맞게(세계 그림·일상컷 한 칸씩·자세 추천·해방·랜덤·다시·폰 레일/막대/시트) — 61가지
- AGENTS.md · IMAGE_RULES.md · docs/ELEMENT_CONCEPT.md · docs/PORT_NOTES.md — 일상컷 버전2·생성기 판·공간 리뉴얼

## 2026-10-30 · claude · 일상컷 지시문(트리 버전2) 조립
- lib/prompt-spec.js — 일상컷 표(CASUAL 줄 묶음 · 고정값 · 화면비 · CROP · 두 축 · 렌즈 · 표정)를 game-atelier 에서 옮겼다. 첨부 그림이 없으니 INPUT 은 글만, CHARACTER 는 「누구의 의인화」, 「그 게임」 자리는 「그 원소」(장신구·주변 사물로만, 옷·갑옷으로는 안 옮긴다). 함수는 없다.
- lib/prompt-element.js — buildCasual(D, S, 카드, 장면, {style, tree, tree2}) · casualFile · casualRecord · casualDetailsV2 · exprNoGaze. 차례는 game 의 buildCasualV2 와 같고 시대 줄은 표의 시대 열쇠(now · site · nation · fantasy)로 고른다.
- tests/prompt-element.cjs — 카드 다섯 × 시대 넷 · 랜덤 · 해방 · 돌아보기 · 클로즈업 · 두 손 소품 · 고정값 · 기록. 표·모듈이 없으면 game 것을 빌려 돈다.

## 2026-10-30 · claude · 원소의 공방 — 뼈대
- data/element-design.json — 설계표. 나라(원소) › 가문(물질) › 주민(물건) 세 층, 세계 셋(판타지·스팀펑크·메카). 사실 칸 118원소는 tools/seed-elements.py 가 채웠고, 설계 칸은 철·수소·산소·탄소·나트륨·금·오가네손 일곱 나라(가문 15, 주민 33).
- data/style.json — 화풍 판 game_keyart v1(시안 열두 장을 뽑은 문장 그대로). data/img.json — 빈 등록부.
- lib/prompt-spec.js · lib/prompt-element.js — 지시문 표와 조립(CONCEPT → TRAITS → WORLD → STYLE → OUTPUT·BODY·규칙). 층마다 CONCEPT 한 문장, 입는 물건은 WEARS 줄, 메카는 설계 문장. 파일 이름·기록도 여기서.
- index.html · dex.html · prompt.html · lib/element.css · lib/words.js — 첫 화면(주기율표·첫 묶음·패치 기록·공간), 도감(근본·가문주·주민 세 세계, 같은 물질 다른 나라 잇기, 크게 보기), 생성기(나라 › 카드 › 세계 › 덧붙임 → 지시문·파일 이름·기록).
- lib/workspace*.{css,js} · lib/room.css · lib/fresh.js · lib/patch.js · lib/favorites.js · lib/img.js — game-atelier 에서. 열쇠(element_room_v1 …)·문양·공간 이름만 바꿨다.
- tools/roster.py · tools/element-design.py · tools/seed-elements.py · tests/* — 자료 읽기, 설계표 검사, 씨앗, 검사(지시문·설계표·낱말·패치·화면·그림 등록).
- AGENTS.md · IMAGE_RULES.md · README.md · CLAUDE.md · docs/ELEMENT_CONCEPT.md · docs/PORT_NOTES.md — 규칙과 기획.
