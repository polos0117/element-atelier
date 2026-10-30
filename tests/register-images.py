"""그림 등록 — 근본·가문주·주민의 세계 그림과 일상컷이 제자리에, 틀린 이름은 저장하지 않고 실패. game-atelier 의 같은 검사에서 왔다(2026-10-30). python3 tests/register-images.py"""
import contextlib, copy, importlib.util, io, os, subprocess, sys, tempfile
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
spec = importlib.util.spec_from_file_location('register_images', ROOT / 'tools' / 'register-images.py')
reg = importlib.util.module_from_spec(spec); spec.loader.exec_module(reg)

# 실제 자료의 열쇠를 쓴다 — 설계표·화풍 기록과 등록기가 같은 말을 하는지도 같이 본다
forms = reg.roster.forms()
styles = reg.roster.styles()
cards = reg.roster.cards()
assert list(forms) == ['fantasy', 'steampunk', 'mecha'], forms
assert 'game_keyart' in styles, styles
for k in ('fe', 'fe-steel', 'fe-steel-sword', 'h-water-bottle', 'og'):
    assert k in cards, k
assert 'zz' not in cards and 'fe_steel' not in cards and all('_' not in k for k in cards), '카드 열쇠에 밑줄이 없다'
S = 'game_keyart'


real_read = reg.roster.read


def run(doc, folder, argv=(), day='2026-10-30'):
    """img.json 만 바꿔 끼우고 설계표·화풍 기록은 실제 것을 읽는다. 매번 새로 읽어 앞 차례가 고친 것이 새지 않게"""
    out = io.StringIO()
    with patch.object(reg, 'IMG_DIR', folder), patch.object(reg, 'EXTRA_DIRS', []), patch.object(reg, 'today', return_value=day), \
         patch.object(reg.roster, 'read', side_effect=lambda n: copy.deepcopy(doc) if n == 'img' else real_read(n)), \
         patch.object(reg.roster, 'art_size', return_value=[]), \
         patch.object(reg.roster, 'write') as write, \
         patch.object(sys, 'argv', ['register-images.py', *argv]), contextlib.redirect_stdout(out):
        try:
            reg.main(); code = 0
        except SystemExit as e:
            code = e.code
    return code, (write.call_args[0][1] if write.called else None), out.getvalue()


with tempfile.TemporaryDirectory() as d:
    # 근본은 세계 셋, 가문주·주민은 한 세계씩 — 세 층의 열쇠(붙임표 포함)가 다 카드로 읽혀야 한다
    root = {w: f'fe_{w}_{S}_f.webp' for w in ('fantasy', 'steampunk', 'mecha')}
    lord = f'fe-steel_fantasy_{S}_f.webp'
    citizen = f'fe-steel-sword_mecha_{S}_f.webp'
    cas = [f'fe_{S}_f_casual2.webp', f'h-water-bottle_{S}_f_casual1.webp']
    ext = f'og_{S}_f_extra1.webp'
    for n in [*root.values(), lord, citizen, *cas, ext, 'style-sample.webp']:
        (Path(d) / n).touch()
    code, saved, out = run({'img': {}, 'added': {}}, d)
    assert code == 0 and saved, out
    fe = saved['img']['fe']['byStyle'][S]
    assert {k: v['f'] for k, v in fe['byForm'].items()} == root, fe
    assert list(fe['byForm']) == ['fantasy', 'steampunk', 'mecha'], '세계 차례'
    assert fe['casual']['f'] == [cas[0]] and 'byForm' not in saved['img']['h-water-bottle']['byStyle'][S]
    assert saved['img']['fe-steel']['byStyle'][S]['byForm'] == {'fantasy': {'f': lord}}
    assert saved['img']['fe-steel-sword']['byStyle'][S]['byForm'] == {'mecha': {'f': citizen}}
    assert saved['img']['h-water-bottle']['byStyle'][S]['casual']['f'] == [cas[1]]
    assert saved['img']['og']['byStyle'][S]['extra']['f'] == [ext]
    assert saved['count'] == 5 and 'where' not in saved, saved.keys()
    assert sorted(saved['added']) == sorted([*root.values(), lord, citizen, *cas, ext]) and set(saved['added'].values()) == {'2026-10-30'}
    # 다시 돌려도 겹치지 않는다
    code, again, out = run(saved, d)
    assert code == 0 and reg.listed_files(again['img']) == set([*root.values(), lord, citizen, *cas, ext]), out

    # 틀린 이름은 하나라도 있으면 아무것도 저장하지 않는다
    for bad, why in [(f'fe_modern_{S}_f.webp', '그런 카드가 없다'),            # 없는 세계 → 카드 이름으로 읽혀 실패
                     (f'zz_fantasy_{S}_f.webp', '그런 카드가 없다'),            # 없는 나라
                     (f'fe-steel-swords_fantasy_{S}_f.webp', '그런 카드가 없다'),  # 없는 주민(오타)
                     (f'fe_steel_fantasy_{S}_f.webp', '그런 카드가 없다'),      # 층 사이를 밑줄로 — 열쇠는 붙임표다
                     (f'og_fantasy_watercolor_f.webp', '그런 카드가 없다'),     # 없는 화풍 → 카드 이름으로 읽혀 실패
                     (f'og_fantasy_{S}.webp', '이름 꼴'),                      # 성별 표시 없음
                     (f'og_{S}_f.webp', '세계 열쇠가 없다'),                    # 세계 없는 세계 그림
                     (f'og_fantasy_{S}_f_casual1.webp', '세계를 안 탄다'),       # 일상컷은 세계를 안 탄다
                     (f'fe_fantasy_{S}_f_action1.webp', '이름 꼴')]:           # 연출컷은 없다
        p = Path(d) / bad; p.touch()
        code, s2, out = run(saved, d)
        assert code == 1 and s2 is None and why in out, (bad, out)
        p.unlink()
    # 같은 자리 둘
    (Path(d) / f'fe_{S}_f_casual02.webp').touch()
    code, s2, out = run({'img': {}}, d)
    assert code == 1 and '중복' in out, out

