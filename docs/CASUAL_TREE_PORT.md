# 일상컷 트리 옮기기 — game-atelier → 원소의 공방 (2026-10-30)

game-atelier 의 일상컷 트리 버전1·버전2 를 가져왔다. 모듈 둘은 글자 하나 다르지 않게, 표 둘은 원소 몫으로 고쳤다.
현대 컷(「지금 현실」)은 이 트리가 쥔다 — `docs/ELEMENT_CONCEPT.md` 6절의 5단계.

## 파일

| 파일 | 어디서 | 바꾼 것 |
|---|---|---|
| `lib/casual-tree.js` · `lib/casual-tree-v2.js` | game 과 byte-identical(`cmp`) | 없음 — game·book·myth·pkm 이 같이 쓰는 모듈. 여기서 고치지 않는다 |
| `tools/casual-tree.py` | game | 머리글 한 줄(「게임 속 일상」 → 「나라 안 일상 — required.world」). 규칙은 그대로 |
| `tools/casual-tree-v2.py` | game 과 byte-identical | 없음 |
| `tests/casual-tree.py` · `tests/casual-tree-v2.py` | game | 오락실·휴대용 게임기 사례를 현장·원소 소품으로, 시대 넷·필수 갈래(현장·나라 안)·since 없음 사례를 더했다 |
| `tests/casual-tree.cjs` | game | 생성기 표(`prompt-spec` POSE_OPTIONS·ORIENTATION_OPTIONS) 대조는 뺐다 — 원소 생성기엔 자세 표가 없다. CLOSE_FRAMES·LOOK_BACK 은 game 값을 파일 안에 적었다. 시대·required.world·year() null 사례를 더했다 |
| `tests/casual-tree-v2.cjs` | game | 휴대용 게임기 since 사례를 뺐다. 13절(현장·나라 안·원소 소품) 을 더했다. 알아볼 거리(`signature`)는 2026-10-30 「그 원소의 물건」 으로 되살렸다(설계표 `hold.en`·주민 `object.en`, 동작 셋) |
| `data/casual-tree.json` · `data/casual-tree-v2.json` | game 표에서 변환 | 아래 |

## 시대 열쇠

| game | 원소 | 뜻 |
|---|---|---|
| `now` | `now` | 지금 현실 |
| `release` | `site` | 쓰임의 현장 — 실험실·용광로·광산·염전·정유소·제어실·조폐소·천문대·충전소·공방. 출시 연도가 없어 `since` 를 쓰는 장소·소품이 하나도 없다 |
| `in_game` | `nation` | 나라 안 — 그 원소 나라(판타지·스팀펑크·메카)의 방·시장·들판·광장·목욕탕·지붕·여관 |
| `fantasy` | `fantasy` | 무대·환상 |

모듈이 시대 열쇠를 박아 둔 곳과 어떻게 맞췄나:

- `casual-tree.js` `places()`·`why()` — `eraKey === 'release'` 일 때만 `year(tree, card)` 로 `since` 를 거른다. 원소엔 `release` 시대가 없고 `since` 도 없다. `year()` 는 카드에 `facts.year`·`gen`·`era` 가 없으면 `null` 을 돌려주고 거르기를 건너뛴다(시험 `CT.year(tree, null) === null`, `CT.places(tree, 'release', …) === []`).
- `casual-tree.js` `worldRule()` — `required.world || required.in_game`. 원소 표는 `required.world = { era: 'nation', places: [nation_room · nation_bath · nation_roof · nation_inn], outfits: [homewear · lingerie · bath · swimwear] }`(game 의 in_game 규칙 그대로).
- `casual-tree.js` `repair()` 기본 시대 `'now'`, `fromLegacy()` 의 `was !== 'now'` — `now` 가 있으니 그대로.
- `casual-tree-v2.js` `propAt()` — `eraKey === 'release' && p.since` 만 연도를 본다. 원소 소품엔 `since` 가 없다. `fromV1()` 기본 시대 `'now'`.
- `ERA_YEAR`(arcade·8bit…) 는 카드의 `era` 칸을 보는 game 몫 — 원소 카드엔 그 칸이 없어 쓰이지 않는다.

## 버전1 표에서 뺀 것 · 더한 것

