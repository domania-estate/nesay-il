content = open('Nesay_IL.html').read()
changes = 0

old_btn = '<button class="fpill" data-filter="new" onclick="toggleFPill(this)">Новые</button>'
new_btn = old_btn + '\n        <button class="fpill" data-filter="owner" onclick="toggleFPill(this)">От собственника</button>\n        <button class="fpill" data-filter="agency" onclick="toggleFPill(this)">От агентства</button>'
if old_btn in content:
    content = content.replace(old_btn, new_btn)
    changes += 1
    print('OK: buttons added')
else:
    print('FAIL: button anchor not found')

old_map_end = "new:(d)=>d.badge==='new',\n};"
new_map_end = "new:(d)=>d.badge==='new',\n  owner:(d)=>d.agent.type==='owner',\n  agency:(d)=>d.agent.type==='agency'||d.agent.type==='agent',\n};"
if old_map_end in content:
    content = content.replace(old_map_end, new_map_end)
    changes += 1
    print('OK: FILTER_MAP updated')
else:
    print('FAIL: FILTER_MAP anchor not found')

if changes == 2:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED - fix anchors first')
