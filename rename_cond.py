content = open('Nesay_IL.html').read()
changes = 0

old_btn = '<button class="fcond" data-cond="needs_repair" onclick="toggleCondition(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="cond.needsRepair">Требует ремонта</button>'
new_btn = '<button class="fcond" data-cond="needs_repair" onclick="toggleCondition(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="cond.needsRepair">Без ремонта</button>'
if old_btn in content:
    content = content.replace(old_btn, new_btn); changes += 1; print('OK: button label')
else:
    print('FAIL: button anchor')

old_i18n = "'cond.needsRepair':'Требует ремонта',"
new_i18n = "'cond.needsRepair':'Без ремонта',"
if old_i18n in content:
    content = content.replace(old_i18n, new_i18n); changes += 1; print('OK: RU i18n')
else:
    print('FAIL: RU i18n anchor')

print('Total:', changes, '/ 2')
if changes == 2:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
