content = open('Nesay_IL.html').read()
old = '<div class="filters-scroll" id="filterPills">'
new = '<div class="filters-scroll" id="filterPills" style="overflow:visible">'
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
