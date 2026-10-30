#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""원소 표 118칸의 사실 칸(번호·기호·이름·족·주기·분류·상태)을 data/element-design.json 의 elements 에 채운다.

한 번 돌리면 끝인 씨앗 도구다 — 설계 칸(nations)은 건드리지 않는다. 이름은 대한화학회 표기를 따르되 흔히 쓰는 말이 있으면 그것(나트륨·칼륨).
    python3 tools/seed-elements.py        # elements 만 새로 쓴다
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import roster  # noqa: E402

# 번호 차례. (기호, 한국어, 영어)
ROWS = """H 수소 Hydrogen|He 헬륨 Helium|Li 리튬 Lithium|Be 베릴륨 Beryllium|B 붕소 Boron|C 탄소 Carbon|N 질소 Nitrogen|O 산소 Oxygen|F 플루오린 Fluorine|Ne 네온 Neon|
Na 나트륨 Sodium|Mg 마그네슘 Magnesium|Al 알루미늄 Aluminium|Si 규소 Silicon|P 인 Phosphorus|S 황 Sulfur|Cl 염소 Chlorine|Ar 아르곤 Argon|K 칼륨 Potassium|Ca 칼슘 Calcium|
Sc 스칸듐 Scandium|Ti 타이타늄 Titanium|V 바나듐 Vanadium|Cr 크로뮴 Chromium|Mn 망가니즈 Manganese|Fe 철 Iron|Co 코발트 Cobalt|Ni 니켈 Nickel|Cu 구리 Copper|Zn 아연 Zinc|
Ga 갈륨 Gallium|Ge 저마늄 Germanium|As 비소 Arsenic|Se 셀레늄 Selenium|Br 브로민 Bromine|Kr 크립톤 Krypton|Rb 루비듐 Rubidium|Sr 스트론튬 Strontium|Y 이트륨 Yttrium|Zr 지르코늄 Zirconium|
Nb 나이오븀 Niobium|Mo 몰리브데넘 Molybdenum|Tc 테크네튬 Technetium|Ru 루테늄 Ruthenium|Rh 로듐 Rhodium|Pd 팔라듐 Palladium|Ag 은 Silver|Cd 카드뮴 Cadmium|In 인듐 Indium|Sn 주석 Tin|
Sb 안티모니 Antimony|Te 텔루륨 Tellurium|I 아이오딘 Iodine|Xe 제논 Xenon|Cs 세슘 Caesium|Ba 바륨 Barium|La 란타넘 Lanthanum|Ce 세륨 Cerium|Pr 프라세오디뮴 Praseodymium|Nd 네오디뮴 Neodymium|
Pm 프로메튬 Promethium|Sm 사마륨 Samarium|Eu 유로퓸 Europium|Gd 가돌리늄 Gadolinium|Tb 터븀 Terbium|Dy 디스프로슘 Dysprosium|Ho 홀뮴 Holmium|Er 어븀 Erbium|Tm 툴륨 Thulium|Yb 이터븀 Ytterbium|
Lu 루테튬 Lutetium|Hf 하프늄 Hafnium|Ta 탄탈럼 Tantalum|W 텅스텐 Tungsten|Re 레늄 Rhenium|Os 오스뮴 Osmium|Ir 이리듐 Iridium|Pt 백금 Platinum|Au 금 Gold|Hg 수은 Mercury|
Tl 탈륨 Thallium|Pb 납 Lead|Bi 비스무트 Bismuth|Po 폴로늄 Polonium|At 아스타틴 Astatine|Rn 라돈 Radon|Fr 프랑슘 Francium|Ra 라듐 Radium|Ac 악티늄 Actinium|Th 토륨 Thorium|
Pa 프로트악티늄 Protactinium|U 우라늄 Uranium|Np 넵투늄 Neptunium|Pu 플루토늄 Plutonium|Am 아메리슘 Americium|Cm 퀴륨 Curium|Bk 버클륨 Berkelium|Cf 캘리포늄 Californium|Es 아인슈타이늄 Einsteinium|Fm 페르뮴 Fermium|
Md 멘델레븀 Mendelevium|No 노벨륨 Nobelium|Lr 로렌슘 Lawrencium|Rf 러더포듐 Rutherfordium|Db 더브늄 Dubnium|Sg 시보귬 Seaborgium|Bh 보륨 Bohrium|Hs 하슘 Hassium|Mt 마이트너륨 Meitnerium|Ds 다름슈타튬 Darmstadtium|
Rg 뢴트게늄 Roentgenium|Cn 코페르니슘 Copernicium|Nh 니호늄 Nihonium|Fl 플레로븀 Flerovium|Mc 모스코븀 Moscovium|Lv 리버모륨 Livermorium|Ts 테네신 Tennessine|Og 오가네손 Oganesson"""

# 분류 — 흔한 주기율표 색 묶음
CAT = {}
for s in "Li Na K Rb Cs Fr".split(): CAT[s] = "alkali"
for s in "Be Mg Ca Sr Ba Ra".split(): CAT[s] = "alkaline_earth"
for s in "Sc Ti V Cr Mn Fe Co Ni Cu Zn Y Zr Nb Mo Tc Ru Rh Pd Ag Cd Hf Ta W Re Os Ir Pt Au Hg Rf Db Sg Bh Hs Mt Ds Rg Cn".split(): CAT[s] = "transition"
for s in "Al Ga In Sn Tl Pb Bi Po Nh Fl Mc Lv".split(): CAT[s] = "post_transition"
for s in "B Si Ge As Sb Te".split(): CAT[s] = "metalloid"
for s in "H C N O P S Se".split(): CAT[s] = "nonmetal"
for s in "F Cl Br I At Ts".split(): CAT[s] = "halogen"
for s in "He Ne Ar Kr Xe Rn Og".split(): CAT[s] = "noble_gas"
GAS = set("H He N O F Ne Cl Ar Kr Xe Rn".split())
LIQ = set("Br Hg".split())


def period_group(n):
    """번호 → (주기, 족). 란타넘족·악티늄족은 족이 없다(None)."""
    ends = [2, 10, 18, 36, 54, 86, 118]
    p = next(i + 1 for i, e in enumerate(ends) if n <= e)
    start = ([0] + ends)[p - 1] + 1
    off = n - start
    if p == 1:
        g = 1 if off == 0 else 18
    elif p in (2, 3):
        g = off + 1 if off < 2 else off + 11
    elif p in (4, 5):
        g = off + 1
    else:
        if 2 <= off <= 16:
            return p, None          # La~Lu · Ac~Lr
        g = off + 1 if off < 2 else off - 14 + 1
    return p, g


def main():
    rows = [r.strip().split() for r in ROWS.replace("\n", "").split("|") if r.strip()]
    assert len(rows) == 118, len(rows)
    out = []
    for i, (sym, ko, en) in enumerate(rows, 1):
        p, g = period_group(i)
        cat = CAT.get(sym) or ("lanthanide" if 57 <= i <= 71 else "actinide" if 89 <= i <= 103 else "unknown")
        state = "gas" if sym in GAS else "liquid" if sym in LIQ else "unknown" if i >= 99 else "solid"
        out.append({"number": i, "symbol": sym, "key": sym.lower(), "ko": ko, "en": en,
                    "category": cat, "period": p, "group": g, "state": state, "synthetic": i >= 93 or sym in ("Tc", "Pm")})
    doc = roster.read("element-design")
    doc["elements"] = out
    roster.write("element-design", doc)
    print("elements", len(out))


if __name__ == "__main__":
    main()
