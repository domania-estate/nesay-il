content = open('Nesay_IL.html').read()
old = '''    <button class="ctab rt" onclick="selCat(this,'rent-apt')"><span class="ctab-ico">🏢</span><span data-i18n="nav.rent_apt">Аренда квартир</span></button>
    <button class="ctab rt" onclick="selCat(this,'rent-villa')"><span class="ctab-ico">🏡</span><span data-i18n="nav.rent_villa">Аренда домов</span></button>
    <button class="ctab st" onclick="selCat(this,'buy-apt')"><span class="ctab-ico">🔑</span><span data-i18n="nav.buy_apt">Покупка квартир</span></button>
    <button class="ctab st" onclick="selCat(this,'buy-villa')"><span class="ctab-ico">🌿</span><span data-i18n="nav.buy_villa">Покупка домов</span></button>
'''
if old in content:
    content = content.replace(old, '')
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
