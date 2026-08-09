content = open('Nesay_IL.html').read()
old = '<button type="button" class="M-sort-btn" style="border:none" onclick="openFilterPanel()">🔧 <span id="mFilterLbl2">Фильтры</span></button>'
new = '<button type="button" class="M-sort-btn" style="border:none;position:relative;z-index:50" onclick="openFilterPanel()">🔧 <span id="mFilterLbl2">Фильтры</span></button>'
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
