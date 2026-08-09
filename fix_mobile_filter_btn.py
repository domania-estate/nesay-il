content = open('Nesay_IL.html').read()
old = '<span class="M-sort-btn" onclick="openFilterPanel()">🔧 <span id="mFilterLbl2">Фильтры</span></span>'
new = '<button type="button" class="M-sort-btn" style="border:none" onclick="openFilterPanel()">🔧 <span id="mFilterLbl2">Фильтры</span></button>'
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
