# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-30` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.

## 2026-10-30 · claude · 원소의 공방 — 뼈대
- data/element-design.json — 설계표. 나라(원소) › 가문(물질) › 주민(물건) 세 층, 세계 셋(판타지·스팀펑크·메카). 사실 칸 118원소는 tools/seed-elements.py 가 채웠고, 설계 칸은 철·수소·산소·탄소·나트륨·금·오가네손 일곱 나라(가문 15, 주민 33).
- data/style.json — 화풍 판 game_keyart v1(시안 열두 장을 뽑은 문장 그대로). data/img.json — 빈 등록부.
- lib/prompt-spec.js · lib/prompt-element.js — 지시문 표와 조립(CONCEPT → TRAITS → WORLD → STYLE → OUTPUT·BODY·규칙). 층마다 CONCEPT 한 문장, 입는 물건은 WEARS 줄, 메카는 설계 문장. 파일 이름·기록도 여기서.
- index.html · dex.html · prompt.html · lib/element.css · lib/words.js — 첫 화면(주기율표·첫 묶음·패치 기록·공간), 도감(근본·가문주·주민 세 세계, 같은 물질 다른 나라 잇기, 크게 보기), 생성기(나라 › 카드 › 세계 › 덧붙임 → 지시문·파일 이름·기록).
- lib/workspace*.{css,js} · lib/room.css · lib/fresh.js · lib/patch.js · lib/favorites.js · lib/img.js — game-atelier 에서. 열쇠(element_room_v1 …)·문양·공간 이름만 바꿨다.
- tools/roster.py · tools/element-design.py · tools/seed-elements.py · tests/* — 자료 읽기, 설계표 검사, 씨앗, 검사(지시문·설계표·낱말·패치·화면·그림 등록).
- AGENTS.md · IMAGE_RULES.md · README.md · CLAUDE.md · docs/ELEMENT_CONCEPT.md · docs/PORT_NOTES.md — 규칙과 기획.
