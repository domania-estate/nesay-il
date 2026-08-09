content = open('Nesay_IL.html').read()
old = '\n            <button class="fchip" data-filter="new" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.new">Новые</button>'
if old in content:
    content = content.replace(old, '')
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
