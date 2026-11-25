Warning: truncated output (original token count: 55755)
Total output lines: 1252

# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-30` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.


## 2026-11-26 · claude · GPT 세계컷 주문서 머리 갈래 — 네 공방 같은 꼴
- lib/prompt-spec.js — 네 공방 같은 꼴로: 기본값 막는 문구(어깨 위로 푼 머리 + 옆 앞머리 · 머리 장식, 아주 긴 머리 갈래는 빼고) · hairFamilies 에 rx
- docs/IMAGE_AUTOMATION.md — 같은 말
- ?v — prompt-spec 64

## 2026-11-26 · claude · 일상컷 머리 연출 13가지 · 짧은 머리 거르기
- lib/prompt-spec.js — 사용자 「일상컷 머리연출도」: 일상컷 머리 연출 5 → 13(반묶음 · 똥머리 · 옆으로 묶기 · 양갈래 · 핀으로 틀어올림 · 한쪽으로 넘김 · 귀 뒤로 넘김 · 머리띠)
- data/casual-tree-v2.json — ambience.hair 에 긴 머리만(long — 묶음 · 땋음 · 반묶음 · 똥머리 · 옆 · 양갈래 · 핀), ambience.short_hairs(짧은 커트 · 픽시 · 단발 · 비대칭 단발 · 핑거 웨이브 · 삐죽 · 올백 · 언더컷 · 울프컷)
- lib/casual-tree-v2.js — style-atelier shared 원본에서 sync: ambience — 설계 헤어스타일(opts.hairKey)이 표 short_hairs 가운데면 긴 머리 연출(hair.*.long)을 안 고른다
- tools/casual-plan.cjs — 계획기가 그 세계 설계 헤어스타일을 넘긴다(장수 120명 × 일곱 컷 시험: 머리 연출 209컷에 13가지 고르게, 짧은 머리에 긴 연출 0)
- lib/prompt-element.js — hairKey · lib/prompt-spec.js 한글 표 ko.chair 여덟 · ?v — prompt-spec 63 · casual-tree-v2 23 · prompt-element 57

## 2026-11-26 · claude · GPT 세계컷 주문서에 머리 갈래
- lib/prompt-spec.js · lib/prompt-element.js — 사용자 「원소공방에서 gpt가 만드는 세계컷은 어때? 인물마다 헤어스타일이 다 비슷한 느낌이던데」 → 「머리만 해주고」: GPT 설계 38장이 거의 다 어깨~가슴 길이로 푼 머리 + 옆 앞머리였다. WORLD_FREE.hairFamilies(올림 · 땋기 · 묶음 · 쌍 · 아주 긴 · 짧은 · 모양 · 반묶음 여덟) · fill.family — 설계 1 · 2 에 다른 갈래를 카드 · 세계로 돌려 가며(우리 설계 갈래는 뺀다, 354 짝에 갈래마다 71~111번), 그 기본값은 막는다(hairFamilyPair)
- docs/IMAGE_AUTOMATION.md — GPT 설계 기록엔 주문서가 아니라 GPT 가 채운 지시문(free_prompt) · SUMMARY 줄(summary) · 머리 갈래(hair_family)

## 2026-11-25 · claude · 팔이 더 생기거나 잘리는 것 막기 — 카메라 쪽 팔 · 한 줄 팔
- lib/casual-tree-v2.js — style-atelier shared 원본에서 sync: 손 줄 끝말 — 뒤 3/4 몸에도 카메라 쪽 팔(일하는 손 쪽 · 화면 그쪽) · 먼 팔(몸 뒤로 거의 숨고 손만 엉덩이 옆), 돌아보는 어깨도 일하는 손 쪽. 소품 · 손짓 손은 「어깨에서 손까지 한 팔, 아래팔을 소매 · 리본 · 장식이 덮지 않음」, 옆에 내려 드는 소품은 「몸 옆에 붙여, 카메라 쪽으로 내밀지 않음」
- prompt.html — casual-tree-v2.js ?v=22
- tests/prompt-element.cjs — 두 손 소품 손 줄은 「is in PROP」 뒤에 팔 잇기 말이 붙어도 된다

## 2026-11-25 · claude · 앉은 · 누운 뒷태
- lib/casual-tree-v2.js — style-atelier shared 원본에서 sync: 옆으로 누운 돌아보기(lie_side)는 위의 오른 어깨 너머로(왼쪽으로 눕는다 — 깔린 어깨 너머로는 못 돈다)
- data/casual-tree-v2.json — 사용자 「앉아서나 누워서도 뒷태가 보이게도 해줘. 모든 의상에서」: 앉은 · 누운 뒷태 추천 다섯 — 걸터앉아 풍경 보는 뒷모습 · 바닥에 앉아 어깨 너머 돌아보기 · 무릎 꿇고 앉아 돌아보기 · 옆으로 누워 등 보이며 돌아보기 · 엎드려 누운 뒷태로 돌아보기(추천은 의상과 무관 — 장소만 맞으면 모든 의상에서). 받침 front_floor(엎드려 팔뚝)에 손 natural
- prompt.html — casual-tree-v2.js ?v=21
- tests/prompt-element.cjs — 랜덤 표본이 동물 동반 장소(말 타기)를 처음 뽑아 걸림: ONE MAIN FIGURE 줄은 동물 동반 줄(figureCompanion)도 받는다 · 일상컷 길이 상한 1300 → 1350(말 돌보기 1310)

## 2026-11-25 · claude · 자연스러운 돌아보기 · 뒷태 · 카메라 쪽으로 숙인 상체
- lib/casual-tree-v2.js — style-atelier shared 원본에서 sync: 돌아보기 머리 줄(backLook.head) — 턱이 가까운 어깨 위 · 그 어깨가 살짝 내려옴 · 윗등이 고개를 따라 조금 돎(날개뼈 · 등줄기) · 엉덩이는 돌아간 채. 돌아보는 컷의 backLock 을 「고개 · 목만」 에서 「가슴을 카메라로 다 비틀지는 않는다」 로(목만으론 못 돌아 억지 자세였다)
- data/casual-tree-v2.json — 사용자 「이렇게 뒤돌아보는 자세가 지금은 없나? 있어도 뭔가 자연스럽게 나오는것 같지가 않아」 · 「이런 자세도 없지? 자연스러운 뒷태구도나, 앞으로 살짝 숙인 상체」: 자세 lean_in(카메라 쪽으로 상체 숙이기 — 다리 편히 · 짝다리 · 한 발 앞, 손 무릎 · 허리 · 내림). 추천 일곱 — 서서 어깨 너머 돌아보기(전신 · 짝다리 · 소품) · 난간에 기대 돌아보기(허리 위) · 가까이서 돌아보기(허리 위 — 가슴 위 컷은 뒤쪽 몸을 막는다) · 숙여 다가오기(올려다봄 · 손 무릎) · 숙여 얼굴 가까이 · 작업대에 숙인 뒷모습(옆얼굴) · 높은 선반에 손 뻗는 뒷모습
- prompt.html — casual-tree-v2.js ?v=20

## 2026-11-25 · claude · 뒷모습 상체 비틀림 막기
- lib/casual-tree-v2.js — style-atelier shared 원본에서 sync: 뒷모습 비틀림 막기(backLock) — 「몸방향 뒤, 시선먼곳, 카메라 눈높이 일 때, 자세는 뒷모습을 보이며 걸어가는 자세인데, 상체는 카메라쪽으로 돌아있어서 기괴한 이미지들이 있네」. 몸이 뒤쪽이면 COMPOSITION 줄에 어깨 · 가슴 · 엉덩이가 한 줄로 돌아가고 허리 비틀림 없음, 노출은 뒤에서 보이는 곳만
- prompt.html — casual-tree-v2.js ?v=19

## 2026-11-25 · claude · 일상컷 색인에 실루엣 갈래
- tools/casual-index.cjs · data/casual-index.json — 색인 줄에 cls · clsKo(수영복 · 란제리 · 역할극 … 계열의 재단 갈래 — 하드웨어 · 쿠튀르 장식 · 크롭 투피스 …). 공방 허브 「전체 그림 찾기」 의 「실루엣 갈래」 거르기가 읽는다(사용자 「실루엣 갈래도 색인에 넣어줘」)

## 2026-11-25 · claude · 생성기 옷 특징 낱말 — 운동복 · 수영복 · 열린 목선
- lib/words.js — 오늘 몸짓 · 운동 작업이 더한 옷 특징(sportswear · swimsuit · cleavage)의 화면 이름이 없어 생성기 콘솔에 빠진 낱말 경고(도시 screen 검사 실패). 세 낱말을 더하고 words ?v 올림

## 2026-11-25 · claude · 일상컷 몸짓 — 빵 물기 · 가슴 사이 물건 · 경례 · 가로 브이 · 갸루 피스 · 눈가리기 브이
- data/casual-tree-v2.json — 사용자 「일상컷에 입에 빵물고 있기, 가슴 사이에 물병이나 다른 물건 끼우거나 올리기, 경례하기, 가로브이, 갸루피스, 눈가리기 브이 장면도 넣어줘」 · 「아 게임기나 pc로 게임하는 장면도」 · 「스포츠경기 관람은 있는데 실제로 하는건 없네」 · 「수영, 테니스, 요가, 놀이터 …, 놀이기구, 워터파크, 자전거, 조깅, 모래성」 · 「수영쪽에서 공기매트 띄워서 누워있는 것」. 손 몸짓 넷(salute 경례 · v_side 가로 브이 · gyaru_peace 갸루 피스 · v_eye 눈가리기 브이)과 자세 추천 여덟(가슴 위 · 얼굴 클로즈업 · 허리 위, 서서 · 앉아 — preset_once 무리라 한 캐릭터 한 장까지, exprs 장난 · 당당 · 윙크). 빵 물기(소품 toast · toast_mouth — 입을 쓰는 동작, exprs 는 입을 벌리지 않는 표정). 가슴 사이 물건 끼우기 · 얹기(물병 · 휴대폰 · 부채 · 선글라스 *_tuck · *_chest — 옷 특징 cleavage 인 옷만, 놀이터 안 됨). 게임(휴대용 게임기 · 패드 · 게임용 컴퓨터 handheld · gamepad · pc_rig). 운동 경기 하기(농구 · 야구 · 축구 · 배구 · 배드민턴 · 탁구 · 테니스 포핸드 · 준비 자세 · 골프 어드레스 · 피니시 · 볼링 굴리기)와 장소 넷(야구장 · 축구장 · 비치발리볼 코트 · 실내 체육관). 수영(자유형 · 물에 누워 뜨기) · 워터 슬라이드 착수 · 공기매트(float_lounge · float_front, 받침 float_raft, 3:2) · 요가 셋 · 조깅(장소 특징 run_path) · 놀이터(그네 · 미끄럼틀 · 시소 · 정글짐, 장소 playground) · 모래성(sand_bucket). 하는 일 갈래 sport(운동 · 놀이). 새 추천 · 소품 · 장소는 start_median.
- data/casual-tree-v2.json — once_groups: 몸짓 · 가슴 사이 물건만 한 묶음 한 장까지. 운동 · 놀이 · 게임 · 빵 물기는 보통 빈도(사용자 「몇 개는 일상적으로 흔하게 하는 것들인데, 특히 운동은 … 이제는 신경안쓰려고」 — 활동 장면의 그림 오류를 받아들인다). 요가 · 조깅 자세는 운동복(sportswear), 헤엄 · 공기매트는 수영복(swimsuit) 옷 특징이 있어야(자세 outfit — 손 칸을 비워도 걸린다).
- data/casual-tree-v2.json · data/casual-tree.json — 놀이터(장소 특징 k_kids): 아이들이 배경에 작게만 나올 수 있어 평상복 · 운동복 · 레트로만(outfit_rules not_has k_kids), 상황 노출 없음(situ_not_has), 가슴 사이 물건 동작 없음(not_has). 조립기가 Place 뒤에 People(배경 아이들) · Coverage(덮인 옷) 두 줄을 싣고 노출 축은 적게(kids_place).
- lib/casual-tree-v2.js — style-atelier shared 원본에서 sync: 소품 동작 · 자세의 outfit(옷 특징) · 소품 동작 not_has · 표 situ_not_has, FEATURES 에 cleavage · sportswear · swimsuit · underlayer.
- tools/casual-tree-v2.py — 같은 규칙(옷 특징 셋 · 소품 동작 outfit · not_has · 자세 outfit). tests/casual-tree-v2.cjs — 견주기의 옷 계열이 소품 동작 · 자세의 옷 특징도 보게, 놀이터 규칙 검사(옷 계열 · 랜덤 · 상황 노출 · 가슴 사이 물건 · once_groups 열쇠).
- tools/casual-plan.cjs — once_groups · start_median · exprs · 놀이터(도시와 같다). data/casual-tree.json — 나라 안 공놀이 마당(nation_games, 세 세계 글) · 하는 일 셋에 그 장소, 그 나라의 공 · 놀잇감(world_ball · world_game).
- lib/prompt-element.js — 놀이터 줄 두 개 · 노출 적게. tests/prompt-element.cjs — 놀이터 검사, 게임하는 자리 · 동작(오락실 · PC방 · e스포츠 · 게임기)은 「게임 말」 검사에서 뺌. tests/casual-tree.cjs — 나라 안 장소 수. prompt.html · index.html — ?v= 올림.

## 2026-11-25 · claude · 크게 보기 일상컷 설명 — 장소 · 하는 일 · 구도 + 더 보기
- tools/casual-detail.cjs(새, 네 공방 같은 파일) — 사용자 「장소나 포즈, 표정, 구도 등 … 어디까지」 → 「응 그 범위로」: 색인 줄 끝 s 에 장면 풀이(둘째 줄 장소 · 하는 일 · 구도, 더 보기 표정 · 시선 · 몸 방향 · 카메라 · 렌즈 · 빛 · 시간대 · 날씨 · 순간 · 화면 구성 · 상황 노출 · 옷 꾸밈 · 시대 · 화면비). 손 · 받침 · 고개는 뺐다, 자유 설계 컷은 GPT 가 채운 줄만(영어), 빈 칸은 뺀다
- tools/casual-index.cjs · tests/casual-index.cjs · data/casual-index.json — s 를 줄 끝에(허브 일상컷 목록이 읽는 칸 · 차례는 그대로), 다시 지음
- lib/casual-note.js · lib/words.js · lib/walk.css · lib/walk-card.js · lib/walk.js · index.html — 한 장 두 줄 + 「더 보기」(44px · aria-expanded · 이 탭 동안 기억). 넓은 화면은 위 줄이 커진 만큼 그림을 줄였다(그림이 더 보기 단추를 덮었다). casual-note ?v=2 · walk-card ?v=10 · walk ?v=24 · walk.css ?v=24 · words ?v=40
- tests/walk-card.cjs — 한 장 설명(둘째 줄 · 더 보기 · 기억 · 자유 설계 영어) 344 · 1280

## 2026-11-25 · claude · 즐겨찾기 알림 말 — 공용 파일에서 빼서 낱말 표로
- lib/words.js · lib/favorites.js(공용 사본) · ?v — 공용 favorites.js 에 박혀 「화면 코드에 한글 금지」 검사(words)를 깨던 가득 · 저장 공간 알림 말을 빼고 낱말 표 dex.fav.full · dex.fav.quota 로

## 2026-11-25 · claude · 원소 월드맵 다듬기 — 휴대폰 대륙 확대 · 동맹선 · 지나온 길 · 확대 한도 · 첫 방문 로딩 화면
- lib/walk-map.js — ① 휴대폰(높이 맞춤)에서 대륙을 누르면 「contain」 상자 맞춤이라 온 세상(0.71)보다 작게(0.35) 줄어 위아래 빈 띠가 생겼다: 대륙 · 지역 · 판 배율의 바닥을 온 세상 배율로(넘치는 상자는 옆으로 밀어 본다), 지역은 고리가 가리는 자리 밖으로 나갈 때만 그만큼 민다 ② 온 세상 「동맹」 단추 — 동맹 여덟을 나라 자리끼리 굽은 선(같은 두 곳 사이는 번갈아 굽힘, 굵기는 확대와 무관), 선을 누르거나 마우스를 대면 「물 동맹 · 수소 · 산소」, 아래 줄(넓은 화면은 위 줄)에서 하나씩 고르기. 대륙 · 지역 · 하늘 판에서는 화면에 없는 동맹 상대를 가장자리 표 「→ 탄소 · 산소 (숨 쉬는 숲)」 「→ 수소 (하늘 군도)」(곳마다 하나 · 화살은 그쪽으로 · 나라 표시 · 이름 표를 비켜 놓음) — 누르면 그곳으로 다가간다 ④ 넓은 화면(900 px 이상)의 확대 한도 = max(온 세상, 1.6 ÷ devicePixelRatio) — 1536 px 그림이 기기 픽셀 1.6 배 넘게 늘지 않는다(＋ · 휠 · 두 손가락 · 지역 모두) ⑤ 지역 · 판에 나라가 보이면 · 나라 표시에 손 · 초점이 닿으면 전경을 미리 받는다. 다듬기 셋: 하늘 · 물밑 · 땅속 판 닫기(× 단추 · 테두리 밖 빈 땅 누르기 · 판 안에서도 Esc), 누른 이름 표가 사라져도 초점은 지도 판(Tab 으로 화면 밖 표에 가면 판이 굴러 좌표가 어긋나던 것 — 굴린 만큼 지도를 옮긴다), 화면 끝에 걸린 이름 표(휴대폰 「땅속」 · 대륙 양 끝 지역)는 표만 안으로
- lib/walk-table.js — prefetchVista: 로딩 화면이 나올 자리(궤도 · 움직임 켬 · 이 탭에서 처음)일 때만 낮은 우선으로 한 번, 데이터 절약(saveData)이면 없음. 나라 카드를 열면 받는다(「들어가기」 첫 누르기에도 600ms 규칙에 안 걸린다 — 그림이 0.9초 걸려도 뜬다)
- lib/walk-core.js — ③ 지도에서 들어온 나라는 c · r(그 나라의 대륙 · 지역일 때만, 하늘 · 물밑 · 땅속은 대륙까지)을 남기고 위가 그 지도 칸 → 지나온 길 「지도 › 가운데 대륙 › 대장간 산성 › 철 Fe」, 길을 누르면 그 지도 칸(역사를 거슬러), 브라우저 뒤로는 전처럼 지역
- lib/walk.js — 바꿔 쓰기(‹ › 등)로 위 칸이 바뀌면 역사 칸 수를 0 으로(지도에서 온 나라의 옆 나라에서 길 「주기율표」 가 지역으로 거슬러 오르지 않게). walk-map ?v=2 · walk-table ?v=11
- lib/words.js — 지나온 길 첫 칸 「대륙」 → 「지도」, 동맹 · 가장자리 표 · 판 닫기 낱말
- lib/walk.css — 동맹 선 · 가장자리 표 · 판 닫기, 지도 그림 image-rendering auto, 이름 표 --dx. index.html — walk.css ?v=23 · walk-core ?v=8 · words ?v=38 · walk ?v=23
- tests/map-screen.cjs — (c) 휴대폰 대륙 · 지역 배율 ≥ 온 세상 · 빈 띠 없음 (d) 가장자리 표 (f) 지나온 길 · 길 누르기 · 옆 나라 (l) 미리 받기(지역 · 나라 카드 · 느린 그림에도 로딩 화면 · saveData) (m) 동맹 선 8 (n) 1280 DPR 1 → 1.6 · DPR 2 → 0.8 (o) 판 닫기 · 초점. tests/walk-core.cjs — 지도에서 온 나라의 주소 · 위 · 조상
- DESIGN.md · AGENTS.md — 지도 줄에 다듬은 것

## 2026-11-25 · claude · 허브 즐겨찾기 — 크게 보기 꽉 채우기 · 가로 보기 · 한도
- lib/favorites.js — style-atelier shared 판(원본이 공방 모음에서 shared 로): 3000칸, 가득이면 오래된 것을 빼지 않고 거절 · error() · message() · room(), 저장 공간 모자람(QuotaExceededError)은 'quota'(담아 둔 칸 그대로)
- lib/fill-view.js · lib/fill-core.js(새) — shared 판: 셈 · 두 번 누르기를 몸통 fill-core.js 로 뗐다(동작 같음 — tests/fill-view.cjs 통과)
- lib/walk-card.js — 하트 알림이 가득 · 저장 공간이면 그 말(FAV.message()), fill-view ?v=2 · walk-card ?v=9(lib/walk.js) · favorites ?v=2(index · styles · alchemy; prompt.html 은 읽기만이라 그대로)
- AGENTS.md — 공용 파일 목록에 fill-core.js · favorites.js

## 2026-11-25 · claude · 공용 파일 한 곳에서 — style-atelier shared · sync
- lib/casual-tree-v2.js — style-atelier shared 판(표 `raise_one` 이 있을 때만 거르는 줄 하나 더함 — 이 공방 표엔 없어 동작 그대로)
- AGENTS.md — 공용 파일(트리 둘 · fill-view · splash)은 style-atelier `shared/` 에서만 고치고 `node shared/sync.cjs` 로 옮긴다
- prompt.html — casual-tree-v2 ?v=17

## 2026-11-25 · claude · 계획기 — 막히는 씨앗 · 속도
- lib/casual-tree-v2.js — 속도만(결과는 같다): repair 가 지금 값이 맞으면 고를 거리를 다 거르지 않고, 골라도 되는 칸은 목록을 안 세고, 고르는 손이 없으면 첫 맞는 값만 찾는다. presetOk 는 몸 칸이 고쳐지는 순간 「안 된다」(손 둘은 끝까지), 손 소품은 맞는 동작 하나만 찾고(anyUse), 장소 · 어색한 조합 장소 펼치기 · 고를 거리 목록은 한 번만 센다. presetBreadth 는 의상 계열을 한 번만 고른다. 공용 모듈이라 도시 · 삼국지 · 원소에 같은 글, 포켓몬 사본엔 같은 고침(가슴 위 두 손 규칙은 그대로). ?v 올림
- tools/casual-plan.cjs — 속도: 쓴 횟수 꼴(usageOf)을 묶음마다 · 칸마다 한 번만. 막히는 씨앗: 한 카드에 묶음이 쌓이면 다른 세계 · 묶음이 쓴 자세 추천 · 입은 옷이 늘어, 덜 쓴 실루엣 갈래의 옷이 「다른 세계가 입은 옷」 하나만 남거나 미리 나눈 프레이밍(얼굴 클로즈업)에 남은 추천이 없어 400 번을 다 버리고 「묶음을 못 찾았다」 로 멈췄다. 이제 첫 판이 실패하면 둘째 판(막힘 풀기)이 check 가 어차피 막을 고를 거리(쓴 자세 추천 · 입은 옷 · 쓴 곳 · 한도를 넘길 추천 · 남은 추천 없는 프레이밍)를 처음부터 빼고, 미리 나눈 프레이밍이 스무 번 안 되면 한도가 남은 프레이밍으로, 따로 된 난수로 다시 400 번 — 규칙은 그대로, 첫 판에서 서던 씨앗은 옛 답 그대로(대조 164 묶음 같음). --world all --fresh fe · na 80 묶음 0 → 0(원소는 아직 안 막혔다 — 같은 꼴이라 같이 넣음). 시간 fe --world all --fresh 108초 → 4.7초
- prompt.html — casual-tree-v2 ?v=16

## 2026-11-25 · claude · 오래 깨진 검사 정리
- lib/walk.css · index.html — 목록 층 조작 줄(`.walk .dex-toc`, 격자)에 칸 폭 `minmax(0,1fr)`: 긴 화풍 이름(고르개 option — 기본 「일본 유화 애니 · 기본 · 3장」)이 격자 칸을 넓혀 폰 344 에서 쪽이 354 로 가로 넘쳤다(실제 버그 — walk-list 「조작 줄이 344 안」 · walk-card noOverflow 둘 다 이것). walk.css ?v=22.
- tests/walk-orbit.cjs — 전경이 생긴 철(11-24)은 폰에서 막대의 ‹ › 를 감추고 전경 이름 줄(.w-vsteps)로 옮긴다: 보이는 단추만 44px 를 재고 ‹ › 가 하나씩 보이는지 보며, 다음 나라는 보이는 › 로 누른다(옛 검사는 감춘 단추의 상자 null 에서 멈췄다).
- tests/walk-particles.cjs — 철의 첫 화면은 전경 무대이고 궤도는 그 아래라 입자는 붙되 멈춰 있다(화면 밖 멈춤 — 설계대로). 처음엔 멈춤을 보고 궤도로 굴린 뒤 도는지 본다.
- tests/walk-card.cjs — 단추 글 줄 수를 글 상자 윗변이 반 줄 넘게 떨어진 무리로 센다: 대신 쓴 글꼴의 ♡ 상자가 같은 줄에서 2px 높아 두 줄로 셌다(검사 환경의 글꼴 탓).
- tests/walk-tools.cjs · tests/walk-world.cjs — 고치지 않음(환경): walk-tools 는 ESM_DIR 에 phaser@4.2.1 사본이 없으면 합성 화면이 안 떠 멈춘다(preact · pixi.js@8.19.0 · phaser@4.2.1 셋이 든 node_modules 로 돌린다). walk-world 는 혼자 돌리면 통과, 브라우저 여섯을 한꺼번에 띄우면 입자 기다림이 시간을 넘긴다 — 하나씩 돌린다.

## 2026-11-24 · claude · 일상컷 노출 문장 — 삼국지 수준으로
- lib/prompt-spec.js — 짧은 판 일상컷 CASUAL.short.expose 과감 = 삼국지 skin_exposure 과감 글 + 최대 존재감, 보통도 같은 결(사용자 「삼국지랑 도시공방이랑 의상 수위가 다른거 같지?」 → 「공방들 다 삼국지 수준으로 맞춰줘」 — 옷 데이터는 같은데 「과감」 뒤에 붙는 노출 문장이 공방마다 달랐다)

## 2026-11-24 · claude · 일상컷 탈 것 · 보드 · 놀이기구 — 차 · 자전거 · 보드 · 물놀이 · 하늘 · 눈 · 놀이기구
- 사용자 「각 세계별로 자동차같은 탈 것에 밖에서 새차한다거나 기대있다거나 트렁크나 짐마차에 짐을 싣는다거나, 바이크나 자전거, 롤러, 웨이크보드, 서핑보드, 스케이트보드 등을 타는 씬은 없네」 → 「비행기, 비행선, 행글라이더, 열기구, 놀이동산에서 놀이기구, 파도풀에서 파도타기 등도 추가해줘. 또 있나?」. 버전2 표엔 탈 것 · 보드 소품이 없어 한 번도 짜이지 않았다(도시 기록 0). 네 공방 같이(도구 scratchpad ride/add_rides.py).
- data/casual-tree.json — 장소 195 → 253(지금 현실 마흔아홉 + 나라 안 아홉, 모두 start_median). 새 묶음 ride 탈것 · 길 · board 보드 · 물 위 탈것 · sky 하늘 탈것 · rides 놀이기구 타기 · ride_animal 말 · 낙타 타기(companion — 동물 한 마리). 차(길가에 세운 차 · 집 앞 세차 · 트렁크에 짐 · 열린 차 문 · 오픈카 조수석 · 캠핑카의 밤 · 푸드트럭 · 골프 카트) · 두 바퀴(카페 앞 스쿠터 · 해안 도로 바이크 · 꽃바구니 자전거 · 강변 자전거 · 전동 킥보드 · 롤러스케이트 산책로 · 스케이트 파크) · 물(서핑 해변 · 워터파크 서핑 풀 · 웨이크보드 · 수상스키 · 패들보드 · 카약 · 래프팅 · 제트스키 · 바나나보트 · 오리배 · 운하 곤돌라 · 요트 조타석) · 하늘(비행기 창가 · 트랩 · 조종석 · 비행선 갑판 · 곤돌라 라운지 · 행글라이더 이륙 · 패러글라이딩 · 짚라인 · 열기구) · 눈(스노보드) · 놀이기구(범퍼카 · 바이킹 · 자이로드롭 · 회전찻잔 · 코스터 맨 앞 칸 · 회전목마 타기) · 거리(트램 정류장 · 트램 안 · 세워 둔 인력거 — 끄는 사람 없이) · 말 · 낙타 · 말 한 마리 마차(동물 규칙 — 한 마리, 제 크기, 몸이 붙지 않음). 하는 일 마흔넷쯤(세차 · 헹구기 · 짐 싣기 · 트렁크에 걸터앉기 · 내리기 · 조수석 바람 · 바이크에 걸터앉기 · 헬멧 벗기 · 자전거 끌기 · 보드 들고 걷기 · 보드 타기 · 파도 기다리기 · 견인줄 · 노 젓기 · 키 잡기 · 이륙 전 점검 · 창밖 구름 · 트랩 오르기 · 이륙 달리기 · 하늘에서 내려다보기 · 열기구 일출 · 범퍼카 · 놀이기구 비명 · 찻잔 돌리기 · 회전목마 · 트램 …), 있는 하는 일(차에 기대기 · 자전거 점검 · 스케이트보드 · 서핑 준비 · 롤러 · 사진 · 창밖 · 산책 · 수영 …)에 새 장소. 옷 계열은 장소 종류(outfit_rules)대로 — 수영복은 물가 장소만(길 · 차 · 놀이기구 · 하늘엔 없다), 역할극은 트랩 · 조종석(승무원 · 레이서 옷) · 푸드트럭 · 회전목마.
- data/casual-tree.json — 나라 안 아홉(worlds 판타지 · 스팀펑크 · 메카 — 「a place of her element's kingdom」, 없는 세계는 worlds_only): 짐마차 · 증기 자동차 · 호버카 / 마법 파도보드 · 증기 보드 · 반중력 보드 / 마법 하늘배 · 놋쇠 비행선 · 스카이 요트 / 깃털 비단 · 오니솝터 · 라이트윙 글라이더 / 등불 · 조각보 · 홀로 풍선 / 장터 흔들 배 · 태엽 흔들 배 · 홀로그램 놀이기구 / 백조 뱃머리 배 · 놋쇠 증기 놀잇배 · 호버 곤돌라 / 말 타기(판타지 · 스팀펑크) / 페니파딩 · 마그레브 바이크.
- data/casual-tree-v2.json — 받침(has) upright(서기 받침 — 삼국지 2026-11-04 꼴을 옮김) · saddle · handlebar · reins · board · tow_rope · ride_bar · pole · skates · boat · flight_harness, car · bike 글은 세계 중립(vehicle). 앉은 자리뿐인 탈것(택시 · 관람차 · 리프트 · 운전석 · 오픈카 · 인력거 · 비행기 좌석 · 조종석 · 놀이기구 · 배 · 웨이크 · 패들 · 하네스 · 말 · 낙타)엔 upright 가 없어 서기 · 걷기 · 기대 서기가 안 고른다. 자세 일곱(탈것에 기대 서기 · 바이크에 옆으로 걸터앉기 · 올라타 앉기 · 보드 위 균형 · 스케이트로 미끄러지기 · 작은 배에 낮게 앉기 · 하네스에 매달려 앉기 — 타는 자세는 받는 손을 정해 둔다: 핸들 · 고삐 · 기둥 · 안전바 · 줄을 놓지 않는다), 받침 「등을 탈것 옆면에」, 손 열(한 손 핸들 · 고삐 둘 · 기둥 · 안전바 · 두 팔 균형 · 견인줄 · 줄 둘 · 탈것 지붕에 팔), 다리 여섯, 자세 추천 서른(하는 일 갈래 ride · rest · walk). 운전대(wheel_both)는 세워 둔 차 · 땅 위 조종석 · 범퍼카 · 찻잔 · 요트 키만. 화면비 첫 줄(3:2)에 보드 · 올라타기 · 하네스 · 스케이트 자세.
- data/casual-tree-v2.json — 소품 아홉(헬멧 · 여행 가방 · 물 호스 · 서프보드 · 스케이트보드 · 롤러스케이트 · 스노보드 · 노 · 표)와 동작(들고 가기 · 쓰기 · 턱끈 · 싣기 · 뿌리기 · 왁스 · 머리에 이기 · 바퀴 돌리기 · 바인딩 · 노 젓기 …, and 없는 동작 하나), 썰매에 앉아 줄 잡기, 세차 스펀지 동작 글 「the car」 → 「the vehicle」, 있는 소품(카메라 · 휴대폰 · 컵 · 책 · 물병 · 수건 · 방수 파우치 · 아이스크림 · 솜사탕 · 풍선 …)에 새 자리, 어색한 조합 넷(보드 · 물살 · 하늘 · 말 · 자전거에 드레스 · 웨딩 · 무대 · 할로윈 / 서핑 해변 · 서핑 풀 · 수상스키 · 스케이트 파크 · 스노보드 · 제트스키 · 바나나보트에 휴양지 · 드레스 · 레트로 / 눈밭 · 하늘 · 말 · 오리배 · 골프 카트 · 자전거 길에 수영복 · 목욕 · 란제리 · 홈웨어 / 차에서 내리기 · 비행선 라운지 · 곤돌라 · 마차에 운동 · 작업 · 모험).
- lib/prompt-element.js — placeEn(장소, 세계)(삼국지 공방과 같다): Place 줄이 나라 안 장소 worlds 의 그 세계 글. index.html · prompt.html ?v prompt-element 55.
- tests/casual-tree.cjs — 나라 안 장소 25 → 34.

## 2026-11-24 · claude · 1:1 1254×1254 — 검수 줄 · 묶음 안내에도 「같은 비율로 크면 맞는 크기」
- docs/IMAGE_AUTOMATION.md — AI 검수의 「그 자리의 크기인가」 줄에 같은 비율로 더 큰 원본(1:1 1254×1254)은 맞다는 말(크기 규칙 · WebP 줄에는 있었는데 검수 줄에 빠져 다시 만들 수 있었다)
- tools/prompt-pack.cjs — INDEX.md 머리에 「크기」 칸은 표준 크기, 같은 비율로 크면 다시 만들지 말고 WebP 로 줄인다는 한 줄

## 2026-11-24 · claude · 원소 월드맵 — 판타지 대륙 지도(배치표 · 지도 그림 · 확대 화면)
- data/world-map.json — 새 배치표(사용자 「이대로 진행하고 … 우선은 보류. 판타지 대륙 지도부터 만들어줘.」). 초안 모양 그대로(대륙 9 · 지역 30 · 나라 118 · 동맹 8) + version · note, 물밑 왕국 자리는 남쪽 바다로. map.fantasy — 지도 그림을 보고 정한 대륙 상자 · 이름 자리 · 지역 점(그림 좌표 0~1). 하늘 군도 = 가운데 대륙 위 밧줄에 매인 섬들, 물밑 = 남쪽 바다 산호 소용돌이, 땅속 = 쇳물 산맥 남동 기슭 갱도 입구
- tools/world-map.py — 새 검사기 check(초안 검사 규칙 + 설계표 나라 · 가문 대조 · 동맹 셈 · 지도 자리 0~1 · 지역 점은 땅 위 대륙 상자 안 · 그림 이름)
- lib/walk-map.js — 새 지도 층(첫 층의 다른 보기 view=map). 그림 끌기 · 휠 · 두 손가락 · ＋ − ⤢ · 키, 대륙 이름(층 배지) → 대륙(c — 지역 이름) → 지역(r — 나라 고리, 켜짐/안개, 동맹 선) → 나라 층(전경 있으면 로딩 화면). 하늘 · 물밑 · 땅속은 그 자리로 다가가 판에 지역 · 나라. 이름 표는 확대해도 같은 크기 · 겹치면 위아래로 비킨다. 움직임 끔이면 바로. 스팀펑크 · 메카는 「준비 중」 + 주기율표
- lib/walk-core.js — 주소 열쇠 c · r, 층 map(view=map · 나라 밖), 부모(지역 → 대륙 → 온 세상), 검증(배치표에 있는 대륙 · 땅 위 대륙의 지역만), popRoute(뒤로 가기에 view=map 을 잇지 않는다), 기억값에서 view=map 은 안 채운다
- lib/walk.js — 지도 층 · 지나온 길 「대륙 › <대륙> › <지역>」 · popRoute · 지도 보기는 기기에 기억하지 않음. lib/walk-data.js — 배치표 읽기(못 읽어도 공방은 열림) · litOf
- lib/walk-table.js — 「주기율표 · 지도」 고르개(FirstView, 역사 칸 없음 — 주기율표가 첫 화면 그대로), 나라로 들어가기를 enterNation 하나로(나라 카드 · 지도가 같이)
- lib/walk.css — 지도 겉모습(?v=21). lib/words.js — first.* · map.* · layer.*(?v=37, 네 쪽)
- index.html · alchemy.html · prompt.html · styles.html · dex.html · gallery.html · hall.html · lib/walk-*.js — ?v= 올림(walk-core 7 · walk-data 7 · walk-orbit 9 · walk 22 …)
- 그림 저장소 element-atelier-img — backgrounds/maps/world-map_fantasy_jp_paint_anime.webp(API gpt-image-2.6-sunburst · 1536×1024 · quality high · 한 번에, 다시 그리지 않음) · 기록 records/backgrounds/world-map_fantasy_jp_paint_anime.json(지시문 · 사용량 · sha). 궤도 그림처럼 배경 자리라 등록(img/ · data/img.json)하지 않는다
- tests/world-map.cjs · tests/map-screen.cjs — 새 검사. tests/walk-core.cjs — 지도 주소 · 뒤로 가기
- AGENTS.md · DESIGN.md · IMAGE_RULES.md — 지도 층 · 검사 줄 · 지도 그림 자리

## 2026-11-24 · claude · 들어갈 때 로딩 화면 — 전경 · 이름 · 빛 입자(픽시)
- lib/splash.js — 새 공용 모듈(도시 공방과 글자 하나 다르지 않게). 주기율표 나라 카드 「들어가기」(궤도로)에서 그 나라 그 세계 전경을 받기 시작 → 600ms 안에 풀리면 어두워졌다가(0.18초) 그 뒤에서 나라로 들어가고, 전경이 어둠에서 떠오르며 천천히 다가온다(1.0 → 1.06) · 세계 줄 · 「Fe 26 · 철」(기호는 분류 색) · 설계표 성격 첫 마디(40자 이하) · 막대 · 빛 입자(PixiJS — lib/walk-fx.js loadPixi 그대로, 판타지 빛 알갱이 · 불티, 스팀펑크 김 · 불꽃, 메카 차가운 빛줄 · 자료 알갱이, 150 이하 · 틱 하나 · 끝나면 지움). 모두 1.6초, 누르기 · 아무 키면 곧바로. 움직임 끔 · 전경 없음 · 목록으로 들어가기 · 이 탭에서 본 나라 × 세계(element_splash_v1) · 그림이 늦으면 없음. PixiJS 를 못 받으면 입자만 빠진다. 덮개 aria-hidden + polite 알림 한 줄, 끝나면 초점은 나라 이름(사용자 「진짜 게임 로딩화면 같네」 → 「응 넣어줘. 이미 도구도 있을텐데. 픽시같은거」)
- lib/splash.css — 덮개 겉모습(공용). lib/walk.css — 덮개 변수(땅 강조색) · 기호 · 번호 · 점(?v=20)
- lib/walk-table.js — 나라 카드 「들어가기」가 enterWithSplash 로(① 출발 자리는 그대로), walk.js ?v=21 · walk-table ?v=9
- index.html — splash.css 링크. lib/words.js — splash.live · splash.skip(?v=36, 네 쪽)
- tests/splash-screen.cjs — 새 검사(휴대폰 · PC 처음 한 번 · 다시 · 세계 바꿈 · 건너뛰기 셋 · 움직임 줄이기 · 전경 없는 나라 · 목록 · PixiJS 막힘 · 느린 그림 · 404 · 깊은 주소)
- DESIGN.md · AGENTS.md — 효과 · 검사 줄

## 2026-11-24 · claude · 원소 전경 — 철 시험(전경 지시문 · 등록 · 나라 화면)
- lib/prompt-spec.js — 사용자 「원소공방도 한 세계 정도 만들어보자」 → 「나라 하나 × 세 세계」(철). 도시 공방 전경을 옮겼다: 파일 이름 틀 FILES.vista(<나라>_<세계>_<화풍>_vista.webp — 성별 표시 없음), 전경 글 T.VISTA(머리 · 장소 · 곁 장소 · 원소 결 · 색 · 구도(아래 1/4 잔잔하게 — 카드 자리) · 사람 · 글자 없음 · Avoid · 3:2 Output)
- lib/prompt-element.js — buildVista · vistaFile · vistaRecord · vistaAvoid · vistaStyle · herCut: 장소 = 설계표 worlds.<세계>.en, 곁 장소 = scenes, 원소 결 = traits.en 첫 마디(뒤 나라들의 내력 글은 이름 머리를 떼고 30 낱말 안), 색 = palette.en(원소 재질 색이라 장소에도 맞다), Avoid = 그 세계 옷 줄의 「No …」 − 옷 낱말. 설계표 글의 그녀 마디(behind her · she stokes …)는 덜어 낸다. 나라(근본) 열쇠에만
- data/style.json — 기본 화풍 jp_paint_anime v1 에 vista 칸(풍경용 화풍 한 줄)
- tools/vista-prompt.cjs — 새 도구. <나라> [세계] [--record] — 세계 하나면 지시문만(도시 공방에서 머리줄이 섞여 간 일)
- tools/register-images.py · tools/roster.py — _vista.webp 를 그 세계 몫(byForm.<세계>.vista)에 등록(나라에만 · 성별 표시 없음 · 1536×1024 크기 검사 · 빈 자리 · 진행에 안 셈), 전경만 있던 나라를 --prune 하면 빈 카드 칸도 지움
- lib/walk-orbit.js · lib/walk.css · lib/words.js — 나라 층 궤도에 전경 무대: 그 세계 전경이 있으면 궤도 위에 전경(cover · 위아래 어둠 막) · 나라 이름 · 사실 칸이 그 위로 · 아래 1/4 에 근본 + 가문주 카드 띠(그림 → 한 장 · 가문, 없으면 목록의 그 칸) · 휴대폰 세로 천천히 좌우로(움직임 끔이면 멈춤) · 「전경」 구경(단추 · 배경 길게 누르기, 돌아가기 · Esc · 한 번 누르기로 나옴) · 휴대폰 머리 한 줄(지금 자리 이름 · ‹ › 는 전경 이름 줄로) · 700px 이상 둥근 판. 궤도 · 보기 고르개 · 나라 글은 그 아래 그대로, 전경 없는 나라는 예전 그대로
- index.html · lib/walk.js · lib/walk-family.js · lib/walk-list.js · prompt.html · styles.html · alchemy.html — ?v= 올림
- tests/prompt-vista.cjs · tests/vista-screen.cjs — 새 검사. tests/register-images.py(전경 자리 · 틀린 이름 · 3:2 크기) · tests/img-shards.cjs(전경 주소) · tests/lib/harness.cjs(fulfill · touch · scale 손잡이)
- IMAGE_RULES.md · DESIGN.md — 전경 파일 이름 · 나라 층 전경 한 줄

## 2026-11-24 · claude · 크게 보기 — 휴대폰 가로로 들면 그림만 가득 · 세로에선 꽉 채우기
- lib/fill-view.js — 새 공용 훅(삼국지 · 원소 · 도시 · 포켓몬 공방이 글자 하나 다르지 않게). 사용자 「1:1이 모바일에선 티가 잘 안나는것같네」 → 「2번만 할까」 → 「1번도 같이하자」. 그림의 가로세로 비가 맞춤 칸 비의 1.4배를 넘을 때만(폰 세로의 1:1 · 3:2) 「⤢ 꽉 채우기」 — 그림 높이를 칸 높이에 맞춰 펴고 옆으로 굴려 본다(가운데부터). 두 번 누르기(손가락 · 마우스)로도, 그림이 바뀌거나 화면 크기가 바뀌면 맞춤으로. 2:3 · PC · 펼친 폴드 · 가로 화면엔 안 뜬다
- lib/walk-card.js — 한 장(크게 보기)에 꽉 채우기: 단추 줄에 단추, 켜면 밀어 넘기기 · 홀로는 쉬고(‹ › · ← → 는 그대로, 넘기면 맞춤 · 넘기기 전환 없이), 닫기 단추에 lb-close
- lib/walk.css — 꽉 채우기 칸 · 그림 touch-action. 휴대폰 가로(높이 500 이하)면 위 막대 · 도구 단추 · 위 줄 · 글 판 · 단추 줄을 숨기고 그림만 화면 높이 가득, 닫기(와 꽉 채우기)만 오른쪽 위 반투명
- lib/words.js — dex.fill · dex.fit
- tests/fill-view.cjs — 새 화면 검사(폰 세로 1:1 · 2:3, PC, 폰 가로 1:1 · 3:2)
- index.html · alchemy.html · prompt.html · styles.html · lib/walk.js — words.js ?v=34 · walk.css ?v=18 · walk.js ?v=19 · walk-card.js ?v=7

## 2026-11-23 · claude · 그림 등록 실패 고침 — 등록 검사가 PIL 없이 돈다
- tests/register-images.py — 크기 시험 그림을 PIL 대신 webp 머리말(VP8X)로 직접 쓴다. Actions 에 PIL 이 없어 화면비 작업(같은 날) 뒤 「그림 등록」 이 검사 단계에서 ModuleNotFoundError 로 모두 멈췄다

## 2026-11-23 · claude · 인상 열네 개 더함 — 섹시 · 도발 · 퇴폐 · 팜파탈 · 새침 · 도도 · 여우 · 몽환 · 신비 · 당당 · 냉미녀 · 수줍음 · 당찬 · 아련함
- lib/prompt-spec.js — FACE_DESIGN.impression 에 열네 열쇠, 한글 표(ko.impression)에도 열넷(섹시함 · 도발 · 퇴폐미 · 팜파탈 · 새침한 애교 · 도도한 자존심 · 여우 같은 장난기 · 몽환 · 신비 · 걸크러시 · 냉미녀 · 수줍음 · 당찬 태도 · 아련한 그리움). 영어 글은 화풍공방 core v7 블록이 덮는다(블록도 다시 옮김). 사용자 2026-11-23 「인상중에 뭔가 섹시,도발, 퇴폐 느낌이 없네」 → 「다 넣어주고 공방 다 적용해줘. 설계 있는거에서도 옮겨주고」. prompt-spec ?v=60(index.html · prompt.html)
- data/element-design.json — 77명(나라 · 가문주 · 주민)의 인상을 원소 성질에 맞춰 새 열쇠로: 팜파탈 비소 · 카드뮴 · 폴로늄 · 노벨륨 · 망가니즈, 퇴폐 브로민 · 네온 · 탄소/기름, 도발 황 · 디스프로슘 · 탄탈럼 · 테네신, 냉미녀 빙하 · 핵융합로 · 스칸듐 · 물결무늬 단검, 신비 크립톤 · 라돈 · 하프늄 · 인 · 플루토늄 · 제논, 몽환 헬륨 · 넵투늄 · 셀레늄 · 비행선, 여우 수은 · 코발트 · 프로메튬 · 갈륨, 도도 로듐 · 백금 · 이리듐 · 금관, 섹시 바나듐 · 베릴륨 · 피 · 심장 · 장신구, 수줍음 인듐 · 마그네슘 · 탈륨 · 아이오딘, 당찬 리튬 · 나트륨 · 세슘 · 오스뮴, 당당 티타늄 · 캘리포늄 · 러더포듐 · 모스코븀, 아련함 라듐 · 아스타틴 · 마이트너륨 · 주석, 새침 크로뮴 · 비스무트 · 아메리슘 · 루테늄. 사용자가 얼굴을 정한 철 · 우라늄은 그대로. look.why 의 「… 인상」 낱말을 맞추고 끝에 바꾼 날을 적었다
- data/element-design.json — 인상 수: 차가운 16→8 · 화려 16→6 · 우아 15→8 · 명랑 15→10 · 무표정 14→10 · 날카로운 12→5 · 귀여운 11→4 …, 새 열넷 4~7

## 2026-11-23 · claude · core v7 나이 문장 — 20대 초 youthful · 중반 young-adult · 후반 clear adult
- lib/prompt-spec.js — 화풍공방 core v7 블록 다시 옮김(나이 문장: 20대 초 youthful · 중반 young-adult · 후반 clear adult). prompt-spec ?v= 올림

## 2026-11-23 · claude · 일상컷 크기 — 같은 비율로 더 크게 온 원본(1:1 1254×1254)은 맞는 그림, WebP 로 바꿀 때 표준 크기로 줄인다
- IMAGE_RULES.md — 크기 규칙에 같은 비율로 더 큰 원본은 맞고 표준 크기로 줄인다는 말
- docs/IMAGE_AUTOMATION.md — 멈춤 조건 · WebP 바꾸기 줄에 같은 비율 큰 원본(ChatGPT 화면 1:1 1254×1254)은 줄여서 올린다

## 2026-11-23 · claude · 일상컷 화면비 — 구도 · 자세에 따라 2:3 / 1:1 / 3:2
- 사용자(도시 공방 파리 · 카이로 시험 뒤) 「배경이 보이니까 더 시원하네」 · 「다른 공방도 조금씩 해보자」 → 「응 그렇게 진행해줘」 — 눕는 자세 · 환경 컷 3:2, 허리 위 · 3/4 1:1, 선 전신 · 가슴 위 · 얼굴은 2:3. 이미 그린 그림은 2:3 그대로, 새 계획 · 지시문만
- data/casual-tree-v2.json — aspect_rules(차례 규칙 · 기본 2:3 · 크기 셋 · keep_fams game_cosplay). 표만 고치면 조정된다
- lib/casual-tree-v2.js — 공용 모듈 aspectFor(t, scene) · aspectSize(t, 화면비) — 도시 · 삼국지 사본과 같은 글자
- tools/casual-plan.cjs — 장면이 정해진 뒤 cut.aspect = aspectFor(자유 설계 칸 · 게임 코스프레 2:3, 캐릭터만의 컷 90 도), 묶음 검사에 화면비, 칸 줄에 화면비를 보인다
- lib/prompt-spec.js · lib/prompt-element.js — 짧은 판 Output 줄이 화면비대로(CASUAL.short.outputs), 구조형 · 긴 판은 FRAME 칸 그대로(ASPECT_FRAME). 자유 설계 칸은 늘 2:3. SCENE_V2 에 aspect
- lib/studio.js — 생성기도 장면을 고치면 aspectFor 로 화면비. tools/prompt-pack.cjs — 계획의 aspect 그대로(옛 계획은 2:3), INDEX.md 에 「크기」 칸
- tools/roster.py · tools/register-images.py — 세계 그림은 1024×1536 하나, 일상컷은 셋 가운데 하나이고 기록(scene.aspect)이 있으면 그 크기인지 본다. tools/make-thumbs.py — 주석만(긴 변 512)
- lib/element.css · lib/studio.css — 목록의 일상컷 칸 · 생성기 그림 미리보기는 칸 2:3 그대로 object-fit: contain(1:1 · 3:2 를 자르지 않는다). 한 장(크게 보기)은 원래 비율대로라 그대로. ?v= 올림
- IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md — 일상컷 크기는 계획 화면비(INDEX 「크기」 칸), 고정값 · 검수 · webp · generation.size 도 그 크기
- tests/casual-tree-v2.cjs · tests/register-images.py · tests/make-thumbs.py — 화면비 규칙 · 크기 검사 · 가로 · 정사각 썸네일

## 2026-11-23 · claude · 일상컷 장소 보충 — 놀이 · 겨울 · 물놀이 · 구경 · 관람 · 캠퍼스 장소, 필수 갈래 자리 넓히기 · 소품 · 상황 · 옷
- 사용자 「장소 보충이랑 필수갈래 장소 넓히기, 소품, 상황, 의상 늘리기 같이 진행해줘. 도시공방 만들면서, 설계에는 장소가 다양하다보니 그전에 있던 장소적인 선택지가 부족한게 눈에 보이네.」 장소 151 → 195, 장소 × 의상 계열 쌍(받침 규칙 통과) 568 → 808, 필수 갈래가 서는 곳 란제리풍 7 → 19 · 수영복 20 → 30 · 역할극 15 → 29 · 게임 코스프레 14 → 27. 네 공방 같이(도구 scratchpad add_places.py).
- data/casual-tree.json — 새 묶음 다섯: play 실내 놀이 · winter 겨울 놀이 · shop 구경 · 꾸밈 · stadium 관람석 · 경기장 · campus 캠퍼스. 새 장소(지금 현실, 모두 start_median): 영화관 객석 · 로비, 볼링장, 보드게임 카페, 방탈출, 테마 카페, PC방 / 아이스링크, 스키 슬로프 · 리프트, 눈썰매장 / 파도풀, 슬라이드 착수장, 루프탑 풀 파티, 비치 클럽(물가), 온천 리조트 풀, 목욕탕 탈의실(스파) / 글램핑 텐트 · 호숫가 데크, 료칸 객실(여행), 호텔 스위트 발코니(저녁), 창가 자리(집) / 미술관 전시실, 서점 서가, 꽃집, 꽃 시장, 사진 스튜디오, 부두아르 세트, 미용실, 네일숍, 피팅룸 / 야구장 응원석, 축구장 관중석, e스포츠 경기장, 골프 연습장 · 그린, 펜싱장(스키 · 골프 · e스포츠 · 펜싱 옷이 설 자리) / 강의실, 캠퍼스 잔디밭, 대학 축제 부스. 나라 안 넷(나라의 극장 · 눈 언덕 · 꽃 시장 · 단장방).
- data/casual-tree.json — 필수 갈래 넓히기: 란제리풍은 사적인 방 · 촬영 세트(료칸 · 글램핑 텐트 · 스위트 발코니 · 창가 · 탈의실 · 피팅룸 · 부두아르 · 사진 스튜디오)와 스파 라운지 · 파우더룸 · 산장, 수영복은 물놀이 · 탈의실 · 피팅룸 · 촬영 세트 · 글램핑 호숫가, 역할극은 영화관 로비 · 볼링장 · 방탈출 · 테마 카페 · 꽃집 · 미용실 · 사진 스튜디오 · 응원석 · e스포츠 · 강의실 · 축제 부스 · 바 · 노래방, 게임 코스프레는 영화관 로비 · 방탈출 · 테마 카페 · PC방 · e스포츠 · 사진 스튜디오 · 축제 · 노래방 · 물놀이. 공중 · 거리(k_public · k_street) 자리엔 란제리풍 · 수영복을 안 둔다(outfit_rules 그대로).
- data/casual-tree.json — 하는 일 서른셋(영화 보기 · 공 굴리기 · 단서 찾기 · 자물쇠 · 서빙 · 게임 · 스케이트 · 리프트 · 썰매 · 파도 넘기 · 그림 감상 · 꽃 고르기 · 꽃다발 묶기 · 촬영 포즈 · 머리 손질 · 네일 · 옷 입어 보기 · 응원 · 골프 스윙 · 퍼팅 · 펜싱 인사 · 강의 필기 · 부스 호객 …), 있는 하는 일에 새 장소. 옷 열다섯(놀이공원 · 영화관 데이트룩, 응원 크롭 저지, 애프터 스키, 캠퍼스 바시티, 글램핑 니트, 래시가드 비키니(sporty), 골프 스코트, 피겨 연습복, 볼링 셔츠 원피스, 신부 준비 가운, 피겨 갈라 의상(costume mini_dress), 역할극 영화관 안내원(mini_dress) · 방탈출 진행자(tailored) · 헤어 스타일리스트(jumpsuit)) — 상표 · 실제 팀 · 학교 없이, 옷마다 start_median.
- data/casual-tree-v2.json — 새 장소 받침, 새 소품(없는 것만 — 3D 안경 · 볼링공 · 보드게임 카드 · 상자 · 열쇠 · 스케이트 · 방수 폰 파우치 · 스키 고글 · 핫초코 · 썰매 · 동물 귀 머리띠 · 응원 막대 · 응원 수건 · 깃발 · 꽃 양동이 · 반사판 · 축제 전단 · 골프채 …)과 동작(준비 · 하는 중 · 마무리, 두 손이면 grip), 있는 소품(카메라 · 꽃다발 · 책 · 컵 · 수건 · 튜브 · 드라이기 · 매니큐어 · 팝콘 · 솜사탕 …)에 새 자리, 어색한 조합 여섯(사람 많은 물가에 란제리풍 · 홈웨어 / 눈밭 · 골프장 · 캠퍼스에 수영복 · 란제리 · 목욕 · 홈웨어 / 눈밭 · 골프 · 펜싱 · 볼링에 드레스 · 휴양지 · 무대 차림 / 피팅룸 · 부두아르 · 발코니에 목욕 · 운동 · 작업 / 료칸 · 텐트 · 창가에 운동 · 작업 / 물 없는 방에 수영복).
- lib/prompt-spec.js CASUAL.situations — 장소에서 생기는 상황 다섯(place_rx 로 그 장소에서만): 물보라(워터파크) · 눈발 속 반쯤 연 지퍼(스키 · 눈썰매) · 놀이기구 바람 · 응원석 물세례 · 드라이어 바람. 천은 비치지 않는다는 말 그대로. prompt.html · index.html ?v prompt-spec 57.
- tools/casual-plan.cjs — 새 옷(표 옷의 start_median)도 쓴 옷의 가운데 값에서 시작(FRESH_ITEMS — 장소의 start_median 과 같은 꼴). 시험 계획에서 새 홈웨어 하나가 세계 안 칸마다 뽑혔다.
- data/casual-tree.json — 앞 단계 하는 일 글 고정물: 달콤한 간식(「stall」 → 종이 봉투) · 먹이 시간 구경(「rail」 → 우리 너머) — 놀이공원 · 세계의 동물 정원에 가판 · 난간이 없었다(tools/casual-tree.py audit).
- tests/casual-tree.cjs · casual-tree.py · casual-tree-v2.py — 나라 안 시대 장소는 나라 안 묶음 열여섯 + 다른 묶음 아홉(스물다섯), 동료 손 검사는 동료 표시를 뺀 버전1 표로(경우 수 59).

## 2026-11-23 · claude · 일상컷 동물 — 배경 동물 장소 · 돌봄 장면 · 놀이공원
- 사용자 「배경 동물 장소 · 돌봄 장면은 열고, 나머지는 동물 없음을 말로」 + 「놀이공원 장소도 같이」. 동물 의상은 다음 단계.
- data/casual-tree.json — 묶음 셋: animal 「동물 구경」(animals) · pet 「동물 돌봄」(companion) · amusement 「놀이공원」. 지금 현실 장소 스물(삼국지 · 도시 공방과 같은 글) + 나라 안 다섯(nation_menagerie 판타지 · 스팀펑크 · nation_biodome 메카 · nation_aquarium · nation_stable 판타지 · 스팀펑크 · nation_fair). 모두 start_median, 하는 일 열셋 + 이미 있는 하는 일에 새 장소.
- data/casual-tree-v2.json — 새 장소의 받침, 소품 자리, 어색한 조합 「동물 돌봄에 란제리풍 · 수영복 · 목욕 차림」.
- lib/casual-tree.js · lib/casual-tree-v2.js — animals(트리, 장소) · animalsAt(t, 장소)(장소나 그 묶음의 animals: true — 동물이 배경에 나오는 곳, 돌봄의 companion 과 따로)를 더해 내보냄. 공용 모듈이라 도시 · 삼국지 · 원소 · pkm 네 사본을 같이 고쳤다(game · book · myth 사본은 아직 옛것).
- lib/prompt-spec.js · lib/prompt-element.js — 일상컷 끝 줄(긴 판 FIGURE · 짧은 판 · 구조판 배경 칸): 보통 장소 동물 없음, 동물 구경 장소는 배경에만, 돌봄 장소는 한 사람 + 동물 한 마리. 짧은 판 글자 금지에 numbers(원소 기호 · 원자 번호 예외는 그대로). WORLD · SETTING 줄의 「no creatures」 는 FIGURE 줄로 옮겼다.
- tools/casual-plan.cjs — usageOf 가 start_median 장소를 쓴 장소의 가운데 값에서 시작. index.html · prompt.html ?v prompt-spec 56 · prompt-element 52 · casual-tree 2 · casual-tree-v2 14.

## 2026-11-23 · claude · 역할극 · 무대·판타지 · 할로윈 — 역할(콘셉트) × 재단
- 사용자 「코스튬 의상들도 같이 이런식으로」 · 「남은 2단계 작업 먼저 하고」. 옷 하나에 역할과 재단이 묶여 있어 같은 역할은 늘 같은 실루엣이었다. 네 공방 같이.
- data/casual-tree.json — roleplay · costume · halloween 계열에 classes(재단 갈래 10: 미니 드레스 · 보디수트 · 크롭 투피스 · 코르셋 · 레오타드 — 게임 코스프레 재단 — + 슬릿 가운 · 테일러드 셋업 · 점프수트 · 케이프 겹침 · 조형 보디스), 지금 옷마다 cls(옷 글로 가름), 역할 · 콘셉트마다 아직 없는 재단 둘(그 계열에서 덜 쓴 재단부터 — 역할은 색 · 휘장 · 소품 글로, 실제 휘장 · 상표 없음). 역할극 36 → 108, 무대·판타지 19 → 57, 할로윈 16 → 48.
- 고르기는 1단계(수영복 · 란제리)와 같은 공용 모듈 classLean — 덜 쓴 재단의 옷 먼저, 새 재단은 쓴 재단들의 가운데 값에서 시작.

## 2026-11-23 · claude · 수영복 · 란제리 실루엣 갈래 — 갈래 열셋씩 · 화보 · 런웨이 옷 · 덜 쓴 갈래 먼저
- 사용자 「같은 필수갈래에서는 의상들 실루엣이 거의 다 비슷 … 수영복이나 란제리쪽이 부족」 → 「1,2번 같이 하는데 … 패션쇼나 패션잡지에 실릴만한 느낌」 → 「1단계부터 진행해주고 덜 쓴 것 먼저로 섞어줘. 화보쪽을 더 자주나오게 할 필요는 없어」. 네 공방 같이.
- data/casual-tree.json — swimwear · lingerie 계열에 classes(갈래 표)와 옷마다 cls. 수영복 갈래 13(비키니 · 원피스 · 컷아웃/모노키니 · 스포티 · 레트로 핀업 · 덮개 겹침 · 조형 · 드레이프 · 스트래피 케이지 · 하드웨어 · 다이브 하이넥 · 쿠튀르 장식 · 리조트 런웨이), 란제리 갈래 13(브라렛 세트 · 코르셋/뷔스티에 · 보디수트/테디 · 슬립/슈미즈/베이비돌 · 가터 · 로브 겹침 · 겉옷처럼 입는 란제리 · 하네스 구조 · 시스루 겹침 · 쿠튀르 코르셋 · 빈티지 부두아르 · 미니멀 모노크롬 · 주얼 부두아르). 새 옷 — 수영복 37 · 란제리 34(상의 · 하의 · 한 벌 · 디테일을 갈래마다 엇갈려 짬, 시스루는 불투명 안감). 수영복 23 → 60, 란제리 29 → 63.
- lib/casual-tree-v2.js — itemClass · classLean(후보 옷 가운데 덜 쓴 갈래의 옷만, 새 갈래는 쓴 갈래들의 가운데 값에서 시작 — 새 갈래만 연달아 나오지 않게).
- tools/casual-plan.cjs — 옷 고르기 전에 classLean. ?v casual-tree-v2 13.

## 2026-11-23 · claude · 일상컷 자세 — 기도꼴 · 쉿 줄이기, 가까운 컷에 허리 위, 가슴 위 · 허리 위 추천 열
- 사용자 「무릎꿇고 기도하는 장면이나, 손으로 쉿 하는 포즈가 자주 나오는 기분」 → 원인(조건 없는 추천이 거의 모든 칸 후보라 「덜 쓴 것 먼저」 로도 안 눌림 — 기록에서 평균의 1.4 ~ 2.1 배, 필수 컷은 후보가 좁아 몰림, 가까운 컷 규칙이 얼굴 클로즈업 여섯에 몰림) → 「1,2,3 은 해주고, 4번은 자세도 늘리고 클로즈업을 가슴 위 아니면 허리 위까지해서 같이 묶는」. 네 공방 같이.
- lib/casual-tree-v2.js — presetBreadth(시대 × 장소 가운데 그 추천이 되는 몫) · presetBias(log2(몫 / 가운데 값), -1 ~ 1.5) · presetOnce(표 preset_once).
- data/casual-tree-v2.json — preset_once [clasp_low · kneel_clasp · shush_close](한 캐릭터 한 장까지). 손 clasp_both 「가슴 앞에 두 손 모으기」 → 「허리 앞 깍지」(zone waist), kneel_clasp 손 → 한 손 무릎 위(lap · natural — 기도로 읽혔다, 한 손 동작은 양쪽에 같이 못 쓴다). 조건 없는 가슴 위 · 허리 위 추천 열(collarbone_chest · cheek_hip_waist · wave_waist · thumbs_chest · crossed_tilt_waist · behind_head_chest · hair_hip_waist · reach_chest · strap_chest(어깨끈 옷) · collar_waist(깃 옷)).
- tools/casual-plan.cjs — 자세 추천 무게에 2^-presetBias, preset_once 는 묶음 · 다른 세계 · 옛 컷에 있으면 후보에서 빼고 check 도 잡음, 가까운 컷(NEAR)에 허리 위. ?v casual-tree-v2 12.

## 2026-11-23 · claude · 일상컷 옷 꾸밈 — 같은 옷도 소재 · 입은 모양 · 핏 · 겹쳐 입기 · 장신구로
- 사용자 「같은 의상이라도 색상말고 다른 방법으로 다양화를 할 수는 없을까?」 → 「1,3,4,5,6번까지해서 공통으로 해줘」. 같은 옷 열쇠는 색 · 데니어 · 노출만 달라 같은 옷으로 보였다. 네 공방(도시 · 삼국지 · 원소 · 포켓몬) 같이.
- data/casual-tree-v2.json — 표 outfit_style: 축 다섯(소재 16 · 입은 모양 8 · 핏 · 길이 7 · 겹쳐 입기 10 · 장신구 15), 축마다 몫(rate)과 이미 정해진 옷이면 안 얹는 말(clash), 꾸밈마다 옷 계열 · 프레이밍 · 옷 글에 있어야 할 말(needs) · 부딪히는 말(clash) · 추운 철에만(warm). 노출을 늘리는 꾸밈(어깨 내리기 · 단추 풀기)은 노출 축과 겹쳐 넣지 않았다.
- lib/casual-tree-v2.js — styleOpts · styleText · spreadStyles(묶음 + 앞 기록에서 덜 쓴 것부터, 게임 코스프레 · 자유 설계 · 직접 쓴 옷 글은 안 꾸밈). scene.ostyle = { 축: 열쇠 }.
- tools/casual-plan.cjs — 고개 좌우 다음에 spreadStyles. lib/prompt-element.js — Outfit 줄에 「styled with …」, SCENE_V2 에 ostyle. ?v — casual-tree-v2 11 · prompt-element 51(prompt.html · index.html).

## 2026-11-20 · claude · 일상컷 고개 · 몸 좌우 — 몸 · 고개 · 시선을 따로, 묶음 안에 좌우를 나눔
- 사용자 「도시공방 경복궁 사이버펑크야. 고치려면 공통으로 고쳐줘」. GPT 검토 — 일상컷 시선은 정해도 고개 좌우를 안 적어 모델이 참고 그림 각도를 그대로 따라 컷마다 같은 각도였다. 네 공방 같이 고침.
- lib/casual-tree-v2.js — turns · turnText · spreadTurns 추가(scene.turn = 코끝이 향하는 화면 쪽 front · left · right). 몸 · 고개를 따로 적고 「각도는 이 줄을 따르고 붙인 그림을 따르지 않는다」 한 줄. 옆모습에서 두 손 쓰임이 같으면 turn 쪽을 본다.
- 계획기 — 분위기 단계 끝에 spreadTurns 로 묶음 안 좌우를 고르게 나눔(자유 설계 칸 빼고). 조립부 COMPOSITION 줄이 turnText 를 씀, SCENE_V2 에 turn. ?v= 올림.

## 2026-11-20 · claude · core v7 — 얼굴 낱말에서 크기 말을 빼고 모양 · 방향만
- 사용자 「이건 공통적으로 손볼 부분 같긴한데」 → 「이건 지금 고치자」 → 「옮겨주고」. style-atelier core/v7 — VOCAB_EN 얼굴 낱말(face_shape · eyes · brows · nose · lips 스물다섯)과 FACE_DESIGN.eye_size 에서 크기 말을 빼고, 이목구비 크기는 자연스러운 범위 · 차이는 눈꼬리 · 눈썹 곡선 · 입꼬리 · 턱선으로(예: square_soft · broad_soft · wide_smile · round_large). 도시 공방 해치 스팀펑크 시험에서 각진 얼굴 · 넓은 코 · 넓은 입 · 긴 아몬드 눈이 겹쳐 넓적하게 나왔다. 열쇠는 그대로 — 이 공방 lib/ 끝 core 블록을 node core/sync.cjs 로 v7 로 옮겼다(블록은 손으로 고치지 않는다). 이미 그린 그림은 그대로.

## 2026-11-20 · claude · 자세별 구도 제한 풀기 — 엎드리기 추천 · 카메라 높이 · 가슴 위 뒤 3/4
- 사용자 「엎드린 자세는 위에서 찍은거 밖에 안나오는거 같던데」 → 「구도제한 다 풀어주고, 다른 공방도 같이 적용해줘」. 엎드리기 추천이 「전신 · 정면」 하나라 세로 화면에서 늘 위에서 찍혔다.  
  data/casual-tree-v2.json — 엎드리기 추천 더함: lie_front_face(바닥 높이 · 가슴 위 · 얼굴 정면) · lie_front_side(바닥 높이 · 환경 컷 · 옆모습). 카메라 floor(바닥 높이)는 서기 · 걷기도 받고(서면 올려다본다) 누운 자세 말을 더했다, top(바로 위에서)은 앉기 · 무릎 꿇기도 받는다. 쪼그려 앉기는 가슴 위 컷도.  
  data/casual-tree.json — frame_rules.chest_up 의 no_orients 에서 뒤 3/4(rear_3q · three_quarter_back)을 뺐다(어깨 너머로 돌아보는 가슴 위 컷). 등 돌림 · 뒤 · 걸어가는 뒷모습은 그대로 막는다. tests/casual-tree.cjs 단언을 새 규칙으로.

## 2026-11-19 · claude · 세계컷 GPT 설계 — 얼굴 칸 여덟(우리와 다르게 · 두 장도 다르게)
- 사용자 「같아도 되고 달라도 된다고 했더니 거의 같게 그리는거 같아 … gpt 세계컷에 얼굴까지 우리거랑 다르게 … GPT A랑 B가 또 다르게」 → 「Face 쪽은 다 다르게로 하자」 → 「응 진행해줘」 — 삼국지와 같은 꼴
- lib/prompt-element.js — 칸 채우기 틀의 Face 줄을 칸 여덟으로, 주문에 칸마다 우리 목록(우리 것 · wide_smile 뺌). worldFillErrors — 목록 밖 · 빈 칸 · 두 설계 칸마다 같음은 오류. 옛 FILL_SPLIT · fillRe 를 한 칸 표(slotTable · slotRe)로. worldFillFace 내보냄
- lib/prompt-spec.js WORLD_FREE.fill.face · two · free(표정 줄만 자유) · msg. 안내 묶음 차례표 · IMAGE_AUTOMATION · world-fill-check 머리. 검사 prompt-element. ?v= prompt-spec 55 · prompt-element 49

## 2026-11-19 · claude · 세계컷 설계 — 크게 웃는 표정 · 웃는 입 없앰
- 사용자 「원소 세계컷 설계에 러더포듐같이 웃는 표정 좀 없애줘」 → 「응 이대로해줘」
- data/element-design.json — 표정 laughing · laughing_open 열 곳(근본 알루미늄 · 플루오린 · 토륨 · 프랑슘 · 러더포듐 · 칼륨 · 프라세오디뮴, 산소 가문 피, 주민 모닥불 · 술통)을 confident · determined · proud · calm · focused · curious 로, 입 wide_smile 스물여덟 곳(근본 열여섯 · 수소 가문 풍선 · 주민 열하나)을 soft_medium · plush_pout · thin_bow 로. look.why 에 바꾼 까닭, 「활짝 웃는 입」 말은 「다문 입」
- tools/element-design.py check — 세계컷 설계에 크게 웃는 표정 · 웃는 입이면 오류(옅은 미소는 됨, 일상컷 표정은 따로). AGENTS.md 1-2 절 한 줄
- 이미 기본 화풍 세계 그림이 있는 여섯(알루미늄 · 플루오린 · 토륨 · 프랑슘 · 칼륨 · 프라세오디뮴)은 그림 그대로 — 바뀐 설계는 다음 그림부터

## 2026-11-19 · claude · 근본 합성 스물셋 C — rg · cn · nh · fl · mc · lv · ts
- 사용자 「원소공방 근본원소 추가해줘」 → 남은 합성 원소 스물셋을 세 묶음으로 → 「응 넣어줘」
- data/element-design.json nations 끝에 rg · cn · nh · fl · mc · lv · ts — 근본만(가문 · 주민 · 그림은 아직). 실루엣은 tools/sil-spread.py 로 미리 고른 값, 헤어 · 체형은 덜 쓴 것부터 미리 나눈 값(스팀펑크 올림머리 없음)
- data/casual-own.json — 캐릭터만의 컷(90번) 세계마다 다른 직업, 다른 카드와 겹치는 직업 없음. 머리색 roentgenium_film · copernicium_orbit · nihonium_dawn · flerovium_atoll · moscovium_frost · livermorium_vine · tennessine_ridge — lib/look-spec.js VOCAB_EN · tools/port-look-spec.cjs EXTRA · lib/prompt-spec.js 한글 표 · SIL_TAGS. docs/ELEMENT_CONCEPT.md 묶음 절

## 2026-11-19 · claude · 근본 합성 스물셋 B — lr · rf · db · sg · bh · hs · mt · ds
- 사용자 「원소공방 근본원소 추가해줘」 → 남은 합성 원소 스물셋을 세 묶음으로 → 「응 넣어줘」
- data/element-design.json nations 끝에 lr · rf · db · sg · bh · hs · mt · ds — 근본만(가문 · 주민 · 그림은 아직). 실루엣은 tools/sil-spread.py 로 미리 고른 값, 헤어 · 체형은 덜 쓴 것부터 미리 나눈 값(스팀펑크 올림머리 없음)
- data/casual-own.json — 캐릭터만의 컷(90번) 세계마다 다른 직업, 다른 카드와 겹치는 직업 없음. 머리색 lawrencium_spiral · rutherfordium_leaf · dubnium_river · seaborgium_row · bohrium_shell · hassium_beech · meitnerium_split · darmstadtium_mosaic — lib/look-spec.js VOCAB_EN · tools/port-look-spec.cjs EXTRA · lib/prompt-spec.js 한글 표 · SIL_TAGS. docs/ELEMENT_CONCEPT.md 묶음 절
- tests/walk-table.cjs — 박아 둔 하슘 흐린 칸 시험을 설계표에서 고르는 칸으로(나라가 아닌 원소 중 바로 위가 나라인 첫 칸, 118 원소가 다 나라면 건너뛰고 나라 수 118 확인)

## 2026-11-19 · claude · 근본 합성 스물셋 A — pm · np · bk · cf · es · fm · md · no
- 사용자 「원소공방 근본원소 추가해줘」 → 남은 합성 원소 스물셋을 세 묶음으로 → 「응 넣어줘」
- data/element-design.json nations 끝에 pm · np · bk · cf · es · fm · md · no — 근본만(가문 · 주민 · 그림은 아직). 실루엣은 tools/sil-spread.py 로 미리 고른 값, 헤어 · 체형은 덜 쓴 것부터 미리 나눈 값(스팀펑크 올림머리 없음)
- data/casual-own.json — 캐릭터만의 컷(90번) 세계마다 다른 직업, 다른 카드와 겹치는 직업 없음. 머리색 promethium_lantern · neptunium_deepsea · berkelium_tassel · californium_sunstreak · einsteinium_ash · fermium_graphite · mendelevium_ledger · nobelium_laurel — lib/look-spec.js VOCAB_EN · tools/port-look-spec.cjs EXTRA · lib/prompt-spec.js 한글 표 · SIL_TAGS. docs/ELEMENT_CONCEPT.md 묶음 절

## 2026-11-19 · claude · 칸 채우기 검사 말을 낱말 표로 — tests/words.cjs 통과
- 같은 날 넣은 칸 채우기 검사(worldFillErrors · freeFillErrors)의 한글 오류 말이 조립부 코드에 박혀 tests/words.cjs 가 깨져 있었다(원소 근본 B 묶음 검사에서 드러남)
- 말은 lib/prompt-spec.js 의 GPT 설계 주문 표(msg)로 옮기고 조립부는 FM(열쇠)로 읽는다 — 글은 그대로라 검사 · 도구 출력은 같다. ?v= 올림

## 2026-11-19 · claude · 그림 저장소 셋째 element-atelier-img-3 연결 — 둘째는 닫힘
- 사용자 「원소랑 삼국지 이미지 저장소 3번 다 만들어놨으니 연결도 시켜줘」 — element-atelier-img-2 가 약 0.96 GB 로 찼다
- element-atelier-img-3 에 README · .nojekyll · 썸네일 워크플로(img-2 와 같은 꼴, 크기 경고는 img-4 를 가리킨다)
- lib/img.js BASES · tools/register-images.py SHARDS(EXTRA_DIRS img-3) · 그림 등록 워크플로(img-repo-3 받기 · img-3 잇기) · .gitignore · img.js ?v=12. 테마(themes/)는 img-2 그대로
- 문서 IMAGE_RULES 저장소 표 · AGENTS · IMAGE_AUTOMATION. 검사 img-shards · register-images 통과

## 2026-11-18 · claude · 세계컷 GPT 설계 — 체형 칸 · 피부색 허용
- 사용자 「피부랑 체형까지는 바꿈 허용해줘」 → 「응 A로 진행해줘」(우리 체형 목록 안에서만)
- 칸 채우기 틀의 우리 체형 글(Body and hair 줄 「… build」)을 [BUILD: …] 칸으로 — 주문에 우리 체형 목록(VOCAB_EN.body 전부 + build)을 싣고 하나를 글 그대로, 우리 것 그대로도 된다
- Face 줄의 피부색은 바꿔도 된다고 주문에 적었다(피부 마감 · 빛 · Avoid 줄은 화풍이라 그대로)
- 검사 worldFillErrors · tools/world-fill-check.cjs — 목록 밖 · 고친 체형 글은 걸린다. 안내 글 · 검사 글 함께

## 2026-11-18 · claude · 세계컷 GPT 설계 — 칸 채우기(우리 설계 지시문 + 헤어스타일 · 실루엣 칸)
- 사용자 2026-11-18 「세계컷은 gpt한테 너무 위임하면 안되겠다」 → 「크게는 우리거를 따르는데, 헤어스타일, 의상은 무조건 다르게. 나머지는 같아도되고, 달라도되고 … 의상만 우리 실루엣 안에서만 고르게하고」 → 「응 이대로 진행해줘」(삼국지 공방과 같은 꼴).
- lib/prompt-element.js buildWorldFree — 머리말(WORLD_FREE.fill) + 우리 설계 지시문의 헤어스타일 글 → [HAIRSTYLE: …], 실루엣 글 → [COSTUME SILHOUETTE: …](원소 성격 묶음에서 우리 것 뺀 글 그대로 — 지시문에서 조금 바뀐 실루엣 글은 앞 구절로 찾는다), 주민은 대신 Costume variation 줄. Design idea · Stance and hands · Setting detail 줄. 카드 × 세계 480 틀 모두 칸이 제자리.
- worldFillErrors · worldFillPicks · tools/world-fill-check.cjs. 묶음 안내 · docs/IMAGE_AUTOMATION.md · tests/prompt-element.cjs 를 칸 채우기로. 같은 날 앞서 넣은 A안 · B안 · 「얼굴은 우리와 다르게」 는 이것으로 바뀌었다(buildWorldFreeOld 로 남김).

## 2026-11-18 · claude · 세계컷 GPT 주문 — 몸 방향 고정(3/4)
- 사용자 2026-11-18 관은병 메카 「자세도 정면을 보는 자세로만 나오던데 … 우리는 약간 옆으로 튼 자세잖아」 → 「추천대로해줘」. 주문엔 자세가 자유였고 몸 방향 말이 없었으며, B안의 「steady pose」 가 정면으로 밀었다(4번 「Stable frontal stance」).
- WORLD_FREE.pose — 「Pose (body direction fixed — ours)」: 우리 설계와 같은 몸 방향(살짝 틀어 약 3/4, 얼굴은 보는 쪽, 정면으로 딱 서지 않게)만 고정, 다리 · 손 · 몸짓은 맡은 쪽. B안 문구는 「역할이 드러나는 자세, 몸 방향은 Pose 줄대로」.

## 2026-11-18 · claude · 세계컷 GPT 주문에 화풍 덧줄(피부 마감 · 빛 · Avoid)
- 사용자 2026-11-18 관은병 메카 GPT 설계 3 · 4 「화풍까지 건든거 같아」 → 「응 고쳐주고」. GPT 는 주문의 Style 줄을 그대로 옮겼다 — 주문(buildWorldFree)이 화풍 문단만 싣고(shortStyle) 화풍 판의 덧줄(worldStyleAfter 피부 마감 · worldLight 빛 · avoid)을 빼서, 물광 피부 · 림 라이트 없이 나왔고 B안은 장면 빛을 스스로 「planetary daylight」 로 정했다.
- Style (fixed) 뒤에 Skin finish (fixed — ours) · Light (fixed — ours — 배경은 바뀌어도 그녀를 비추는 빛은 그대로) · Avoid (fixed) — 덧줄이 있는 판만(삼국지 기본 kr_drawn_rim_dewy, 원소 kr_promo_hikey_oil · mmorpg_cg · bright_2d_oil).

## 2026-11-18 · claude · 세계컷 GPT 설계 3단계 — 설계 요약 기록 · 비슷한 등록작 피하기
- 사용자 2026-11-18 「응 허용하고 이순서대로 진행해줘」 — 세계컷 GPT 설계안 3단계: 설계 요약 기록 · 비슷한 등록작 피하기.
- 주문(WORLD_FREE / FREE_DESIGN .summary)에 「지시문 첫 줄 SUMMARY: 얼굴 윤곽 · 눈매와 눈썹 · 표정 · 머리 외곽 · 의상(장갑) 큰 형태」, 기록 generation.summary(묶음 안내).
- tools/design-near.cjs — 삼국지와 같은 꼴(lib/prompt-element.js designKeys · designSummary, 기록은 옆 element-atelier-img/records). prompt-pack.cjs 가 넣는다. tests/design-near.cjs.

## 2026-11-18 · claude · 세계컷 GPT 설계 2단계 — B안(역할 · 기능 출발, 목록 밖 외곽 허용)
- 사용자 2026-11-18 「응 허용하고 이순서대로 진행해줘」 — 세계컷 GPT 설계안 2단계: 둘째 GPT 설계(-gpt2)는 B안 — 목록 밖 외곽 허용.
- lib/prompt-spec.js WORLD_FREE.second → 「Costume — Design B」: 원소의 쓰임(주민은 그 물건의 쓰임)에서 나온 직책 · 역할을 먼저, 그에 맞는 외곽(목록 밖도), 어깨 · 허리 · 하체 외곽 하나는 A안과 다르게, 장비 배치 · 배경 단서 하나, 메카는 단단한 전신 장갑 안에서 새 외곽.
- 묶음 안내 · docs/IMAGE_AUTOMATION.md 를 A · B 안으로, 기록 generation.plan. tests/prompt-element.cjs 주문 검사를 새 글로.

## 2026-11-18 · claude · 세계컷 GPT 설계 1단계 — A안 문구 · 우리 설계와 얼굴 · 외곽 대조
- 사용자 2026-11-18 「응 허용하고 이순서대로 진행해줘」 — 세계컷 GPT 설계안(A: 지정 실루엣에서 소재 · 상징을 의상 구조로, B: 역할 · 기능에서 출발해 목록 밖 외곽도) 1단계.
- lib/prompt-spec.js WORLD_FREE.costume — 「Design A, your first design」: 원소의 물성 · 상징의 시각 특징 하나를 겹침 · 단면 · 절개 · 여밈 · 장갑판 배열에, 전신에서 먼저 읽히는 윤곽을 지시문에 적는다.
- WORLD_FREE.ours · check — 우리 설계 두 장의 얼굴 · 머리(lib/prompt-element.js oursLook)와 다른 얼굴 인상 · 머리 외곽, 마지막에 대조.

## 2026-11-18 · claude · 단계 동작 문장 관사 겹침 고침
- 단계 동작 영어 문장의 관사 겹침 고침 — 「the open {prop}」 꼴이 소품 이름의 a · an 과 겹쳐 「rests the open a red oil-paper umbrella」 가 됐다(잔 · 우산 · 부채 · 매니큐어 · 기름종이 우산).

## 2026-11-18 · claude · 일상컷 새 소품(E) — 시대 · 장소 · 단계 동작
- 새 소품(E) — 비눗방울 막대 · 고무 오리 · 솜사탕 · 즉석 사진 · 아이스바 · 시트 마스크 · 매니큐어 · 드라이기 · 샤워볼 · 물총 · 팝콘 통 · 수박 한 조각 · 우쿨렐레 · 털실 뭉치 · 연(이미 있으면 그대로). 소품마다 시대(현대 물건은 지금 · 현재 쪽 시대만 — 세계 안 · 무대 · 환상에선 안 나온다)와 장소, 단계 동작 둘씩(예: 즉석 사진 — 빛에 비춰 보기 / 앨범에 끼우기).

## 2026-11-18 · claude · 일상컷 자세 쏠림 줄이기(C) · 순간(D)
- 추천 자세 열다섯 더(C) — 의자에 앉아 위에서 본 3/4 · 어깨 너머로 돌아보기(의자 · 옆으로 걸터앉기 · 한쪽 무릎) · 바닥 높이 카메라 · 엎드려 바로 위에서 · 기대 누워 발치에서 · 옆모습 쪼그려 앉기 · 난간에 기대 하늘 보기 · 옆모습 걷기 아래에서 · 탁자에 기대 위에서 · 옆으로 누워 눈높이 · 무릎 꿇고 옆모습 아래에서 등.
- 순간(D) — 표 moments 스물다섯(노출과 상관없는 작은 사건: 머리 위 거품 · 어깨에 붙은 거품 · 김 서린 거울 손자국 · 속눈썹 물방울 · 볼의 밀가루 · 코끝 생크림 · 눈송이 · 입김 · 꽃잎 · 낙엽 · 색종이 · 비눗방울 · 잠 머리 · 귀에 꽂은 연필 · 보안경 …). 장소 특징 · 목욕 장소 · 프레이밍(보여야 하는 부위) · 얼굴이 보이는 컷 · 날씨 · 시간대 조건, 손을 쓰는 순간은 없다. lib/casual-tree-v2.js moments · momentOk, extras().moment → 지시문 「Small moment: ….」. 계획기가 일반 컷 몇 장(자유 설계 · 상황 · 코스프레 빼고)에 덜 쓴 것 하나.
- tools/casual-plan.cjs — 자세 추천 무게에 자세 · 몸 방향 · 카메라 짝 횟수(전체 + 묶음), 「서기 · 정면쪽 · 눈높이」 추천은 반. momentize(한 묶음 둘까지).

## 2026-11-18 · claude · 일상컷 시간대 · 빛(A · B · G) — 늘 고르기 · 전체 기록 비율 · 빛 모습
- 시간대 다섯 더 — 새벽 · 오전 · 흐린 낮(하늘 · 창) · 낮 실내 · 형광등(창 없는 실내도 등불 말고 고를 것이 있다). 날씨와 짝(weather_times)도 더했다.
- lib/casual-tree-v2.js ambience — 시간대는 늘 고른다(전엔 0.7 · 창 없는 실내 0.3 이라 절반이 비었다). 덜 쓴 값은 같은 묶음 횟수 + 전체 기록 비율(opts.global, 0 ~ 1)로(묶음 안만 봐서 전체로는 등불 · 밤이 72% 였다).
- 빛 모습(G) — 표 ambience.looks(시간대 × 장소 특징 · 날씨, 첫 맞는 줄)를 extras().look 으로, 지시문의 「Time of day: …; <빛 모습>.」(예: 아침 창빛 · 비에 젖은 바닥 반사 · 물에서 튀는 빛 · 땅거미 첫 불빛).
- 자유 설계 칸에도 계획기가 고른 시간대 한 줄 「Time of day (fixed): … — set your scene at this time.」(사용자 2026-11-18 A · B · G).
- tools/casual-plan.cjs — sceneUsage 가 시간대 · 빛 · 날씨를 세고 ambient 가 비율을 global 로 넘긴다. tests/prompt-element.cjs — 랜덤 장면에 그 카드의 현장(casualCard, 이제 내보낸다)을 넘기고 게임 코스프레 옷은 다시 뽑는다(카드 없이 뽑으면 일반 현장 자세가 그 카드 현장엔 안 맞았다).

## 2026-11-18 · claude · 일상컷 행동 단계(F) — 소품 동작에 준비 · 하는 중 · 마무리
- data/casual-tree-v2.json prop_uses 에 단계 동작 64(stage · stage_ko — 소품마다 준비 · 하는 중 · 마무리, 단계마다 손 수 · 손 자리 · 받는 자세가 다르다). 사용자 2026-11-18 「F부터 진행해줘」 — 소품이 달라도 늘 들고 서 있어 비슷해 보였다.
- tools/casual-plan.cjs — 소품 동작 무게에 동작 횟수(sceneUsage use)를 더하고, 단계 동작은 1.3 배 · 단계 없는 hold 는 0.8 배(useWeight).
- tests/casual-plan.cjs — 최근 장면 글 상한 200 → 300(GPT 자유 설계 장면 글이 265 · 226 자).

## 2026-11-18 · claude · casual-own.json 복원 — 잘린 도구 출력이 저장됐던 것
- 9638169(어븀 통역사 직업컷 자세)가 파일 대신 잘린 도구 출력(맨 앞 「Warning: truncated output …」 두 줄 + 가운데 약 4,300 토큰 빠짐)을 저장해 JSON 이 깨졌다 — 계획기가 읽지 못했다. 8ce6bbb 로 되돌리고 그 커밋이 하려던 바뀜(어븀 메카 동시통역사 preset table_lean_use → counter_work) 하나만 다시 적용했다(잘린 파일의 앞 · 뒤 조각이 고친 파일과 글자 그대로 같다).

## 2026-11-18 · gpt · 디스프로슘 선택 1·2·1 및 직업컷 자세 중복 해소
- data/casual-own.json — 판타지 석청 채집꾼과 겹치던 메카 운동화 점원의 lookback_raise를 camera_shot · sig_both로 바꿔 세 세계 직업컷을 모두 생성하도록 했다. 직업과 의상은 그대로다.
- 디스프로슘(dy) — 세계컷은 판타지 1번 · 스팀펑크 2번 · 메카 1번 선택 원본을 무손실 시트에서 복원해 사용한다. 세계별 일상 7장과 직업컷 1장씩의 지시문·참조·검수 기록을 남긴다.

## 2026-11-17 · gpt · 아스타틴 선택 1·1·1 전체 27컷
- 아스타틴(at) — 판타지·스팀펑크·메카 모두 1번 원본 확정. 세계컷 3장, 세계별 일상 7장과 전용컷 1장씩 총 27장을 생성·검수했다.
- element-atelier-img-2/img — 1024×1536 WebP(품질 90), element-atelier-img/records/at — 실제 지시문·참조 해시·자유 설계·코스프레·검수·계획 기록.
- 계획과 다른 배경·구도·머리 길이·허용 외 문자는 검수에 남기고 원본을 유지했다. 생성된 이미지 재생성 없음. 도감·일상 색인은 자동 등록으로 반영한다.

## 2026-11-17 · gpt · 레늄 선택 4·2·1과 전체 27장 등록
- data/img.json — 등록기로 세계컷 3장, 일상 21장과 직업 컷 3장을 추가했다.
- data/casual-index.json — 생성한 레늄 색인 24줄을 기존 항목을 보존하며 합쳤다.
- 그림과 생성·검수 기록은 두 그림 저장소에 각각 커밋했다.

## 2026-11-17 · claude · 코스프레 캐릭터 다른 표기(aka) · PATCH 차례 바로잡음
- 사용자 「응 둘 다 고쳐줘」(코스프레 캐릭터 이름이 명단과 달라 한글이 안 붙던 넷 · 원소 PATCH 차례)
- tools/casual-plan.cjs · tools/casual-index.cjs — characters[].aka 를 그 캐릭터로(기록의 Cherie → Sherry), 색인은 retired_ko 도. data/game-cosplay.json sync · data/casual-index.json 다시 씀(코스프레 캐릭터 한글 60/60)
- docs/PATCH.md — 0097c3a(프랑슘 직업컷)가 맨 위 안내글을 지우고 11-16 칸을 11-17 칸 위에 두어 patch 검사가 실패하던 것: 안내글을 되살리고 칸을 날짜 차례로(같은 날 안은 그대로). 검사: patch · casual-index 통과

## 2026-11-17 · claude · 게임 코스프레 목록 — 다섯 게임 더해 스물넷
- 사용자 2026-11-17 「테일즈위버랑 DOA 는 KOF를 넣고 이건 코스튬 게임에도 넣어줘」 → 「DOA 는 5, KOF는 2002 로 나머지 두개도 추천대로 해줘」 — 게임공방에 다섯 편을 넣고 코스프레 목록에도
- data/game-cosplay.json — 원본(game-atelier tools/game-cosplay.cjs sync) 사본: 게임 열아홉 → 스물넷. 베요네타(주인공 하나), 테일즈위버 11 · 데드 오어 얼라이브 5 · 24 · 더 킹 오브 파이터즈 2002 · 40 · 원신 115(등장인물 많음 — 공식 플레이 캐릭터, 위키백과로 확인. 어린아이로 그려진 캐릭터는 뺐다)
- tests/screen.cjs — 게임 칸 수를 20 으로 박아 두어 게임이 늘면 깨진다 — 목록의 게임 수 + 1 로
- IMAGE_RULES.md · tools/casual-plan.cjs(주석) — 게임 열아홉 → 스물넷(주인공 하나 열둘 · 등장인물 많음 열둘)
- 검사: tests/casual-plan.cjs — 게임 코스프레 고르기 통과, 원래 걸리던 「최근 장면 여덟(200자)」 자리에서 그대로 멈춤(그림 저장소 기록 몫)

## 2026-11-17 · claude · 게임 코스프레 사본 — 어린 캐릭터 뺌
- 사용자 「그러면 어린케릭터는 빼자. 어차피 원신쪽은 잘 알지도 못하는 케릭터들인데」
- data/game-cosplay.json — 게임공방 원본 sync: 어린 캐릭터 열셋(유피 포함)과 young 칸들이 빠짐. 이미 그린 그림은 그대로

## 2026-11-17 · claude · 한 장 층 — 일상컷 한 줄(무엇으로 그렸나)
- 사용자 「전체 목록리스트에서 보는건 지저분하니까, 상세보기나 크게보기 일 때만 보이도록」 · 「우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」
- lib/casual-note.js — 새 모듈(삼국지 · pkm 과 글자 하나 다르지 않게): data/casual-index.json 을 한 장을 처음 열 때 한 번만 받아 파일 이름(<카드>_<세계>_<화풍>_f_casualN.webp)으로 줄을 찾고 「필수 · <갈래> — <옷> · <색>」 · 「필수 · 게임 코스프레 — <게임> · <캐릭터> · <재단>」(+GPT 고름) · 「<자유 설계 갈래> — <Outfit 영어, 길면 줄였다 누르면 펼침>」 · 「캐릭터만의 컷 — <직업>」 한 줄. 받기 실패 · 없는 줄이면 안 보인다
- lib/walk-card.js — 한 장(크게 보기) 위 줄 아래에 일상컷이면 한 줄. 목록 층(walk-list) 칸은 그대로. walk.js ?v=18 · walk-card ?v=6 · index.html words ?v=33 · walk.css ?v=17
- lib/words.js — dex.cnote.req · gpt · more · less
- lib/walk.css — .w-card .lb-cnote 작은 글 한 줄(흐린 글색 · 갈래만 본문색)
- tests/walk-card.cjs — 맨 앞에 fixture 색인 묶음: 목록엔 없음(색인도 안 받음) · 한 장 필수 · 코스프레 GPT · 자유 설계 줄였다 펼침 · 없는 컷 · 색인 한 번, 덮개 · PC
- 검사: tests/walk-card.cjs — 새 묶음 통과, 원래 걸리던 「어디서 눌러도 같은 한 장」 넘침(아래 목록 층 344 조작 줄) 자리에서 그대로 멈춤

## 2026-11-17 · claude · 게임 코스프레 목록 사본 — 캐릭터 한글 이름 · 어린 캐릭터 young
- 사용자 2026-11-17 「응 캐릭터 한글 이름도 채워줘」 · 「코스튬의상이라 나이는 상관없는데」 → 「응 그렇게 해줘」
- data/game-cosplay.json — 원본(game-atelier tools/game-cosplay.cjs sync) 사본: 등장인물 많은 게임 열 곳의 characters 마다 ko, 어린 캐릭터 열둘 다시 넣음(테일즈위버 14 · 원신 124) · young: true(유피 포함 열셋) · young_cuts [knit, idol, mini_dress]. young 재단 고르기는 계획기 작업이 따로 한다
- data/casual-index.json — node tools/casual-index.cjs 로 다시 씀 — 바뀐 것은 cosplay.characterKo 뿐(+ built)

## 2026-11-17 · claude · 일상컷 색인 — 허브 「일상컷 목록」 자료
- 사용자 「저거를 목록을 두고 확인할 수 있는 방법은 없을까? 위치는 허브가 좋을거 같은데 … 필수컷 만들 때 뜬 갈래랑 의상이랑, 게임코스튬 때 쓴 게임, 케릭터, 의상갈래 정도만」 → 「응 그렇게 진행해줘. 우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」
- tools/casual-index.cjs — 새 도구. 그림 저장소 records 의 일상컷 기록(<세계>-casualN.<화풍>-ui.json, 꼬리 붙은 곁가지는 한 컷으로)과 그 카드 · 세계의 계획 파일(required — 노출 갈래 · 나라 안 · 게임 코스프레 · 옛 묶음의 상황 노출, 90번은 캐릭터만의 컷)을 읽어 data/casual-index.json 을 쓴다(세 공방 같은 꼴, 그림은 안 읽음). 우리 값(갈래 · 옷 · shade · 게임 · 재단 · 세계 · 카드 이름)은 표의 한글, 캐릭터는 목록 characters[].ko → 주인공 하나 character_ko → null, GPT 가 지은 자유 설계 Outfit 줄 · 옛 pick 캐릭터는 영어 그대로. 내용이 같으면 다시 쓰지 않는다
- data/casual-index.json — 첫 색인(2810줄 · 필수 933 · 캐릭터만의 컷 237 · 코스프레 60(planner 51 · gpt 9) · 자유 설계 456(Outfit 줄 453))
- .github/workflows/register-images.yml — 그림 등록 뒤 「일상컷 색인」 단계(검사 tests/casual-index.cjs → 도구, 깨져도 등록은 막지 않음), 되커밋에 data/casual-index.json 도
- tests/casual-index.cjs — 새 검사(fixture — 꼴 · 한글 · 곁가지 합치기 · 필수 표시 · 코스프레 by · 캐릭터 한글 · Outfit 줄 · 차례 · 같으면 안 씀). AGENTS.md — 도구 · 검사 한 줄씩

## 2026-11-17 · claude · 게임 코스프레 사본 — 원본과 다르면 계획기 경고
- 사용자 「게임공방에 게임 자료를 늘리면 아까 추가한 게임코스튬 갈래도 더 추가되게 할 수있을까?」 · 「이제 게임공방에 데이터를 추가한다면」 → 「응 진행해줘」
- data/game-cosplay.json — 게임공방 원본 sync(뺀 게임 excluded 칸이 더해짐 — 계획기는 games 만 읽는다)
- tools/casual-plan.cjs — 옆에 game-atelier 가 있고 사본이 원본과 다르면 「사본이 옛것 — sync」 경고(명령줄로 돌릴 때만, 계획은 막지 않음). 검사: 일상컷 계획기 검사(원래 실패 자리 그대로)

## 2026-11-17 · gpt · 프랑슘 직업컷 구도 중복 수정
- data/casual-own.json — 프랑슘 메카 직업컷을 소품 근접 구도로 바꿔 판타지의 걷는 구도와 구별하고, 세 세계 모두 90번을 생성할 수 있게 함.

Warning: truncated output (original token count: 55755)
Total output lines: 1252

# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-30` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.


## 2026-11-16 · gpt · 하프늄 2·3·2 선택 및 27장 등록
- data/img.json — 판타지 2번·스팀펑크 3번·메카 2번과 세계별 일상 7장·전용컷 90번, 총 27장을 등록기로 추가했다. 기존 등록은 보존했다.
- 이미지 원본은 1024×1536, 등록본은 WebP 품질 90·method 6이다. 실제 프롬프트·참조 SHA·자유 설계·코스프레·검수와 계획을 records/hf에 기록했다.
- 생성 이미지는 재생성하지 않았다. 프레이밍·옷 핏·방향·그림자 구성의 차이 4건은 검수에 그대로 남겼다.

## 2026-11-16 · gpt · 이트륨 2·2·1 선택 및 27장 작업
- 판타지 2번·스팀펑크 2번·메카 1번을 선택하고 세계별 일상 7장·직업컷 90번, 총 27장을 추가했다.
- 원본 1024×1536, WebP 품질 90·method 6. 실제 프롬프트·참조 SHA·자유 설계·검수와 계획을 그림 저장소 records/y에 기록했다.
- 생성 결과는 재생성하지 않았고, 기존 이미지·기록·등록을 보존한 채 main에 반영했다. data/img.json은 자동 등록기를 사용한다.

## 2026-11-16 · gpt · 스칸듐 1·2·3 선택 및 27장 등록
- data/img.json — 판타지 1번·스팀펑크 2번·메카 3번과 세계별 일상 7장·직업컷 90번을 등록기로 추가했다. 기존 등록은 보존했다.
- 이미지·실제 프롬프트·참조 SHA·검수는 그림 저장소에 기록했다. 생성된 이미지는 재생성하지 않았다.

## 2026-11-16 · claude · 일상컷 옷 색 — 갈래 대신 구체 색 하나(shade)
- 사용자 「수영복 중에 색이 분홍색으로 지정되어 있는게 있어?」 → 「응 너무 많아」 → 분홍 빼기는 거절 → 「응 그렇게 진행해줘」 — 갈래 글의 「such as」 맨 앞 예시(파스텔 → 분홍)로 쏠렸다
- lib/prompt-spec.js — CASUAL.colors 여덟 갈래마다 shades(key · ko · en · hue, 마흔여섯) · hues 열둘 · hairHue(머리색 영어 글 → hue 정규식)
- lib/prompt-element.js — hairHue · shadesOf · autoShade · shadeFor. Outfit 줄 색 글이 shade 의 en 하나(짧은 판 · 긴 꼴 · 구조판). shade 없는 장면은 카드 | 세계 | 번호로 늘 같은 하나(머리 hue 피함), casualRecord 가 번호를 넘긴다. SCENE_V2 에 shade(기록에 남는다)
- tools/casual-plan.cjs — shadeUsage(그린 기록 scene.shade + 안 그린 계획 파일 — 코스프레 「쓴 것」 과 같은 곳 · 거름, --shade-usage) · shadeize(덜 쓴 것 먼저 · 머리 hue 피함 · 묶음 안 겹침 없음 · 같은 hue 되도록) · check(그 갈래 안 · 겹침 · 코스프레 · 색 고정 옷 · 머리 갈래) · plan.json shadeRead
- tools/prompt-pack.cjs — settings 로 갈래를 바꾸면 계획 shade 를 버리고 조립부가 정한다. lib/studio.js · lib/words.js — 옷 색 아래 「색」 단계(자동 · 그 갈래 shade, 머리색 갈래 표시), 생성기 지시문도 번호를 넘긴다. prompt.html · index.html · alchemy.html · styles.html ?v= words 32 · prompt-spec 43 · prompt-element 38 · studio 10
- tests/casual-shade.cjs 새로 · tests/casual-plan.cjs(shade 줄 · 겹침) · tests/screen.cjs(색 단계). IMAGE_RULES.md 옷 색 절 · AGENTS.md 검사 목록
- 검사: casual-shade · screen · prompt-pack-screen · prompt-short-look · prompt-sections · words 통과. casual-plan(그림 저장소 최근 장면 200자) · prompt-element(fe-steel-sword 랜덤)는 원래 자리에서만 실패

## 2026-11-16 · claude · 근본 스물넷 더(3) — 나라 아흔다섯
- 사용자 「원소공방 근본원소 추가해줘」 → 후보 스물넷(남은 자연 원소 전부, 세 묶음 — 합성 스물셋은 다음 판) → 「응 진행해줘」
- data/element-design.json — nations 끝에 A(sc · y · zr · hf · ru · rh · cd · re) · B(la · pr · sm · tb · dy · ho · er · tm) · C(yb · lu · in · tl · at · fr · ac · pa), 근본만(가문 · 주민 · 그림은 아직). 헤어스타일은 늘린 마흔일곱을 세 묶음에 갈라 일흔두 자리에 다 쓰임, 스팀펑크 올림머리 없음
- data/casual-own.json — 스물넷의 캐릭터만의 컷(90번). 겹침 고침: 루테늄 스팀펑크 「연애편지 대필가」(산소 주민과 같다) → 「만년필 가게 점원」, 이트륨 판타지 「왕실 아이들의 보모」 → 「공주들의 시녀장」. C 열한 줄 자세 추천 · 소품 동작을 계획기가 짜지는 짝으로
- lib/look-spec.js VOCAB_EN · tools/port-look-spec.cjs EXTRA — 머리색 스물넷 · 눈 색 아홉, lib/prompt-spec.js 한글 표 · SIL_TAGS 스물넷. index.html · prompt.html ?v= prompt-spec 42 · look-spec 14. docs/ELEMENT_CONCEPT.md 「근본 스물넷 더(3)」 절
- tests/prompt-element.cjs 세계 그림 글자 상한 5100 → 5400(이트륨 스팀펑크 5177 — 글은 줄이지 않는다). tests/walk-table.cjs 흐린 칸 시험을 철 아래 루테늄(이제 나라) → 오스뮴 아래 하슘
- 검사: element-design check 오류 0 · sil-spread --check · look-spec · prompt-short-look · prompt-sections · words · walk-core · walk-orbit · walk-table · walk-world · alchemy 통과, 스물넷 casual-plan --world all 짜짐. prompt-element 는 원래 자리(fe-steel-sword 랜덤)에서만 실패 — 그 줄을 빼면 끝까지 통과

## 2026-11-16 · claude · 외형 낱말 삼국지에서 옮김 · 그림 없는 세계 머리 다시 나눔
- 사용자 「원소공방은 외형정보나 실루엣이 삼국지나 pkm에 비해 적은거 같은데 맞아?」 → 「응 다 옮겨주고」
- lib/look-spec.js VOCAB_EN — 삼국지에만 있던 열쇠: 체형 +5(tall_curvy · strong_curvy · petite_curvy · pear_curvy · willowy_curvy) · 헤어 +24 · 머리색 +24 · 눈 색 +7 · 얼굴형 +3 · 눈 +4 · 눈썹 +3 · 코 +2 · 입 +3. 영어 글은 삼국지 그대로(core 열쇠는 core 블록이 덮는다)
- lib/prompt-spec.js — FACE_DESIGN 앞머리 +5 · 피부 honey_tan · 나이 late_30s, STRUCT.ko 한글 표 · STRUCT.body 체형 여덟 칸 다섯 · STRUCT.age late_30s, 스팀펑크 tiedHair 에 묶은 새 머리 열넷. gallium_led 한글 「LED」 를 괄호 안으로(괄호 밖은 한글 — 원래 걸리던 것이 앞 실패에 가려져 있었다)
- tools/port-look-spec.cjs EXTRA — 같은 열쇠를 더하고, 머리 칸에 잘못 들어가 있던 눈 색 일곱(gallium_led …)을 눈 색 칸으로
- lib/prompt-element.js · tools/element-design.py — UPDO(올림머리 여덟)를 스팀펑크에서 뺀다(돌림 · 검사). element-design.py rehair — 기본 화풍 세계 그림 · 손글 칸이 없는 자리 195/408 의 머리를 47가지에서 고르게 다시 고름(삼국지 rehair 옮김), 바뀐 카드 why 에 날짜
- data/element-design.json — rehair 결과(머리 195 · 앞머리 1 · why 80). IMAGE_RULES.md 「외형 낱말 늘림 · 머리 다시 나눔」. ?v= prompt-spec 41 · look-spec 13 · prompt-element 37
- 검사: look-spec · prompt-short-look · words · element-design check 통과, prompt-element 는 원래 자리(fe-steel-sword 랜덤)에서 실패 — 그 줄을 건너뛰고 돌리면 끝까지 통과, 화풍공방 core 통과

## 2026-11-16 · claude · 상황 노출 — 일반 컷 하나에 늘 한 장
- 사용자 「게임 코스튬 하기 전 필수였던 상황 노출엔 어떤 장면들이 있었지?」 → 「지금 필수가 아닌 일상컷 장면 하나를 이걸로 써도 상관은 없겠네」 → 「응 늘 1장은 나오게 맞춰줘」
- 게임 코스프레 구성에서 상황 노출을 일반 컷(필수 · 코스튬 · 자유 설계 칸이 아닌 컷) 하나에 늘 얹는다. 삼국지 · 원소 — SITU_RATE 0.5 → 1, 맞는 옷의 일반 컷이 없어 못 얹은 묶음은 계획기가 다시 짠다(그 세계에 이미 상황 컷이 있으면 그대로). pkm — 게임 코스프레 구성에서도 chooseSitu(상황 컷을 먼저, 안 되면 자유 설계 칸을 먼저 정한 뒤), 상황 컷엔 얼굴 클로즈업을 안 주고 이 구성의 얼굴 클로즈업은 한 장까지(일반 컷이 적어 자리가 모자랐다), 안 되면 다른 씨앗으로(옛 v1 은 건너뜀)
- 검사 기대값(삼국지 표본 묶음 상황 n · 원소 문구 · pkm 새 구성 상황 한 장 · 옛 구성 판정 · 묶음 검사)과 문서 고침

## 2026-11-16 · claude · 게임 코스프레 — 쓴 것은 이 공방 그림 저장소에서만
- 사용자 「각 공방마다 게임 코스튬을 서로 읽고 관리한다고 했잖아? 그게 안되면 어떻게 작동해?」(없는 저장소는 조용히 건너뛰어 다른 세션에선 못 막았다) → 「공방별로 따로 두는건?」 → 「응 그렇게 진행해줘」
- 계획기의 쓴 것 읽기(그린 기록 + 계획 예약)를 이 공방 그림 저장소만으로(삼국지 sam-atelier-img · -2, 원소 element-atelier-img, pkm pkm-atelier-img ~ -5). 다른 공방과는 같은 캐릭터가 나올 수 있다 · 공방마다 목록을 통째로 쓴다
- 이 공방 그림 저장소가 없으면 계획기가 멈춘다(삼국지 · 원소 cosplayReposOk — 하나라도 없으면, pkm — 하나도 없으면 멈추고 일부 없으면 알림). 일부러 비우려면 --cosplay-usage none(pkm --cosplay-repos). 계획 파일에 읽은 저장소(cosplayRead, 삼국지 · 원소). 문서 · 검사 같이

## 2026-11-16 · claude · 게임 코스프레 — pkm · 삼국지와 쓴 것 세는 법 맞추기
- tools/casual-plan.cjs — 주인공 하나 게임은 기록 이름(Geralt · Geralt of Rivia)과 상관없이 그 주인공으로 센다(같은 재단 되풀이 막기, pkm 91e78ea 와 같게) · pkm 예약은 24시간 안만 세던 것을 나이와 상관없이(pkm 과 같게 — 버려진 계획이라도 겹치지 않는 쪽). tests/casual-plan.cjs 기대값 · 이름 단언

## 2026-11-16 · claude · 게임 코스프레 2차 — 캐릭터를 계획기가 정하고, 예약도 「쓴 것」 으로 센다
- 사용자 「삼국지 공방에서만 벌써 오버워치 메르시가 4케릭터안에서 2번이나 나왔어」 → 「응 그래」 — 등장인물 많은 게임 1회차를 그리는 쪽이 골라(pick 「…」) 미리 짠 계획끼리 서로 못 보고 유명한 캐릭터를 되풀이했다
- tools/casual-plan.cjs — 등장인물 많은 게임도 목록(data/game-cosplay.json characters — 사본 갱신분 그대로 올림)에서 안 쓰고 예약 안 된 캐릭터를 정한다(여자 2 · 남자 1, 재단은 그 게임에서 덜 쓴 것 → text.assigned), 다 쓰면 2회차 again · 다 차면 빠짐. cosplayUsage 가 그린 기록에 더해 계획 파일(<세계>-casual-plan · -replan · .replanned)과 pkm 예약(casual-reservations · 장부 reserved, 24시간 안)의 character 찬 cosplay 도 센다(그린 번호 · 지금 다시 짜는 카드 · 세계는 빼고, 같은 번호는 replan 하나)
- tools/casual-plan.cjs — --recosplay(계획 파일의 안 그린 코스프레 칸만 새 규칙으로, 장소가 받는 재단 · 다른 칸 그대로 · 전 값은 recosplay 칸) · --recosplay-list(계획은 있는데 안 그린 pick 칸 — 지금 원소 그림 저장소엔 없음)
- lib/prompt-element.js — 캐릭터가 찬 1회차는 assigned 글, 2회차는 again, 옛 pick 칸은 그대로 · lib/studio.js — 생성기도 등장인물 많은 게임이면 목록에서 같은 무게로 캐릭터를 정한다(칩에 캐릭터) · lib/words.js · lib/prompt-spec.js 주석 · ?v= 올림
- tools/prompt-pack.cjs · IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md · AGENTS.md — 새 계획은 캐릭터가 정해져 있다, 「1회차 채우기」 절은 옛 계획에만(먼저 --recosplay)
- tests/casual-plan.cjs · prompt-element.cjs · screen.cjs — assigned(목록 안 · 쓴/예약 아님) · 여자 무게(4000번) · 오버워치 20번 겹침 없음 · 예약이 빠짐 · 2회차 · 다 차면 빠짐 · 옛 pick 지시문 그대로 · --recosplay 는 안 그린 칸만

## 2026-11-16 · gpt · 크립톤 27컷 등록
- data/img.json — 사용자 선택 판타지 2 · 스팀펑크 1 · 메카 1과 세계별 일상 7장·전용컷 1장을 공식 등록기로 추가했다. 기존 카드·등록일·저장소 위치를 보존했다.
- 생성 프롬프트·참조 해시·검수 결과는 그림 저장소 records/kr에 남겼고, 이미 생성된 그림은 다시 만들지 않았다.

## 2026-11-16 · gpt · 안티모니 27컷 등록
- 사용자 선택 판타지 2 · 스팀펑크 3 · 메카 4 및 세계별 일상 7장·직업 1장을 등록했다.
- data/img.json — 공식 register-images.py로 안티모니 27장만 추가; 기존 등록·날짜·저장소 위치 보존.
- 생성·참조 해시와 검수 기록은 그림 저장소 records/sb에 보존했다. 이미 생성된 결과는 재생성하지 않았다.

## 2026-11-16 · claude · 게임 코스프레 — 인원 많은 게임일수록 자주(남은 인원의 제곱근 무게)
- 사용자 「케릭터 수 많은 게임일수록 더 많이 선택되게 해줘」 → 표 셋(인원 그대로 · 제곱근 · 많음 3배) 중 「B로해줘」
- 게임 고르기를 「덜 쓴 게임 먼저」 에서 남은 인원의 제곱근 무게 무작위로 — 주인공 하나 게임 √(남은 재단/11), 등장인물 많은 게임 1회차 √(roster − 쓴 캐릭터), 2회차 √(남은 캐릭터 × 재단 / 11). 빈 기록에서 2만 번: LoL 약 19% · WoW 18% · 오버워치 10% · 창세기전 9% · 스타 8% · FF7 7% · 랑그릿사 7% · 스파2 6% · 주인공 하나 각 약 1.5%(세 공방 같다). 다 찬 게임은 그대로 빠진다
- 계획기 검사의 「덜 쓴 게임 먼저 · 고루」 단언을 무게 고르기 단언(빈 기록 4000번 — LoL 이 주인공 하나 게임의 다섯 배 넘게, 주인공 하나도 나온다)과 「다른 게임을 다 채워 남은 게임 하나」 꼴로 바꿨다. 문서 · 주석의 같은 말도

## 2026-11-15 · gpt · 저마늄 선택 4·2·4 및 27컷 생성
- 그림·기록 — 판타지 4·스팀펑크 2·메카 4 원본을 채택하고 세계별 일상 7장과 직업컷 1장(합계 27장)을 생성. WebP 1024×1536, 원본·참조 해시와 실제 자유 설계 및 QA 기록을 보존. 스팀펑크 일상 5는 이미지 수신 없이 차단되어 규칙의 재시도·노출 단계 뒤 새 계획으로 생성. 받은 결과는 임의 재생성하지 않음.
- 작업 방식 — 공용 Git과 별도 sparse worktree를 재사용. Git push 인증 제한으로 연결된 GitHub의 force=false 일반 갱신을 사용해 기존 main 변경을 보존.

## 2026-11-15 · gpt · 폴로늄 27컷 등록
- data/img.json — 선택한 세계컷(판타지 2·스팀펑크 1·메카 2)과 세계마다 일상 7장·직업컷 1장을 등록 도구로 추가. 기존 카드·그림·등록 시각은 유지.

## 2026-11-15 · claude · 게임 코스프레 — 쓴 기록 읽는 저장소에 pkm-atelier-img-5
- tools/casual-plan.cjs COSPLAY_ROOTS 에 ../pkm-atelier-img-5(pkm 이 연 저장소 — pkm 302be16 · 삼국지 4c25544 와 같게). 없으면 건너뛴다

## 2026-11-15 · claude · 일상컷 필수 셋째를 게임 코스프레로 — 상황 노출은 필수에서만 내림
- data/casual-tree.json · data/casual-tree-v2.json — 의상 계열 game_cosplay(재단 열하나 gc_<재단>) · 시대 지금 현실 · 무대·환상에만(나라 안 · 현장은 세 세계 시대와 부딪친다) · 장소 코스프레 행사 · 테마 행사장 · 무대 · 거실 · 침실 · 화보 스튜디오 · 물가 · 새 장소 오락실 · costume_required(얼굴 클로즈업 안 씀)
- data/game-cosplay.json — 게임 코스프레 목록 사본(원본 game-atelier tools/game-cosplay.cjs sync, 여기서 고치지 않는다)
- tools/casual-plan.cjs — 필수 셋째 = 게임 코스프레(pickCosplay — 세 공방 그림 저장소 기록을 합쳐(cosplayUsage) 덜 쓴 게임 · 주인공 하나는 안 입은 재단 · 등장인물 많은 게임 1회차 pick / 2회차 again · 다 찬 게임 빠짐, 1회차 칸엔 2회차 몫 again + <자리>-again-prompt.txt), 물가는 수영복 재단만 · 옷 색 · 데니어 · 상황 · 머리 없음, 상황 노출은 장면 컷 한 장에 반쯤(SITU_RATE), 옛 묶음(상황 노출 필수 시절) 통과 · --check 가 generation.cosplay 를 본다 · --cosplay-usage
- lib/prompt-element.js · lib/prompt-spec.js — 코스프레 Outfit 줄(목록 글 fixed · pick 「…」 · again, 게임 · 캐릭터 이름을 넣는다 — 이름 규칙의 이 갈래만 예외), 짧은 판은 머리 장식 줄 대신 코스튬 줄 · 원소 옷 줄 뺌(긴 꼴 OUTPUT · WARDROBE · DESIGN · CHARACTER 끝, 구조판 장신구 칸), 체형 줄 그대로
- tools/prompt-pack.cjs — 코스프레 목록을 넘기고 1회차 칸의 2회차 몫 지시문(<자리>-again-prompt.txt) · INDEX 안내(1회차 채우는 법 · 2회차로 넘길 때 · 기록 generation.cosplay)
- lib/studio.js · lib/words.js · prompt.html 등 ?v= — 생성기에 「게임」 단계(옷 = 재단 다음, 게임 열아홉 — 등장인물 많은 게임은 「…」 자리 그대로), 코스프레엔 옷 색 · 데니어 · 상황 단계 없음, 표에 없는 장소 · 물가의 수영복 아닌 재단은 트리 밖
- IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md · AGENTS.md · docs/CASUAL_TREE_PORT.md — 필수 셋 바뀜 · 게임 코스프레 절 · 이름 규칙 예외 · GPT 세션 0-2절 · 기록 칸
- tests/casual-plan.cjs · tests/prompt-element.cjs · tests/screen.cjs · tests/prompt-pack-screen.cjs — 필수에 코스프레 · 1회차 pick · 2회차 again · 재단 겹침 없음 · 다 찬 게임 빠짐 · 옛 묶음 통과 · 세 공방 기록 · --check · 지시문 셋 꼴 · 생성기 게임 단계

## 2026-11-15 · gpt · 테크네튬 1·1·1 세계컷과 일상컷 등록
- data/img.json — 선택한 세 세계컷과 세계별 일상컷 7장·직업컷 1장, 총 27장을 등록기로 추가했다. 기존 항목은 보존했다.

## 2026-11-15 · claude · 도감 신규 생성 — 최근 1일 그림을 시간순으로
- 사용자 「원소공방 도감에 최신생성 이미지를 시간순으로 보여지게 해줘. 주기율표에 색상표시랑, 하단에 알칼리금속 항목 위에 신규생성 항목 만들어서 해당 도감의 같은 양식으로 표시해주고 각 근본원소 탭에도 N 같은 글자나 색상 테두리로 표시해줘. 주민들은 표시가 안보일 수 있으니 주민들 표시 방법도」 → 「'가' 로 1일 기준」
- tools/register-images.py — 등록한 때를 한국 시각까지(YYYY-MM-DDTHH:MM+09:00) — 하루 수백 장이라 날짜만으로는 차례가 없다. 옛 날짜만 적힌 것은 그대로(그날 23:59 로 본다). lib/img.js setAdded 가 두 꼴을 받는다
- lib/walk-data.js isFresh · freshOf — 지금부터 24시간 안에 등록된 기본 화풍 그림(누구에게나 같다). lib/walk-table.js — 표 칸 흰 테두리 · 점, 범례 맨 앞 「신규 생성」, 나라 판 알칼리 금속 위 「신규 생성」 묶음(가장 늦게 등록된 나라부터, 타일에 새 그림 수 · 근본 · 가문주 · 주민 수), 갈래 묶음 타일에 N 배지 · 흰 테두리, 나라 카드에 새 그림 카드 이름. 한 나라가 두 묶음에 나와 고른 나라는 (나라, 묶음)으로
- lib/walk-list.js — 주민 · 가문주는 표에 칸이 없어 나라 목록에서: 바로 가기 띠 단추의 점, 카드 머리 N 수, 그림 칸 구석 N. lib/walk.css · lib/words.js. ?v= walk-data 6 · walk-table 8 · walk-list 6 · walk.js 17 · walk.css 16 · img.js 11 · words 29
- 검사: tests/register-images.py(시각 도장) · tests/walk-table.cjs(범례 11 · 시계를 옮겨 신규 생성 묶음 = 새 그림 나라 · 시간순 · 갈래 타일 N · 카드 하나, 나머지 판 검사는 먼 뒤 시계로) 통과 · tests/lib/harness.cjs open 에 now(시계 옮기기). walk-list · walk-card 는 원래 실패하던 자리에서 그대로

## 2026-11-15 · claude · 일상컷 체형 줄 — 삼국지에서 옮김(GPT 설계 그림이면 그림의 몸만)
- 사용자 「그럼 삼국지공방처럼 체형 문구 일상컷에 나오도록 옮겨줘. 세계컷중에 gpt 설계 맡기는 것도, gpt가 본인거 선택받으면 일상컷때 옮길 수 있는지도 확인해줘」 → GPT 설계 주문에 체형 칸은 두지 않는다(「1번은 안돼. 다양성이 떨어져서」) → 「응 그렇게 진행해줘」
- lib/prompt-spec.js CASUAL.bodyKeep · bodyKeepFree · lib/prompt-element.js figureLine — 짧은 꼴(기본 jp_paint_anime)은 끝 빛 줄 앞 Figure:, 긴 꼴은 ANATOMY 다음 FIGURE:. 우리 설계 그림이면 설계표 체형 글, opts.refFree(고른 세계 그림이 GPT 임의 설계)면 체형 글 없이 그림의 몸만, 기록에 refDesign: gpt_free. 구조판(내린 화풍)은 그대로
- tools/casual-plan.cjs refFree — element-atelier-img 의 그 세계 기록 generation.design(GPT 설계로 고른 세계 72). tools/prompt-pack.cjs 안내 — GPT 설계 장을 고른 세계는 일상컷 체형 줄 하나만 바꿔 넘긴다. IMAGE_RULES.md 일상컷 첨부 그림 규칙에 체형 문단
- tests/prompt-short-look.cjs 일상컷 체형 줄(우리 설계 · GPT 설계, 짧은 꼴 · 긴 꼴). tests/prompt-element.cjs 일상컷 낱말 상한 1250 → 1300(og site 1261 — 글은 줄이지 않는다), 원래 실패하던 fe-steel-sword 줄에서 그대로 멈춘다. index.html · prompt.html prompt-spec ?v=38 · prompt-element ?v=34

## 2026-11-14 · claude · 근본 스물넷 더(2) — 나라 일흔하나
- 사용자 「원소공방 근본 원소 추가 작업해줘」 → 후보 스물넷(지금 나라와 물질 짝이 생기는 원소, 세 묶음) → 「응」
- data/element-design.json — nations 끝에 A(ga · ge · v · mo · os · pd · ta · nb) · B(cs · rb · sr · ba · kr · rn · te · sb) · C(ce · eu · gd · th · tc · po · cm · am), 근본만(가문 · 주민 · 그림은 아직). 세 묶음을 따로 설계해 묶음끼리 장소 · 장면 · 직업 · 머리색이 겹치지 않게 견줬다. sil 은 구조판 3절 · 메카 설계 글을 쓴 실루엣 그대로. 가돌리늄 · 테크네튬 메카 eye_size 를 medium 으로 덮음(큰 눈 · 가는 눈 모양 부딪침). 체형 lean_toned 셋 · petite_voluptuous 셋
- data/casual-own.json — 스물넷의 캐릭터만의 컷(90번): 뿌리 연상 + 세계마다 다른 직업 · 장소 · 하는 일 · 자세 · 노출 단계별 의상. 216가지(24 × 세계 셋 × 단계 셋)가 다 짜진다
- lib/prompt-spec.js SIL_TAGS 스물넷 · 머리색 스물넷 · 눈 색 일곱 한국어 이름. tools/port-look-spec.cjs EXTRA · lib/look-spec.js VOCAB_EN 같은 어휘. index.html · prompt.html prompt-spec ?v=37 · look-spec ?v=12
- tests/prompt-sections.cjs 칸 꼴 세계 그림 낱말 상한 900 → 1000(갈륨 스팀펑크 902 — 글은 줄이지 않는다). docs/ELEMENT_CONCEPT.md 「근본 스물넷 더(2)」 절
- 검사: element-design check 오류 0 · look-spec · prompt-sections · prompt-short-look · sil-spread --check · walk-core · walk-orbit · walk-table · walk-world · alchemy 통과. 원래 실패하던 것(깨끗한 사본에서도 같다): prompt-element 일상컷 fe-steel-sword 랜덤 줄 · walk-list 조작 줄 344 · walk-card. casual-plan 검사는 그림 저장소 최근 장면 하나가 200자를 넘어 걸린다(설계와 무관)

## 2026-11-14 · gpt · 제논 27장 도감 등록
- data/img.json — 선택한 세계컷 판타지 4·스팀펑크 3·메카 4와 세계별 일상 7장·직업컷 1장씩 총 27장을 둘째 그림 저장소에 등록. 실제 프롬프트·참고 원본 해시·자유 설계·검수 차이는 그림 저장소 기록에 보존.

## 2026-11-14 · gpt · 브로민 선택과 일상·직업컷 완료
- 브로민 근본원소: 판타지 1 · 스팀펑크 2 · 메카 2 선택 원본을 보존해 세계컷 3장과 일상 21장 · 직업컷 3장을 등록했다.
- 그림은 element-atelier-img-2, 생성 지시문 · 참조 해시 · 자유 설계 · 개별 QA · 계획은 element-atelier-img records/br에 기록했다. 도감의 세계별 일상 1~7번과 직업 90번, 총 27장 및 썸네일 생성을 확인했다. 계획과 다른 구도는 QA에 남기고 재생성하지 않았다.

## 2026-11-14 · gpt · 네온 기존 결과 복구 및 직업컷 완료
- 네온 선택 4·1·1의 기존 세계컷 3장·일상컷 21장을 보존하여 새 이미지 저장소에 복구하고 세계별 직업컷(casual90) 3장을 추가했다. 세계·번호 시트는 원본 크기를 유지한다.
- 과거 21장 묶음의 최신 계획 검사 경고(필수갈래·장면/소품 중복)는 records/ne/recovery-completed-20261114.json에 남겼다. 이미지 재생성 없이 기존 검수 기록을 보존했다.

## 2026-11-14 · gpt · 아이오딘 세계 선택과 일상·직업컷 등록
- data/img.json — 선택 1,2,2의 세계컷 3장과 세계별 일상컷 7장·직업컷 1장씩 총 27장을 등록 도구로 반영.

## 2026-11-14 · gpt · 셀레늄 세계컷 선택 및 일상·직업컷 완료
- 판타지 2 · 스팀펑크 2 · 메카 1을 선택 원본 그대로 등록하고, 각 세계 일상 7장 + 직업컷 90번 1장씩 총 27장을 등록했다.
- 생성 지시문·참조 해시·자유 설계·차단 1회 후 동일 지시문 재시도·검수 차이를 records/se에 보존했다. 이미지 main e6f2427, 기록 main 632e025, 자동 도감 등록 3e57c4f.
- 공용 Git 데이터와 셀레늄 전용 sparse worktree를 재사용했다. 셸 push 인증 제한으로 연결된 GitHub에서 force=false로 기존 main 뒤에 반영했다.

## 2026-11-14 · gpt · 비소 선택 세계컷과 일상·직업컷 등록
- data/img.json — 사용자 선택 판타지 4 · 스팀펑크 3 · 메카 1의 세계컷 3장과 세계별 일상 7장 · 캐릭터만의 컷 90번 1장, 총 27장을 그림 등록 워크플로로 반영했다. 새 이미지는 element-atelier-img-2, 생성·검수 기록은 element-atelier-img의 records/as에 보존했다.
- docs/PATCH.md — 세 세계 일상컷 계획 검사·원본 1024×1536·원격 Git blob 27개 일치와 썸네일·그림 등록 성공을 확인했다. 생성된 이미지는 재생성하지 않았으며, 의상 무늬·자세·배경 글자·머리 길이 차이는 검수 기록에 표시했다. 스팀펑크 90번은 결과 없는 첫 차단 뒤 같은 지시문의 두 번째 시도로 생성했다.

## 2026-11-13 · gpt · 니켈 선택 세계컷과 일상·전용컷 등록
- data/img.json — 사용자 선택 판타지 1 · 스팀펑크 1 · 메카 4의 세계컷 3장과 세계별 일상 7장 · 캐릭터만의 컷 90번 1장, 총 27장을 그림 등록 워크플로로 반영했다. 새 이미지는 element-atelier-img-2, 생성·검수 기록은 element-atelier-img의 records/ni에 보존했다.
- docs/PATCH.md — 세 세계 일상컷 묶음 검사와 원본 1024×1536, 업로드한 WebP 27개의 Git blob 일치를 확인했다. 선택·생성 이미지를 재생성하지 않았으며, 계획과 다른 프레이밍·시선은 검수 기록에 표시했다.

## 2026-11-13 · gpt · 타이타늄 선택 세계컷과 일상컷 등록
- data/img.json — 사용자 선택 판타지 3 · 스팀펑크 1 · 메카 4의 세계컷 3장과 세계별 일상 7장 · 캐릭터만의 컷 90번 1장, 총 27장을 그림 등록 워크플로로 반영했다. 새 이미지는 element-atelier-img-2, 생성·검수 기록은 element-atelier-img의 records/ti에 보존했다.
- docs/PATCH.md — 세 세계 묶음 검사와 썸네일·그림 등록 워크플로 성공을 확인했다. 생성된 이미지는 재생성하지 않았고, 최초 판타지 일상 1번 요청은 결과 없는 차단 뒤 동일 지시문 재시도로 생성했다.

## 2026-11-13 · claude · 계획기 — 세계끼리 같은 구도인 캐릭터만의 컷은 짓지 않는다
- tools/casual-plan.cjs — 90번을 짓기 전에 같은 카드의 다른 세계와 자세 추천이 같으면 「90 ✗ … 세계와 같은 구도」 를 찍고 건너뛴다(사용자 「세 세계가 같은 구도인 직업컷은 세계마다 다른 자세로」 — 표가 다시 쏠려도 그리기 전에 걸리게). 이미 그려진 컷은 그대로 건너뜀

## 2026-11-13 · claude · 캐릭터만의 컷 — 옆모습 조금 되돌리기
- data/casual-own.json — 사용자 「옆모습 비율 조금만 올려줘. 너무 줄였어」: 가문 · 주민 13줄을 옆모습 일하는 자세로 옮기고 하는 일 문장을 다시 썼다(그림이 있는 줄은 빼고). 옆모습 18% → 22%(처음 26%). 336 장면 모두 계획기 통과

## 2026-11-13 · claude · 캐릭터만의 컷 — 몰린 서 있는 자세를 일하는 자세로 고르게
- data/casual-own.json — 사용자 「응 골고루 펴줘」: 가문 · 주민의 다른 자세 줄 가운데 소품 얼굴 가까이 · 두 손 모으기 · 엄지 척으로 몰린 22줄을 일하는 자세(두 손으로 쓰기 · 한쪽 무릎 · 쪼그려 앉기 · 앉기 · 나르기 등)로 옮기고 하는 일 문장을 다시 썼다(그림이 있는 줄은 빼고). 옆모습 18% 그대로, 336 장면 모두 계획기 통과

## 2026-11-13 · claude · 캐릭터만의 컷 — 가문 · 주민도 세계마다 다른 자세
- data/casual-own.json — 사용자 「세 세계가 같은 구도인 직업컷은 세계마다 다른 자세로 바꿔줘」: 가문 · 주민 74장의 둘째 · 셋째 세계 줄에 다른 자세 추천 · 받침 · 하는 일 문장을 넣었다(첫 세계 줄과 직업 · 장소 · 옷은 그대로). 새 자세는 정면 계열에서만 골라 옆모습이 336 장면의 26% → 18%. 이 줄들은 아직 그림이 없다. 336 장면 모두 계획기 ownCut 통과

## 2026-11-13 · gpt · 금·수은·납·오가네손·우라늄 캐릭터만의 컷
- 세계 이미지가 등록된 근본원소 5종에 세계별 직업 일상컷 90번을 1장씩, 총 15장 추가했다. 세계별 jp_paint_anime 원본을 참조하고 기존 직업 설계·높음 단계 프롬프트를 그대로 사용했다.
- 새 WebP는 element-atelier-img-2, 생성·원본 해시·참조 해시·검수 기록은 element-atelier-img에 캐릭터별 커밋했다. 모든 그림은 1024×1536, 각 1회 생성이며 재생성·기존 그림 삭제·강제 갱신은 하지 않았다.
- 일반 git push 인증 실패로 연결된 GitHub의 일반 fast-forward 갱신(force=false)을 사용했다. 도감과 썸네일은 기존 자동 등록 절차로 반영한다.
- 금 메카 배경 숫자, 납 문서·활자의 유사 글자 획은 검수 기록에 남겼다.

## 2026-11-13 · gpt · 칼슘 필수 직업 일상컷
- 등록 도구로 세 세계 casual90을 도감에 추가했다. 기존 그림을 보존하고 생성 지시문과 QA를 기록했다.

## 2026-11-13 · gpt · 인 필수 직업 일상컷
- 등록 도구로 세 세계 casual90을 도감에 추가했다. 기존 그림을 보존하고 생성 지시문과 QA를 기록했다.

## 2026-11-13 · gpt · 칼륨 필수 직업 일상컷
- 등록 도구로 세 세계 casual90을 도감에 추가했다. 기존 그림을 보존하고 생성 지시문과 QA를 기록했다.

## 2026-11-13 · gpt · 염소 필수 직업 일상컷
- 등록 도구로 세 세계 casual90을 도감에 추가했다. 기존 그림을 보존하고 생성 지시문과 QA를 기록했다.

## 2026-11-13 · gpt · 황 필수 직업 일상컷
- 등록 도구로 세 세계 casual90을 도감에 추가했다. 기존 그림을 보존하고 생성 지시문과 QA를 기록했다.

## 2026-11-13 · gpt · 규소 필수 직업 일상컷
- 등록 도구로 규소의 세 세계 casual90을 data/img.json에 추가했다. 기존 그림과 기록은 보존했다.


## 2026-11-13 · claude · 설계 규칙 — 새 나라 · 가문 · 주민은 캐릭터만의 컷 직업도 같이
- AGENTS.md — 사용자 「공방문서에 써놓긴해야겠다. 새로운 근본원소나 물질등을 설계할 때, 일상컷의 직업갈래도 같이 설계를 해야된다고」: 1-1-1 절을 더했다(근본은 세계마다 다른 직업, 가문 · 주민은 쓰이는 곳의 일 하나, 표에 적고 계획기로 확인). 1절의 「같이 적는다」 줄에도 이었다

## 2026-11-13 · gpt · 근본원소 네 나라의 캐릭터만의 일상컷 추가
- 수소(h) · 헬륨(he) · 리튬(li) · 붕소(b) — 판타지 · 스팀펑크 · 메카마다 캐릭터만의 컷(일상 90번) 한 장씩, 12장을 추가했다. 새 그림은 element-atelier-img-2, 지시문 · 기준 그림 해시 · 시도 수 · 검수 기록은 element-atelier-img에 원소별 후속 커밋으로 보존했다.
- 표의 bold 의상과 생성기가 만든 지시문을 그대로 사용하고 세계마다 등록된 기준 그림 한 장을 첨부했다. 12장 모두 첫 생성 결과를 보존했으며 재생성하지 않았다. 원본 의상의 무늬 · 색 영향과 수소 관제실 숫자 등 어긋난 점은 qa에 남겼다.
- 베릴륨(be)은 도감과 두 그림 저장소에 기준 세계 그림이 없어 일상 90번 세 장을 보류했다. 기준 그림 없이 새 얼굴로 일상컷을 만들지 않았다.
- 검증: 12/12 WebP 1024×1536, 원격 blob 해시 일치, 생성기 프롬프트와 저장 기록 일치. 일반 일상컷 묶음 검사기는 own90을 제외하므로 이번 추가분은 별도로 확인했다. 도감은 자동 등록하며 data/img.json을 손으로 고치지 않았다.

## 2026-11-13 · claude · 캐릭터만의 컷 — 셀레늄 메카는 문워크 무대 댄서
- data/casual-own.json — 사용자 「문워크도 넣고 올려줘」: 셀레늄(se) 메카를 태양광 패널 설치 기사 → 문워크 무대 댄서(달의 이름 → 달 위를 걷는 춤)로. 지시문에는 실제 이름을 쓰지 않는다

## 2026-11-13 · claude · 캐릭터만의 컷 — 산소 메카는 「에어」 농구 선수
- data/casual-own.json — 사용자 「또다른 goat MJ님도」 → 「air면 … 사람들 생각은 보통 산소니까 산소로 할까?」: 산소(o) 메카를 호흡 · 요가 강사 → 농구 선수(공중에 떠 있는 사람 — 농구공을 옆에 들고 걸어 나오는 전신)로. 수소 · 헬륨은 그림 작업 중이라 건드리지 않았다. 지시문에는 실제 이름 · 등번호를 쓰지 않는다

## 2026-11-13 · claude · 캐릭터만의 컷 — 염소 판타지는 환영 마술사, 스팀펑크는 덤불에 숨은 사냥꾼 · 코발트 판타지는 장난 물건 가게
- data/casual-own.json — 사용자 「코발트를 바꾸고 염소를 환영마술사로 하자 … hide on bush는 스팀펑크 식 총을 든 사냥꾼으로」: 염소(cl) 판타지 흉내쟁이 광대 → 환영 마술사, 스팀펑크 야생 사진가 → 덤불에 숨은 사냥꾼(긴 황동 사냥총). 요술쟁이가 겹치던 코발트(co) 판타지는 장난 물건 가게 주인으로

## 2026-11-13 · claude · 캐릭터만의 컷 — 염소는 goat → GOAT · faker, 금 메카는 육상 금메달리스트
- data/casual-own.json — 사용자 「염소 -> goat -> faker 페이커라는 단어에 어울리는 직업」 · 「스팀펑크는 그럼 hide on bush 같은 느낌으로」: 염소(cl) 세 세계를 흉내쟁이 광대 · 덤불 은신처의 야생 사진가 · 프로게이머(역대 최고)로 바꿨다(전엔 우물 정화 사제 · 수영 교사 · 인명구조원). 프로게이머가 겹쳐 금(au) 메카는 육상 금메달리스트로. 지시문에는 실제 이름을 쓰지 않는다

## 2026-11-13 · claude · 캐릭터만의 컷 — 가문 24 · 주민 56 은 「쓰이는 곳」 하나씩
- data/casual-own.json — 사용자 「근본 원소만 이렇게 가고 나머지는 좀 쉽게 가자」 → 「가문이랑 주민은 설명에 이 물건이나 물질이 쓰이는 곳으로 하자」: 가문 · 주민 80장은 그 물건 · 물질이 쓰이는 곳의 일 하나(mode same_job — 사는 세계마다 같은 줄, 세계 맛은 지시문의 세계 줄이 낸다). 검 → 검술 사범, 산소통 → 산소 용접공, 금반지 → 웨딩 플래너 식. 운전석 받침이 없는 스팀펑크의 버스 운전사 · 유조차 운전사만 앉은 자세로. 336 장면 모두 계획기 ownCut 통과

## 2026-11-13 · claude · 캐릭터만의 컷 — 근본 47명 내용 채움
- data/casual-own.json — 사용자 「원소 표 먼저」 → 「이대로 채워줘」: 근본 47명마다 뿌리 연상 한 줄 + 세계마다 다른 직업(장소 · 하는 일 · 자세 추천 · 도구 · 노출 단계별 의상 글 셋). 사용자가 짚은 줄 — 베릴륨 「도사」(산중 도사 · 체스 살롱 고수 · e스포츠 전략 코치), 오가네손 「손이 오가는 일」(야바위꾼 · 카드 딜러 · 네일 아티스트), 플루토늄 스팀펑크는 장의사 대신 지하 증기철도 차장. 수은 · 크로뮴은 예시 표시(example)만 뗐다. 141 장면 모두 계획기 ownCut 통과

## 2026-11-13 · claude · 캐릭터만의 컷 — 세계마다 한 장 더(번호 90), 노출 단계별 의상 · 틀과 예시
- data/casual-own.json — 새 표: 캐릭터마다 뿌리 연상 + 세계마다 그 연상에서 나온 직업(장소 · 하는 일 · 자세 추천 · 도구 · 노출 단계별 의상 글). 예시 둘(수은 · 크로뮴 — example). 사용자 「직업쪽은 항상 필수로 한장」 · 「세계마다 한장으로 … 단계는 처음엔 높음으로」
- tools/casual-plan.cjs — 일상 묶음 뒤에 그 세계의 캐릭터만의 컷 한 장(ownCut · ownStep, 번호 90 — 묶음 장수 · 규칙에 안 센다, 일상이 다 찬 카드도 짠다, 내용 없으면 건너뜀). --own-level 로 단계를 내려 다시
- lib/prompt-element.js — 그 컷의 장소 글(placeText) · 직업 도구(ownProp)를 Place · PROP 줄에
- lib/casual-tree-v2.js — 캐릭터만의 컷은 직업 도구를 「그 물건」 자리로 든다(signatureHold)
- lib/prompt-spec.js — 상황 둘(소매를 걷고 단추 하나를 풂 · 넥타이 · 스카프를 풀어 내림)
- IMAGE_RULES.md — 장수 룰(일상 7 + 캐릭터만의 컷 1) · 번호 90 · 단계 내리기(높음에서, 단계마다 세 번)
- docs/casual-review-2026-11-13.md — 11절

## 2026-11-13 · claude · 일상컷 — 안 어울리는 의상 · 자세 막기, 하는 일 갈래(이동 · 야영 · 식사 · 훈련)의 세계별 판
- data/casual-tree-v2.json — 장소마다 종류 하나(사적 실내 · 공공 실내 · 작업 현장 · 물가 · 자연 · 거리 · 무대 · 탈것)와 누울 면(soft). 의상 조건 outfit_rules(수영복 · 란제리풍 · 목욕 차림 · 홈웨어 · 저녁 드레스 · 웨딩 …이 못 서는 종류), 눕기 · 엎드리기 · 바닥에 앉기는 누울 면이 있는 곳만. 사용자 「갱도에서 수영복을 입고 누워있는 다거나 그런거」. 새 장소 열(운전석 · 세차장 · 지하철 승강장 · 객차 · 포장마차 · 마구 창고 · 조종석 · 격납고 · 비행선 갑판 · 태엽 · 기계 의수 공방 · 증기 객차 · 증기 선술집 · 네온 사인 공방), 손 넷(운전대 · 손잡이 · 핸들 · 불 쬐기) · 자세 하나(안장에 앉기) · 소품 넷(밥그릇 · 세차 스펀지 · 목검 · 안장 닦는 천), 추천 넷(운전대 잡고 앉기 · 손잡이 잡고 서기 · 안장에 앉아 먼 곳 보기 · 불가에 앉아 손 쬐기), 모든 추천에 하는 일 갈래 act · 표 acts · 현장 ↔ 땅(lands_of · place_lands — 사용자 「현장 장소 땅에 묶는 것도 같이 넣어줘」). 목록과 막은 규칙은 원소 저장소 docs/casual-review-2026-11-13.md 10절
- lib/casual-tree-v2.js — 의상 계열이 설 수 있는 장소 종류(why ofam) · 그 세계에만 있는 자리(worlds_only) · 그 땅의 현장(place_lands)
- lib/prompt-element.js — 트리에 카드의 땅 · 세계를 알려 준다(casualCard)
- tools/casual-plan.cjs — 카드의 땅 · 세계로 장소를 고른다 · 하는 일 갈래는 묶음에 두 장까지
- tests/casual-tree-v2.cjs · tests/casual-plan.cjs — 「어색한 조합은 표시만」 은 아직 막히지 않은 조합으로, 추천×장소는 그 장소에 설 수 있는 계열로, 「새 계열」 은 넷 가운데 둘 넘게
- docs/casual-review-2026-11-13.md — 10절: 막은 규칙 · 현장 ↔ 땅 표 · 더한 씬 · 묶음 전 · 후 · 다음 후보(일상 갈래 × 세계)
- prompt.html · index.html — casual-tree-v2.js ?v=6 · prompt-element.js ?v=32

## 2026-11-13 · claude · 일상컷 장소 · 의상 · 상황 노출 늘리기, 자유 설계 칸의 팔 · 굳은 장면 줄
- data/casual-tree-v2.json — 새 장소 스물하나(지금 현실 여섯 · 쓰임의 현장 아홉 · 나라 안 여섯) — 현장 10곳 · 나라 안 16곳에 묶음의 40%가 몰렸다. 새 소품이 나오는 곳에 더함. 어색한 조합 세 줄(휴양지 차림 · 작업복 · 새 작업 자리의 수영복 · 목욕 차림 · 란제리풍). 목록은 원소 저장소 docs/casual-review-2026-11-13.md 9절
- data/casual-tree.json — 의상 계열 둘(휴양지 차림 · 작업복·현장 차림, 여덟 벌씩). 사용자 「구도나 저런 날씨 지시말고, 장소나 의상 추가 등을 더 해 줄수는 없어?」
- lib/prompt-spec.js — 상황 노출 넷 → 아홉(밑단을 묶어 올림 · 겉옷을 허리에 묶음 · 더위에 밴 땀 · 역광에 비친 실루엣 · 움직임에 벌어진 트임 — 사용자 「그게 종류가 적은걸로 알아」), 바람은 실내가 아닌 곳만. 자유 설계 머리글에 팔 · 물속 발 줄과 「작업대 · 수리 · 장비실 말고」 줄(사용자 「응 5번도 해줘」)
- lib/casual-tree-v2.js — 상황의 조건(situOk: 장소 특징 · 묶음 · 자세 · 프레이밍)
- tools/casual-plan.cjs — 상황은 표의 조건을 본다(situOk) · 젖은 옷은 다른 후보가 있으면 열에 넷만 · 역광 실루엣이면 빛을 역광으로 · 어색한 조합인 의상 계열은 무게 0.15
- tests/casual-plan.cjs — 상황 「넷」 을 「넷 넘게」 로
- docs/IMAGE_AUTOMATION.md — 검수 기록에 몸 이상 칸 qa.anatomy(ok 또는 arm · hand · foot · leg). 이미 쓴 기록은 그대로
- docs/casual-review-2026-11-13.md — 9절: 더한 장소 · 의상 · 상황 목록과 조건, 다섯째(18번)
- prompt.html · index.html — casual-tree-v2.js ?v=5 · prompt-spec.js ?v=35

## 2026-11-13 · claude · 일상컷 검토 6절 1 ~ 17 — 실내 비 · 까닭 없는 까치발 · 팔이 헷갈리는 글 · 빛 · 「하는 일」 추천
- docs/casual-review-2026-11-13.md — 세 공방 일상컷 지시문 체계 검토(기록 5,058장 · 자유 설계 433장 · 검수 기록)와 8절 「고친 것 · 정한 것」. 사용자 「4번까지하고 gpt도 다 비슷한 장면을 쓴다면 그거를 우리쪽 일상틀에 넣어줘」
- data/casual-tree-v2.json — 일상컷 검토(docs/casual-review-2026-11-13.md) 6절 1 ~ 17. 장소 특징 여덟(실내 · 창 · 하늘 · 밤 고정 · 시간이 글에 정해진 곳 · 높은 선반 · 스툴 · 계단 · 문간)을 받침 낱말에 더해 장소마다 붙였다. 시선 「창밖」 은 창, 「위」 는 하늘이 있는 곳만. 까치발은 높은 선반이 있는 곳만(추천 「까치발로 손 흔들기」 는 까치발을 뗐다 — 열쇠 tiptoe_wave 그대로). 작업대 숙이기에 짝다리 · 까치발 · 벽에 한 발 뺌. 옆으로 눕기는 왼쪽으로 눕고 깔린 왼팔은 머리 받치기만(새 손 head_rest · floor_front, 추천 lie_side_full 손 바꿈). 난간 기대 서기 글에서 「leaning lightly on it」 뺌. 앉아 앞으로 기울이기 · 헤엄은 받는 손만. 엎드리기에서 팔을 드는 한 손 동작 뺌. 벽에 기대 서기에서 벽 짚기 뺌. 우산 펴 들기는 하늘이 보이는 곳만. 새 자세 넷(한쪽 무릎 꿇기 · 옆으로 걸터앉기 · 한 발 올려 서기 · 위로 손 뻗기), 새 손 넷, 새 소품 다섯(손 공구 · 닦는 천 · 손 빗자루 · 갓 빤 천 · 수납 상자)과 동작 열, 그 물건을 옆에 내려 드는 동작(sig_low), 새 장소 여섯(수리 가게 작업대 · 정비 창고 · 수영 클럽 장비실 · 옥상 빨래 건조대 · 개관 전 전시실 체험대 · 계단참), 새 추천 여덟(GPT 자유 설계에 되풀이된 「하는 일」 — 손보기 · 한쪽 무릎 꿇고 쓰기 · 선반에 손 뻗기 · 널기 · 신발끈 매기 · 한 발 올리고 먼 곳 · 빛에 대 보기 · 벽에 기대 앉아 쓰기). 카메라용 몸짓 추천 여덟에 pose 표시. 카메라 높이 둘(낮은 눈높이 · 바로 위), 새 표 light · spot · depth · view · ambience. 소금 집기는 두 손 동작으로(항아리 든 손이 숨어 있었다)
- lib/casual-tree-v2.js — 시선이 장소 특징을 본다 · 뒤쪽 몸 방향의 소품은 옆에 내려 드는 동작만(등 뒤에서 안 보이는 「가슴 높이」 가 팔을 하나 더 불렀다) · 자세가 받는 손(posture.hands) · 한쪽만 되는 손(hand.sides) · 받침의 손별 목록(hands_left) · 카메라의 자세 계열 · 뒷모습의 「화면 쪽」 말은 등이 다 돌아선 몸에만 · 옆모습의 가까운 팔(sideLook) · 덧붙는 표(aux) · 조립기 글 묶음(extras) · 계획기의 빛 고르기(ambience). game · book · myth 의 같은 파일과 이제 다르다(그쪽은 안 고쳤다 — docs/CASUAL_TREE_PORT.md)
- tools/casual-tree-v2.py — 모듈과 같은 규칙(뒤쪽 몸의 소품 자리 · 시선의 장소 특징 · 자세가 받는 손 · 손 쪽 · 받침의 손별 목록 · 카메라 계열)과 새 표의 참조 검사
- lib/prompt-spec.js — 상황 「젖은 옷」 에 실내 글(enIn — 비 없이 물 튐). 젖은 옷 125장 중 44장이 실내(갱도 · 제어실 · 박물관 · 찜질방)에서 「갑작스러운 소나기」 였다
- lib/prompt-element.js — 장면 줄에 빛의 방향(Light direction) · COMPOSITION 에 화면 안 자리 · 배경 깊이 · 전경 · 옆모습이면 몸이 보는 쪽과 손 줄의 가까운 팔 · 먼 팔. 구조판은 빛의 방향을 빛 칸에. 장면 칸 목록에 light · spot · depth · view
- tools/casual-plan.cjs — 묶음마다 시간대 · 날씨 · 머리 매무새 · 빛의 방향 · 화면 자리 · 깊이 · 전경 · 카메라 높이를 고른다(ambient — 전엔 한 번도 안 채웠다). 바람 상황은 실내가 아닌 곳만. 카메라용 몸짓 추천 무게 0.4
- tests/casual-tree-v2.cjs · tests/casual-tree-v2.py — 옛 동작을 고정하던 두 줄: 예전 기록 방향 변환의 시선 「위」 는 하늘이 보이는 공원에서 보고, 그 물건 동작은 셋 → 넷(옆에 내려 들기)
- tests/casual-plan.cjs — 상황 줄은 실내면 enIn 글 · 데니어 표본 수 문턱 15 → 5(고르는 무게가 바뀌어 표본 묶음이 달라졌다)
- docs/CASUAL_TREE_PORT.md · IMAGE_RULES.md — 모듈이 game 과 달라진 것 · 계획기가 빛 칸을 채우는 것을 적음
- prompt.html · index.html — casual-tree-v2.js ?v=4 · prompt-spec.js ?v=34 · prompt-element.js ?v=31

## 2026-11-13 · claude · 땅(테마) 여섯 — 풍경 배경 · 고르개 · 풍경만 보기
- 사용자 「원소 테마 작업 시작해줘」 → 「여섯 개로 가자」 · 「이대로 가자」 — 원소가 자연에서 있는 곳 여섯(금속의 대지 · 숨결의 들판 · 소금의 바다 · 결정의 골짜기 · 빛의 하늘 · 깊은 땅의 불빛), 갈래 열이 하나씩 묶인다. 보는 원소를 따라 바뀌지 않고 사용자가 고른다
- element-atelier-img-2/themes/ — 땅 x 세계 풍경 열여덟 장(1024×1536 webp, 과슈)과 thumb/ 작은 그림. 지시문 · 원본은 C:\Users\jjshs\element-theme-art
- lib/walk-core.js — LANDS · landOf(갈래) · getLand/setLand(element_land_v1, element-land) · sceneURL
- lib/walk.js — 고른 땅 x 지금 세계의 그림을 다 받은 뒤 --w-scene 에(땅을 바꾸면 View Transition 으로 겹쳐 넘어감, 움직임 끄기면 바로) · 풍경만 보기(역사 한 칸, 누르기 · 뒤로 · Esc)
- lib/walk.css — .w-scenery 가 화면 전체 배경 + 어둠 한 겹(목록 · 가문 · 한 장은 더 짙게) · 땅마다 강조색 · 위 막대 반투명(blur 는 안 쓴다 — 막대 안 도구 상자의 fixed 가 막대에 갇힌다)
- lib/toolbox.js · toolbox.css — 공방 안에서는 「공간」 고르개 대신 땅 그림 단추 여섯 + 풍경만 보기. 도구 화면은 그대로
- lib/words.js — tool.land · tool.scenery · land.*
- tests/walk-theme.cjs — 새 검사
- *.html — ?v= walk-core 6 · toolbox.js 4 · toolbox.css 2 · words 28 · walk.css 14 · walk 16

## 2026-11-13 · claude · 주기율표 아래 나라 판(큰 타일 · 그림 장수)
- 사용자 「주기율표 모바일에서는 화면이 좀 작긴하네. 터치가 좀 어렵고, 이미지 등록현황도 보기가 좀 어려워」 → 「장수까지」 · 「장수 세는 거 기준은 현재의 기본 화풍 기준으로 해줘」
- lib/walk-table.js — 표는 지도로 두고 아래에 나라 판: 갈래마다 타일(기호 · 이름 · 세계 그림 채운/채울 · 일상컷 · 세계 셋 막대), 거르개(전부 · 그림 있음 · 그림 없음), 나라 카드는 고른 타일 줄 아래에 세계별 장수와 함께. 표를 누르면 가까운 나라가 골라지고 판의 그 자리로. 그림 없는 나라 칸은 테두리만(.bare)
- lib/walk-data.js — tally(doc, n): 카드마다 사는 세계 한 곳이 한 자리, 기본 화풍(style.json default)만 센다. 일상컷은 등록된 장수만
- lib/walk.css — 나라 판 · 타일 · 장수 칸. 덮개에서 한 줄 셋, 판 아래 여백(도구 단추에 안 가리게)
- lib/words.js — walk.board · walk.f.* · walk.group · walk.t.* · walk.table.note 고침
- tests/walk-table.cjs — 타일 수 · 크기 · 철 장수 · 거르개 · 타일 → 카드 · 표 → 판
- index.html 외 — ?v= walk 15 · walk.css 13 · words 27 · walk-data 5 · walk-table 7

## 2026-11-13 · gpt · 플루오린 3·3·3 확정과 일상컷 등록
- element-atelier-img-2/img/f_* — 선택한 판타지·스팀펑크·메카 GPT 설계 3번과 세계별 일상컷 7장, 총 24장 추가; 기존 생성 이미지 보존
- element-atelier-img/records/f/ — 실제 생성 프롬프트·원본 SHA256·자유 설계·동일 지시문 재시도·검수 기록; 자세/배경 차이와 메카 일상컷 3번 추가 팔, 7번 수중 발 윤곽 이상을 통과로 처리하지 않고 기록
- data/img.json — 그림 등록 워크플로가 24장과 둘째 그림 저장소 위치를 자동 반영한 것을 확인; 손으로 수정하지 않음

## 2026-11-13 · claude · 근본 스물넷 더(나라 마흔일곱) · 합성 원소 패 판
- 사용자 「원소공방에 근본 원소 추가해줘」 → 「많을수록 좋긴한데」 · 「이번에 체형 2가지 추가 한것도 같이 설계 들어가는거지?」 — 세 묶음(nations-A · B · C 브랜치)을 main 에 합쳤다
- data/element-design.json — nations 끝에 A(al · mg · ti · ni · pt · w · cr · co) · B(f · i · br · ar · xe · b · as · se) · C(k · mn · bi · ra · pu · ir · nd · be), 근본만(가문 · 주민 · 그림은 아직). 체형에 lean_toned 셋 · petite_voluptuous 셋
- data/element-design.json — 겹침 고침: 이리듐 스팀펑크(백금과 같은 1889 원기 금고 · 저울실)를 1803 런던 테넌트 실험실로 — 세계 글 · 장면 셋 · 구조판 3 · 4절. 플루토늄 판타지 장면 이름을 오가네손과 다르게
- lib/prompt-spec.js — SIL_TAGS 스물넷 · 머리색 스물넷 · 눈 색 열하나 한국어 이름. tools/port-look-spec.cjs EXTRA · lib/look-spec.js VOCAB_EN 같은 어휘(생성 결과와 같은 줄만 손으로 — core:v6 블록 그대로)
- tools/sil-spread.py — 마흔일곱 위에서 다시 돌림: 빈 칸 없음 · 바뀐 것 없음(구조판 3절 · 메카 설계가 실루엣에 맞춰 적혀 있어 처음부터 다시 나누지 않았다)
- alchemy.html — 원소 패를 캔버스의 다섯 줄 고정 칸에서 HTML 단추 판(#tray)으로: 단추 줄 아래 자리에 겹쳐 접어 싸고 위아래로 굴린다, 패 한 칸 44px 이상, 결과 · 수집첩이 열리면 숨김. 규칙은 그대로(나라 서른 넘으면 패가 캔버스 밖으로 넘쳤다)
- tests/alchemy.cjs — 폴드 겉화면 344×882 더함 · 패 판(나라 수 · 굴려서 다 닿음 · 44px · 옆으로 안 넘침 · 덮개에 숨음). tests/walk-core.cjs 철 이웃을 원자 번호 차례에서 · walk-orbit 철 다음 코발트 · walk-table 흐린 칸 루테늄
- docs/ELEMENT_CONCEPT.md — 「근본 스물넷 더」 절. index.html · prompt.html — ?v= prompt-spec 33 · look-spec 11

## 2026-11-13 · claude · core v6 · 체형 두 열쇠(슬림 근육형 · 아담한 풍만형)
- lib/look-spec.js VOCAB_EN.body · tools/port-look-spec.cjs EXTRA.body — lean_toned · petite_voluptuous(삼국지에서 만든 글, core v6). 사용자 「공통으로 다 넣어주면 돼」 · 「원소 … 추가되는 케릭터 있을 때 넣어주면 돼」 — 설계표 체형은 그대로
- lib/prompt-spec.js STRUCT.body — 두 체형의 여덟 칸(체형 표가 어휘 열쇠와 같아야 한다 · 「근육 결 · 탄탄」 말 없이)
- lib/prompt-spec.js · lib/look-spec.js — core:v6 블록. 자동으로 체형을 고르는 도구는 없다(설계표는 손으로) — 고를 수 있는 어휘에만 더했다
- index.html · prompt.html — ?v= 올림

## 2026-11-13 · gpt · 선택 시트 기본 화질을 원본 컷 해상도로
- docs/IMAGE_AUTOMATION.md — 사용자 「시트 기본 화질 좀 올려줘」: 각 컷 1024×1536을 축소 없이 배치하고 PNG 무손실 시트를 제공하도록 기본 규칙 명시

## 2026-11-13 · claude · 새 그림은 둘째 그림 저장소(element-atelier-img-2)로
- 사용자 「이미지 저장소 많이 차서 img-2로 저장경로 옮겨줘. repo랑 토큰은 다 설정해놨어」 — 첫 저장소가 Pages 한도(1 GB)에 가깝다
- element-atelier-img-2(그림 저장소) — 썸네일 워크플로 · README · img/ 자리를 넣어 열었다(첫 저장소 것을 옮김)
- lib/img.js — BASES 에 1 번(element-atelier-img-2). img.js?v=10
- tools/register-images.py — SHARDS · EXTRA_DIRS 에 둘째(img-2). 새 이름은 열린 저장소(둘째)만 받고, 첫 저장소는 교체만
- .github/workflows/register-images.yml · .gitignore — 둘째 저장소를 img-repo-2 로 받아 img-2 로 잇는다(못 받아도 등록은 돈다)
- IMAGE_RULES.md(3 · 4절 — 저장소 표) · AGENTS.md · docs/IMAGE_AUTOMATION.md — 새 그림은 둘째에, 기록 · 잠금 · 배경 · 화풍 비교는 첫 저장소 그대로

## 2026-11-12 · claude · 한 장은 고른 세계 안에서만 넘긴다 · 안 사는 세계 탭은 끈다
- 사용자 「상단 탭은 판타지인데 그 다음 이미지가 스팀펑크 세계컷이 나오는것보다 그 세계의 일상컷이 나오게」 · 「산소 녹가문에 화성처럼 스팀펑크가 없잖아. 그럼 그 없는 세계 탭을 비활성화」
- lib/walk-card.js — 넘기는 차례가 지금 그림의 세계 안에서만: 그 세계의 세계 그림 → 그 세계의 일상컷(세계 없는 일상컷은 끝에). 몇 번째(1 / n)도 그 세계 것만 센다. 세계 탭을 누르면 그 세계의 세계 그림(없으면 첫 일상컷)으로. 한 장의 세계는 그림의 세계 — 목록의 「전부」 에서 열어도 목록의 세계 거르기는 그대로. 사는 세계인데 그림이 없으면 전처럼 글 판만 그 세계로
- lib/walk.js — 한 장 층에서 그 카드가 안 사는 세계의 탭은 disabled(흐리게 · 줄 긋기), 눌린 탭은 지금 그림의 세계
- lib/walk.css · lib/words.js(walk.world.none) — walk-card.js?v=5 · walk.js?v=14 · walk.css?v=12 · words.js?v=26
- tests/walk-card.cjs — 화성(판타지 · 메카): 스팀펑크 탭 꺼짐, 판타지에서 여섯 장이 모두 판타지 것, 메카 탭 → 메카 그림과 일상컷, 다른 세계 그림 주소 → 탭이 따라감, 닫으면 탭 다시 켜짐

## 2026-11-12 · claude · 한 장을 넘길 때 화면 아래 하얀 줄
- 사용자 「도감 화면 넘길 때 화면 하단에 하얀줄이 나타났다가 사라져」(원소 공방 큰 그림 보기 · 옆으로 넘길 때) — 넘기기 전환이 그림을 18px 밀 때 한 장 층이 몇 px 옆으로 넘쳤고(재 보니 6px), 층이 가로 굴림을 허용해 폰이 가로 굴림 막대를 잠깐 띄웠다
- lib/walk.css — 한 장 층 overflow-x:hidden. walk.css?v=11
- tests/walk-card.cjs — 한 장 층은 가로 굴림 막대를 띄우지 않는다

## 2026-11-12 · claude · 원소 「들어가는 곳」 최종 검토 고침 2 — 한 장 초점은 대화 상자 자신 · 즐겨찾기 단추 띄어쓰기
- lib/walk-card.js — 열 때 초점을 닫기 단추가 아니라 한 장(대화 상자, tabIndex -1) 자신으로 — 주소로 바로 열면 닫기 단추에 초점 테두리가 떠 있었다(덮개 사진 5-card-fe). Tab 은 안의 첫 단추부터, 닫으면 연 자리로(B3 그대로)
- lib/walk.css — 대화 상자 자신의 초점 테두리는 없이, 단추 줄 단추 안 gap(inline-flex 가 「♡ 즐겨찾기」 의 띄어쓰기를 먹었다)
- index.html · lib/walk.js — walk.css ?v=10 · walk.js ?v=13 · walk-card ?v=4

## 2026-11-12 · claude · 원소 「들어가는 곳」 최종 검토 B12 — 옛 브라우저 검사 넷을 ESM_DIR 없이도
- tests/alchemy.cjs · tests/dex-holo.cjs · tests/dex-turn.cjs · tests/screen.cjs — ESM_DIR 이 비면 공용 손(tests/lib/harness.cjs 의 ESM_DIR — $HOME/.cache/element-esm/node_modules)으로. 맨 실행(tests/*.cjs 전부)이 지나간다

## 2026-11-12 · claude · 원소 「들어가는 곳」 최종 검토 고침 — 뒤로 가기 한 층씩 · 한 장은 화풍을 안 바꾼다 · 깨진 그림 · 단추 줄 · 초점
- lib/walk.js — 뒤로 가기가 mode 를 지금 보기로 덮지 않는다(빈 자리 → 목록으로 건너뛴 뒤 뒤로 가기가 한 층씩 오르지 못하던 것, A1) · 보기 기억은 고르개만(A3) · 역사 칸 walk 를 조상 칸 수로, 길 표시는 history.go(-k)(모르면 지금 칸을 바꾼다 — 한 장이 다시 열리던 것, A6) · 길이 넘치면 끝(지금 자리)이 보이게(B9)
- lib/walk-card.js — 한 장은 그 그림의 화풍으로 보이되 st 를 주소 · 기기 기억에 쓰지 않는다(카드 하나 열면 목록 화풍이 바뀌고 생성기 링크가 사라지던 것, A2 — 결정대로) · 열면 초점을 닫기 단추로, 닫으면 연 자리로(B3) · 그림 실패면 숨김(B6)
- lib/walk-data.js — imgFail 하나(썸네일 → 원본 한 번 → 숨김 — onerror=null 이 Preact 에선 안 들어 404 그림을 초당 수백 번 다시 부르던 것, B1 · B6), 안 쓰는 hasArt 지움(B11)
- lib/walk-orbit.js · lib/walk-family.js · lib/walk-list.js — imgFail(B1 · B6), 다른 세계 그림이면 「… 의 그림」(A7), 가문의 「목록에서 보기」(A7), 궤도/목록 고르개가 보기를 기억(A3)
- lib/walk-table.js — ① 의 출발 자리는 궤도로 들어갈 때만 넘긴다(목록으로 가면 남았다가 나중에 터지던 것, A3)
- lib/toolbox.js — 판 안에서 Tab 이 돈다(B3) · 판을 연 채 새로고침하면 죽은 {tb:1} 칸에서 한 칸 물러난다(A5) · 도구 화면 「← 돌아가기」는 공방에서 왔으면 history.back()(A4) · 기기 움직임 줄이기면 움직임 고르개를 막고 까닭(B10)
- lib/walk-fx.js — 입자가 멈추면 PixiJS system 틱도 멈춘다(화면 밖에서 rAF 60/초, B5)
- lib/walk.css — 한 장 단추 줄 wrap · 단추 글 한 줄 · 44px(사용자 「홀로, 즐겨찾기 그렇게 버튼 쭉 있는 텍스트가 세로로 안나오게 해줘」, B2) · 그림 칸 최소 크기(B6) · 세계 단추 · 화풍 고르개 44px(B7) · 어두운 바탕 강조색 --w-acc 와 흐린 칸 글 4.5:1(B8) · 목록 머리 원소 기호를 나라 카드 칸 모양으로(B13) · 「… 의 그림」 · 「목록에서 보기」(A7)
- lib/words.js — gallery.from · walk.inList · tool.motion.system
- alchemy.html — 카드 열기를 index.html?n=&mode=list(&card=&pic= 또는 &at=)로 바로(A9)
- index.html · alchemy.html · prompt.html · styles.html · lib/walk*.js — words ?v=25 · walk.css ?v=9 · walk.js ?v=12 · toolbox ?v=3 · walk-card ?v=3 · walk-data ?v=4 · walk-family ?v=5 · walk-fx ?v=6 · walk-list ?v=5 · walk-orbit ?v=7 · walk-table ?v=6
- tests/walk-*.cjs · tests/lib/harness.cjs — 고친 것마다 검사(빈 자리 → 목록 뒤로 가기 · 화풍 고르개 그대로 · 404 그림 부르기 수 · 단추 줄 · 키 초점 · 판 Tab · 대비 4.5 · 길 표시 · 돌아가기 · 새로고침 · rAF), A2 로 느슨하게 했던 단언 셋 되돌림, 입자 검사의 주석에 묻힌 줄 꺼냄(B4), 대비 손 contrast
- AGENTS.md · DESIGN.md · docs/superpowers/plans/2026-11-12-element-walk-in.md — st 는 화풍 고르개로만 · 길 표시는 위로 · 계획의 「실행 중 바뀐 것」 A2 되돌림 기록

## 2026-11-12 · claude · 원소 「들어가는 곳」 10-2 — 스팀펑크 전환의 김을 부드럽게
- lib/walk-fx.js — 세계 전환 스팀펑크 입자를 겹친 원 여럿으로(한 원은 덮개 사진에서 가장자리가 계단처럼 보였다)
- lib/walk-table.js · lib/walk-orbit.js · lib/walk-family.js · lib/walk-list.js · lib/walk.js · index.html — walk-fx ?v=5 · walk-orbit ?v=6 · walk-table ?v=5 · walk-family ?v=4 · walk-list ?v=4 · walk.js ?v=11

## 2026-11-12 · claude · 원소 「들어가는 곳」 10 — 안 쓰는 탭 머리 · 낱말 정리, AGENTS 화면 표 새로, DESIGN.md
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 10 — 정리 · 문서 · 전체 검사
- DESIGN.md (새) — 이 공방의 뼈대(「넘기는 곳이 아니라 들어가는 곳」 · 도구 상자 · 탭 줄 없음 · 어두운 바탕 · 효과 다섯 · 움직임 설정). 다른 공방의 뼈대를 가져오지 않는다 — 새 화면은 여기부터(사용자 「새로 만들어 달라고 하면 그전 공방 그대로 옮겨서 만든다」)
- AGENTS.md — 먼저 읽을 것에 DESIGN.md, 화면 표(타이틀 · 전시관 · 주기율표 · 도감 → 원소 공방 · 도구 상자), PAGES 문장 지움, 목록과 즐겨찾기 link 꼴, 검사 목록에 tests/walk-*.cjs, 꾸밈에 새 층은 --frame · --ui-* 를 안 쓴다고
- README.md · docs/PORT_NOTES.md — 화면 줄 · 옛 탭 머리 지움 표시
- lib/workspace-ui.js — 지움(아무도 안 싣는다 — 탭 머리 · AppearanceControls)
- lib/words.js — 쓰는 곳이 없는 열쇠 지움(nav.* · title.* · ui.header.* · home.title/intro/tag/table*/first*/themes · gallery.island* 와 옛 전시관 · 도감 머리 낱말), 첫 줄 보기 W('walk.table')
- lib/walk-orbit.js · lib/walk-family.js — 효과 ① · ⑤ 를 그리기 전(useLayoutEffect)에 — 끝 모습이 한 틀 먼저 비치지 않게(walk-orbit 검사가 가끔 「enter」 를 못 보던 것)
- lib/toolbox.js — Esc 를 그리자마자 받는다(useLayoutEffect — 열고 바로 누른 Esc 를 놓쳐 walk-list 가 가끔 시간 초과)
- alchemy.html · prompt.html · styles.html · index.html — words.js ?v=24 · toolbox.js ?v=2, walk.js ?v=10(walk-orbit ?v=5 · walk-list ?v=3 · walk-family ?v=3)
- tests/screen.cjs — 세계 그림 칸 꼴의 줄 이름(Scene note: · Time & weather: — main 2887e08 의 생성기 그대로)으로 단언
- tests/lib/harness.cjs — 낱말 표에 없는 열쇠(console.warn 'words: …')도 오류로 센다

## 2026-11-12 · claude · 원소 「들어가는 곳」 9 — 세계 바꾸기 전환(가루 · 김 · 주사선)
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 9 — 설계 효과 ③(세계마다 다른 전환)
- lib/walk-fx.js — PixiJS 를 닫을 때 전역 자원(releaseGlobalResources)은 놓지 않는다(궤도 입자 · 세계 전환 · 한 장의 홀로가 한 화면에 같이 살아서 — 하나를 닫으면 남은 쪽이 「null 의 '2'」 오류로 깨졌다, walk-list 에서 잡힘)
- lib/walk-fx.js — playShift: 막대 아래 덮개 .w-shift 하나(늘 하나 · 누르기를 막지 않음 · 900ms 안에 지움), WebGL · PixiJS 가 되면 덮개 안에 그 세계 입자 한 번(가루 · 김 · 주사선 잡음), 안 되면 CSS 만. 움직임 판단은 motionOn 한 곳
- lib/walk.js — 세계 고르개: 주소를 먼저 바꾸고(효과를 기다리지 않음) 그 뒤 전환. 목록의 「전부」 · 같은 세계는 전환 없음
- lib/walk.css — 세계마다 가면 움직임(판타지 점무늬 가루 · 스팀펑크 아래서 오르는 김 · 메카 주사선과 어긋나는 띠, 600ms), 한 장 위 · 막대 아래
- lib/walk-table.js · lib/walk-orbit.js · lib/walk-family.js · lib/walk-list.js — walk-fx ?v=4 · walk-orbit ?v=4(walk-fx 를 싣는 곳은 모두 같은 ?v= — 누른 자리 기억을 같이 쓴다)
- index.html — walk.css ?v=8 · walk.js ?v=9
- tests/walk-world.cjs (새)

## 2026-11-12 · claude · 원소 「들어가는 곳」 8 — 한 장 하나로(글 판 · 세계 넘기기) · 전시관 옛 주소 이어 주기
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 8 — 설계 물음 4(목록 · 가문 · 궤도 어디서 눌러도 같은 한 장, 전시관 한 장의 글 판과 세계 넘기기를 더한다)
- lib/walk-card.js — 글 판(층 · 기호 이름 · 이름 · 영어 · 근본이면 사실 칸과 그 세계의 나라 · 인격 · 주민이면 모티브 · 사는 세계 — 옛 전시관 한 장의 글), 막대의 세계를 바꾸면 지금 화풍의 그 세계 그림으로(없으면 그림은 그대로, 글 판만)
- lib/walk.css — 글 판(덮개는 그림 아래, 넓으면 옆)
- gallery.html — 옛 전시관을 지우고 새 주소로 넘기는 껍데기(?n=&f=&c=&w=&v=1 → 같은 층)
- lib/gallery.css — 지움(옮길 몫은 궤도 · 가문 · 한 장으로 다 옮겼다)
- index.html — walk.css ?v=7 · walk.js ?v=8(walk-card.js ?v=2)
- 계획 공유 약속 맨 위 — 과제 6 · 7 · 8 에서 바뀐 것(바로 가기 띠 · 막대 높이 · 한 장은 막대 아래 · st 가 위 층에 남음 …)
- tests/walk-card.cjs (새) · tests/screen.cjs(전시관 묶음 지움 — 궤도 · 가문 · 한 장 검사가 같은 것을 본다)

## 2026-11-12 · claude · 원소 「들어가는 곳」 7 — 가문 층(주민 전부 · 빈 원은 목록 그 칸으로) · 가문주가 날아와 머리 그림으로
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 7 — 설계 목표 4 · 물음 1(설계된 카드를 다 보인다) · 효과 ⑤
- lib/walk-family.js (새) — 옛 전시관 가문 층을 바탕으로: 가문주 크게(그림 → 한 장, 없으면 빈 원 → 목록의 그 칸) · 층 · 이름 · 인격 · 성질 · 설계된 주민 전부(아직 안 그린 주민은 빈 원 + 「아직 그림 없음」 → 목록의 그 칸) · 같은 물질의 다른 나라(그 나라의 같은 가문으로). 궤도에서 들어오면 ⑤ 누른 가문주 원에서 머리 그림이 날아와 커지고 주민이 차례로
- lib/walk.js — 가문 층을 붙임(빈 자리 층 코드는 지움)
- lib/walk.css — 가문 층(옛 gallery.css .g-fam-top · .g-hero · .g-cits 를 옮겨 이름을 바꿈)
- index.html — walk.css ?v=6 · walk.js ?v=7
- tests/walk-family.cjs (새)

## 2026-11-12 · claude · 원소 「들어가는 곳」 6 — 목록 보기(지금 도감) · 조작 줄 두 줄 · 세계 하나 · 크게 보기를 주소 층으로
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 6 — 설계 목표 3 · 7(원소 알약 줄이 없어지고 조작 줄이 잘리지 않는다) · 물음 2 · 3 · 4
- lib/walk-list.js (새) — 옛 dex.html 몸통(나라 · 카드 · 세계 칸 · 그림 칸 · 조작 판)을 옮김. 원소 알약 줄 없음, 조작 줄은 두 줄(화풍 한 줄 · 보기 한 줄 — 344 에서도 안 잘림), 세계 거르기는 막대의 세계 고르개(목록에선 「전부」), 즐겨찾기 수는 도구 상자로, 바로 가기 띠는 막대 아래 붙고 양끝이 흐림, 머리에 궤도로/목록으로, ?at= 이면 그 칸으로, 그림을 누르면 한 장 층(뒤로 가기로 닫힘), 같은 물질 다른 나라는 그 나라 목록으로
- lib/walk-card.js (새) — 옛 도감 크게 보기를 주소 층(?card=&pic=)으로: 홀로 · 넘기기 전환 · 하트 그대로, 넘기기 · 화풍 맞추기는 역사 칸 없이, 닫기 · Esc · 바깥 · 뒤로 가기는 한 층 위. 즐겨찾기 link 는 index.html?n=&mode=list&card=&pic=(&st=). 열자마자 누른 키도 받는다
- lib/walk-data.js — fileOf · styleList · picsOf · styleOfPic(옛 dex.html 에서 옮김, 몸 그대로)
- lib/walk.js — 목록 · 한 장 층을 붙임(한 장은 부모 층 위에), 목록 층에서만 세계 고르개 끝에 「전부」, 위 막대 높이를 --w-bar-h 로
- lib/walk.css — 목록 · 한 장을 어두운 바탕으로(element.css 의 공간 변수를 두 층 안에서만 바꿈), 조작 줄 두 줄 · 바로 가기 띠 · 한 장은 막대 아래. element.css 의 폰 주기율표 규칙이 새 주기율표를 넓히지 않게
- dex.html — 옛 도감을 지우고 새 주소로 넘기는 껍데기(즐겨찾기의 옛 link 도 이 길로 산다)
- index.html — element.css · prompt-spec.js · prompt-element.js 싣기(옛 dex.html 과 같은 버전), walk.css ?v=5 · walk.js ?v=6. lib/words.js — walk.world.all, 싣는 화면 ?v=23
- lib/walk-orbit.js — walk-data.js ?v=3 만(가져오는 파일 버전)
- tests/walk-list.cjs (새 — screen.cjs 도감 묶음을 옮기고 더함) · tests/screen.cjs(도감 묶음 지움) · tests/dex-holo.cjs · tests/dex-turn.cjs(여는 주소만)

## 2026-11-12 · claude · 원소 「들어가는 곳」 5 — 궤도가 천천히 돌고(손대면 멈춤) 분류마다 입자(PixiJS 늦게 불러오기)
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 5 — 효과 ②(궤도 화면에 머무는 동안), 설계 「입자 수 상한, 화면 밖 · 숨은 탭에서는 멈춘다」 · 움직임 끄기
- lib/walk-fx.js — loadPixi(한 번만, 실패하면 다음에 다시 — 주소는 holo.js 의 PIXI_URL) · mountParticles: 분류마다 입자(불티 · 바람결 · 빛 알갱이 · 결정 반짝임 · 푸른 깜빡임), 수 상한, 숨은 탭 · 화면 밖이면 멈춤, 움직임이 꺼졌거나 WebGL 이 없거나 PixiJS 를 못 받으면 조용히 빠짐(WebGL 이 없으면 받지도 않는다)
- lib/walk-core.js — particleKind(분류 → 입자 종류) · particleCap(덮개 24 · 넓으면 48)
- lib/walk-orbit.js — 궤도 층에 입자를 붙이고 떼기(움직임 끄기를 바로 따른다), 고리에 손대면 멈춤(뗀 뒤 2초)
- lib/walk.css — 고리가 180초에 한 바퀴(가문주 원은 거꾸로 돌아 똑바로), 손대면 멈춤, 움직임이 꺼지면 없음 · 입자 캔버스 자리
- index · hall · alchemy · styles · prompt 의 walk-core.js ?v=5, index 의 walk.css ?v=4 · walk.js ?v=5
- tests/walk-particles.cjs (새) · tests/walk-core.cjs(입자 종류 · 상한) · tests/walk-table.cjs(PixiJS 0 은 주기율표 · 목록만 본다 — 궤도에 들어가면 이제 받는다)

## 2026-11-12 · claude · 원소 「들어가는 곳」 4 — 나라 궤도 층(설계된 가문 전부 · 점선 고리 · 빈 원) · 앞뒤 나라 · 들어가기 확대
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 4 — 설계 목표 2(나라 = 궤도) · 물음 1(설계된 카드를 다 보인다) · 물음 7(궤도 그림 없는 나라는 코드가 그린 고리) · 효과 ①
- lib/walk-orbit.js (새) — 궤도 층: 가운데 근본(그림이면 둥근 그림 → 한 장, 없으면 빈 원 → 목록의 그 칸), 고리 위에 설계된 가문 전부(가문주 원 · 가문 이름 · 주민 수, 그림 없으면 빈 원 + 「아직 그림 없음」 → 목록의 그 칸, 그림 있으면 → 가문). 궤도 그림 일곱(RING)은 그 그림, 나머지 · 그림 404 는 점선 고리. 아래에 궤도로/목록으로(역사 칸 없이, 기기에 기억) · 사실 칸 · 인격 · 그 세계의 나라 · 성질. 주기율표에서 들어오면 ① 근본이 누른 칸에서 날아와 커지고 고리가 그려지고 가문주가 퍼진다. EmptyArt · ModeSwitch 는 가문 · 목록 층도 쓴다
- lib/walk-core.js — nationOrder(주기율표 번호 차례) · neighbors(앞뒤 나라, 끝에서 처음으로)
- lib/walk-data.js — cardsOf(근본 → 가문주 → 주민) · pick(고른 화풍 → 다른 화풍, 그 세계 → 다른 세계) · hasArt
- lib/walk.js — 궤도 층을 붙임, 나라 층(궤도 · 목록)이면 길 표시 옆 ‹ ›(역사 칸 없이 옆 나라)
- lib/walk.css — ‹ › · 궤도 무대(옛 전시관 .g-stage 를 옮김) · 가문주 원 · 빈 원 · 보기 고르개 · 나라 글
- lib/words.js — walk.mode · walk.mode.orbit · walk.mode.list · walk.noart · walk.prev · walk.next, 싣는 화면 ?v=22. index · hall · alchemy · styles · prompt 의 walk-core.js ?v=4, index 의 walk.css ?v=3 · walk.js ?v=4
- tests/walk-orbit.cjs (새) · tests/walk-core.cjs(나라 차례)

## 2026-11-12 · claude · 원소 「들어가는 곳」 3 — 첫 화면 주기율표 · 나라 카드 · 칸 숨쉬기와 불꽃
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 3 — 설계 목표 1(첫 화면 = 주기율표) · 효과 ④
- lib/walk-table.js (새) — 118칸(옛 hall.html 칸 배치 그대로), 나라 칸만 분류 색으로 빛남, 가로 스크롤 없이 폭에 맞춤(덮개 칸 16px 남짓 · 넓으면 최대 56px). 누르기는 표 한 곳에서 받아 가장 가까운 나라(흐린 칸 위를 눌러도), 고르면 표 아래 큰 나라 카드(기호 · 이름 · 분류 · 인격 · 가문 · 주민 수, 「들어가기」 — 기억된 보기 · 「목록」), Esc 로 닫힘, 역사는 안 늘림. 범례 분류 열
- lib/walk-fx.js (새) — 효과 문: fx()(움직임 판단은 walk-core motionOn 한 곳 — 기기의 움직임 줄이기 · 도구 상자의 움직임 끄기), 누른 자리 넘기기, ④ 불꽃(고른 칸 둘레 불티 여덟). 검사 손잡이 window.AtelierWalkFx
- lib/walk-core.js — nearestNation(가까운 나라 칸)
- lib/walk.js — 주기율표 층을 붙임, html[data-motion] 에 움직임 판단을 걸어 CSS 숨쉬기도 같은 판단을 봄
- lib/walk.css — 분류 색 열(칸 · 카드 · 범례가 같이), 주기율표 · 숨쉬기(움직임 꺼지면 없음) · 불꽃 · 나라 카드 · 범례
- hall.html — 옛 주기율표 화면을 지우고 새 주소로 넘기는 껍데기(walk-core legacyURL). 패치 기록은 도구 상자로 옮겨 갔다
- index.html · alchemy.html · styles.html · prompt.html — walk-core.js ?v=3, index 의 walk.css ?v=2 · walk.js ?v=3. lib/words.js — walk.enter · walk.list · walk.counts · walk.legend · walk.table.note, 싣는 화면 ?v=21
- tests/walk-table.cjs (새) · tests/walk-core.cjs(가까운 칸) · tests/screen.cjs(옛 hall 묶음 지움 — 같은 몫은 walk-table.cjs)

## 2026-11-12 · claude · 원소 「들어가는 곳」 2 — 도구 상자 · 도구 화면은 가는 막대(탭 줄 걷기)
- 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 2 — 합성 · 화풍 · 프롬프트는 장소가 아니라 도구(설계 「도구 상자」 · 물음 6), 움직임 끄기(사용자 「움직임 끄기 옵션 넣어줘」)
- lib/toolbox.js · lib/toolbox.css (새) — 구석 단추 하나 → 아래에서 오르는 판(PC 는 오른쪽 아래): 합성 · 화풍 · 프롬프트 · 즐겨찾기(원소 수) · 설정(공간 · 밀도 · 움직임) · 패치 기록(옛 주기율표 화면의 것). 판 밖 · Esc · 뒤로 가기로 닫힘, 판 안 링크는 판의 역사 칸을 걷고 간다. 도구 화면 머리 ToolBar(← 돌아가기 — 들어오기 전 층 · 도구 이름 · 도구 상자)
- lib/walk-core.js — motionOn() · setMotion(on): 움직임 판단 한 곳(기기의 움직임 줄이기 또는 이 기기에서 끔 element_motion_v1=off), 바꾸면 element-motion 사건
- lib/walk.js — 막대 끝에 도구 상자, 판의 역사 칸에서 새로고침해도 씨앗을 다시 심지 않음
- alchemy.html · styles.html · prompt.html — 머리를 WorkspaceHeader(탭 줄 · 큰 제목) → ToolBar, favorites.js · patch.js · walk-core.js · toolbox.css 싣기
- index.html — toolbox.css · patch.js 싣기, walk-core.js ?v=2 · walk.js ?v=2
- lib/words.js — tool.* 낱말(움직임 켜기/끄기 포함). 싣는 화면 일곱 ?v=20
- tests/walk-tools.cjs (새) · tests/screen.cjs 「화풍 탭」 · tests/alchemy.cjs 「메뉴의 합성」 — 탭 줄 대신 h1.tb-name

## 2026-11-12 · claude · 원소 「들어가는 곳」 1 — 한 화면 껍데기 · 주소 층 · 뒤로 가기 한 층씩
- 사용자 「괜찮네. 이대로 진행해줘」 — 설계 docs/superpowers/specs/2026-11-12-element-walk-in-design.md, 계획 docs/superpowers/plans/2026-11-12-element-walk-in.md 과제 1
- index.html — 타이틀 화면(공간 배경 · 그림 현판 · 그림 단추)을 「들어가는 곳」 껍데기로 통째 갈아치움. material.css · room.css 를 싣지 않는 어두운 바탕(#07080c)
- lib/walk-core.js (새) — 주소 읽기/쓰기 · 층 · 부모/조상 · 기억값 채우기 · 검증(낡은 열쇠는 가장 가까운 맞는 층) · 옛 주소(hall · gallery · dex) · 세계. node 로도 돈다
- lib/walk-data.js (새) — 설계표 · 화풍 판 · 등록부 한 번 읽기(옛 gallery.html useDocs 그대로)
- lib/walk.js (새) — 껍데기 앱: 주소 ↔ 상태, 깊은 주소로 들어오면 조상 층을 역사에 한 칸씩 심기, 내려가기 push · 옆으로 replace, 같은 주소는 다시 안 씀(두 번 눌러도 한 칸), 세계 · 보기는 뒤로 가도 남음, 위 막대(지나온 길 · 세계), 층 다섯은 아직 빈 자리
- lib/walk.css (새) — 새 층들의 어두운 겉모습 · 막대 · 세계 고르개(44px) · 세계 · 테마 배경 자리(.w-scenery)
- lib/words.js — walk.* 낱말 여섯. 싣는 화면 일곱 ?v=19
- tests/walk-core.cjs · tests/walk-shell.cjs · tests/lib/harness.cjs (새) — 순수 함수 · 껍데기 브라우저 검사, 공용 손(서버 · 가로채기 · 넘침 · 사진)
- tests/screen.cjs — 타이틀 묶음 지움(그 화면이 없어졌다 — 같은 몫은 walk-shell.cjs)

## 2026-11-12 · claude · 칸 꼴 세계 그림 — 시간대 · 덧붙임 줄 이름, 메카 의상 문장 이음
- 사용자 2026-11-12 「응 둘 다 고쳐줘」 — 허브를 고치다 옆에서 찾은 두 군데
- lib/prompt-element.js buildWorldSections — 장면에서 고른 시간대 · 덧붙임이 4칸에 옛 줄 이름(TIME & WEATHER: · SCENE NOTE: · OUTFIT NOTE: · EXTRA:)으로 들어가던 것을 4칸 다른 줄과 같은 꼴(Time & weather: · Scene note: …)로. 칸 꼴을 끈 옛 꼴은 그대로
- lib/prompt-element.js worldLines — 메카 의상 줄 「…a back unit may carry the motif. heavy dark-iron…」: 틀 꼬리 뒤에 설계표 design 소문자 조각이 붙어서였다 → 첫 글자를 올려 새 문장으로(「motif. Heavy dark-iron…」, 모든 꼴)
- tests/prompt-sections.cjs — 시간대 · 덧붙임을 고른 판(칸 꼴 이름 · 옛 꼴은 옛 이름)과 메카 의상 줄 문장 이음 단언 더함(전엔 장면을 안 고른 판만 봤다)
- dex.html · prompt.html — prompt-element.js ?v=30

## 2026-11-12 · claude · core 블록을 v5 원본에 다시 맞춤
- lib/look-spec.js 끝 core:v5 블록에 손으로 넣은 새 근본 여덟의 머리색 · 눈색(공통 낱말이 아닌 원소 몫)이 끼어 화풍공방 tests/core.cjs 가 깨져 있었다 — node core/sync.cjs ../element-atelier 로 다시 옮김.
- VOCAB_EN 결과는 전과 같다(새 열쇠는 위 본표에 그대로 있어 지시문 변화 없음). 원소 몫 낱말은 블록이 아니라 본표에 둔다(블록은 손으로 고치지 않는다).

## 2026-11-12 · claude · 검사 정리 — 겹친 검사 지우고 느린 검사 반복 줄이기
- 사용자 2026-11-12 「각 공방별로 필요없고 쓸데없이 시간만 잡아먹는 검사들 좀 없애줘」 — 보는 것은 그대로, 반복만 줄였다
- tests/core-sync.cjs 지움 — 화풍공방 tests/core.cjs 가 여섯 공방 core 블록을 같은 sync.cjs --check 로 본다(CLAUDE.md 「core 낱말 — 화풍공방 core.cjs 하나」)
- tests/casual-tree-v2.cjs — 랜덤 2000 · 바꾸기 1500 → 300 · 200(다른 공방과 같은 수). 53 → 16초
- tests/casual-plan.cjs — 카드 열 × 씨앗 둘(52 묶음) → 대표 카드 넷 × 씨앗 하나(상황 넷 · adventure · drape · 데니어 비율이 다 나오는 카드). 42 → 15초
- tests/casual-tree-v2.py — 걸림 시험 예순한 개를 모아 끝에서 나눠 돌린다(fork 풀). 22 → 14초
- tests/alchemy.cjs — 합성 흐름은 폰 한 판, PC 는 맞춤 · 넘침 · 메뉴 · 오류만. 연출 끝 1.6초 고정 대기 → 제자리 상태 기다림, 스크린샷은 SHOT_DIR 이 있을 때만. 74 → 34초
- tests/screen.cjs — 전시관 · 도감 깊은 흐름 · 즐겨찾기 link · 생성기 화풍 고르개 · 내린 화풍 주소는 폰 한 판에서만, PC 는 열고 칸 수 · 넘침 · 콘솔(생성기 걸음은 화면 꼴이 달라 둘 다). 94 → 37초
- tests/prompt-pack-screen.cjs — 카드 둘 → 고친 설정 카드 하나(fe-steel-sword, 24 자리). 29 → 20초

## 2026-11-12 · claude · 원소 합성 — 합성로 원이 단추를 침범하지 않게
- 사용자 「동그란 부분이 밑에 버튼을 침범하고 있어」 — alchemy.html: 합성로 반지름 112 → 92(빛 번짐 104), 칸 셋은 안으로(반지름 25 · 간격 58), 안내 글은 원 밑으로, 단추 줄 · 원소 패는 그 아래로. 터질 때 빛 번짐도 1.7배 → 1.35배로 줄여 가장 크게 번져도 단추 줄 위에서 멈춘다
- tests/alchemy.cjs — 폰 · PC 에서 합성로가 가장 크게 번진 아래 끝 < 단추 줄 위 끝, 마지막 원소 이름이 캔버스 안(검사용 layout)

## 2026-11-12 · gpt · 리튬 일상컷 21장 등록
- data/img.json — 사용자 업로드 승인에 따라 보존된 일상컷 세계별 7장 등록. 세계 간 의상·구도 중복과 기존 QA는 기록에 그대로 보존. 재생성 없음.

## 2026-11-12 · claude · 공방 지도의 문에서 넘어올 때 페이드
- index.html · hall.html · gallery.html · dex.html · prompt.html · alchemy.html · styles.html — 머리(`<title>` 바로 아래)에 한 줄: `@view-transition { navigation: auto; }`(동작 줄이기면 꺼진다)와, 여기서 나갈 때는 전환을 그만두는 `pageswap` · 끊긴 전환의 콘솔 오류를 받아 두는 `pagereveal` 한 마디씩. 공방 지도(polos0117.github.io)의 대미궁에서 문을 누르면 이 페이지가 페이드로 들어온다 — 공방 안에서 쪽을 옮길 때는 전과 같다. 문서 간 전환을 모르는 브라우저도 전과 같다
- 사용자 2026-11-12 「각 공방 저장소에도 한 줄 넣고 VT_READY 에 더해줘」 — 약속은 공방 지도 README 「방에 들어가는 연출」

## 2026-11-12 · claude · 원소 합성 — 성공 연출(손맛)
- 사용자 「합성 성공 연출 손맛 있게 넣어줘」 — 허브 game-feel 스킬의 단계표대로 alchemy.html 에 연출 묶음(feedback): 처음 찾은 물질(큰 단계) = 모으기(고른 칸이 가운데로 빨려 들고 합성로가 움츠림, Cubic.In) → 터짐(합성로가 넘쳤다 제자리 Back.Out · 빛 번짐 · 강조색 번쩍임 한 번 · 고른 원소의 분류 색 입자 28 · 살짝 흔들림) → 잠깐 숨 → 카드가 넘치게 튀어나오며 반짝이 · 「새 카드 +n」 떠오르기 · 수집 수가 하나씩 올라감. 이미 찾은 물질(작은 단계) = 입자 8, 흔들림 · 번쩍임 없음. 실패 = 회색 김 + 도리질. 움직임 줄이기면 연출 없이 바로 결과(카드도 앞면)
- 입자 장치 하나를 돌려 쓰고, 모든 움직임은 끝나면 제자리(크기 1 · 자리 · 카메라 0)로. 합성 중엔 다시 못 눌러 번쩍임이 1초 세 번을 넘지 않는다(WCAG 2.3.1). 위 수집 수는 결과를 닫을 때 바뀐다
- lib/words.js alchemy.gain, ?v= words 18(합성 화면). tests/alchemy.cjs — 단계 · 끝나면 제자리 · 뒤집히는 중에 닫기 · 움직임 줄이기

## 2026-11-12 · claude · 홀로 · 합성 점검(허브 게임 스킬)
- 사용자 「응 스킬 읽고 만든 것들 점검해줘」 — 허브 .claude/skills 의 pixijs-rendering · shader-programming · phaser-core · card-game · game-feel 로 대조
- lib/holo.js(pkm 과 같은 파일) — 거꾸로 준 smoothstep 가장자리 · 셰이더 정밀도 highp · 앱 정리 releaseGlobalResources. dex.html holo.js?v=3
- lib/alchemy.js tidy · alchemy.html — 저장된 열쇠 가운데 지금 설계표에 없는 카드 · 겹친 열쇠는 뺀다(가문을 고치면 「수집 25 / 24」 가 될 수 있었다). 덮개를 닫을 때 모든 트윈(killAll)이 아니라 덮개 것만 멈춘다(합성로 · 칸 움직임이 중간에 끊겨 크기가 남지 않게). alchemy.js?v=2
- tests/alchemy.cjs — tidy

## 2026-11-12 · claude · 원소 합성(Phaser) — 근본 원소를 붙여 가문주 카드 모으기
- 사용자 「Phaser — 그림으로 놀기 … 원소 둘을 붙여 물질 만들기 … 이것도 해볼까?」 → 「합성 + 수집」. alchemy.html(새로): 근본 원소 패(주기율표 번호 차례 · 분류 색)를 하나 ~ 셋 골라 합성로에 넣고 「합성」 — 그 원소 묶음으로 된 물질(설계표 가문 elements)이 있으면 나라마다 가문주 카드가 뒤집히며 열린다(H + O → 수소의 물 · 산소의 물, Fe + O → 녹 · 피 넷, 한 원소 → 그 나라 혼자 가진 물질). 비활성 기체는 「섞이지 않는다」, 힌트(원소 몇 개 · 그중 하나), 수집첩(24장 — 찾은 카드는 그림, 누르면 도감), 찾은 것은 이 기기에(element_alchemy_v1). Phaser 4.2.1(jsdelivr), 캔버스는 논리 두 배 크기 · 테마 색을 읽는다, 결과는 화면 읽기에도
- lib/alchemy.js(새로) — 조합표 · 합성 · 힌트 · 저장(node 와 같이). lib/workspace-ui.js 메뉴에 「합성」, lib/words.js nav.alchemy · alchemy.*. 모든 화면 ?v= words 17 · workspace-ui 5
- tests/alchemy.cjs(새로) · AGENTS.md 검사 목록

## 2026-11-12 · claude · 넘기기 — 칸이 내려갔다 올라오지 않게
- 사용자 「넘길 때 카드가 밑으로 이동했다가 다시 올라오네. 자연스럽게 넘어가지가 않아」 — dex.html Lightbox: 넘길 때마다 그림 요소가 새로 생겨 새 그림을 받는 동안 크기가 0, 칸이 줄었다 커지며 위 이름 줄 · 아래 단추 줄 · 사본이 내려갔다 올라왔다(390 폭에서 단추 줄 696→422→696). 새 그림이 올 때까지 칸을 옛 크기로 붙잡고(움직임 줄이기여도), 전환은 새 그림이 왔을 때 시작한다(그때까지는 옛 그림 그대로 — 늦어도 0.9초에 시작하던 것을 뺐다)
- tests/dex-turn.cjs — 그림이 1.2초 늦게 와도 이름 줄 · 단추 줄이 움직이지 않는다, 옛 그림은 그때까지 보인다

## 2026-11-12 · claude · 도감 크게 보기 넘기기 전환
- 사용자 「원소 도감에도 넘기기 전환 넣어줘」 — dex.html Lightbox: pkm 도감 크게 보기와 같은 모양(0.42초 · 18px). 나가는 그림의 사본(.lb-ghost — 바뀌기 직전에 주소 · 자리를 떠 둔다)이 반대쪽으로 밀리며 흐려지고, 새 그림은 넘긴 쪽에서 들어온다(단추 · 방향키 · 밀기 모두). 새 그림이 오면(늦어도 0.9초) 시작, 빠르게 넘기면 앞 전환은 끝낸다, 움직임 줄이기면 바로. lib/motion-fx.js 는 삼국지와 같이 쓰는 파일이라 건드리지 않고 Web Animations 로
- lib/element.css — 사본 < 새 그림 < 홀로 빛 · 넘기기 단추(z-index). ?v= element 10
- lib/holo.js — pkm 과 같은 파일로(그림을 바꿀 때 빛도 0.45초에 다시 든다). holo.js?v=2
- tests/dex-turn.cjs(새로) · AGENTS.md 검사 목록

## 2026-11-12 · claude · 도감 크게 보기 홀로 효과(PixiJS — pkm 과 같은 파일)
- 사용자 「원소 도감에도 홀로 효과 붙여줘」 — lib/holo.js(pkm-atelier 와 같은 파일): PixiJS 8.19.0(jsdelivr, WebGL 만) 캔버스를 그림 위에 screen 으로. 무지갯빛 반사 + 빛 번짐, 밝고 차가운 곳에 세게 · 살색 같은 따뜻한 색엔 약하게, 마우스 · 폰 기울기 · 가만두면 천천히, 움직임 줄이기 존중, 그림의 둥근 모서리를 따라간다
- dex.html 크게 보기 — 「홀로」 단추(켜고 끈 것은 공방 모음 공용 열쇠 atelier_holo_v1 — pkm 도감과 같이), 넘겨도 캔버스는 그대로 그림만 바꿈. lib/element.css(캔버스 · 넘기기 단추 z-index) · lib/words.js dex.holo · ?v= words 16 · element 9
- tests/dex-holo.cjs(새로) · AGENTS.md 검사 목록

## 2026-11-12 · gpt · 리튬 선택 세계컷 등록
- data/img.json — 판타지 4 · 스팀펑크 4 · 메카 3 선택본 세 장 등록. 일상컷 21장은 생성 후 세계 사이 의상·구도 중복 검사 실패로 보류, 재생성하지 않고 보존.

## 2026-11-12 · gpt · 인 세계컷과 일상컷 등록
- data/img.json — 선택한 세계컷 1·1·1과 세계별 일상컷 7장, 총 24장을 등록했다. 기존 등록과 이미지는 유지했다.

## 2026-11-12 · gpt · 질소 세계컷과 일상컷 등록
- data/img.json — 선택된 판타지 4 · 스팀펑크 3 · 메카 3 원본과 세계별 일상컷 7장씩, 총 24장을 등록기로 추가했다. 기존 등록과 날짜는 보존했다.
- docs/PATCH.md — 안내글보다 앞에 놓인 기존 규소 기록을 안내글 뒤로 옮겨 기록 검사를 통과하도록 했다. 기록 내용은 유지했다.

## 2026-11-12 · gpt · 규소 세계컷과 일상컷 등록
- data/img.json — 선택된 판타지 3 · 스팀펑크 4 · 메카 4 원본과 세계별 일상컷 7장씩을 등록기로 추가했다. 기존 등록은 보존했다.


## 2026-11-12 · gpt · 철 세계컷과 일상컷 등록
- data/img.json — 선택한 세계컷 4·4·2 및 세계별 일상컷 7장, 총 24장을 등록 도구로 추가. 기존 화풍·다른 캐릭터 기록 보존.

## 2026-11-12 · claude · 근본 여덟 더 — 질소 · 네온 · 인 · 리튬 · 아연 · 주석 · 납 · 수은
- 사용자 「원소공방 근본원소 추가해줘」 → 추천 여덟(기존 나라와 물질 짝이 생기는 것). data/element-design.json nations 끝 — 성격 · 성질 · 팔레트 · 세 세계(장소 · 장면 셋 · 메카 설계) · 손 물건 · 외형(세계마다 다른 사람) · 구조판 손글 칸(세 세계 3 · 4절) · 실루엣. 가문 · 주민은 아직
- lib/prompt-spec.js SIL_TAGS 여덟(실루엣은 tools/sil-spread.py 가 나눴다) · 머리색 여덟 · 눈 색 cinnabar 한국어 이름. lib/look-spec.js · tools/port-look-spec.cjs EXTRA 같은 어휘
- docs/ELEMENT_CONCEPT.md 2절 표. 검사 element-design check · tests/element-design.py · look-spec · prompt-element · prompt-sections · prompt-short-look · words

## 2026-11-12 · gpt · 염소 세계별 GPT 필수 갈래 일상컷 7 추가
- data/img.json — 판타지·스팀펑크·메카의 7번 일상컷을 한 장씩 추가한다. 수영복·역할극·수영복 갈래와 새 상황을 함께 자유 설계했고, 실제 프롬프트·설계 덩어리·참고 해시·검수 차이는 그림 저장소 records/cl에 보존했다. 기존 여섯 장과 계획은 유지하며 생성된 결과는 임의 재생성하지 않았다.

## 2026-11-12 · gpt · 우라늄 세계별 갈래 자유 일상컷 7 추가
- data/img.json — 변경된 일곱 장 규칙에 따라 판타지·스팀펑크·메카의 7번 일상컷을 각각 한 장씩 추가한다. 기준 세계 그림을 첨부하고 필수 의상 갈래와 새 상황을 함께 자유 설계했다. 실제 프롬프트·FREE DESIGN 덩어리·참고 해시·검수 결과는 그림 저장소 records/u에 기록했고, 기존 여섯 장과 계획은 보존했다.

## 2026-11-12 · gpt · 황 GPT 갈래 자유 일상컷 세계별 1장 추가
- data/img.json — 판타지·스팀펑크·메카의 7번 일상컷을 등록기로 추가. 필수 의상 갈래와 상황을 결합한 자유 설계 3장, 실제 프롬프트·설계·검수는 그림 저장소 기록에 보존.

## 2026-11-11 · claude · 갈래 자유 설계 컷 — 갈래 이름은 짧게
- Outfit family 줄의 {family} 가 두 번 들어가는데 트리 표의 긴 영어 글이 들어가 문장이 깨졌다(「any a playful adult event costume … outfit」) — FREE_DESIGN.familyNames 짧은 이름(lingerie-inspired · swimwear · role-play costume, 삼국지와 같음)
- tests/casual-plan.cjs 를 짧은 이름으로, prompt-spec · prompt-element ?v 올림

## 2026-11-11 · claude · 갈래 자유 설계 컷 — 상황은 열기, 옷 갈래는 큰 범위만
- Outfit family 줄: 「any {family} outfit; you may pick one from our outfit catalog … or design your own, but prefer one that is not in it(그 갈래면 우리 목록에서 골라도 직접 지어도 되지만 목록에 없는 것 먼저)」
- Situation 줄: 표에서 고르지 않고(gsitu 'free') 「a situational exposure moment of your own design that fits the scene — prefer one that is not among ours: …(장면에 맞는 상황 노출 순간을 직접 짓되 우리 넷이 아닌 것 먼저)」
- 사용자 2026-11-11 「상황도 열어주자. 옷도 이제 큰범위로만 지정해줘. 수영복갈래면 우리쪽에서 선택해도 되고, 본인이 골라도 되는데, 최대한 우리쪽에 없는걸 고르게」 — tests/casual-plan.cjs 를 새 줄로

## 2026-11-11 · claude · 일상컷 일곱 장 — 자유 설계 칸 둘(옷 자유 · 갈래 자유)
- lib/prompt-spec.js — FREE_DESIGN 한 상수(자유 설계 덩어리 · 최근 장면 · 갈래 · 상황 · Outfit 줄 안내). 사용자 「한 장 더 생성하게 해서 필수갈래 또는 상황 노출을 더 그리게 추가해줘. 그럼 일상컷은 총 7장 되는거야」 → 「장소·활동·자세·구도·의상을 자유롭게 설계해줘 … 필수갈래랑 상황노출 두개를 묶어서 이렇게 가자. 그리고 지금 맡겨놓은 일상컷 1장도 같이 이런식으로」
- lib/prompt-element.js — 자유 설계 칸(sfree)은 장면 줄 대신 덩어리(freeDesignLines), 트리로 채우지(repair) 않는다. 얼굴 · 화풍 · 몸 · 첨부 그림 줄은 짧은 판 그대로, 노출 · 몸 줄은 Outfit 줄 끝
- tools/casual-plan.cjs — 세계마다 일곱 장(장면 컷 다섯 + 맨 뒤 자유 설계 칸 둘 — ofree · gfree+gsitu), 갈래는 노출 갈래 컷과 · 상황은 상황 노출 컷과 다르게, 최근 장면(recent — 그림 저장소 기록 여덟 + 같은 묶음). 장면 규칙은 장면 컷만, 옛 여섯 장 묶음은 그대로 통과하고 일곱째만 짜진다. --check 가 자유 설계 기록의 채운 글(generation.free_prompt)을 본다
- tools/prompt-pack.cjs — 자유 설계 칸은 트리 검사 없이, situ none 은 갈래 자유 칸의 상황에도, INDEX 에 「덩어리 채우기」 안내 · 칸 표시
- tools/image-claim.cjs — 일상컷 일곱 장(빈 자리 세 세계 21 → 24)
- lib/studio.js · lib/words.js — 자유 설계 장면을 넣으면 고르는 단계 없이 덩어리 지시문, 「처음부터」 로 보통 장면. *.html ?v 올림
- IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md · AGENTS.md — 일곱 장 · 자유 설계 칸 둘 · 「자유 설계 덩어리를 채운다」 · 채운 글은 기록 free_prompt · free_design
- tests/casual-plan.cjs · tests/prompt-pack-screen.cjs — 일곱 장 · 자유 설계 칸 둘 · 옛 여섯 장 + 일곱째 · 같은 갈래 · 상황을 잡는다

## 2026-11-11 · gpt · 황 재작업 21장 등록
- data/img.json — 선택한 세계컷 판타지 4·스팀펑크 3·메카 3과 세계별 일상컷 여섯 장, 총 21장을 등록기로 반영. 기존 그림과 다른 카드 데이터는 보존.

## 2026-11-11 · claude · 진한 빨간 립스틱을 연하게(core v5)
- 표식 red_lip 「bold red lipstick(진한 빨간 립스틱)」 → 「a soft rose-red tint on the lips(입술에 연한 장밋빛 붉은 기)」 — core v5 블록
- 사용자 2026-11-11 「진한 빨간 입술은 다 빼거나 연하게 바꾸자」

## 2026-11-11 · claude · 스팀펑크 옷 · 빛 · 노출, 메카 노출 고침(감사 E3 · E6)
- 스팀펑크 의상: 「a short bustle skirt over riding trousers(승마 바지 위 짧은 버슬 치마)」 → 「a short bustle skirt and laced boots(짧은 버슬 치마와 끈 부츠)」, 「muted palette with the traits above as accents(가라앉은 색에 특징 포인트)」 → 「the traits above as colour accents(특징을 색 포인트로)」 — 노출의 드러난 다리 · 화풍의 빛나는 색과 부딪혔다(11-04 헬륨 때 옛 구조판에만 들어갔던 것). 근본 · 가문주 39
- 스팀펑크 빛(의상 · 주민 꼬리 둘 다): 「hazy gaslight and a smoky overcast sky(뿌연 가스등 · 흐린 하늘)」 → 「bright warm sunlight with soft sky light bounced from white clouds(밝고 따뜻한 햇빛, 흰 구름에 반사된 하늘빛)」. 스팀펑크 88
- 스팀펑크 과감 노출: 「sleeves rolled above the elbow, a short bustle skirt showing the legs…; the waistcoat stays buttoned(소매 걷기 · 버슬 치마 아래 다리 · 조끼 잠금)」 → 「her outfit opens to show skin — the neckline opened down to the sternum…, bare forearms, and bare legs above the boots or through a high slit where the silhouette allows; pieces stay symmetrical(목선은 가슴뼈까지, 팔뚝 · 부츠 위 다리 또는 실루엣이 허락하는 트임)」 — 민소매 · 바지 실루엣과 어긋났다. 39
- 메카 과감 노출: 세계 전용 문장을 새로 — 「her mecha frame is cut open by design in only these places — bare shoulders and upper arms between pauldron and gauntlet, and a deep open chest window…; everywhere else she stays fully plated(메카 몸은 이 두 곳만 열림: 어깨 · 위팔, 가슴 창. 나머지는 장갑)」(삼국지 메카와 같은 꼴). 전엔 천 옷용 공용 문장(겉옷 · 속옷 · 코르셋 · 옷깃)이 나갔다. 주민도 같은 문장(WORLDS mecha exposureBoldCitizen). 메카 78
- 사용자 2026-11-11 「응 원소도 한글로 풀어서 보여줘」 → 「응 4,5도 수정해줘」. tests/prompt-element.cjs 스팀펑크 · 메카 노출 검사를 새 글로, prompt.html · dex.html prompt-spec ?v=28 · prompt-element ?v=27, 검사 전부 통과

## 2026-11-11 · claude · 세계 그림을 칸 꼴로 — 3단계 첫 공방
- 기본 화풍(jp_paint_anime, 같은 열쇠)의 세계 그림이 짧은 판 → 칸 꼴: 머리말 → 1 STYLE → 2 CHARACTER → 3 COSTUME — 세계 → 4 SCENE → 5 CONSTRAINTS + Avoid. 칸 머리 · 해부 줄 · Avoid 줄은 화풍공방 core v4 칸 틀(AtelierSpec.CORE_FRAME — 삼국지와 같은 틀)
- 글은 짧은 판 그대로 칸에 나눴고 걸림 다섯은 사용자가 고른 안대로: 빛 한 줄 · 얼굴 비율 줄 described below · 노출 줄 the costume above · 「No …」 금지는 Avoid(조건 unless 마디만 남김) · 5칸 손가락 말 빼기. HAIR 조각은 2칸 Hair 줄, 옛 줄 이름(WORLD · SILHOUETTE · CONCEPT · TIME & WEATHER · EXPOSURE)은 칸 말로
- lib/prompt-element.js buildWorldSections · splitNo, data/style.json worldSections, 새 검사 tests/prompt-sections.cjs(240장), prompt-element · prompt-short-look · screen 검사를 칸 꼴로, IMAGE_RULES 적음. 일상컷은 그대로 짧은 판
- 시험: 금 판타지 짧은 판 · 칸 꼴 한 쌍(2.6) — 얼굴 · 화풍 · 실루엣 같음. 사용자 2026-11-11 「다른거 먼저 3단계 진행해줘」 → 「응 네 안대로 하고 기존 화풍 열쇠로 해줘」
- prompt.html · dex.html prompt-spec ?v=27 · look-spec ?v=8 · prompt-element ?v=26

## 2026-11-11 · claude · core v3 글 · 눈꼬리 모순 13자리
- core v3: square_soft · angular · wide_smile 글(삼국지와 같음)
- 설계값: 가는 올라간 눈 + 처진 꼬리 6자리 → 꼬리 up, 처진 눈 + 올라간 꼬리 7자리 → 꼬리 down(삼국지 11-10 EYE_TILT_FIX 와 같은 짝), tests/look-spec.cjs 에 눈꼬리 짝 · IMAGE_RULES 적음
- 기본 화풍 세계 지시문 68개 Her 줄만 바뀜. 시험: 나트륨(wide_smile) · 녹슨 갑옷(눈꼬리) 한 쌍씩 — 그림 차이 거의 없음, 정리 몫. 사용자 2026-11-11 「정리하는 김에 깔끔하게 하는게 낫지?」
- prompt.html · dex.html prompt-spec ?v=26 · look-spec ?v=7

## 2026-11-11 · claude · core v2 긴 얼굴 글 · 얼굴 비율 줄 금지 나열 빼기 · 눈 크기 모순 23자리
- core v2: face_shape.long 「long face」 → 「gently long oval face」
- WORLD_SHORT.face: 「— never a long face or a long, pointed or heavy jaw … never squeezed into narrow slits」 금지 나열을 빼고 「Her eyes keep the shape and size described above」(감사 E2 — Her 줄의 긴 얼굴 · 각진 얼굴 · 가는 눈을 다시 막았다). 기본 화풍 세계 지시문 240개 전부 이 줄이 바뀜
- 설계값: 눈 크기가 그 세계 눈 모양과 부딪치는 23자리를 look.worlds.<세계>.face.eye_size 로 덮음(small+round_large → large 2, small+almond_wide → medium 5, large+narrow_upturned/monolid_long → medium 16) — 삼국지 11-10 과 같은 짝. tests/look-spec.cjs 가 생성기 외형으로 검사, IMAGE_RULES 적음
- 사용자 2026-11-11 원소 금 판타지 두 쌍 시험(긴 얼굴이 세지지 않음) → 「넣어주고, 그대로 두고, 설계값 모순만 바꿔줘」
- prompt.html · dex.html prompt-spec ?v=25 · look-spec ?v=6

## 2026-11-11 · claude · core v1 낱말 쓰기 — 표정 표 · 나이 줄 삼국지 글로
- 화풍공방 core/v1/vocab.json 을 lib/prompt-spec.js · lib/look-spec.js 끝 「core:v1」 블록으로(사용자 「응 원소 글로 하고 core v1 만들어줘」 · 「기본 화풍들도 같이 옮기자」). 바뀐 것: 표정 32개 → 삼국지 11-03 누그러뜨린 글(턱 들기 · 이 악물기 · 시선 돌리기 없음 — 감사 E5), 나이 late_20s · early_30s → 「graceful … soft, smooth contours」(감사 E8), 외형 7개 삼국지 글(hime cut · copper-red 등)
- 한글 이름표(표정 · 나이)도 새 글 뜻으로. 검사 tests/core-sync.cjs, prompt-element 의 표정 확인 둘을 core 기준으로. prompt-spec ?v=24 · look-spec ?v=5. prompt-element 는 전부터의 og 낱말 한도(이제 854/850)만 남음

## 2026-11-11 · claude · 짧은 세계 그림 — 고른 외형 싣기 · 얼굴 끈 찌꺼기
- 사용자 「응 둘 다 고쳐줘」 — 화면 검사를 다시 쓰다 찾은 둘(lib/prompt-element.js buildWorldShort): 1) 생성기에서 직접 고른 외형(머리색 등)이 짧은 판 지시문에 안 실렸다 — 고르면 설계의 그 칸이 빠지는데 긴 판의 IDENTITY 칸을 짧은 판이 안 옮겼다. 「Chosen look (overrides the automatic look): hair color: silver.」 한 줄로 Her 줄 바로 뒤에
- 2) 얼굴 싣기를 끄면 「Her: . slender …」 — 빈 얼굴은 빼고 잇는다. prompt-element ?v=25. 검사 tests/prompt-short-look.cjs(네 카드 열두 장). prompt-element 는 전부터의 og 낱말 한도 실패 그대로

## 2026-11-11 · claude · 그림 없는 화풍 열넷 내림
- data/style.json — 도감에 등록 그림이 없는 화풍 열넷(mmorpg2d · semireal · kr_mmorpg · kr_promo_hikey · kr_promo_hikey_oil · glossy_kr_game · glossy_kr_semireal · kv_kmmo_lock · kv_kmmo_23d · kv_jp_mobile · kv_jp_paint · kv_anime_gloss · mmorpg_cg · bright_2d_oil)에 retired · retired_why — 지우지 않고(옛 기록 · 조립 참조가 남는다) 고르개에서만 뺀다(사용자 2026-11-11 「도감에 그림 등록이 없는 키들은 빼는게 좋을거 같아」 → 「1,2번 다 내려줘」). 남은 화풍은 jp_paint_anime(기본) · game_keyart · game_cgi · cinematic_keyart
- lib/studio.js · prompt.html(studio.js ?v=6) — 생성기 화풍 고르개가 내린 화풍을 빼고, 주소 ?style= · 이 기기에 기억된 고른 화풍이 내린 것이면 기본 화풍으로
- tests/screen.cjs — 내린 화풍을 쓰던 곳을 살아 있는 화풍으로 다시 씀: 고르개 검사는 목록 = 살아 있는 화풍(kv_jp_paint · mmorpg2d 없음) · game_keyart 를 고르면 화풍 단락이 바뀌고 ''로 돌아옴 · 내린 화풍 주소 · 기억값은 기본으로. 생성기 세계 그림 · 일상컷 흐름은 구조판 mmorpg2d 대신 기본 화풍(짧은 판)으로 — 머리말 · 화풍 단락 · 얼굴 비율 · 덧붙임 · 노출 · 장면 · 시간대 · 자세 · 표정 · 끝 줄, 일상컷의 시간대 · 머리 · 노출 축 · 소품, 파일 이름 fe-steel-sword_mecha_<기본>_f(_casual1).webp, 참고 그림 줄(등록부의 기본 화풍 칸)
- tests/prompt-element.cjs — 손대지 않음: 이번 일 전부터 「og steampunk 낱말 868」(한도 850)로 멈춘다(git stash 로 확인 — 앞선 다른 커밋 탓)

## 2026-11-11 · gpt · 은 선택 세계컷과 일상컷 도감 등록
- data/img.json — 판타지 3 · 스팀펑크 4 · 메카 3 및 세계별 일상컷 여섯 장, 총 21장을 등록 도구로 반영. 생성·참고 원본 해시와 검수 기록은 그림 저장소 records/ag 에 보존.

## 2026-11-11 · claude · 얼굴 낱말 — 사실형 눈 · 광대 말 빼기
- 사용자 「원소공방은 지금 화풍 놔둬도 되겠다. 설계가 문제 였나봐」 → 「응 적용해줘」 — 화풍공방에서 철 판타지를 원래 · 얼굴 말 뺀 판으로 견줘 보니 뺀 쪽 질감이 낫다고 봄(한 장씩)
- lib/prompt-spec.js 공통 낱말: eye_size.medium 「moderately sized, realistically proportioned eyes」 → 「medium-sized eyes」(50명), age.late_20s 「with defined cheekbones」 빼기(26명), age.early_30s 「with defined cheekbones and jaw」 빼기(17명). 한글 이름표도 같이. prompt-spec ?v=23. 올린 그림 · 기록은 그대로, 새 지시문부터
- 검사: look-spec · casual-plan · screen · words · element-design 통과. prompt-element 는 이 수정 전부터 「og steampunk 낱말 871」(한도 850)로 걸려 있었다 — 이 수정 뒤 868, 손대지 않음

## 2026-11-11 · gpt · 칼슘 세계컷 선택 및 일상컷 등록
- data/img.json — 선택한 세계컷(판타지 3 · 스팀펑크 2 · 메카 2)과 세계별 일상컷 여섯 장, 총 21장을 등록기로 추가.
- 그림 및 검수 기록은 element-atelier-img의 records/ca/에 보존. 세계 간 자세·장소 중복과 생성 구도 차이는 기록하고 재생성하지 않음.

## 2026-11-11 · gpt · 금 세계컷 선택 및 일상컷 등록
- data/img.json — 선택한 판타지 1번·스팀펑크 3번·메카 2번과 세계별 일상컷 여섯 장(총 21장)을 등록기로 추가. 기존 그림과 기록을 보존.

## 2026-11-11 · gpt · 염소 세계 선택 3·4·3 및 일상컷 등록
- data/img.json — 판타지 3번·스팀펑크 4번·메카 3번 세계컷과 각 세계의 일상컷 6장, 총 21장을 표준 등록기로 추가했다. 실제 생성 프롬프트·참고 원본 해시·자유 의상·검수 차이는 그림 저장소 records/cl에 기록했고, 생성 완료된 그림은 임의 재생성하지 않았다.

## 2026-11-11 · gpt · 우라늄 세계 선택 3·1·3 및 일상컷 등록
- data/img.json — 판타지 3번·스팀펑크 1번·메카 3번 세계컷과 각 세계의 일상컷 6장, 총 21장을 표준 등록기로 추가했다. 실제 생성 프롬프트·참고 이미지 해시·검수 차이·이미지 미반환 차단과 노출 단계 조정 기록은 그림 저장소 records/u에 보존했다.

## 2026-11-11 · gpt · 오가네손 재작업 — 세계 선택 4·3·2
- 선택한 판타지 4번·스팀펑크 3번·메카 2번 세계컷과 이를 기준으로 생성한 일상컷 18장을 교체. 그림 저장소 records/og에 실제 프롬프트·참고 이미지 해시·검수 결과를 남기고 records/replacement.json에 이전 파일 해시와 커밋을 보존했다. 도감 등록 파일명은 기존 21개를 유지한다.

## 2026-11-10 · claude · 우라늄 색감 — 검정 · 은 · 에메랄드 초록, 초록 머리 · 구릿빛 피부 뺌
- 사용자 「원소공방 우라늄 색감을 이렇게 바꾸자. 초록머리랑 까만피부 빼고」(검은 드레스에 은 세공 · 초록 수정 · 회색 머리 · 흰 피부 그림)
- data/element-design.json 나라 u — 머리 uranium_green → lead_silver(은빛 도는 짙은 납회색) · 피부 bronze → porcelain · 눈 cherenkov_blue → emerald(그림처럼). 팔레트 「deep black, polished silver, uranium-glass emerald-green glow, a touch of Cherenkov blue」(노랑 · 경고 검정 뺌). 메카 design · 구조판(판타지 · 스팀펑크 · 메카) 색 · 소재 · 상의 · 하의 · 신발 · 액세서리 · 장면 팔레트를 검정 · 은 · 에메랄드로(노랑 · 금 · 연초록 · 크림 · 민트 뺌). 배경 장면은 그대로
- lib/look-spec.js · tools/port-look-spec.cjs 머리색 lead_silver, lib/prompt-spec.js 한국어 말. 생성기 스크립트 판 올림
- tests/screen.cjs 는 이 변경 전 코드에서도 갤러리 칸(.g-tile)을 기다리다 멈춘다 — 이 변경과 따로

## 2026-11-10 · claude · 세계컷 카메라는 얼굴 높이 · 향수 표정 시선은 눈높이
- 사용자 「세계컷 만드는중인데 그 고개를 뒤로 젖히다보니 일상컷도 다 고개를 젖히거나 하관이 길어지게 나와」(오가네손) — 고개를 젖히라는 말은 없었고, 가슴 높이 카메라(얼굴을 아래에서 올려다봐 턱 밑 · 긴 하관)와 오가네손 기본 표정 향수의 「gaze past the camera」(시선이 위로 가며 턱이 들림)가 겹쳤다. 일상컷은 그 세계컷을 첨부해 얼굴 각도가 따라갔다
- lib/prompt-spec.js composition(모든 세계컷) — 「Camera at chest height」 → 「Camera level with her face …; her head level, chin neither raised nor tucked …5755 tokens truncated… 옆을 보는 시선) → nostalgic(카메라 너머 아련한 시선). 쓸쓸함은 인상 melancholic · 홑꺼풀 긴 눈 · 처진 눈꼬리로 남긴다.
- 시험(판타지 기본 화풍 세계 그림 둘 + 같은 장면 근접 일상컷 — 일상컷 표정도 nostalgic): 얼굴이 덜 길고 고개가 수평. 이미 그린 그림 · 비교 묶음은 그대로.

## 2026-11-07 · claude · 일상컷 얼굴 길이 — 모든 화풍
- 사용자 「원소공방에는 일상컷 근거리때 얼굴길이 줄이는게 없나?」 → 「응 적용해줘」 — 구조판(mmorpg2d · semireal)만 STRUCT.casual.faceLock 이 있었고, 영어 틀 · kv 판 일상컷의 FACE 줄(REF_FACE)엔 길이 말이 없었다.
- lib/prompt-element.js REF_FACE 끝에 한 문장 — 같은 짧은 중안부 · 하관 길이 · 얼굴 가로세로 비율, 카메라 각도 · 자세 · 앞머리 · 머리 장식이 얼굴이나 하관을 길게 · 턱을 무겁게 만들지 않게(삼국지 공방의 두 문장을 겹침 없이 줄임). 구조판 일상컷은 그대로.
- 검사 prompt-element.cjs — 화풍마다 일상컷에 길이 문장, 일상컷 길이 상한 1200 → 1250 낱말(가장 긴 것 1212). prompt-element.js v15.

## 2026-11-07 · claude · 화풍 비교 둘째 묶음 — 오가네손
- 사용자 「오가네손으로도 만들어줘. 일상구도는 다르게해서」 — 묶음 2026-11-07-2: 오가네손(og)을 화풍 여덟으로 세계 셋 × 세계 그림 · 근접 · 원거리, 72장(그림 저장소 style-test/compare/2026-11-07-2/).
- 일상컷 장면은 수소 묶음과 장소 · 자세가 겹치지 않게(계획기 og --slots 6~10, seed 5 · 13 · 29 에서 뒷모습 · 수소에 쓴 장소 · 자세 · 노출 큰 의상 빼고 세계마다 근접 · 원거리 하나). 필터 거절 없음.

## 2026-11-07 · claude · 화풍 비교 첫 묶음 — 수소
- 사용자 「수소로 해줘」 — 묶음 2026-11-07: 수소(h)를 화풍 여덟(기본 mmorpg2d + 삼국지에서 옮긴 일곱)으로 세계 셋 × 세계 그림 · 근접 일상컷 · 원거리 일상컷, 72장(그림 저장소 style-test/compare/2026-11-07/, 등록 아님).
- 일상컷 장면은 화풍끼리 같게(계획기 h --slots 6~10 에서 세계마다 근접 · 원거리 하나 — 판타지 원거리는 seed 11). 애니 광택 판타지 원거리는 필터 거절 둘 뒤 노출 low 로.

## 2026-11-07 · claude · 삼국지 공방 화풍 일곱 · 생성기 화풍 고르개 · 화풍 비교 탭
- 사용자 「원소공방에도 지금 삼국지 공방에 있는 화풍들추가랑 화풍탭 추가해줘」.
- data/style.json — 영어 틀 kr_mmorpg · glossy_kr_game(삼국지 글 그대로), kv 판 kv_kmmo_lock · kv_kmmo_23d · kv_jp_mobile · kv_jp_paint · kv_anime_gloss(머리말 · STYLE · 장르 이름 · 끝 줄, GENRE LOCK 은 판타지 · 스팀펑크 · 메카로, 일본 판 끝 줄의 「글자 없음」 은 원소 기호 · 번호를 허락하게). 기본 화풍은 그대로 mmorpg2d.
- lib/prompt-element.js — build 의 영어 틀을 worldLines(칸 붙은 줄)로 떼고 build 는 그대로 이음(옛 판 1425 지시문 글자 하나 안 바뀜 확인), buildKv 가 그 줄을 CHARACTER · COSTUME AND EQUIPMENT — 장르 · POSE AND SETTING 으로 묶는다. 일상컷은 판의 casualSkin(23d · lock · 애니 광택)을 싣는다.
- 생성기 — 화풍 고르개(맨 위 기본, 주소 ?style=, 기기에 stylePick). 화풍 탭 — styles.html · data/style-compare.json(빈 묶음 — 아직 그림 없음) · tools/style-compare.py(next · put · sync · check, 세계 fantasy · steampunk · mecha), 항해 PAGES 에 styles. IMAGE_RULES 끝 절.
- 검사 — prompt-element.cjs(옮긴 화풍 1200 + 영어 틀), screen.cjs(화풍 탭 · 생성기 고르개), tests/style-compare.py. 판 번호 words v12 · workspace-ui v4 · prompt-element v14 · studio v3.

## 2026-11-06 · claude · 세계 그림 카메라 기본 — 수평 3/4
- lib/prompt-spec.js — 구조판 4절 카메라 기본 글: 낮은 시점(low angle) → 얼굴 높이 수평(eye-level) · 턱 수평 · 얼굴에 올려다보는 원근 없음 · 완만한 3/4. 올려다본 기본 그림을 일상컷이 붙이면 하관이 길고 턱이 무겁게 따라갔고, 정면 기본 그림은 일상컷 고개 각도를 굳혔다(포켓몬 갸라도스 시험 — 옛 · 수평 정면 · 수평 3/4 비교). 사용자 「수평 정면 3/4 구도를 기본으로 하자」
- data/element-design.json — 헬륨 · 규소 세 세계 손글 칸 「카메라」 도 같은 글로

## 2026-11-06 · claude · 원소 기호 · 번호는 여러 곳에 나와도 된다
- lib/prompt-spec.js — 구조판 액세서리 기본 글에서 「한 번씩만」 을 뺐다. 본인 원소 기호 · 번호 말고 다른 글자만 금지(배경 끝 문장 그대로). 헬륨 메카(mmorpg2d)에서 탱크에 "He" "2" 가 여러 번 찍힌 것을 보고 사용자 「이름을 알 수 있어서 더 좋은거 같아」 · 「본인 원소 기호 외 금지가 날거 같은데」

## 2026-11-06 · claude · 기본 화풍 mmorpg2d(2D 한국 MMORPG 구조판) · 일상컷 얼굴 고정
- data/style.json — 화풍 `mmorpg2d` v1 을 더하고 기본으로. `semireal` 과 같은 구조판(공통 적용 규칙 · 일상컷 규칙 · 2~4절 칸 · 카드 손글 칸)이고 1절 작화 고정만 2D 한국 MMORPG 공식 캐릭터 일러스트(색 선화 · 여러 겹 칠 명암 · 3D 렌더 · 실사 · 반실사 피부 결 금지)로. 사용자 「원소공방도 이그림체로 하자」. 옛 화풍 그림은 그 열쇠로 도감 고르개에 남는다
- lib/prompt-spec.js · lib/prompt-element.js — 일상컷 구조판에 얼굴 고정: 일상컷 규칙 끝에 「카메라 · 자세가 아래 얼굴을 길게 · 턱을 무겁게 만들지 않는다」 영어 문장, 1절 NEGATIVE 줄 끝에 「face lengthened by the camera angle, heavy jaw」(세계 그림 1절은 그대로). 사용자 문장 그대로
- tests/prompt-element.cjs — 파일 이름 검사가 기본 화풍 열쇠를 따르고, 일상컷 머리에 얼굴 고정 · 세계 그림엔 안 실림
- AGENTS.md · IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md — 기본 화풍 mmorpg2d

## 2026-11-04 · claude · 근본 열세 나라 손글 칸(구조판 3 · 4절)
- data/element-design.json — 철 · 수소 · 산소 · 탄소 · 나트륨 · 금 · 오가네손 · 황 · 염소 · 칼슘 · 구리 · 은 · 우라늄 근본의 `struct`(세 세계마다 3절 아홉 칸 · 4절 액션 · 손동작 · 움직임 · 광원 · 팔레트 · 배경 · 효과). 헬륨 · 규소를 본보기로, 판타지 몸통은 불투명 비단(판갑 · 코르셋 없음), 스팀펑크는 광택 · 파스텔 · 보조광(승마 바지 · 망토 · 갑옷 없음), 메카는 설계 문장을 풀어 복부를 덮는다, 배경 끝은 글자 · 두 번째 인물 문장. 2절은 설계표 외형 그대로(자동 한글). 사용자 「근본 원소부터 채워줘」
- lib/prompt-spec.js · lib/prompt-element.js — 스팀펑크 머리 꼬리: 원래 묶는 머리(포니테일 · 땋은 머리 · 반묶음 · 번)엔 「모자·고글 속에 넣지 않음」 만(「풀어 둔 그대로」 가 부딪혔다 — 우라늄 · 오가네손)
- tests/prompt-element.cjs — 받침 검사를 손글 칸 없는 가문주 카드로

## 2026-11-04 · claude · 구조판 2절 · 표정 · 자세 · 시간대를 한글로
- lib/prompt-spec.js — `STRUCT.ko`: 얼굴형 · 눈 · 눈썹 · 코 · 입술 · 눈 색 29 · 머리색 57 · 헤어 24 · 앞머리 · 인상 · 피부 · 눈 크기 · 눈꼬리 · 표식 · 나이감 · 표정 33 · 세계 그림 자세 · 시간대 · 일상컷 시간대 · 머리. 이름 붙은 스타일 용어만 괄호로 영어. 사용자 「한글로 나오게 한 뒤에 손글칸 채우는게 맞을거 같은데」
- lib/prompt-element.js — 구조판 2절 · 표정 · 자세 · 시간대가 한글 표를 먼저 쓰고, 3절 성질은 설계표 `traits.ko`. 체형 칸 뒤 영어 괄호를 뺐다
- tests/prompt-element.cjs — 한글 표 열쇠가 어휘와 같고 괄호 밖은 한글, 2절 칸이 한글 · tests/screen.cjs — 생성기 칸 검사를 한글로
- AGENTS.md — 1-3 기본 글이 한글 표

## 2026-11-04 · claude · 생성기가 구조판 지시문을 짓는다
- lib/prompt-element.js — 화풍 판이 `format: structured` 면 `build` · `buildCasual` 이 구조판(공통 적용 규칙 → 일상컷 규칙 → 1절 → 2~4절 칸)을 짓는다. 칸 값은 기본 글 → 카드 손글 칸(설계표 `struct`) → 직접 고른 외형 · 장면 · 덧붙임 차례. 일상컷은 트리 장면 줄을 칸에 나눈다. 사용자 「생성기부터 손봐줘」
- lib/prompt-spec.js — `STRUCT`: 칸 이름 · 체형 여덟 칸 표(근육 과장 없음) · 세계마다 옷 · 빛 · 효과 기본 글(스팀펑크 광택 · 파스텔 · 승마 바지 없음) · 잇는 말 · 옛 머리말 바꾸기 · 외형 칸 → 2절 칸
- data/element-design.json — 헬륨 · 규소 `struct`(세 세계 2~4절 — 채팅에서 뽑아 검증한 전체본, 헬륨 스팀펑크는 사용자가 뺀 승마 반바지 없이 · 헬륨 판타지 일상컷 `c2` 얼굴 길이 줄)
- tools/element-design.py · tests/element-design.py — `struct` 검사(사는 세계 · 절 · 칸 이름 · 빈 글 · 괄호)
- tests/prompt-element.cjs — 영어 틀 검사는 옛 화풍으로, 구조판 검사(모든 카드 × 세계 · 칸 차례 · 손글 칸 · 설계 외형 · 체형 · 받침 · 고른 것이 이김 · 일상컷 c2 · 검사기 칸 이름) · tests/screen.cjs — 생성기 지시문 검사를 구조판 칸으로
- data/style.json · AGENTS.md · IMAGE_RULES.md — 생성기가 구조판 전체본을 짓는다

## 2026-11-04 · claude · 화풍 열쇠 semireal(반실사 구조 지시문)을 기본으로, 도감에 화풍 고르개
- data/style.json — 새 화풍 `semireal` v1(`format: structured` — 공통 적용 규칙 `rules` · 일상컷 규칙 `casual_rule` · 1절 작화 고정 `section1`(그림 용어 영어 병기) · 2~4절 머리 `sections`, 생성기용 한 줄 `text`), `default` game_keyart → semireal. 사용자 「이런구조로 가자」 → 「화풍키를 둬서 도감에 화풍선택 셀렉트 박스를 넣자. 기존 원소공방 이미지들은 거기서 셀렉트하면 보이는걸로하고, 이걸 기본화풍으로 처음부터 만들거야」
- dex.html — 판 맨 앞에 화풍 고르개(기본 화풍 먼저 · 그 나라 장수). 고른 화풍의 세계 그림 · 일상컷만 보이고 다른 화풍으로 메우지 않는다. 「다른 화풍」 접은 줄은 뺐다. 빈 칸 · 크게 보기의 생성기 링크는 기본 화풍일 때만. 주소 `st=` · 이 기기 저장, 즐겨찾기 link 는 그 그림이 든 화풍으로
- lib/words.js — 화풍 고르개 낱말, 「다른 화풍」 낱말 뺌 · lib/element.css(v8) — 고르개 · 빈 칸
- tests/screen.cjs — 처음은 기본 화풍 · 고르개 차례 · 화풍마다 그 그림만 · 기본 아닌 화풍의 빈 칸은 생성기로 안 감 · 주소 · 즐겨찾기 link 의 화풍
- AGENTS.md · IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md — 기본 화풍 semireal, 도감 고르개

## 2026-11-04 · claude · 원소 화풍 기본을 v2 로 되돌림
- data/style.json — game_keyart current v4d → v2, v2 에 `readopted`(까닭). 사용자 「v2 로 바꿔줘」 — v3 · v4d 는 GPT 세션 · API 어디서도 v2(11-02 금 · 고목, 11-03 헬륨 · 다이아 드릴 API v2)만큼 맞지 않았다. v3 · v4 · v4c · v4d 는 지우지 않고 기록 판으로
- tests/prompt-element.cjs — 기본 판 v2 검사(헬륨 기본 지시문이 v2 문장), v4d 검사는 v4d 로 돌린 판에서
- IMAGE_RULES.md · AGENTS.md — 지금 판 v2, v4d 는 기록 판

## 2026-11-03 · claude · 일상컷 얼굴 · 화풍은 첨부 그림에 맡긴다
- lib/prompt-element.js — 일상컷 지시문 끝에서 refLock: 화풍 문장 → 「STYLE: keep the attached image's rendering exactly …」, 나이 줄 → 「FACE: exactly the face of the attached image …」(없으면 CHARACTER 밑에), 표정 줄 끝에 「눈썹 · 눈꺼풀 · 입꼬리로만」, FINAL CHECK 줄 뺌. 사용자 「일상컷 저거 너무 이상해」 → 「이제 좀 낫네」 → 「응 다 적용해줘」 — 화풍 · 얼굴 문장을 새로 주면 GPT 세션이 첨부 그림의 얼굴을 다시 그렸다(헬륨 메카 일상)
- tests — 일상컷 화풍 · 얼굴 · 표정 줄 검사로 바꾸고 일상컷 낱말 상한을 올렸다
- IMAGE_RULES.md — 일상컷 규칙 한 줄

## 2026-11-03 · gpt · 헬륨 세계·일상 18장 화풍 v4d 교체
- 그림 저장소 img/he_* · records/he/ — 기존 외형·장면·일상 계획을 유지하고 생성기 현재 화풍 v4d로 세계 3장·일상 15장을 교체했다. 일상은 새 세계 그림을 첨부했고, 프롬프트·1024×1536·원본/참고 그림 해시를 대조했다.
- 그림 저장소 records/replacement.json — 이전 WebP·PNG 해시와 새 해시·교체 사유를 보존했다. 의상·크롭·손 좌우·피부 광택 등의 9건은 passed:false로 기록하고 GPT 검수 규칙에 따라 올렸다. 기존 파일·이력을 삭제하지 않았고 썸네일은 변경 원본 --redo 워크플로로 갱신한다.
- data/img.json — 기존 18개 파일명을 유지하므로 등록 변경은 없다. 등록 도구로 기존 연결을 확인했다.

## 2026-11-03 · claude · 원소 화풍 v4d — 반실사 · 3D 쪽으로 넘친 v3 를 되돌림
- data/style.json — game_keyart current v3 → v4d. 선은 아주 가늘게 눈 · 눈썹 · 입술에만, 형태는 칠, 무광 손칠 피부(에어브러시 · 3D 렌더 아님), 색 대비, 배경은 윤곽선 없는 붓칠, 평면 2D · 반실사 아님. v3 얼굴 고침은 남기고 「realistically proportioned eyes」 · 「glossy nude lips」 를 바꿔 적는다. 시험 판 v4 · v4c 는 기록으로. 사용자 「지금은 3d 쪽 실사로 많이 치우친 것 같아. 헬륨이 그 예」 → GPT 세션 · API 시험(헬륨 판타지) → 「v4c도 기존보단 선이 좀 굵어」 → v4d 「응 올려줘」
- tests/prompt-element.cjs — v3 검사는 v3 로 돌린 판에서, v4d 기본 판 · 헬륨 얼굴 낱말 · v3 얼굴 고침 유지
- IMAGE_RULES.md · AGENTS.md · docs/IMAGE_AUTOMATION.md — v4d 와 시험, 검수에 「반실사 · 에어브러시로 넘치지 않았나」

## 2026-11-03 · gpt · 헬륨 세계 그림과 일상컷 등록
- data/img.json — 등록 도구로 헬륨 근본 세계 그림 3장과 일상컷 15장을 추가했다. 다른 카드의 등록은 보존했다.
- 그림 저장소 records/he/ — 생성기 v3 프롬프트, 세계별 일상 계획, 원본 해시와 AI 검수 기록을 함께 남겼다. 계획과 다른 크롭·의상·손 좌우 등의 11건은 passed:false로 기록하고 GPT 작업 규칙에 따라 올렸다.

## 2026-11-03 · claude · 근본 여덟을 설계표에
- data/element-design.json — 보관해 둔 나라 여덟(헬륨 · 규소 · 황 · 염소 · 칼슘 · 구리 · 은 · 우라늄)을 nations 끝에. 사용자가 초안 표를 보고 「이미지는 자동으로 그릴게」 — 세계 그림 스물넷은 자동 그리기가 그린다. 가문 · 주민은 아직(근본이 다 선 뒤)
- docs/held/element-roots-8.json — 걷었다 · docs/ELEMENT_CONCEPT.md 2절 — 설계 중 → 넣음

## 2026-11-03 · gpt · 다이아 드릴 화풍 v3 그림 등록
- data/img.json — 수정된 생성기 화풍 v3로 새로 만든 다이아 드릴 세계 2장·일상컷 10장을 등록기로 추가. 기존 등록 항목 유지.

## 2026-11-03 · claude · 근본 여덟 설계 초안(보관) · 외형 어휘 늘림
- docs/held/element-roots-8.json — 헬륨 · 규소 · 황 · 염소 · 칼슘 · 구리 · 은 · 우라늄 나라 여덟(성격 · 성질 · 팔레트 · 손 물건 · 세 세계 장소 · 장면 셋씩 · 메카 설계 · 외형). 사용자 「근본 원소부터 설계해서 채워놓고」 · 「우라늄까지」 · 「헬륨까지」. 확인 받기 전이라 설계표 밖 — 임시로 합쳐 검사기 오류 0(경고는 가문 없음 여덟) · 외형 표 · 지시문 24장 조립을 봤다
- tools/port-look-spec.cjs · lib/look-spec.js — 머리 윤곽 열넷 · 눈 색 열하나 · 머리색 일곱 더함. 사용자 「머리 스타일이나 눈색이 부족하면 더 추가해도 괜찮아 … 머리스타일은 지금 수가 제한적이라 계속 돌려쓰는 추세」. 기존 카드 87 · 지시문 216 은 그대로(대조)
- docs/ELEMENT_CONCEPT.md 2절 — 근본 여덟 표(나눌 물질 후보 메모), 늘린 어휘

## 2026-11-02 · claude · 연필 주민 세계 메모(연필촉 머리장식) · v3 「스케치 아님」 뜻 고침
- data/element-design.json — 연필(c-graphite-pencil) notes 세 세계: 판타지 연필촉 왕관 · 삼나무 결 띠, 스팀펑크 연필촉 모자 · 놋쇠 띠 · 삼나무 결 판, 메카 등의 연필촉 핀 둘 · 머리띠 볏 · 삼나무 색 장갑 테. 사용자 「다시 그리기는 연필만」 → v3 로 세 장을 뽑으니 얼굴은 2.5D 인데 연필촉이 다 빠졌다(예전 v2 그림의 연필촉은 지시문에 없던 모델의 즉흥) → 「1,2 하고 세계 이미지 다시 만들어보자」. 메모를 넣고 뽑으니 셋 다 돌아왔다
- data/style.json — v3 세계 그림 문장에 잠깐 더했던 「물건 대표 모양을 굵게」 한 마디는 효과가 없어(2차 셋 다 빠짐) 걷었다. 「스케치 · 선그림 아님」 은 「그림 자체가」 로 — 연필 · 흑연처럼 그리는 도구가 주제인 카드의 연필 요소까지 누르지 않게
- tests/prompt-element.cjs — 길이 상한 5100

## 2026-11-02 · claude · 화풍 v3 에 놀람 표정 낮추기 · FACE 끝 한 마디(v3b)
- data/style.json — game_keyart v3 에 expr(놀람 → 「입술만 살짝 벌림」)과 face_tail(「치비 · 모에 애니 얼굴 아님」). 사용자 「2번은 넣어주고」(성냥 메카 v3b 시험 — v3 보다 눈이 줄고 입이 작아졌다). v3 로 그린 그림이 아직 없어 같은 판에 더했다
- lib/prompt-element.js — styleVer · exprText: 세계 그림 기본 표정 · 일상컷 EXPRESSION 이 판의 expr 를 먼저, 설계 얼굴이 있는 FACE 줄 끝에 face_tail
- tests/prompt-element.cjs — 성냥 v3 놀람 · FACE 끝 · v2 는 그대로, 기본 표정 검사가 판의 expr 를 따른다, 길이 상한 5000(화풍 v3 문장 · FACE 끝)

## 2026-11-02 · claude · 화풍 game_keyart v3 — 평면 2D 로 나오던 것 보정(문장 · 얼굴 낱말)
- data/style.json — game_keyart v3(current). 사용자 「원소 공방 화풍이 2d 식으로 나오는 경우가 가끔 있어서 … 연필그림도 그렇고 몇몇개가」 · 「나트륨쪽도」 · 「성냥도」 → 시험 → 「추천대로 진행해줘」. 윤곽선은 옅은 색선, 얼굴은 코 · 광대 · 입술 · 턱 입체 명암, 밝은 장면에서도 얼굴 그림자, 「평면 셀 2D 애니 · 스케치 · 실사 아님」. face 칸 — 귀여움 · 큰 눈 · 둥근 큰 눈 · 단추코 · 들창코 · 홍조를 지시문에서만 바꿔 적는다. v2 · v1 은 남는다
- lib/prompt-element.js — styleFace(현재 판의 face), faceItems 가 그 글을 먼저 쓴다(세계 그림 FACE 줄). 옛 판엔 face 가 없어 옛 지시문 그대로
- tests/prompt-element.cjs — 얼굴 줄 검사가 판의 face 를 따른다 · v3 문장 · 적혈구 v3 얼굴 낱말 · v2 로 돌리면 옛 지시문 · 나트륨 둥근 눈
- IMAGE_RULES.md 1절 얼굴 설계 · docs/IMAGE_AUTOMATION.md 4절 검수(화풍이 2.5D 인가) · AGENTS.md 파일 표 — 까닭과 시험(적혈구 · 성냥 메카 여섯 장), 2D 세계 그림의 카드는 세계 그림부터

## 2026-11-02 · gpt · 나뭇잎 이미지 등록
- 나뭇잎(o-wood-leaf)의 세계 그림 3장과 세계별 일상컷 5장씩 총 18장을 생성하고, WebP·생성 지시문·계획·원본 및 참고 해시·AI 검수 기록을 그림 저장소 4aa64ee에 반영했다.
- 프레이밍·손 좌우·의상·장식·배경 등 계획과 다른 부분은 개별 qa.passed=false로 보존했다. 메카 일상3의 출력 필터 거절 및 동일 지시문 재시도 성공을 기록했다.
- 셸 Git push 인증이 없어 연결된 GitHub 앱으로 기존 main의 후속 커밋을 추가했다. 도감은 그림 등록 자동화로 반영한다.

## 2026-11-02 · gpt · 다이아 반지 이미지 등록
- 다이아 반지(c-diamond-ring)의 세계 그림 3장·세계별 일상컷 5장씩 총 18장을 생성하고 WebP·생성 지시문·계획·참고 및 원본 해시·AI 검수를 그림 저장소 c3ee937에 기록했다.
- 손 좌우·구도·문자·의상 등 계획과 다른 12컷은 qa.passed=false로 보존했다. 자동화 규칙 0·4절에 따라 임의 재생성 없이 게시했다. 도감은 그림 등록 워크플로로 반영한다.

## 2026-11-02 · gpt · 염전 이미지 등록
- 염전(na-salt-saltpan)의 세계 그림 3장·일상컷 15장을 추가하고 생성 지시문·계획·원본 해시·AI 검수를 그림 저장소에 기록했다.
- 판타지 일상2 추가 팔과 의상·좌우 손·구도 등의 계획 불일치를 qa.passed=false로 남겼다. 자동화 규칙 0·4절에 따라 재생성 없이 게시했다.

## 2026-11-02 · gpt · 장신구 가문주 — 세계 그림 셋과 세계별 일상컷 다섯 장
- data/img.json — au-jewel 의 판타지·스팀펑크·메카 세계 그림 3장과 일상컷 15장을 그림 등록 워크플로로 등록. 그림 저장소 edfd1fd, 썸네일 18장 자동 생성·등록 검사 통과. 원본 PNG 없이 WebP·프롬프트·참고 해시·AI 검수·필터 재시도를 기록했고, 계획과 다른 구도·손 좌우·장식·배경 문자 등 7컷은 검수 실패를 그대로 남김.

## 2026-11-02 · claude · 공용 트리 모듈 복사 — 코스튬 컷의 안 쓰는 프레이밍 칸
- lib/casual-tree.js · lib/casual-tree-v2.js — 공용 트리 모듈(game 원본)을 그대로 복사. 표에 costume_required.not_frames 가 있으면 그 옷 계열 컷에 그 프레이밍을 안 쓴다(이유 code costume). 이 공방 표엔 그 칸이 없어 동작은 그대로

## 2026-11-02 · claude · 전시관 움직임 — 그림이 날아와 커지고, 가문 이름표가 핵에서 퍼진다
- Motion 작은 판(lib/vendor/motion-mini.mjs, animate + spring 압축 5KB)과 lib/motion-fx.js 를 sam-atelier 와 같이 두고(사용자 「갤러리 쪽 모션을 더 다듬기」 → 「둘 다 붙여줘」), 뷰 전환 대신 누른 그림 한 장만 움직인다(FLIP).
- 섬의 카드를 누르면 그 자리에서 궤도 무대가 커지고, 가문 이름표가 핵에서 튀어나와 궤도 자리로 차례로 퍼진다. 이름표 · 가운데를 누르면 미리 보기 그림이 거기서 날아와 커지고, 크게 보기 · 주민 보기는 미리 보기 그림에서 이어진다. 주민 액자는 차례로. 폰 흉내로 세계 바꾸기 0.11초 · 미리 보기 0.13초 그대로.
- tests/screen.cjs — 시험 서버가 .mjs 를 자바스크립트로 내준다.

## 2026-11-02 · claude · 전시관 폰 — 미리 보기 · 한 장의 그림을 위로
- 미리 보기 판을 화면 아래에서 위로 붙이고(맨 위 10px), 한 장 보기의 「닫기」를 그림 위 모서리로 올려 그림이 위 막대 바로 아래에서 시작(사용자 「모바일에서 이미지 뜨는 위치를 조금 더 위로」).
- 층이 바뀔 때의 움직임이 끝난 뒤에도 남아(fill both) 미리 보기 · 닫기의 고정 자리가 그 층에 갇혀 아래로 밀리고 위 막대 밑에 깔리던 것도 함께 — 움직임은 시작 쪽만 채운다(backwards).

## 2026-11-02 · claude · 전시관이 느리던 것 — 뷰 전환을 빼고 가벼운 움직임으로
- 폰 흉내(CPU 4배 느리게 · 이미지 지연)로 재니 세계 바꾸기 3.7초 · 궤도 화면 4.2초 — 뷰 전환(화면 전체를 찍어 섞기)이 한 번 돌면 끝날 때까지 터치를 붙잡았다(사용자 「여기만 화면 로딩이랑 전환이 느리다」).
- 뷰 전환을 빼고 층이 바뀌면 살짝 커지며 나타나는 CSS 움직임(투명도 · 크기만), 세계를 바꾸면 새 그림이 깔린 썸네일 위로 스르르. 점선 고리는 통째로 돌리고, 빛 점은 그림자 대신 퍼지는 고리로, 흐림(backdrop-filter)은 다 걷고 궤도 그림의 가장자리 흐림은 그림 층에만. 한 장 보기는 다른 세계 그림을 미리 받는다.
- 같은 조건에서 첫 화면 1.7초 → 0.43초, 궤도 화면 4.2초 → 0.2초, 세계 바꾸기 3.7초 → 0.11초.

## 2026-11-02 · claude · 전시관 나라 층 — 원소마다 궤도 그림 · 이름표 → 미리 보기 → 크게 보기
- 폰에선 궤도 선을 숨기고 그림만 쌓아 원자 느낌이 사라졌다(사용자 「모바일에서는 이펙트가 안 보인다 — 궤도 이미지를 원소별로, 텍스트로만, 누르면 큰 이미지, 거기서 크게 보기」).
- 원소마다 궤도 그림 한 장 생성(일곱, 그림 저장소 backgrounds/orbits/ — 가운데 원소의 핵, 큰 고리 하나). 그 위엔 글자만 — 가운데 원소 이름, 큰 고리 위에 가문 이름표(빛 점이 숨 쉬듯, 점선 고리가 천천히 돈다 · 움직임 줄이기면 멈춤). 고리 반지름은 그림마다 재서 기록 ring 과 gallery.html RING 에.
- 이름표를 누르면 미리 보기(큰 그림 · 이름 · 설명) — 「크게 보기」는 한 장, 가문주는 「주민 n 보기」로 가문 층. 폰에선 아래에서 올라오는 판. PC 도 같은 구조.

## 2026-11-02 · claude · 화면이 늦게 뜨던 것 — 글꼴을 쓰는 것만 · 그리기를 막지 않게
- 모든 화면이 제목 글꼴 넷(Song Myung · Hahmlet · Orbit · Black Han Sans)을 한꺼번에 받아 글꼴 목록만 514KB, 그걸 받기 전엔 화면이 안 그려졌다(사용자 「화면 로딩이 엄청 느린데」).
- 제목 글꼴은 lib/workspace-theme.js 가 지금 공간의 것 하나만 붙이고, 본문 글꼴은 400 · 700 두 굵기만, 글꼴 줄은 전부 그리기를 막지 않게(media=print → onload). 전시관의 큰 그림은 원본이 오는 동안 썸네일을 먼저 깐다. 주기율표 첫 그리기 1.0초 → 0.2초, 받는 글꼴 1.1MB → 0.7MB.

## 2026-11-02 · claude · 전시관 — 감상용 화면(섬 → 나라 궤도 → 가문 → 한 장)
- gallery.html · lib/gallery.css 새로. 도감은 그림을 채우는 작업 화면(빈 칸 → 생성기 · 장 수)으로 두고, 그려진 카드만 거는 감상 화면을 따로(사용자 「감상용 디지털 아카이브 — 레이어 줌인 · 원형 구조」).
- 층: 섬(그림 걸린 나라) → 나라(가운데 근본, 둘레 궤도에 가문주 — 원자와 전자, 나라 글 · 이 세계의 나라 글 · 성질) → 가문(가문주 크게 · 주민은 공간의 장식 틀 액자) → 한 장(화면 가득 · ← → 세계 · 밀기 · Esc). 세계 셋은 위 막대에 늘 — 바꾸면 같은 카드가 그 세계 그림으로 이어 바뀐다(뷰 전환, 움직임 줄이기면 끈다).
- 그림은 세로 2:3 그대로(가로로 자르지 않는다), 사실 칸은 elements 의 것만(지어낸 수치 없음). 그 세계 그림이 없는 카드는 다른 세계 것을 「…의 그림」 표시로. 주소 ?n=&f=&c=&w=&v=1, 층마다 뒤로 가기 · 한 장을 닫으면 뒤로. 머리 메뉴 · 타이틀 메뉴에 「전시관」(타이틀은 강조 단추).

## 2026-11-02 · claude · 공간 다섯의 장식 틀
- 공간마다 생성한 장식 틀 한 장(실험실 크롬 관 · 유리 플라스크 / 천문대 황동 아스트롤라베 / 연금술 구리 · 리벳 · 호박 전구 / 광산 갱도 목재 · 쇠 꺾쇠 · 광석 / 제어실 금속 베젤 · 초록 LED)을 9칸 틀로 섹션 · 프롬프트 판 · 결과 · 패치 · 공간 고르기 · 나라 카드 · 머리 메뉴에(사용자 「응 장식 틀도 만들어줘」, sam-atelier 와 같은 방식).
- 그림의 투명 여백을 잘라내야 판 바탕이 틀 밖으로 삐져나오지 않는다 — 잘라낸 틀로 변 두께 · 모서리를 재서 자르기 %. 틀 안 글이 장식에 걸리지 않게 판 안쪽 여백을 28 · 30px(폰 26 · 22px)로. 「배경 끄기」 면 틀도 끈다.

## 2026-11-02 · claude · 전체 화면 점검 반영(frontend-design · ui-ux-pro-max)
- 주기율표: 폰에서 15px 이던 칸을 44px 로 두고 옆으로 밀기(오른쪽 끝 흐림), 원자 번호 7px → 10px, 칸 글꼴 고정폭 → 본문 글꼴 고른 폭 숫자. 첫 묶음 나라 카드는 카드 전체가 그 나라 도감 길. 머리말 위 작은 「원소의 공방」 표시 뺌.
- 도감: 폰 단추(보기 · 세계 · 바로 가기 · 나라 · 일상컷 펼치기)를 44px, 붙는 판은 비치는 막, 거르기 줄 오른쪽 끝 흐림, 「나라 설명」 펼침 표시(▸), 원소 기호는 공간의 제목 글꼴, 빈 칸 · 원소 표시 10~11px 고정폭 → 12px 본문 글꼴.
- 프롬프트: 판 · 결과에 카드 바탕(글이 배경 장면 위에 바로 앉던 것), 폰 붙는 단계 줄은 내려 읽을 때만 막, 「? 설명 보기」, 빈 단계는 「—」 대신 이름, PC 왼쪽 줄 맞춤, 손가락 크기. 공통: 폰 머리 메뉴 12px · 머리 설명 한 줄, 공간 고르기 · 패치 기록 단추 44px, 타이틀 작은 글씨 12px.

## 2026-11-02 · claude · 타이틀 화면 — 배경 장면 가득 · 그림 현판·단추, 옛 첫 화면은 주기율표(hall.html)로
- index.html 을 게임 첫 진입 화면처럼 — 공간 배경 장면을 화면 가득, 공간 다섯마다 생성한 투명 그림 한 벌(현판 · 주 단추 · 보통 단추 · 둥근 단추, 그림 저장소 backgrounds/ui/)로 메뉴 셋(주기율표 · 도감 · 프롬프트, 머리 메뉴 차례), ◀ ▶ · ← → 공간 넘기기, 빈 곳 누르면 배경만(사용자 「메인화면 구성을 지금 삼국지처럼」 — sam-atelier 의 타이틀을 옮김).
- 옛 첫 화면(주기율표 118 · 첫 묶음 · 패치 · 공간)은 hall.html(머리 메뉴 「주기율표」)로 내용 그대로. lib/material.css 새로 — 그림 단추 변수와 공간별 제목 글꼴(실험실 · 제어실 Orbit · 천문대 Hahmlet · 연금술 Song Myung · 광산 Black Han Sans).
- 디자인 점검 skill 셋(frontend-design · ui-ux-pro-max · web-design-guidelines)을 .claude/skills 에 설치(AGENTS 「꾸밈 · 글꼴」).

## 2026-11-02 · gpt · 황토 안료 12장 등록
- data/img.json — 등록 스크립트로 판타지·스팀펑크 세계 그림과 세계마다 일상컷 다섯 장을 추가했다. 기존 등록·날짜는 보존했다.

## 2026-11-02 · gpt · 잠수 헬멧 6장 등록
- data/img.json — 등록 스크립트로 스팀펑크 세계 그림과 일상컷 다섯 장을 추가했다. 기존 등록은 보존했다.

## 2026-11-02 · gpt · 바다 18장 등록
- data/img.json — 등록기로 o-water-sea 판타지·스팀펑크·메카 기본컷 3장과 세계별 일상 5장씩을 추가하고 기존 등록·날짜를 보존했다.
- 그림 저장소 records/o-water-sea/ — 생성기 원문·일상 계획·원본 및 참조 해시·AI 검수를 기록했다. 일상 6장의 손 좌우·다리·시선·자세 차이는 검수 실패로 남겼다. 18장 모두 1024×1536 WebP이며 양팔 연결을 검수했다.

## 2026-11-02 · gpt · 탄소의 나무 가문주 18장 등록
- data/img.json — 등록기로 판타지·스팀펑크·메카 세계 그림 3장과 세계별 일상컷 5장씩을 추가했다. 기존 766장의 등록과 날짜는 보존했다.
- 그림 저장소 records/c-wood/ — 생성기 원문, 세계별 일상 계획, 원본·참조 해시와 AI 검수를 기록했다. 구도·손 좌우·기준 의상 잔류의 차이는 실패 항목으로 남겼으며, 메카 일상1은 같은 지시문 재시도에서 생성됐다.

## 2026-11-02 · gpt · 탄소의 기름 가문주 그림 18장 등록
- data/img.json — 자동 등록으로 c-oil 판타지·스팀펑크·메카 세계 그림 3장과 세계별 일상컷 5장씩 총 18장을 연결했다.
- element-atelier-img의 records/c-oil — 생성기 원문·트리 계획·참고 원본 해시·검수를 보존했다. 세계·의상·손 좌우·프레이밍 불일치는 검수 실패로 표시했다.
- element-atelier-img의 img/c-oil_steampunk_game_keyart_f_casual4.webp — 0바이트 변환 오류를 동일 원본 PNG에서 재변환해 복구했다. 18장 전체 디코딩, 크기·이름·일상 묶음 검사와 자동 썸네일 성공을 확인했다.

## 2026-11-01 · gpt · 탄소의 불 가문주 그림 18장 등록
- data/img.json — 그림 등록 자동화로 c-fire 판타지·스팀펑크·메카 세계 그림 3장과 각 세계 일상 5장(총 18장)을 등록했다.
- element-atelier-img의 records/c-fire — 생성기 원문·트리 계획·참고 이미지와 원본 해시·검수를 보존했다. 손 좌우·구도·장식 잔존과 메카 일상5의 추가/분리 팔은 검수 실패로 기록했다.
- element-atelier-img의 img/c-fire_steampunk_game_keyart_f_casual5.webp — 0바이트 저장 오류를 같은 원본 PNG로 재변환해 복구했다. 새 이미지 생성이나 기존 작업 삭제는 없다.

## 2026-11-01 · claude · 「난간에서 돌아보기」 빼기 — 뒷모습으로 돌아보며 얼굴 · 머리에 손 안 대기
- data/casual-tree-v2.json — 자세 추천 rail_lookback(뒤 3/4 · 어깨 너머 · 오른손 난간 · 왼손 머리 넘기기)을 뺐다. 좌우 · 팔 줄을 적은 시험 세 장도 사용자가 「아니 지금도 이상해. 그냥 지금 구도는 갈래에서 없애줘」
- lib/casual-tree-v2.js(공용) — 몸이 뒤쪽(far)이고 머리가 어깨 너머(look_back)면 얼굴 · 머리에 대는 손(zone face)을 못 고른다(why lookback — 화면 · 랜덤 · 계획기가 같이 막는다). backLook 은 팔 줄 없이 왼쪽 어깨 · 손의 화면 쪽만. 예전 기록의 그 손은 다시 검사(repair)가 비운다
- tools/casual-tree-v2.py — 추천이 그 조합이면 건다
- lib/words.js — 못 고르는 까닭 낱말 lookback. 생성기 캐시 번호 올림

## 2026-11-01 · claude · 뒷모습 돌아보기 — 돌아보는 어깨 · 손의 화면 쪽 · 얼굴 손의 팔
- lib/casual-tree-v2.js(공용, game 원본 · book · element · pkm 같은 파일) — backLook: 몸이 뒤쪽(far)이고 머리가 어깨 너머(look_back)면 돌아보는 어깨를 얼굴에 닿는 손(zone face)의 쪽으로(없으면 왼쪽) 정하고, 손 줄에 붙일 화면 쪽 말과 얼굴 손의 팔 줄을 준다. 「어깨 너머」 만 적으니 모델이 아무 쪽으로 돌렸고 뒷모습에서 「her own right hand」 를 자주 뒤집어, 얼굴 쪽과 반대 팔이 귀를 만지려 머리 뒤를 가로질렀다(element 「난간에서 돌아보기」 — 사용자 「지속적으로 뒷태에서 머리 만지는 컷이 팔 구조 해석이 잘못됐는지」). 시험 세 장(o-blood 메카 일상1 두 번 · c 판타지 일상1)에서 팔이 같은 쪽 어깨에서 올라갔다
- lib/prompt-element.js — COMPOSITION 의 머리 말을 「her own left shoulder — the shoulder on the image's left side」 로, 손 줄 끝에 「on the image's … side, since her back is to the camera」, 얼굴 손이면 ARM 줄(같은 쪽 어깨에서 · 팔꿈치는 옆으로 · 머리 · 목 뒤를 가로지르지 않는다). 앞모습은 그대로. 생성기 캐시 번호 올림

## 2026-11-01 · claude · AGE 줄을 game 표와 다시 맞춤
- lib/look-spec.js — `node tools/port-look-spec.cjs` 로 다시 옮겼다. game 의 폼 표정 작업에서 AGE 줄(20대 · 젊은 성인)의 「soft full cheeks · soft smile」 을 뺀 것이 아직 안 들어와 tests/look-spec.cjs 가 걸렸다. 다른 표는 그대로

## 2026-11-01 · claude · 일상컷 의상 계열 「할로윈 코스튬」
- data/casual-tree.json · data/casual-tree-v2.json — 의상 계열 할로윈 코스튬(halloween) 열여섯 벌: 마녀 · 뱀파이어 · 검은 고양이 · 악마 · 서큐버스 · 미라 · 유령 신부 · 해골 · 호박 · 늑대 · 해적 · 거미 여왕 · 타락 천사 · 박쥐 · 시스루 유령 · 메두사(수위 있게 — 코르셋 · 하이 슬릿 · 바디수트 · 사이하이). 시대는 지금 · 무대·환상(옛 시대 줄 「그 시대 평상복만」 과 부딪혀 뺐다), 장소는 무대 의상을 받는 곳 + 거실 · 바 · 옥상 파티 · 축제 거리, 무대 의상을 받는 하는 일. 필수 갈래는 아니다. 버전2 어색한 조합에 목욕 · 운동 · 물가. 사용자 「각 공방에 일상컷 의상중에 할로윈 코스튬 의상 등 좀 더 추가해줘. 수위가 좀 있는걸로」

## 2026-11-01 · claude · 일상컷 계획기 — 카드 사이 안 쓴 트리 쪽 먼저
- tools/casual-plan.cjs — 다른 카드 기록(--usage)에서 소품만 세던 것을 장소 · 옷 · 자세 추천 · 자세 · 표정까지 센다(sceneUsage). 한 번도 안 쓴 값은 무게 4, 쓴 값은 1/(1+횟수)². 묶음 규칙은 그대로. 옛 꼴(소품 → 횟수)도 받는다. 사용자 「element쪽도 pkm 처럼 일상컷 만들때 안 쓴 트리 쪽으로 먼저 쓰게 하는 규칙」 → 「응 그렇게 넣어줘」
- tests/casual-plan.cjs — 많이 쓴 값으로 채운 횟수를 주면 안 쓴 장소 · 자세 추천 · 표정이 60% 넘게, 횟수 없을 때의 1.5배 넘게 나온다 · 같은 씨앗 같은 답 · 그림 저장소 기록에서 센다
- IMAGE_RULES.md 2절 · docs/IMAGE_AUTOMATION.md — 규칙과 잰 값(새 카드 여섯 × 씨앗 둘 60컷: 안 쓴 장소 7 → 13, 선 자세 33 → 16)

## 2026-11-01 · claude · 안전 필터에 막히면 — 다시 · 노출 낮추기 · 계획 바꾸기
- IMAGE_RULES.md 1절 — 같은 지시문으로 한 번 더 → 노출을 한 단계씩 낮춰(과감 → 보통 → 적게) 단계마다 한 번 → 그래도 막히면 계획을 바꾼다(한 번, 새 계획도 같은 순서). 노출 칸 말고 다른 말은 바꾸지 않는다. 시도는 generation.retries 에. 사용자 「생성룰에 필터 문제로 막히면 재시도 후, 노출 수위를 낮춰가며 재시도로 바꿔줘. 그래도 안될 땐 계획 변경으로」
- docs/IMAGE_AUTOMATION.md — GPT 세션의 멈춤 조건과 일상 한 칸 다시 정하기를 같은 순서로
- tools/prompt-pack.cjs — 노출 낮추기 칸 `casual.<자리>.exposure`(세계 그림은 이미 있던 `worlds.<세계>.look.exposure`): moderate · low 만, 까닭(why) 필수
- tests/prompt-pack-screen.cjs — 일상 한 칸 노출 low · 세계 노출 moderate 로 고친 설정도 화면과 같은 지시문

## 2026-11-01 · claude · 여러 나라에 걸친 가문 — 짝 채우기 · 새 공통 가문 · 산소 물 주민 재편
- data/element-design.json — ① 이미 elements 에 적어 둔 짝: 산소나라 녹(황토 안료 · 화성 · 녹슨 닻) · 피(심장 · 적혈구), 탄소나라 강철(숯 · 무쇠솥 · 물결무늬 단검). 산소나라 물 주민에서 우물(수소나라에 있다)을 빼고 샘 · 빙하 · 연꽃 연못을 더했다(아직 안 그린 자리). ② 새 공통 가문: 불 C·O(탄소 — 모닥불 · 석탄 / 산소 — 풀무 · 횃불 · 성냥), 기름 C·H(탄소 — 석유등 · 석유 드럼통 / 수소 — 양초 · 가스등), 나무 C·H·O(탄소 나무 — 종이 두루마리 · 나무통 / 산소 숲 — 나뭇잎 · 고목). 가문주 아홉 · 주민 스물넷이 늘어 카드 87. 모두 그 원소가 그 물질에서 맡는 몫에서 관점 · 외형(얼굴 설계 칸까지)을 잡았다. 사용자 「H2O 같이 여러 나라에 공통으로 걸칠 수 있는 가문주가 더 있음 좋겠어 … 산소쪽은 다른 주민을 편성하는 구조로」 → 「둘 다 해줘」
- tools/element-design.py — 같은 열쇠의 가문이 나라마다 같은 주민 열쇠를 두면 오류
- docs/ELEMENT_CONCEPT.md 2절 — 몫 규칙과 나눈 물질 표, 나라를 늘리면 생길 짝

## 2026-11-01 · gpt · 산소나라 물 가문주 일상컷 열다섯 장
- element-atelier-img 의 img/o-water_*_casual*.webp — 판타지·스팀펑크·메카 기준 그림을 각각 참고해 세계마다 일상컷 다섯 장, 총 열다섯 장을 생성했다. 기존 세계 그림 세 장은 보존했다
- element-atelier-img 의 records/o-water — 세계별 계획과 생성기 지시문·설정·참고 이미지·원본 PNG·WebP 해시·검수 결과를 기록했다. 구성 검사는 세 세계 모두 통과. 시각 검수는 구도·손 방향·장식·표정 차이 및 스팀펑크 3번 배경 H₂ 표기로 열두 컷을 passed:false로 남기고 IMAGE_AUTOMATION 0·4절대로 반영했다. 메카 1번은 첫 안전 거절 뒤 동일 지시문·참고 이미지 재시도 한 번으로 생성됐다
- data/img.json — 그림 등록 자동화로 세계별 일상컷 다섯 장을 등록한다. 사용자 「일상컷도 작업해줘」, 앞선 main 일반 반영 승인 유지

## 2026-11-01 · gpt · 산소나라 물 가문주 세계 그림 세 장
- element-atelier-img 의 img/o-water_* — 판타지·스팀펑크·메카 세계 그림 각 한 장을 game_keyart v2와 최신 물 가문주 외형 설계로 생성했다. 사용자 요청대로 일상컷은 제외하고 기존 수소나라 물 그림은 보존했다
- element-atelier-img 의 records/o-water — 생성기 지시문·설정·설계값, 원본 PNG 및 WebP sha256, 크기·변환 설정과 시각 검수를 기록했다. 원본 PNG는 올리지 않았다
- data/img.json — 그림 등록 자동화로 산소나라 물 가문주의 세 세계 그림을 등록했다

## 2026-11-01 · claude · 녹 · 자석 세계 그림 여섯 · 일상컷 서른 다시 그림
- element-atelier-img 의 img/fe-rust_* · img/fe-magnet_* — 얼굴 설계(나이감 · 인상 · 피부 · 눈 · 표식 · 기본 표정 · 앞머리)와 화풍 v2 로 세계 그림 여섯 장(장면 열쇠는 앞 그림 그대로)을 다시 그리고, 일상컷 서른 장(장면 칸은 앞 컷 그대로)을 새 세계 그림을 참고 그림으로 다시 그렸다. 사용자 「녹이랑 자석은 새설계로 다시 이미지 뽑아줘」 · 「응 올리고 일상컷도 새로 그려줘」 · 「응 올려줘」
- element-atelier-img 의 records/fe-rust · records/fe-magnet — 새 기록(생성 · 원본 PNG · 참고 그림 sha256), 앞 기록은 history/ 에 그대로. records/replacement.json 에 서른여섯 장의 앞 그림 sha256 · 까닭. 자석 스팀펑크 일상 5번은 첫 안전 거절 뒤 같은 지시문 한 번 더로 됐다. 파일 이름이 같아 data/img.json 은 그대로, 썸네일은 자동화가 다시 만든다

## 2026-11-01 · claude · 얼굴 설계 — 얼굴 느낌이 비슷하게 나오는 것 고치기
- lib/prompt-spec.js — FACE_DESIGN(나이감 넷 · 인상 · 피부 톤 일곱 · 눈 크기 · 눈꼬리 · 표식 · 앞머리 어휘, FACE 줄 머리). 일상컷 AGE 줄에서 「soft full cheeks · soft smile」 을 빼고 첨부 그림의 얼굴 그대로. 사용자 「얼굴형이나 이목구비를 설계로 나눠놔도 얼굴 느낌이 비슷하게 나오는것 같아」 → 「응 일상컷도 같이 바꿔서 다 채워줘」
- lib/prompt-element.js — 설계표 얼굴 칸이 있으면 AGE 줄은 설계 나이감, FACE 줄은 인상 먼저 + 피부 · 눈 크기 · 눈꼬리 · 표식, SILHOUETTE 머리에 앞머리, 표정을 안 고르면 설계 기본 표정. 얼굴 설계 칸은 근본 → 가문주 → 주민으로 물려받지 않는다. 생성기에서 고른 칸(facial character · skin tone · eye size · eye tilt · bangs · apparent age)이 이긴다
- data/style.json — game_keyart v2: 「controlled anime facial design」 → 각자 얼굴 구조 · 눈 비율 · 피부 톤을 지키는 문장(판타지 열여섯 장이 한 얼굴이었다). v1 은 남긴다
- data/element-design.json — 근본 7 · 가문주 15 · 주민 33 모두 얼굴 칸 일곱 + 사는 세계마다 앞머리를 그 원소 · 물질 · 물건에서. 철나라 가문주 셋 판타지 시험(올리지 않음)에서 녹 · 자석이 겹쳐 자석을 바꿨다
- tools/element-design.py · tests/prompt-element.cjs · tests/look-spec.cjs — 얼굴 칸이 다 찼는지 · 어휘에 있는지 · 지시문에 실리는지 · 얼굴을 하나로 만들던 말이 없는지
- IMAGE_RULES.md 2절 · prompt.html · dex.html(판 올림). 이미 그린 그림은 그대로 둔다

## 2026-11-01 · gpt · 풍선·비행선 세계 그림과 일상컷 등록
- data/img.json — 그림 저장소 main의 새 WebP를 자동 등록했다. 풍선은 판타지·스팀펑크·메카 각각 세계 그림 한 장과 일상 다섯 장(18장), 비행선은 스팀펑크 세계 그림 한 장과 일상 다섯 장(6장)으로 빈 자리를 채웠다.
- element-atelier-img/img/ · records/h-balloon-balloon/ · records/h-balloon-airship/ — 내장 image_gen으로 한 자리씩 생성하고 원본 SHA-256·참조 해시·생성기 지시문·계획·컷별 QA를 보존했다. 24장 모두 1024×1536 WebP 품질 90이며 네 세계 묶음 계획 검사를 통과했다. 프레이밍·잔존 장신구·소품 동작 차이와 풍선 메카 일상 3번 화면 오른쪽 신발 끝 잘림은 QA 실패로 기록했다. 자동화 규칙에 따라 재생성 없이 결과를 올렸고 두 캐릭터의 도감 등록·썸네일 성공을 확인했다.


## 2026-11-01 · gpt · 증기 스팀펑크 일상 1번 새 설계로 교체
- element-atelier-img/img/h-water-steam_steampunk_game_keyart_f_casual1.webp — 사용자 「다른 설계로 다시 그려서 올려줘」에 따라 승인된 세계 카드의 얼굴·머리를 참조해 새로 그렸다. 불투명 터틀넥 니트·퀼팅 조끼와 밝은 방의 창가 휴식, 몸과 얼굴 같은 방향·앞쪽 팔짱으로 역회전과 팔 연결 문제를 해소했다.
- element-atelier-img/records/h-water-steam/ · records/replacement.json — 기존 기록·계획 원문과 PNG·WebP 해시를 보존하고 새 트리 선택값·덧붙임·지시문·세계 카드 참조 해시·출력 해시·검수를 남겼다. 계획의 chest_up보다 허리까지 넓은 크롭과 몸 방향 차이는 QA에 기록했다. 기록 기준 다섯 장 묶음 검사 통과. 썸네일은 변경 이미지 자동 재생성으로 갱신하며 도감 파일 이름은 유지한다.

## 2026-11-01 · gpt · 비 일상 3·13번 팔 연결 수정, 증기 1번 수정 시도 기록
- element-atelier-img/img/h-water-rain_fantasy_game_keyart_f_casual3.webp · img/h-water-rain_mecha_game_keyart_f_casual3.webp — 사용자가 지적한 등 뒤로 솟는 팔과 추가 팔을 수정했다. 몸·얼굴을 같은 정면 사선으로 정렬하고, 난간 손과 머리 손을 각각 같은 쪽 어깨·팔꿈치·손목에 연결했다. 기존 얼굴·의상·배경을 유지했고 1024×1536·전신·두 팔 연결을 검수했다.
- element-atelier-img/records/h-water-rain/ · records/replacement.json — 수정 전 기록 원문과 이전 PNG·WebP 해시를 보존하고, 생성기로 조립한 수정 선택값·지시문·두 첨부 역할·수정본 해시와 해부학 검수를 남겼다. 파일 이름은 유지하며 썸네일은 변경 파일 자동 재생성으로 갱신한다. 도감 등록 데이터는 수동 변경하지 않는다.
- element-atelier-img/records/h-water-steam/corrections/steampunk-casual1.anatomy-2026-11-01.blocked.json — 몸·얼굴 방향과 빗질 팔 교정은 동일 지시문 두 번 모두 출력 안전 필터(moderation_blocked)에 거절되어 원본을 유지했다. 지시문 해시·응답 코드·요청 ID를 남겼고 추가 재시도는 하지 않았다.

## 2026-11-01 · gpt · 핵융합로 메카 그림 6장 등록
- data/img.json — 그림 등록 워크플로로 핵융합로(h-star-fusion)의 메카 기본 그림과 일상컷 다섯 장을 등록했다. 지시문·참고 그림 해시·원본 및 WebP 해시·구도·손·장식 차이 검수는 그림 저장소 records/h-star-fusion/에 남겼다. 여섯 WebP의 디코딩·1024×1536 크기와 업로드 객체 해시를 확인했다.

## 2026-11-01 · gpt · 태양 판타지·메카 그림 12장 등록
- data/img.json — 그림 등록 워크플로로 태양(h-star-sun)의 두 세계 기본 그림과 세계마다 일상컷 다섯 장을 등록했다. 지시문·참고 그림 해시·원본 해시·구도·손·장식 차이 검수는 그림 저장소 records/h-star-sun/에 남겼다. 메카 일상컷 3번의 0바이트 WebP는 같은 생성 원본으로 복구하고 upload-repair.json에 기록했다.

## 2026-11-01 · claude · 늘 빨간 casual-tree-v2.py 고치기
- tests/casual-tree-v2.py — 원소 표에 소품 signature 가 있으면 실패로 보던 단정을 바꿨다. signature(그 원소의 물건)는 2026-10-30 일부러 되살린 소품이고(docs/CASUAL_TREE_PORT.md · tests/casual-tree-v2.cjs 는 이미 반영) 이 파이썬 검사만 옛 단정을 남겨 늘 실패했다. 이제 알아볼 거리 소품은 signature 하나 · 모든 장소 · 동작 셋(들기 · 얼굴 옆 · 두 손)인지 본다

## 2026-11-01 · claude · 가문주 · 주민 외형을 제 물질 · 물건에서 — 글래머러스한 체형 넷 더함
- tools/port-look-spec.cjs · lib/look-spec.js — 체형 어휘에 hourglass · voluptuous · busty_slender · curvy_athletic 넷을 더했다(SILHOUETTE 줄의 「 build」 꼴로 읽히게). 사용자 「hourglass, voluptuous 등 글래머러스한 몸매가 더 많았으면 해」
- data/element-design.json — 가문주 열다섯 · 주민 서른셋 모두 look 을 그 물질 · 물건에서 떠오르는 외형으로 다 적었다: 체형 · 머리색 · 눈썹 · 코 · 입(가문주는 눈 색도), 사는 세계마다 헤어 · 얼굴형 · 눈, why 에 이유. 사용자 「가문주 외형도 근본 쪽 따라갈 필요가 없을거 같아. 각자 그 물질이나 물건을 생각했을 때 떠오르는 이미지로」. 체형은 글래머러스한 다섯 갈래가 마흔여덟 중 서른여섯. 흑연 가문주 머리색 iron_grey · 주화 가문주 brass_gold 를 새로 적었다(전엔 근본 것). 머리 · 눈 색은 그 전 값 그대로
- lib/prompt-element.js — lookOf: 주민 look.worlds.<세계> 도 싣는다. 돌림은 안 적은 칸의 대비로만
- tools/element-design.py — 가문주 · 주민 look 이 다 찼는지(사는 세계마다 헤어 · 얼굴형 · 눈, 세계끼리 다름, 스팀펑크 올림머리 아님). 전엔 주민은 머리색 하나만 허락했다
- tests/prompt-element.cjs · tests/look-spec.cjs — 지시문 값이 설계표 값 · 눈 색은 가문 · 글래머러스한 체형이 절반 넘게 · 한 갈래 30% 이하 · 안 적은 칸 대비 돌림
- IMAGE_RULES.md 2절 — 가문주 · 주민 외형 · 체형 규칙. prompt.html · dex.html 판 올림. 이미 그린 그림은 그대로 둔다

## 2026-11-01 · claude · 스팀펑크 올림머리 줄이기
- lib/prompt-element.js — lookOf: 스팀펑크에선 가문주 · 주민을 올림머리(updo_bun)로 돌리지 않는다. 사용자 「스팀펑크 쪽은 모든 물체에서 헤어스타일이 위로 묶은 머리가 너무 많아」 — 그린 스팀펑크 스물하나 가운데 아홉이 설계부터 올림머리였다(근본 넷의 스팀펑크 머리가 올림머리이고 가문주가 물려받았다)
- lib/prompt-spec.js — 스팀펑크 의상(근본 · 가문주 · 주민 꼬리 둘): 고글은 「이마 위」 → 「목에 건」, 끝에 HAIR 줄(SILHOUETTE 대로, 올림머리라고 할 때만 올린다 · 고글이나 모자 밑에 넣지 않는다) — 다른 머리도 고글 · 시대 옷차림에 끌려 올라갔다
- data/element-design.json — 아직 안 그린 금 근본의 스팀펑크 머리 updo_bun → voluminous. 이제 스팀펑크 올림머리는 그린 근본 셋(철 · 수소 · 오가네손)만
- IMAGE_RULES.md 2절 · prompt.html · dex.html(판 올림)

## 2026-11-01 · claude · 가문주 · 주민이 근본 외형을 덜 따라가게 — 체형 고르게
- lib/prompt-element.js — lookOf: 가문주는 가문 look 에 적은 칸만 가문 것, 안 적은 칸(체형 · 헤어 · 얼굴형 · 눈 · 눈썹 · 코 · 입)은 가문주 열쇠로 근본과 다르게 돌린다. 주민은 일곱 칸을 가문주와도 근본과도 다르게(그 전엔 헤어 · 얼굴형 · 눈만, 체형 · 눈썹 · 코 · 입은 가문 = 근본 그대로). 사용자 「가주나 다른 물건들이 근본원소의 외형값을 너무 많이 따라가. 특히 체형은 슬랜더로 치우친」 — 카드 55 의 체형이 슬렌더 45 · 애슬레틱 36 · 장신 20 · 건장 18 · 아담 11 · 글래머 8 · 마른 장신 3(세계마다 센 것)에서 카드마다 건장 10 · 마른 장신 9 · 슬렌더 8 · 장신 8 · 글래머 7 · 아담 7 · 애슬레틱 6 으로. 가문주가 근본과 같은 칸은 일곱 중 평균 0.06
- data/element-design.json — 주민 why 글 · IMAGE_RULES.md 2절 — 가문주 · 주민 규칙. 이미 그린 그림은 그대로 둔다
- tests/prompt-element.cjs — 가문주의 안 적은 칸은 근본과 다르다 · 체형이 한 가지에 30% 넘게 몰리지 않는다 · 주민의 체형 · 눈썹 · 코 · 입도 가문주와 다르다
- prompt.html · dex.html — prompt-element 판 올림

## 2026-11-01 · gpt · 나침반 판타지 일상컷 5번 승인 시안으로 교체
- element-atelier-img의 img/fe-magnet-compass_fantasy_game_keyart_f_casual5.webp — 기존 중복 팔과 국소 보정의 연결 문제 뒤 사용자가 요청한 새 계획으로 제작한 시안을 명시 승인받아 교체했다. 같은 판타지 카드 인물·카페·레트로 의상·전신을 유지하며 정면 사선, 오른손 창턱, 왼손 몸 옆 구도로 정리했다.
- element-atelier-img의 records/fe-magnet-compass/fantasy-casual5.game_keyart-ui.json · records/fe-magnet-compass/history/ · records/replacement.json — 새 생성기 계획·원문·참조/원본 SHA256·검수·승인을 기록하고, 이전 생성·실패 QA 기록은 이력 파일에 그대로 보존했다. 이전 WebP/PNG SHA256과 교체 사유를 남겼으며 같은 이름의 썸네일은 자동 재생성한다. data/img.json은 수동 변경하지 않았다.

## 2026-11-01 · gpt · 연료 가문주 일상컷 부족분 9장 완료
- data/img.json — 그림 등록 워크플로가 h-fuel 판타지 3·4·5번, 스팀펑크 1·2·5번, 메카 1·2·3번을 추가했다. 세 세계 각각 일상컷 다섯 장을 채웠다. h-balloon은 이미 세 세계 다섯 장씩 있어 새 그림 없이 확인만 했다.
- element-atelier-img의 img/·records/h-fuel/ — 생성기 원문·세계별 참조 이미지로 built-in image_gen 편집을 수행했다. 9장 모두 1024×1536을 확인하고 WebP 품질90·method6으로 저장했으며 계획·참조/원본 SHA256·검수 결과를 보존했다. 크롭 확대·기준 장식 잔존·표정/자세 차이는 qa.passed=false로 명시하고 규칙에 따라 재생성 없이 반영했다. 스팀펑크5는 첫 안전 거절 뒤 동일 지시문 1회 재시도에 성공했다. 세 세계 묶음 검사와 썸네일 자동화가 통과했다.

## 2026-11-01 · gpt · 기구 스팀펑크 일상컷 5번 오른손 교체
- element-atelier-img의 img/h-balloon_steampunk_game_keyart_f_casual5.webp — 사용자가 승인한 국소 수정 시안으로 교체했다. 화면 왼쪽 인사하는 오른손을 엄지 포함 다섯 손가락으로 보정하고 얼굴·의상·배경·기존 프레이밍을 대체로 유지했다.
- element-atelier-img의 records/h-balloon/steampunk-casual5.game_keyart-ui.json · records/replacement.json — 최초 생성·실패 QA는 그대로 두고 repairs에 보정 및 승인 이력을 추가했다. 이전 WebP/PNG와 새 그림의 SHA256·교체 사유를 기록했다. 나침반 시안은 등록하지 않았다. 같은 파일 이름을 유지하므로 data/img.json은 수동 변경하지 않았다.

## 2026-11-01 · gpt · 수소 나라 우물 세계 그림과 일상컷 등록
- data/img.json — 그림 등록 워크플로가 h-water-well의 판타지·스팀펑크 세계 그림 각 1장과 일상컷 각 5장, 총 12장을 등록했다. 기존 그림·기록·다른 작업은 보존했다.
- element-atelier-img의 img/·records/h-water-well/ — built-in image_gen으로 세계 그림은 참조 없이, 일상컷은 해당 세계 그림을 붙여 자리마다 한 번 생성했다. 생성기 원문·계획·원본/참고 SHA256·컷별 QA를 보존하고 WebP 품질90·method6으로 변환했다. 12장 모두 1024×1536 크기와 디코딩을 확인하고 두 세계 일상컷 묶음 검사 및 썸네일·그림 등록 자동화 성공을 확인했다.
- QA 기록 — 구도 확대·원소 장신구 과다·손 좌우/머리 방향·엘프 귀 추가·스팀펑크 의상 재단 등 계획 차이를 11장에 passed:false로 남겼다. 자동화 규칙대로 재생성 없이 반영했다.

## 2026-10-31 · claude · 이미지 작업 몫 없애기
- tools/image-claim.cjs — 하루(12) · 실행마다(1) 몫을 없앴다(사용자 「원소공방 저장소 이미지 저장 제한 없애줘」 — 오늘 UTC 로 19 카드를 잡아 새 잡기가 막혀 있었다). 잡힌 카드를 다른 세션이 못 잡는 잠금 · push 경합 되돌림 · 끝 검사는 그대로
- docs/IMAGE_AUTOMATION.md · AGENTS.md — 몫 없음, 한 실행이 여러 카드를 차례로 · tests/image-claim.cjs — 몫이 없으면 둘째 카드 · 열둘 뒤에도 잡힌다

## 2026-10-31 · gpt · 수혈팩 일상컷 부족분 등록
- data/img.json — 등록기로 스팀펑크·메카 각 3장, 총 6장을 추가해 사는 세계마다 일상컷 5장을 채웠다. 기존 번호·그림·기록은 보존했다.
- element-atelier-img의 img/·records/fe-blood-bloodbag/ — 기준 그림 참조 편집과 생성기 원문·계획·원본/참고 SHA256·컷별 검수를 보존했다. WebP 품질90·method6으로 변환하고 모두 다시 열어 1024×1536 크기와 디코딩을 확인했다. 구도·장식·손 좌우·소품 동작·배경 문자 차이는 qa.passed=false로 남겼다.
- 메카 묶음 검사 — 기존 2·4번의 signature 소품 중복 때문에 전체 CLI 검사는 경고 1건이다. 기존 컷을 base로 넣은 동일 검사기 check(새 1·3·5번, 기존 2·4번)는 통과했다. 기존 기록과 이미지는 고치지 않았다.

## 2026-10-31 · gpt · 기구 가문주 일상컷 부족분 등록
- data/img.json — 자동 등록으로 판타지·스팀펑크·메카 각 3장, 총 9장을 추가해 세계마다 일상컷 5장을 채웠다. 기존 번호와 이미지는 보존했다.
- element-atelier-img의 img/·records/h-balloon/ — 생성기 원문·계획·참고 이미지/원본 SHA256·1024×1536 WebP 품질90·method6 및 검수 기록을 보존했다. 구도·장신구·소품 동작 차이와 스팀펑크 5번의 여섯 손가락은 qa.passed=false로 남겼다.
- fantasy-casual5 — 0바이트 WebP 변환 오류를 같은 원본 PNG에서 재변환해 복구했다. 재생성 없이 복구하고 9장 모두 디코딩·크기를 다시 확인했다.

## 2026-10-31 · gpt · 말굽자석 일상컷 부족분 등록
- data/img.json — 등록기로 스팀펑크·메카 각 3장, 총 6장을 추가해 사는 세계마다 일상컷 5장을 채웠다. 기존 번호와 그림은 보존했다.
- element-atelier-img의 img/·records/fe-magnet-horseshoe/ — 기준 그림 참조 편집, 1024×1536 WebP 품질90·method6, 생성기 원문·계획·원본/참고 SHA256·컷별 검수 보존. 구도·손 좌우·장식·배경 문자 차이를 qa.passed=false로 남겼다.
- steampunk-casual4 — 최초 지시문 출력 안전 거절 2회를 기록하고, 자동화 3절의 1회 대체 계획(seed 20261031)으로 실험실 일상복 장면을 생성했다. 원래 계획·거절 지시문도 보존했다.

## 2026-10-31 · gpt · 피 가문주 일상컷 부족분 등록
- data/img.json — 등록기로 판타지·스팀펑크·메카 각 3장, 총 9장을 추가해 세계별 일상컷 5장을 채웠다. 기존 번호와 그림은 보존했다.
- 생성·검수 기록은 그림 저장소 records/fe-blood/에 남겼다. 구도·손 좌우·참조 장식·소품·배경 문자 차이는 qa.passed=false로 기록하고 자동화 규칙에 따라 재생성 없이 반영했다.

## 2026-10-31 · gpt · 나침반 일상컷 부족분 아홉 장 보충
- data/img.json — 그림 등록 워크플로가 판타지·스팀펑크·메카 일상컷을 각각 다섯 장으로 등록. 기존 그림과 번호 및 다른 작업 보존
- element-atelier-img의 img/·records/fe-magnet-compass/ — 세계별 기준 그림을 참조한 image_gen 편집 9장. 1024×1536 WebP 품질90·method6, 생성기 원문·계획·원본/참고 SHA256·컷별 QA 보존. 세 세계 계획 묶음 검사와 썸네일·그림 등록 자동화 성공
- QA 기록 — 판타지 casual5의 팔 세 개 오류, 구도 확대·장식 반복·나침반 눈금 문자·손 좌우·의상 차이를 passed:false로 남김. 자동화 규칙대로 재생성 없이 반영. 메카 casual3의 최초 출력 안전 거절은 같은 지시문으로 한 번 재시도해 성공

## 2026-10-31 · gpt · 자석 가문주 일상컷 부족분 아홉 장 보충
- data/img.json — 그림 등록 워크플로가 판타지·스팀펑크·메카 일상컷을 각각 다섯 장으로 등록. 기존 그림과 번호 및 다른 작업 보존
- element-atelier-img의 img/·records/fe-magnet/ — 세계별 기준 그림을 참조한 image_gen 편집 9장. 1024×1536 WebP 품질90·method6, 생성기 원문·계획·원본/참고 SHA256·컷별 QA 보존. 세 세계 묶음 검사와 썸네일 자동화 성공
- QA 기록 — 말굽자석 분리·구도 확대·손 좌우·기준 장식 유지·의상 해석 차이를 passed:false로 기록하고 재생성 없이 반영

## 2026-10-31 · gpt · 폐선 일상컷 부족분 여섯 장 보충
- data/img.json — 그림 등록 워크플로가 스팀펑크·메카 일상컷을 각각 다섯 장으로 등록. 기존 그림·번호·다른 작업 보존
- element-atelier-img의 img/·records/fe-rust-wreck/ — 세계별 기준 그림을 붙인 image_gen 편집으로 여섯 장 생성. 1024×1536 WebP 품질90·method6, 생성기 원문·계획·원본/참고 SHA256·컷별 QA 보존. 두 세계 다섯 장 묶음 검사 통과
- QA 기록 — 손 좌우·몸/고개 방향·찜질복 변형·선체의 휴대 모형 해석·간호복 십자 표식을 passed:false로 기록하고 재생성 없이 반영. 썸네일·그림 등록 워크플로 성공 확인

## 2026-10-31 · gpt · 버려진 열쇠 일상컷 부족분 여섯 장 보충
- data/img.json — 그림 등록 워크플로가 판타지·스팀펑크 일상컷을 각각 다섯 장으로 등록. 기존 그림·번호·다른 작업 보존
- element-atelier-img의 img/·records/fe-rust-key/ — 세계별 기준 그림을 붙인 image_gen 편집으로 여섯 장 생성. 1024×1536 WebP 품질90·method6, 생성기 원문·계획·원본/참고 SHA256·컷별 QA 보존. 두 세계 다섯 장 묶음 검사 통과
- QA 기록 — 일부 구도 확대·얼굴 방향·손 좌우·발목 대신 무릎 교차는 passed:false로 기록하고 프로젝트 자동화 규칙에 따라 재생성 없이 반영

## 2026-10-31 · gpt · 녹슨갑옷 일상컷 부족분 아홉 장 보충
- data/img.json — 그림 등록 워크플로가 녹슨갑옷의 판타지·스팀펑크·메카 일상컷을 각 다섯 장으로 등록. 기존 그림·번호·다른 작업은 보존
- element-atelier-img의 img/·records/fe-rust-armor/ — 각 세계 승인 그림을 붙인 image_gen 편집으로 아홉 장 생성. 1024×1536 WebP 품질90·method6, 생성기 원문·계획·원본/참고 SHA256·컷별 QA 보존. 세 세계 다섯 장 묶음 검사 통과
- QA 기록 — 일부 구도·고개·시선·찜질복 변형 및 택시 안 서기 공간 충돌은 passed:false로 기록하고 임의 재생성하지 않음. 온천 컷 최초 안전 거절은 지시문 변경 없이 한 번만 재시도해 성공했으며 시도 횟수와 응답 ID 기록

## 2026-10-31 · gpt · 녹 가문주 일상컷 부족분 아홉 장 보충
- data/img.json — 그림 등록 워크플로가 녹 가문주의 판타지·스팀펑크·메카 일상컷을 각 다섯 장으로 등록. 기존 그림·번호·다른 작업은 보존
- element-atelier-img의 img/·records/fe-rust/ — 각 세계 승인 그림을 붙인 image_gen 편집으로 아홉 장 생성. 1024×1536 WebP 품질90·method6, 생성기 원문·계획·원본/참고 SHA256·컷별 QA 보존. 세 세계 다섯 장 묶음 검사 통과
- QA 기록 — 환경 구도 축소·머리 매무새 변경·충전소 H2 표기·원본 고글 잔존·눕기 대신 앉기가 나온 컷은 passed:false로 기록하고 프로젝트 자동화 규칙에 따라 재생성 없이 반영

## 2026-10-31 · gpt · 철교·레일 일상컷 부족분 보충
- data/img.json — 그림 등록 워크플로로 철교·레일의 스팀펑크·메카 일상컷을 각각 다섯 장으로 보충(새 그림은 캐릭터별 여섯 장, 총 열두 장). 기존 그림·기록은 보존
- element-atelier-img의 img/·records/fe-steel-bridge/·records/fe-steel-rail/ — 세계 그림을 참고한 이미지 편집, 1024×1536 WebP 품질90·method6, 생성기 원문·원본/참고 SHA256·QA 기록. 프레이밍·고개 방향·복수 장식·허용 외 글자 등 어긋남은 passed:false로 남기고 임의 재생성하지 않음
- 철교 스팀펑크 묶음 검사 — 기존 1·3번의 수영복 계열 중복은 보존. 계획기의 기존 컷 허용 규칙을 적용한 새 2·4·5번 증분 검사는 통과, 메카·레일 두 세계 전체 다섯 장 검사 통과

## 2026-10-31 · claude · 원자 번호도 허용 — 지시문도 기호 · 번호 둘만 허용
- lib/prompt-spec.js · lib/prompt-element.js — 「no text, no numbers」 를 「그 원소의 기호({symbol})와 원자 번호({number})만 읽히게 나와도 된다, 그 밖엔 안 쓴다」 로(세계 그림 RULES · 일상컷 ONE MAIN FIGURE · SCREENS · 나라 안 WORLD). 사용자 「원자 번호랑 기호도 허용해줘」
- IMAGE_RULES.md 1절 · docs/IMAGE_AUTOMATION.md — 기호와 원자 번호는 나와도 다시 만들지 않는다. 일부러 그리라고 하지는 않는다
- prompt.html · dex.html — 스크립트 판 올림

## 2026-10-31 · claude · 읽히는 원소 기호는 허용
- IMAGE_RULES.md 1절 — 그림에 그 원소의 기호(Fe · Au …)가 읽히게 보여도 다시 만들지 않는다(사용자 「읽히는 기호는 허용해줘도 돼. 여기는 저작권 문제 같은게 없잖아」). 다른 글자·숫자 · 로고는 지금처럼 그리지 않는 쪽, 지시문의 no text 줄은 그대로
- docs/IMAGE_AUTOMATION.md — GPT 세션의 멈춤 목록에서 「읽히는 글자·숫자」 를 빼고, 검수 항목은 원소 기호 말고 다른 글자만 적는다

## 2026-10-31 · claude · GPT 세션 이미지 규칙 — 잠금 · 일상컷 계획기 · 지시문 묶음 · 일상컷 세계마다 다섯 장
- docs/IMAGE_AUTOMATION.md — 사람이 안 지켜보는 GPT 세션의 길(pkm · game · book 과 같게, 사용자 2026-10-31): 실행마다 한 카드 · 하루 열두 카드, 잠금 → 세계마다 일상컷 계획 → 지시문 묶음 → 그리기(세계 그림은 기준 없이, 일상컷은 그 세계 그림 첨부) → AI 검수 → 묻지 않고 올리기 → 끝
- tools/casual-plan.cjs — 일상컷 묶음 계획기(새 — game 의 버전2 계획기를 원소 꼴로): 한 세계의 빈 번호를 한 번에, 필수 갈래 · 네 시대 · 먼/가까운 컷 · 그 원소의 물건 한두 장 · 소품 고르게, 칸마다 생성기 꼴 기록 · 지시문, --check
- tools/prompt-pack.cjs — 브라우저 없이 생성기와 같은 지시문 · 기록을 파일로(사는 세계마다 세계 그림 + 일상 다섯). 철 세 세계 그림이 실제 화면 기록과 글자 하나 다르지 않다
- tools/image-claim.cjs — 잠금(그림 저장소 records/automation/claims/<카드>.json), 다음 차례 · 빈 자리(사는 세계마다 세계 그림 + 일상 다섯 — 번호는 세계마다 따로) · 끝 · 멈춤 · 풀기
- IMAGE_RULES.md — 일상컷은 세계마다 다섯 장(사용자 「일상컷은 각 캐릭별 5장으로」 — 같은 날의 「세 장」 을 바꿈, 적은 옛 카드는 모자란 번호만), 묶음 계획기 절, 번호는 세계마다, GPT 세션은 IMAGE_AUTOMATION 0절
- tests/casual-plan.cjs · tests/prompt-pack-screen.cjs · tests/image-claim.cjs · AGENTS.md

## 2026-10-31 · claude · 오가네손 근본 일상컷 아홉 — 세계마다 세 장
- data/img.json — og_<세계>_game_keyart_f_casual2~10 등록(사용자 「오가네손 일상컷 작업해줘, 이제부턴 3장씩으로」). 세계마다 먼 컷 · 가까운 컷 · 자유 컷, 시대 다르게, 첫 장은 필수 갈래(나라 안 목욕탕 찜질복). 세계 없는 옛 시안(casual1) 다음 번호부터. 판타지 일상컷 1 은 오가네손 물건(손바닥에서 흩어지는 보랏빛 입자)을 들었다
- IMAGE_RULES.md — 일상컷은 세계마다 세 장(오가네손부터)

## 2026-10-31 · claude · 별 가문주 메카 일상컷 1 교체 — 팔 연결
- data/img.json 은 그대로(같은 이름) — 그림 저장소에서 h-star_mecha_game_keyart_f_casual5.webp 를 같은 지시문으로 다시 뽑아 바꿨다(사용자 「메카 일상 1번 팔 연결이 이상해」 — 돌아선 몸에서 머리로 올린 팔이 가슴 앞에서 나왔다). records/replacement.json

## 2026-10-31 · claude · 수소나라 별 가문주 — 세계 그림 3 · 일상컷 6, 수소 가문주 넷 다 참
- data/img.json — h-star_<세계>_game_keyart_f.webp 셋과 일상컷 여섯 등록(사용자 「별 가문주 이미지 생성 작업해줘」). 장면 변주 셋을 앞 가문주들이 다 써서 세계 글의 장소에 시간대로 갈랐다(판타지 밤 · 스팀펑크 석양 · 메카 밤). 메카 일상컷 6 은 별 가문 물건(핵융합 빛의 유리구)을 들었다. 수소나라 근본·가문주 넷이 다 찼다

## 2026-10-31 · claude · 수소나라 연료 가문주 — 세계 그림 3 · 일상컷 6
- data/img.json — h-fuel_<세계>_game_keyart_f.webp 셋(별불 신전 · 비행선 항구 · 토카막 — 근본·물·기구 가문주와 배경을 갈랐다)과 일상컷 여섯(세계마다 먼 컷 하나 · 가까운 컷 하나, 세계 그림을 참고 그림으로) 등록(사용자 「연료 가문주 이미지 생성 작업해줘」). 스팀펑크 일상컷 4 는 연료 가문 물건(서리 낀 연료통)을 들었다

## 2026-10-31 · claude · 수소나라 풍선(기구) 가문주 — 일상컷 6
- data/img.json — h-balloon_<세계>_game_keyart_f_casual1~6 등록. 장면 씨앗을 카드 열쇠에서 다시 짜 물 가문주와 다른 장면(나라 안 목욕탕 시퀸 · 조폐소 · 펜트하우스 · 서커스 · 금고 고딕 · 스파 가운). 세계마다 먼 컷 하나 · 가까운 컷 하나

## 2026-10-31 · claude · 수소나라 풍선(기구) 가문주 — 세계 그림 3
- data/img.json — h-balloon_<세계>_game_keyart_f.webp 셋(풍선 등불의 하늘 섬 · 비행선 곤돌라 · 극저온 가스 탱크) 등록(사용자 「기구 가문주 이미지 생성 작업해줘」). 일상컷 여섯은 물 가문주와 장면·자세가 같게 나와(장면 씨앗이 카드마다 안 갈렸다) 올리지 않았다 — 씨앗을 카드 열쇠에서

## 2026-10-31 · claude · 수소나라 물 가문주 — 세계 그림 3 · 일상컷 6
- data/img.json — h-water_<세계>_game_keyart_f.webp 셋(구름 다리 · 전기분해 실험실 · 우주 엘리베이터 — 근본과 배경을 장면 변주로 갈랐다)과 일상컷 여섯(세계마다 먼 컷 하나 · 가까운 컷 하나, 시대 다르게, 세계 그림을 참고 그림으로) 등록(사용자 「물 가문주 이미지 생성 작업해줘」). 판타지 일상컷 1 은 물 가문 물건(빛을 받는 물 한 잔)을 들었다

## 2026-10-31 · claude · 수소 근본 메카 — 세계 그림 1 · 일상컷 2(사용자가 만들어 올림), 수소 근본 다 참
- data/img.json — h_mecha_game_keyart_f.webp(극저온 탱크와 토카막 앞의 수소 근본) · casual5(수영장 옆 옆얼굴) · casual6(클럽에서 잔을 든) 등록(사용자 「수소 메카」). 수소 근본이 세계 그림 셋 · 일상컷 세계마다 둘로 다 찼다. 그림 저장소 기록엔 원본 sha256 만

## 2026-10-31 · claude · 수소 근본 스팀펑크 — 세계 그림 1 · 일상컷 2(사용자가 만들어 올림)
- data/img.json — h_steampunk_game_keyart_f.webp(비행선 항구의 수소 근본) · casual3(실험실에서 푸른 불꽃 유리관) · casual4(네온 화장실의 가죽 코르셋) 등록(사용자 「수소 스팀펑크 올려줘」). 일상컷 번호는 판타지 1·2 다음. 그림 저장소 기록엔 원본 sha256 만

## 2026-10-31 · claude · 수소 근본 판타지 — 세계 그림 1 · 일상컷 2(사용자가 만들어 올림)
- data/img.json — h_fantasy_game_keyart_f.webp(하늘 섬 왕국의 수소 근본) · h_fantasy_game_keyart_f_casual1.webp(하늘 섬 계단의 투명 우산) · casual2(해 질 녘 옥상 수영장) 등록(사용자 「수소 판타지 올려줘」). 그림 저장소 기록엔 원본 sha256 만 — 지시문 기록은 없다

## 2026-10-31 · claude · 크게 보기에서 뒤로 가기는 팝업만 닫는다
- dex.html — 일상컷 크게 보기에서 뒤로 가기를 누르면 이전 화면으로 넘어갔다(사용자 「뒤로 가기 누르면 팝업창이 닫히는 걸로」). 열 때 기록에 한 칸(elementLb)을 더하고 뒤로 가기(popstate)가 그 칸을 지우며 닫는다. 닫기·Esc·바깥으로 닫으면 그 칸을 같이 지운다. 즐겨찾기 link 로 바로 열 때도 같다
- tests/screen.cjs — 뒤로 가기로 닫힘 · 도감 그대로 · 닫기가 기록 칸을 지움(173가지)

## 2026-10-31 · claude · 도감 판 새로 — 위에 붙는 판 · 접기 · 작은 칸 · 크게 보기 넘기기 · 즐겨찾기
- dex.html — 한 나라가 PC 3만 · 폰 1만 2천 픽셀이라 불편했다(사용자 「도감 보기가 좀 불편해」 「다 해줘」). 위에 붙는 판: 보기(세계 그림 · 일상컷 · 전부) · 세계(모두·판타지·스팀펑크·메카) · 바로 가기(근본·가문·주민 칩) · 즐겨찾기 수. 카드마다 세계 그림 셋만 펴고 일상컷·다른 화풍은 「일상컷 6 ▸」「다른 화풍 2 ▸」 로 접는다. 안 사는 세계는 작고 흐린 칸, 일상컷 이름은 「판타지 1」 한 줄. 크게 보기는 그 카드의 그림을 차례로(← → · 밀기 · Esc, 키를 빨리 눌러도 늘 지금 자리에서). 보기·세계는 주소(?view=&w=)와 이 기기(element_dex_v1)에 — 철 도감이 PC 6천 4백 · 폰 5천 4백 픽셀로
- dex.html · lib/favorites.js · tests/favorites.cjs — 크게 보기의 하트로 공방 모음 즐겨찾기에 담는다(a: element, link ?nation=&card=&pic= 가 그 그림을 다시 연다, 사용자 「즐겨찾기 다른 공방처럼, 허브에서 한 번에」). favorites.js 는 공방 모음 것과 같은 파일인지 검사
- lib/element.css · lib/words.js — 판·접기·작은 칸·크게 보기·즐겨찾기 꼴과 낱말. tests/screen.cjs — 도감 검사를 새 판에 맞게(접힘·펼치기·바로 가기·보기·세계·전부·한 줄 이름·넘기기·하트·즐겨찾기 link 로 다시 열기) — 163가지. AGENTS.md

## 2026-10-31 · claude · 철나라 일상컷 세계마다 두 장 — 마흔아홉 더해 일흔여덟
- data/img.json — 일상컷 마흔아홉 등록(사용자 「일상컷은 캐릭터마다 판타지 2장, 스펑 2장, 메카 2장」). 세계마다 먼 컷 하나 · 가까운 컷 하나, 같은 세계 안 두 장은 시대를 다르게. 녹 스팀펑크 하나는 필터에 두 번 막혀 재봉실 평상복으로 다시 뽑았다. 철나라 일상컷 일흔여덟 — 근본·가문주는 여섯, 주민은 사는 세계마다 둘
- IMAGE_RULES.md — 한 카드 일상컷은 세계마다 두 장

## 2026-10-31 · claude · 나침반 일상컷 1 채움 — 나라 안 방의 홈웨어
- data/img.json — fe-magnet-compass_mecha_game_keyart_f_casual1.webp 등록(사용자 「나침반 채워줘」). 하이레그 수영복(먼 컷)이 필터에 두 번 막혀 필수 갈래를 나라 안 방의 홈웨어로 바꿨다(메카 그림 참고). 철나라 일상컷 스물아홉 — 말굽자석 2 만 비었다

## 2026-10-31 · claude · 작업 안내에 「사용자에게는 언제나 한국어 반말」
- CLAUDE.md — 답이 중간에 영어로 바뀌었다(사용자 「계속 영어로 바뀌네, 한글로 고정해줘」). 모델이 바뀌어도 한국어 반말로

## 2026-10-31 · claude · 철나라 일상컷 스물여덟 장 — 카드마다 두 장(참고 그림을 붙여)
- data/img.json — <카드>_<세계>_game_keyart_f_casualN.webp 스물여덟 등록(사용자 「철나라 일상컷 뽑아줘」 · 「카드마다 2장」). 카드마다 필수 갈래 · 먼 컷 하나(나라 안 방·목욕탕·지붕·여관의 홈웨어·목욕·수영복·란제리, 또는 수영복·역할극) + 다른 시대 · 가까운 컷 하나, 참고 세계도 갈랐다. 그 세계 그림을 붙여 이미지 편집으로 — 같은 사람이 나온다. 나침반 수영복(먼 컷) · 말굽자석 란제리(가까운 컷) 두 장은 안전 필터에 두 번 막혀 비었다(같은 지시문 한 번만 다시 — 규칙)
- IMAGE_RULES.md — 일상컷 뽑기(참고 그림을 붙여 편집 · 기록에 endpoint·ref_sha256 · 한 묶음 두 장부터)

## 2026-10-31 · claude · 철나라 주민 스물네 장(2.5D) — 새로 22 · 시안 교체 2
- data/img.json — fe-<가문>-<주민>_<세계>_game_keyart_f.webp 스물둘 등록(사용자 「응 해줘」). 머리색은 물건 재질, 머리·얼굴형·눈은 가문주와 다르게, 옷은 물건이 먼저. 메모가 없는 세계는 장면 변주로 배경을 갈랐다. 녹슨 갑옷 판타지 · 못 메카 2.5D 시안은 같은 이름으로 교체(그림 저장소 records/replacement.json). 철나라 근본·가문주·주민 세계 그림이 기본 화풍으로 다 찼다
- tests/screen.cjs — 「빈 자리는 생성기로」 가 나라 차례로 빈 자리를 찾고, 일상컷 「참고 그림」 줄은 등록부를 보고 판정(철나라가 차서 옛 기대가 깨졌다)

## 2026-10-31 · claude · 주민이 가문주 복사본이 되지 않게 — 물건 재질 머리색 · 외형 돌리기 · 물건이 먼저인 옷
- data/element-design.json · tools/element-design.py — 주민 서른셋에 look.silhouette.hair_color(물건의 재질 색 — 검 거울 강철, 나침반 놋쇠 금빛, 수혈팩 짙은 피빛 …). 철 주민 스물네 장을 뽑아 보니 가문주와 외형 줄이 글자까지 같고 물건이 안 보였다(사용자 「머리색도 좀 바꾸는 건 어떨까」 「그렇게 해줘」)
- tools/port-look-spec.cjs · lib/look-spec.js — 원소 몫 머리색 21 더함(물건 재질 색)
- lib/prompt-element.js — lookOf 가 주민이면 헤어스타일·얼굴형·눈 모양을 주민 열쇠로 돌려 그 세계 가문주와 다르게(세계끼리도 다르게), 머리색은 설계표. 주민 세계 그림은 세계 옷 뼈대 대신 citizenTail(물건이 먼저 — 그 모양이 옷·머리 장식에서 한눈에), 주민 과감 노출(옷 뼈대 말 없이), 메카는 「물건이 설계를 이끈다」
- lib/prompt-spec.js — citizenTail(판타지·스팀펑크) · CITIZEN_MECHA · CITIZEN_EXPOSURE_BOLD. tests — 주민 75 (주민, 세계) 가 가문주와 머리·얼굴형·눈이 다 다르고 세계끼리도 다르다 · 옷 줄 · 검사기. IMAGE_RULES.md · AGENTS.md. 시험 세 장(나침반 스팀펑크 · 못 판타지 · 레일 메카)으로 봤다 — 첫 스물네 장은 안 올렸다

## 2026-10-31 · claude · 기본 화풍을 게임 키아트 2.5D 로 · 기록 이름에 화풍을 늘 붙인다
- data/style.json · IMAGE_RULES.md · AGENTS.md — 기본을 game_keyart 로(사용자 「2.5d 가 낫다, CGI 는 얼굴이 각지고 못생기게 나오는 컷이 있다」). game_cgi 철나라 열여덟 장은 그 열쇠로 남아 도감 「다른 화풍」 줄에
- lib/studio.js — 생성기는 늘 기본 화풍(화풍 고르개가 없는데 저장된 옛 화풍을 따르고 있었다 — 기본을 바꿔도 이 기기에선 CGI 로 지었을 것)
- lib/prompt-element.js · IMAGE_RULES.md — 기록 이름은 <세계>.<화풍>-ui.json 으로 늘 화풍을 붙인다. 그림 저장소의 옛 <세계>-ui.json 열여덟을 <세계>.game_cgi-ui.json 으로 옮겼다(git mv)
- tests/screen.cjs — 파일 이름이 기본 화풍을 따른다

## 2026-10-31 · claude · 철나라 게임 키아트 2.5D 판 열다섯 — 가문주 12 새로 · 근본 3 교체
- data/img.json — fe-<가문>_<세계>_game_keyart_f.webp 열둘 등록(사용자 「게임 키아트 2.5d로도 다 다시 뽑아줘」). CGI 판과 같은 장면·외형·옷으로 화풍 줄만 game_keyart. 근본 2.5D 셋(fe_<세계>_game_keyart_f.webp)은 외형 설계 전 시안이라 같은 이름으로 교체 — 그림 저장소 records/replacement.json. 도감은 기본 화풍(CGI) 줄 아래 「다른 화풍 · 게임 키아트 2.5D」 줄로 보인다

## 2026-10-31 · claude · 세계마다 헤어스타일·얼굴형·눈 · 철 판타지·스팀펑크 열 장 다시 뽑아 교체
- data/element-design.json · tools/element-design.py — 나라 일곱에 look.worlds(세계마다 헤어스타일·얼굴형·눈 모양, 세 세계가 서로 다른 사람이어야 검사 통과). 색·체형은 공통. 강철·자석 가문의 머리·얼굴도 세계마다로 옮겼다. 철나라·강철·자석의 메카 값은 먼저 올린 메카 그림 그대로(지시문이 글자까지 같다)(사용자 「기본 세팅값에 헤어스타일이랑 얼굴 모양은 다르게」)
- lib/prompt-element.js · lib/studio.js — lookOf(카드, 세계): 나라 → 나라 세계 → 가문 → 가문 세계 차례. FACE·SILHOUETTE 줄 · 설계 줄 목록 · 기록 design 이 그 세계 값
- data/img.json 은 그대로(같은 이름) — 그림 저장소에서 근본 판타지·스팀펑크 2 · 가문주 판타지·스팀펑크 8 을 교체했다(records/replacement.json). 안전 필터에 걸린 한 장은 같은 지시문으로 한 번 다시 돌려 통과
- tests/prompt-element.cjs · tests/look-spec.cjs — 나라마다 세 세계가 다른 사람·색·체형 공통·가문 세계 값·지시문·기록. IMAGE_RULES.md · AGENTS.md

## 2026-10-30 · claude · 판타지·스팀펑크 옷 뼈대 가르기 — 세계 꼬리·과감 노출·기본 빛
- lib/prompt-spec.js · lib/prompt-element.js — 철 가문주 판타지·스팀펑크가 같은 코르셋 + 트임 치마로 나왔다(사용자 「판타지와 스팀펑크 의상이 비슷해 보이지 않아?」). 공용 과감 노출의 「corset-like waist · slits」 와 스팀펑크 꼬리의 「fitted bodice」 가 둘을 끌어당겼다. 판타지 COSTUME(견갑·고르젯·사슬·타바드·서클릿·망토, 코르셋·버슬 금지) · 스팀펑크 COSTUME(하이넥 블라우스·조끼·연미 코트·장갑·앞치마·고글·짧은 버슬 + 승마 바지, 갑옷판·망토·왕관 금지 — 입는 물건 주민은 예외), 세계마다 exposureBold, 기본 LIGHT(판타지 햇빛·마법 빛 · 스팀펑크 가스등·흐린 하늘, 시간대가 이긴다). 메카는 그대로. 강철 가문주 시험 두 장으로 갈리는 것을 봤다
- tests/prompt-element.cjs — 세계마다 옷·과감·빛. tests/screen.cjs — 「빈 자리는 생성기로」 가 등록부에서 빈 자리를 찾는다(가문주가 차서 옛 자리가 없어졌다). docs/ELEMENT_CONCEPT.md

## 2026-10-30 · claude · 철나라 가문주 열두 장(CGI) · 강철·자석 가문 외형 가르기
- data/element-design.json — 강철 가문 look 에 짧게 친 머리·타원 얼굴·아몬드 눈·곧은 눈썹, 자석 가문 look 에 양갈래·곡선형 몸·하트 얼굴·큰 둥근 눈·하트 입술. 첫 뽑기에서 둘이 같은 은회색 땋은 머리라 자매처럼 닮았다(사용자 「2번」 — 강철·자석만 다시)
- data/img.json — fe-<가문>_<세계>_game_cgi_f.webp 열두 장 등록(강철·녹·자석·피 × 판타지·스팀펑크·메카). 장면은 가문마다 변주로 갈랐다(강철 대장간·리벳 공장·수리 도크, 녹 세계 글·철교·세계 글, 자석 자철석 광산·세계 글·자기 레일, 피 쇠 성문·용광로·궤도 주조소). 안전 필터에 걸린 두 장은 같은 지시문으로 한 번 다시 돌려 통과

## 2026-10-30 · claude · 세계 그림 장면 줄 머리말을 「SETTING (this card): 」 로
- lib/prompt-spec.js · prompt.html — 「SETTING: this card is set a magnetite mine…」 처럼 장면 글이 명사로 시작하면 문장이 어긋났다(철 가문주 지시문을 뽑다 봤다). 머리말은 콜론까지만. tests/prompt-element.cjs · tests/screen.cjs 의 문자열도

## 2026-10-30 · claude · 세계 그림에 장면·시간대·자세·표정 · 일상컷에 손에 드는 물건·시간대·머리 변화 · 나라 안은 참고 세계로
- data/element-design.json · tools/element-design.py — 나라마다 세계마다 장소 변주 scenes 셋(63) · 일상컷에서 손에 드는 그 원소의 물건 hold.en(나라 7 · 가문 15, 주민은 object.en). 검사기가 본다(사용자 「응」 + 「일상컷에서 손에 드는 소품까지」)
- data/casual-tree-v2.json · tests/casual-tree-v2.cjs — 소품 signature(그 원소의 물건, 모든 장소)와 동작 셋(들기 · 얼굴 옆 · 두 손). 카드가 signature_hold 를 주면 든다
- lib/prompt-spec.js · lib/prompt-element.js — 세계 그림: SETTING(장면) · TIME & WEATHER(일곱) · OUTPUT 의 자세 자리(WORLD_POSES 일곱, 비우면 카드 자세) · EXPRESSION, opts.shot(normShot 이 바로잡고 기록에 남는다). 일상컷: PROP 에 그 물건(hold), 시대 「나라 안」 이 참고 그림의 세계 글(전엔 늘 판타지), Time of day(일곱) · Hair(다섯 — 색·길이는 지키고 매무새만), CHARACTER 가 머리 변화·물건 들기를 허락
- lib/studio.js · lib/words.js — 세계 그림 단계 세계 → 장면(+시간대 고르개) → 자세·표정(+표정 고르개) → 설계 줄 → 외형 → 덧붙임, 카드×세계마다 저장(shots). 일상컷 단계에 시간대(날씨 뒤)·머리 변화(옷 뒤). 랜덤·여기부터 다시가 같이 다룬다
- tests/prompt-element.cjs · tests/screen.cjs(125가지) — 장면·시간대·자세·표정 줄과 차례 · 다른 세계 열쇠 비움 · 손에 드는 물건(근본·가문주·주민, 트리 허락) · 나라 안 세계 · 시간대·머리 · 화면 흐름
- IMAGE_RULES.md · AGENTS.md · docs/ELEMENT_CONCEPT.md · docs/CASUAL_TREE_PORT.md — 규칙

## 2026-10-30 · claude · 외형 칸의 「설계표」 표를 라벨 옆에 · 일상컷 덧붙임에 전체 강도·피부 노출 고르개
- lib/studio.js · lib/studio.css · lib/words.js — 외형 칸에서 설계 줄이 채우는 항목의 표(「설계표」)가 폰에서 빈 칸처럼 보였다(사용자 「설계 라고 나오는 건 뭐야」) → 라벨과 한 덩이로. 일상컷 덧붙임 칸에 두 축(전체 강도 · 피부 노출) 고르개 — 기본은 고정값(가장 강함 · 많이), 바꾸면 지시문·칩에 따라온다(사용자 「일상컷에 세부 강도 설정이 빠졌네」). 화면비는 2:3 그대로
- tests/screen.cjs — 93가지

## 2026-10-30 · claude · 세계 그림에 외형 — 설계표 look(팔레트 → 머리·눈 색) · 설계 줄 · 외형 선택지(game 과 같은 표)
- data/element-design.json · tools/element-design.py — 나라 일곱에 look(얼굴 여섯 + 실루엣 셋 — 팔레트 색이 머리·눈 색: 철 iron_grey·ember, 수소 silver_white·sky_blue, 산소 ocean_blue·forest_green, 탄소 soot_black·leaf_green, 나트륨 lemon_yellow·sodium_yellow, 금 golden_blonde·gold, 오가네손 violet_white·violet), 가문 열다섯은 제 팔레트로 머리색·눈 색만 덮어쓴다, 주민은 가문 것. 검사기가 칸·꼴을 본다(사용자 「게임 공방처럼 원소·물질의 특성을 살려 외형 특징을 잡자, 팔레트 색을 머리·눈 색으로」)
- lib/look-spec.js · tools/port-look-spec.cjs · tests/look-spec.cjs — game 의 외형 선택지(34) · 얼굴 다섯 묶음 · 실루엣 어휘 · 나이 줄 · 노출 문장을 글자 그대로 옮겨 AtelierSpec 에 붙인다(「게임 설계표」→「나라 설계표」, FORM costume → the costume WORLD describes). 원소 몫 머리색 10 · 눈 색 4 만 더했다. 검사가 game 표와 대조하고 설계표 look 값이 어휘에 다 있는지 본다
- lib/prompt-element.js — build 가 AGE · SILHOUETTE · FACE(설계표 look, 직접 고른 묶음은 빠진다) · EXPOSURE(세계로 겉옷 꼴) · IDENTITY(직접 고른 외형 목록, game 의 paramValues 그대로)를 싣는다. opts.look = {params, faceDesignOn, silhouetteOn, exposure}, normLook 이 저장값을 바로잡고 기록에 look·design 이 남는다
- lib/studio.js · lib/studio.css · lib/words.js · prompt.html — 세계 그림 갈래가 세계 → 설계 줄(실루엣·얼굴 싣기 + 설계표 값 목록 + 왜 + 노출) → 외형(네 묶음 접는 칸, 무작위·초기화, 설계가 쥔 칸 표시, 직접 입력) → 덧붙임. 외형은 카드×세계마다 저장(element_studio_v1 looks). 폰 막대도
- tests/prompt-element.cjs · tests/screen.cjs(85가지) · tests/words.cjs — 외형 줄·차례·이김·끄기·노출·기록, 생성기 두 칸, 표 파일 셋
- AGENTS.md · IMAGE_RULES.md · docs/ELEMENT_CONCEPT.md · docs/PORT_NOTES.md — 외형 규칙

## 2026-10-30 · claude · 화풍은 CGI 하나로 · 일상컷은 세계 그림을 참고 그림으로(세계를 탄다)
- data/style.json · IMAGE_RULES.md · AGENTS.md · docs/ELEMENT_CONCEPT.md — 화풍은 game_cgi 하나로 통일(사용자 「cgi로 통일하자」). game_keyart·cinematic_keyart 는 이미 뽑은 그림들의 열쇠로만. 일상컷은 그 세계 그림을 참고 그림으로 붙인 그 사람의 지금 평상시(사용자 「일상컷은 참고 이미지가 있어야 돼서 그 화풍을 따라가야 돼」) — 세계를 타고 화풍은 그 그림의 것
- lib/prompt-spec.js · lib/prompt-element.js — 일상컷 INPUT·CHARACTER·WARDROBE·ANGLE 을 game 의 「첨부 그림의 그 여자」 꼴로(얼굴·머리·몸만 가져오고 옷·갑옷·배경은 버린다), buildCasual(…, {world}) — 카드가 안 사는 세계면 ''. 파일 이름 <카드>_<세계>_<화풍>_f_casualN.webp, 기록에 world·ref(참고 그림 파일)
- lib/studio.js · lib/studio.css · prompt.html · lib/words.js — 일상컷 갈래의 첫 칸이 세계(참고 그림). 결과에 참고 그림 줄(등록돼 있으면 작은 그림, 없으면 「아직 없다 — 세계 그림을 먼저」), 주소 ?world= 는 일상컷에도. 랜덤·처음부터 다시가 세계도 다룬다
- tools/register-images.py · lib/img.js · dex.html · index.html — 세계 붙은 일상컷은 그 세계 몫(byForm.<세계>.casual)에, 세계 없는 옛 시안 셋은 화풍 몫에 그대로. IMG.casualsOf([{file, world}])로 도감 일상컷 줄에 세계 이름, 첫 화면 그림 수도 센다. 특별컷은 세계를 안 탄다
- tests/prompt-element.cjs · tests/screen.cjs(69가지) · tests/register-images.py — 첨부 줄 · 세 세계 · 안 사는 세계 거름 · 파일 이름·기록 · 생성기 세계 칸·참고 그림 줄·주소 · 등록기 세계 몫 일상컷·옛 시안·--prune

## 2026-10-30 · claude · 오가네손 근본도 세 화풍 나란히 — CGI 세 장 · 시네마틱 키아트 세 장 등록
- data/img.json — og_<세계>_game_cgi_f.webp · og_<세계>_cinematic_keyart_f.webp 여섯 장 등록(사용자 「철 말고 오가네손도 똑같이, 다른 화풍 3개씩」). 2.5D 시안 세 장과 함께 도감 근본 칸에 세 줄로 보인다. 그림 저장소 기록은 records/og/<세계>-ui.json(기본 CGI) · <세계>.cinematic_keyart-ui.json

## 2026-10-30 · claude · 도감 — 기본 화풍 밖에 등록된 세계 그림도 「다른 화풍」 줄로 보인다
- dex.html — 카드마다 기본 화풍 줄 아래에, 다른 화풍으로 등록된 세계 그림을 화풍 이름 붙여 한 줄씩(점선 테두리). 기본을 game_cgi 로 바꾼 뒤 2.5D 시안 열두 장이 도감에서 안 보이던 것(사용자 「처음 2.5D 뽑은 이미지는 어디 갔지」). 기본 화풍 그림이 없는 카드는 첫 화풍이 본 줄
- lib/element.css · lib/words.js — .alt-row · .style-note · dex.style.alt. tests/screen.cjs — 다른 화풍 줄 수·이름·그림 검사

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
