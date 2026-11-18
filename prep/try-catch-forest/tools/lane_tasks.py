# usage: python lane2_tasks.py <submission_id>   - outstanding replays on the battles of that (live) submission
# Hybrid live (41747326): mimic copy A on its 5-unit battles, then on its 3-unit battles (the hybrid plays v10 there,
#   so the arena game is v10's game: a direct pair of copy A against v10).
# Any other live submission (e.g. the user's own version): v10 and mimic C on every battle, mimic A on every battle
#   (hybrid = mimic A in 4-unit battles, v10's replay elsewhere), battle by battle; then the other two mimics.
import json, os, sys
sub = sys.argv[1]
rows = json.load(open('rows_%s.json' % sub)); rows.sort(key=lambda r: r['id'])


def missing(lab, g):
    fn = 'r%s_%s/%d.json' % (sub, lab, g)
    if not os.path.exists(fn) or os.path.getsize(fn) == 0: return True
    try: return 'log' not in json.load(open(fn, encoding='utf-8'))
    except ValueError: return True


B = {'v10': 'dbg10', 'mimicA': 'mim/dbg', 'mimicC': 'vmimic_c/dbg', 'mimic3': 'vmimic3/dbg', 'mimic2': 'vmimic2/dbg', 'press': 'vpress/dbg'}
out = []
if sub == '41747326':
    for size in (5, 3):
        for r in rows:
            if r['N'] == size and missing('mimicA', r['id']): out.append(('mimicA', r['id']))
else:
    for r in rows[:24]:
        for lab in ('v10', 'mimicA', 'mimicC'):
            if missing(lab, r['id']): out.append((lab, r['id']))
    for r in rows[:24]:
        for lab in ('mimic3', 'mimic2'):
            if missing(lab, r['id']): out.append((lab, r['id']))
for lab, g in out[:3]:
    os.makedirs('r%s_%s' % (sub, lab), exist_ok=True)
    print('r%s_%s' % (sub, lab), B[lab], g)
