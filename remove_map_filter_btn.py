content = open('Nesay_IL.html').read()
old = '\n    <button class="M-pill" onclick="openFilterPanel()">🔧 <span id="mFilterLbl" data-i18n="filter.label">Фильтры</span></button>'
if old in content:
    content = content.replace(old, '')
    open('Nesay_IL.html', 'w').write(content)
    print('OK: removed from map, SAVED')
else:
    print('FAIL: anchor not found')