- 묶음: `arcade`(오락실·게임 가게) → `site`(원소의 현장), `game`(게임 세계) → `nation`(나라 안). `studio` 는 「작업실·공방」. 묶음·장소의 `screens` 표시는 다 뺐다.
- 뺀 장소 17: `arcade_*` 여섯, `studio_dev`·`studio_stream`·`studio_mocap`, `stage_contest`, `game_*` 일곱(그 게임의 장소 포함).
- 더한 장소 17: `site_lab`(화학 실험실) · `site_furnace`(제철소 용광로) · `site_mine`(광산 갱도) · `site_saltpan`(염전) · `site_refinery`(정유소·탱크) · `site_control`(발전소 제어실) · `site_mint`(조폐소·금고) · `site_observatory`(천문대) · `site_hydrogen`(수소 충전소) · `site_kiln`(유리·도자기 공방) — 시대 `now`·`site`; `nation_room`·`nation_market`·`nation_field`·`nation_square`·`nation_bath`·`nation_roof`·`nation_inn` — 시대 `nation`.
- 뺀 하는 일 22(오락실·PC방·사진 부스·개발실·방송·대회 무대·휴대용 게임기 등). 더한 하는 일 11: `inspect_sample`·`log_entry`·`goggles_up`·`dial_watch`·`valve_turn`·`furnace_watch`·`wipe_brow`·`rake_salt`·`lamp_check`·`cart_push`·`coin_count`. `game_*` 를 가리키던 하는 일은 `nation_*` 로, 「그 게임의 장소」 는 맞는 것만 `nation_square` 로. `@arcade` 자리엔 `@site`(앉아 쉬기·물 마시기·야근 커피 등). `backstage_ready` 의 `prefer: esports_jersey` 는 뺐다.
- 의상 14 계열 265 옷은 그대로(`low` 포함).
- 추천 조합 282 → 229, 묶음 25 → 20: `game_life_sensual`·`game_place`·`arcade_culture`·`dev_studio`·`speedrun_stream` 을 뺐고 `fest_ribbon`·`fest_rehearsal`(대회 무대)·`arcade_night` 도. `unexpected_contrast` 는 염전 산책(린넨 드레스), `sunroom_lounge` 는 소파에 기대 쉬기, `gyaru_street` 는 쇼핑몰 산책으로. `source_editorial` 묶음 이름은 「에디토리얼 패션」. 예전 기록 변환(legacy) 467 → 409 — 남은 추천만 가리킨다.

## 버전2 표에서 뺀 것 · 더한 것

- 장소 받침(`places`): 뺀 장소는 지우고, `nation_*` 는 game 의 `game_*` 받침을 그대로(광장은 「그 게임의 장소」 받침), 현장 열 곳은 새로 — 실험실 chair·table·worktable·wall·floor·rail_waist, 용광로 floor·wall·rail_waist·edge·worktable, 갱도 floor·wall·edge, 염전 floor·shallow_water·edge, 정유소 floor·wall·rail_waist·edge, 제어실 chair·table·rail_waist·wall·floor, 조폐소 table·chair·floor·wall·rail_waist, 천문대 rail_waist·chair·floor·wall·edge·table, 충전소 floor·wall·rail_waist, 공방 worktable·chair·floor·wall·edge.
- 새 장소(`extra_places`): `boardgame_lounge` 를 뺐다(오락실 묶음). 나머지 일곱은 그대로, 시대는 `now` 만.
- 소품: `gamepad`·`coin`·`handheld`(since 1989)·`arcade_panel`·`signature`(알아볼 거리) 를 뺐다. 더한 소품 여섯 — `test_tube`(시험관)·`flask`(플라스크)·`compass`(나침반)·`magnifier`(돋보기)·`hammer`(망치)·`salt_jar`(소금 항아리). 소품 동작 17 을 더했다(hold·raise·both 꼴, 작업대가 필요한 동작은 `needs_any`). 휴대폰은 `now` 만(나라 안엔 없다). `companion`·`banned` 칸은 없다.
- 어색한 조합(`awkward`): `@arcade`·`studio_dev` 를 빼고 `@site` 를 더했다(웨딩·목욕 차림·란제리풍으로 현장, 수영복으로 갱도·제어실·조폐소·천문대).
- 자세 추천 48 · 표정 · 프레이밍 · 렌즈 · 몸·머리·카메라·시선 · 받침 · 자세 · 손 · 다리 · 의상 특징 · 날씨 · 예전 기록 변환은 그대로.

## 검사

```bash
python3 tools/casual-tree.py check      # 일상컷 트리 통과 — 시대 4 · 장소 99 · 하는 일 155 · 옷 계열 14(옷 265) · 길 596 · 추천 조합 229 · 예전 기록 변환 409
python3 tools/casual-tree.py audit      # 고정물이 장소 문장에 없는 쌍 0
python3 tools/casual-tree-v2.py check   # presets 48 · postures 16 · hands 30 · legs 19 · props 36 · prop_uses 68 · 통과
python3 tests/casual-tree.py            # 검사기가 규칙마다 거는지(현장·나라 안 필수 갈래, since 없음)
python3 tests/casual-tree-v2.py         # 버전2 검사기 — 원소 소품 여섯
node tests/casual-tree.cjs              # 모듈 ↔ 검사기 길 596 · required.world · year() null
node tests/casual-tree-v2.cjs           # 추천×장소 · 랜덤 · 바꾸기 · 현장 · 나라 안 · 원소 소품
```

## 아직

- 생성기(`prompt.html`·`lib/prompt-element.js`)에 일상 갈래를 붙이는 일 — 이 문서 밖. 시대 `nation` 의 지시문은 카드의 세계 글(`worlds.<세계>.en`)을 장소 문장 뒤에 이어야 한다(game 의 `casualWorld` 자리).
- `AGENTS.md`·`docs/PORT_NOTES.md`·`docs/PATCH.md` 는 사람이 적는다.