# 등록한 날(added) — 새로 적힌 것만 오늘, 있던 날짜는 그대로, 날짜를 지어내지 않는다
with tempfile.TemporaryDirectory() as d:
    a1, a2, a3 = (f'og_{w}_{S}_f.webp' for w in ('fantasy', 'steampunk', 'mecha'))
    (Path(d) / a1).touch()
    code, s1, out = run({'img': {}}, d, day='2026-10-10')
    assert code == 0 and s1['added'] == {a1: '2026-10-10'}, out
    code, s2, out = run(s1, d, day='2026-10-12')
    assert code == 0 and s2['added'] == {a1: '2026-10-10'}, ('다시 돌려도 날짜는 그대로', out)
    # 날짜 없이 적혀 있던 그림(이 기능 전의 등록)은 날짜 없이 남는다 — 오늘로 메우지 않는다
    old = copy.deepcopy(s1); old.pop('added')
    (Path(d) / a2).touch()
    code, s3, out = run(old, d, day='2026-10-12')
    assert code == 0 and s3['added'] == {a2: '2026-10-12'}, ('옛 그림은 날짜 없이', out)
    # 틀린 날짜는 버린다 · --check 는 쓰지 않는다
    bad = copy.deepcopy(s3); bad['added'][a1] = 'yesterday'
    code, s4, out = run(bad, d)
    assert code == 0 and a1 not in s4['added'] and s4['added'][a2] == '2026-10-12', out
    code, s5, out = run(s1, d, ['--check'])
    assert code == 0 and s5 is None and '등록한 날' in out and '[대조]' in out, out
    # 파일이 사라지면 --prune 때 날짜도 빠진다. --prune 이 아니면 자리와 날짜를 남긴다
    (Path(d) / a1).unlink()
    code, s6, out = run(s3 | {'added': {a1: '2026-10-10', a2: '2026-10-12'}}, d)
    assert code == 0 and s6['added'] == {a1: '2026-10-10', a2: '2026-10-12'}, out
    code, s7, out = run(s6, d, ['--prune'])
    assert code == 0 and s7['added'] == {a2: '2026-10-12'}, out
    assert list(s7['img']['og']['byStyle'][S]['byForm']) == ['steampunk'], '빠진 세계 칸은 지운다'
    # 오류가 있으면 날짜도 저장하지 않는다
    (Path(d) / 'og_fantasy_watercolor_f.webp').touch()
    code, s8, out = run(s7, d)
    assert code == 1 and s8 is None, out

