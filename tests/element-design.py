#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""설계표 검사기가 규칙마다 제대로 거는지 — 진짜 표는 통과하고, 망가뜨린 사본은 걸린다.
    python3 tests/element-design.py"""
import copy
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "tools"))
import roster  # noqa: E402
import importlib  # noqa: E402
ed = importlib.import_module("element-design")

doc = roster.design()
errs, warns = ed.check(doc)
assert not errs, "진짜 설계표가 걸린다:\n" + "\n".join(errs)


def broken(mut):
    d = copy.deepcopy(doc)
    mut(d)
    return ed.check(d)[0]


def fe(d):
    return [n for n in d["nations"] if n["key"] == "fe"][0]


cases = {
    "struct 모르는 칸": lambda d: fe(d).__setitem__("struct", {"fantasy": {"2": {"얼굴": "oval"}}}),
    "struct 모르는 절": lambda d: fe(d).__setitem__("struct", {"fantasy": {"5": {"액션": "서 있음"}}}),
    "struct 빈 글": lambda d: fe(d).__setitem__("struct", {"mecha": {"4": {"액션": " "}}}),
    "struct 괄호": lambda d: fe(d).__setitem__("struct", {"mecha": {"3": {"상의": "[갑옷]"}}}),
    "struct 모르는 세계": lambda d: fe(d).__setitem__("struct", {"modern": {"2": {"얼굴형": "oval face"}}}),
    "주민 struct 안 사는 세계": lambda d: fe(d)["families"][0]["citizens"][0].__setitem__("struct", {w: {"4": {"액션": "서 있음"}} for w in ("fantasy", "steampunk", "mecha") if w not in fe(d)["families"][0]["citizens"][0]["worlds"]} or {"modern": {}}),
    "세계 셋이 아님": lambda d: d["vocab"].__setitem__("worlds", ["fantasy", "steampunk", "modern", "mecha"]),
    "원소 118 아님": lambda d: d["elements"].pop(),
    "모르는 나라": lambda d: d["nations"].append({"key": "xx"}),
    "persona 빔": lambda d: fe(d).__setitem__("persona", ""),
    "traits.en 짧음": lambda d: fe(d)["traits"].__setitem__("en", "iron"),
    "traits.en 에 한국어": lambda d: fe(d)["traits"].__setitem__("en", fe(d)["traits"]["en"] + " 철"),
    "세계 빠짐": lambda d: fe(d)["worlds"].pop("mecha"),
    "메카 설계 빠짐": lambda d: fe(d)["worlds"]["mecha"].pop("design"),
    "가문 열쇠에 하이픈": lambda d: fe(d)["families"][0].__setitem__("key", "st-eel"),
    "가문 elements 에 제 나라 없음": lambda d: fe(d)["families"][0].__setitem__("elements", ["c"]),
    "가문 elements 에 모르는 원소": lambda d: fe(d)["families"][0]["elements"].append("zz"),
    "주민 worlds 빔": lambda d: fe(d)["families"][0]["citizens"][0].__setitem__("worlds", []),
    "주민 모르는 세계": lambda d: fe(d)["families"][0]["citizens"][0].__setitem__("worlds", ["now"]),
    "주민 object 빔": lambda d: fe(d)["families"][0]["citizens"][0].__setitem__("object", {"en": ""}),
    "주민 열쇠 겹침": lambda d: fe(d)["families"][0]["citizens"][1].__setitem__("key", fe(d)["families"][0]["citizens"][0]["key"]),
}
for name, mut in cases.items():
    got = broken(mut)
    assert got, "검사기가 못 걸었다: " + name

# 경고 — 겹치는 가문이 서로를 가리키지 않으면
d = copy.deepcopy(doc)
h = [n for n in d["nations"] if n["key"] == "h"][0]
[f for f in h["families"] if f["key"] == "water"][0]["elements"] = ["h"]
_, w = ed.check(d)
assert any("가문 water" in x for x in w), "겹치는 가문 경고가 없다"

print("PASS 설계표 검사기: 진짜 표 통과 · 망가뜨린 %d가지 다 걸림 · 겹치는 가문 경고" % len(cases))

# 세계 그림 실루엣(2026-11-09 「원소 특징에 맞게 분배」) — 근본 · 가문주 · 세계마다 표의 갈래가 있고, 모든 갈래가 어느 원소 성격 묶음에 들어 있다
import subprocess
_r = subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tools', 'sil-spread.py'), '--check'], capture_output=True, text=True)
assert _r.returncode == 0 and '실루엣 통과' in _r.stdout, _r.stdout + _r.stderr
print('PASS 실루엣 분배: ' + _r.stdout.strip().splitlines()[-1])
