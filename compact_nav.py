content = open('Nesay_IL.html').read()
changes = 0

old_ctab = ".ctab{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;border:none;background:none;cursor:pointer;font-family:var(--font);white-space:nowrap;transition:all .2s;flex-shrink:0;font-size:13px;font-weight:600;color:var(--ink3)}"
new_ctab = ".ctab{display:flex;align-items:center;gap:4px;padding:5px 9px;border-radius:20px;border:none;background:none;cursor:pointer;font-family:var(--font);white-space:nowrap;transition:all .2s;flex-shrink:0;font-size:12px;font-weight:600;color:var(--ink3)}"
if old_ctab in content:
    content = content.replace(old_ctab, new_ctab); changes += 1; print('OK: ctab compacted')
else:
    print('FAIL: ctab anchor')

old_ico = ".ctab-ico{font-size:14px}"
new_ico = ".ctab-ico{font-size:12px}"
if old_ico in content:
    content = content.replace(old_ico, new_ico); changes += 1; print('OK: icon size reduced')
else:
    print('FAIL: icon anchor')

old_cats = ".cats{display:flex;gap:1px;overflow-x:auto;scrollbar-width:none;flex:1;padding:0 4px}"
new_cats = ".cats{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;flex:1;padding:0 4px;min-width:0}"
if old_cats in content:
    content = content.replace(old_cats, new_cats); changes += 1; print('OK: cats row tightened')
else:
    print('FAIL: cats anchor')

print('Total:', changes, '/ 3')
if changes == 3:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
