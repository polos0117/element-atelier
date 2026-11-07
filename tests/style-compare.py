"""화풍 비교 묶음 — 열쇠 꼴 · 겹침 없음 · 목록의 화풍이 style.json 에 있나 · 그림 저장소에 파일(옆에 element-atelier-img 가 있을 때만).
   Run: python3 tests/style-compare.py"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, 'data', 'style-compare.json'), encoding='utf-8'))
assert d['worlds'] == ['fantasy', 'steampunk', 'mecha'], d['worlds']
keys = [r['key'] for r in d['rounds']]
assert len(keys) == len(set(keys)), '묶음 열쇠 겹침'
assert all(re.fullmatch(r'\d{4}-\d{2}-\d{2}(-\d+)?', k) for k in keys), keys
S = json.load(open(os.path.join(ROOT, 'data', 'style.json'), encoding='utf-8'))
for r in d['rounds']:
    for s in r['styles']:
        assert s['key'] in S['styles'], s['key']
img = os.path.join(os.path.dirname(ROOT), 'element-atelier-img')
if os.path.isdir(img):
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'style-compare.py'), 'check', img], check=True)
    nk = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'style-compare.py'), 'next', '2026-01-01'], check=True, capture_output=True, text=True).stdout.strip()
    assert nk not in keys, nk
print('PASS 화풍 비교 묶음: ' + str(len(keys)))