# --backfill-added — 그림 저장소 git 이력에서 처음 더해진 날. 얕은 저장소면 더 받고, 그래도 잘린 경계의 날짜는 버린다
def sh(*args, cwd=None, date=None):
    env = dict(os.environ, GIT_AUTHOR_NAME='t', GIT_AUTHOR_EMAIL='t@t', GIT_COMMITTER_NAME='t', GIT_COMMITTER_EMAIL='t@t',
               GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_NOSYSTEM='1')
    if date:
        env.update(GIT_AUTHOR_DATE=date + 'T12:00:00+0000', GIT_COMMITTER_DATE=date + 'T12:00:00+0000')
    return subprocess.run(args, cwd=cwd, env=env, check=True, capture_output=True, text=True).stdout


with tempfile.TemporaryDirectory() as t:
    src = Path(t) / 'src'; (src / 'img').mkdir(parents=True)
    sh('git', 'init', '-q', '-b', 'main', cwd=src)
    b1, b2, b3 = (f'h-water-bottle_{w}_{S}_f.webp' for w in ('steampunk', 'mecha', 'fantasy'))
    b4 = f'h-water-bottle_{S}_f_casual1.webp'
    gone = f'h-water-bottle_{S}_f_casual2.webp'
    for date, add, rm in [('2026-10-01', [b1, gone], []), ('2026-10-03', [b2], [gone]), ('2026-10-05', [b3], []), ('2026-10-07', [b4], [])]:
        for n in add:
            (src / 'img' / n).write_bytes(b'x')
        for n in rm:
            (src / 'img' / n).unlink()
        # 교체(같은 이름의 새 판)는 더하기가 아니다 — 날짜가 안 바뀐다
        if date == '2026-10-05':
            (src / 'img' / b1).write_bytes(b'y')
        sh('git', 'add', '-A', cwd=src); sh('git', 'commit', '-qm', date, cwd=src, date=date)
    hist = reg.history_dates(str(src))
    assert hist == {b1: '2026-10-01', b2: '2026-10-03', b3: '2026-10-05', b4: '2026-10-07', gone: '2026-10-01'}, hist
    # 가져온 날짜는 적힌 그림에만 · 이미 있는 날짜는 덮지 않는다 · 이력에 없는 그림은 날짜 없이
    folder = Path(t) / 'img'; folder.mkdir()
    for n in (b1, b2, b3, f'h-water-bottle_{S}_f_casual3.webp'):
        (folder / n).touch()
    code, base, out = run({'img': {}}, str(folder))
    seeded = base | {'added': {b2: '2026-10-09'}}
    code, s9, out = run(seeded, str(folder), ['--backfill-added', str(src)])
    assert code == 0 and s9['added'] == {b1: '2026-10-01', b2: '2026-10-09', b3: '2026-10-05'}, (s9.get('added'), out)
    # 얕게 받은 저장소(워크플로의 체크아웃) — 더 받으면 끝까지 맞고, 더 못 받으면 잘린 경계 커밋은 날짜로 쓰지 않는다
    for name, deepen, want in [('deep', (200, 5000), hist),
                               ('edge', (200, 0), {b4: '2026-10-07'})]:
        clone = Path(t) / name
        sh('git', 'clone', '-q', '--depth', '2', 'file://' + str(src), str(clone))
        with patch.object(reg, 'DEEPEN', deepen[0]), patch.object(reg, 'DEEPEN_MAX', deepen[1]):
            got = reg.history_dates(str(clone))
        assert got == want, (name, got)
print('PASS 그림 등록: 근본·가문주·주민의 세계 그림(fantasy·steampunk·mecha)·일상컷·특별컷 자리 · 다시 돌려도 그대로'
      ' · 없는 세계·카드·화풍·성별 표시·밑줄 열쇠·세계 없는 세계 그림·세계 붙은 일상컷·연출컷·같은 자리는 저장 안 함'
      ' · 등록한 날(새 것만 오늘·있던 날짜 그대로·지어내지 않음·틀린 날짜 버림·--check·--prune) · git 이력 채우기(교체·지운 것·얕은 저장소 경계)')
