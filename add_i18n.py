content = open('Nesay_IL.html').read()
changes = 0

# RU dictionary
old_ru = "'filter.balcony':'Балкон','filter.garden':'Сад','filter.sea':'Море 🌊','filter.new':'Новые',"
new_ru = old_ru + "\n    'filter.owner':'От собственника','filter.agency':'От агентства','filter.elevator':'Лифт','filter.ac':'Кондиционер','filter.furnished':'Мебель','filter.pets':'Можно с животными','filter.label':'Фильтры',"
if old_ru in content:
    content = content.replace(old_ru, new_ru); changes += 1; print('OK: RU dict')
else:
    print('FAIL: RU dict anchor')

# EN dictionary
old_en = "'filter.balcony':'Balcony','filter.garden':'Garden','filter.sea':'Sea 🌊','filter.new':'New',"
new_en = old_en + "\n    'filter.owner':'From owner','filter.agency':'From agency','filter.elevator':'Elevator','filter.ac':'A/C','filter.furnished':'Furnished','filter.pets':'Pets allowed','filter.label':'Filters',"
if old_en in content:
    content = content.replace(old_en, new_en); changes += 1; print('OK: EN dict')
else:
    print('FAIL: EN dict anchor')

# HE dictionary
old_he = "'filter.balcony':'מרפסת','filter.garden':'גינה','filter.sea':'ים 🌊','filter.new':'חדש',"
new_he = old_he + "\n    'filter.owner':'מבעל הבית','filter.agency':'מסוכנות','filter.elevator':'מעלית','filter.ac':'מזגן','filter.furnished':'מרוהטת','filter.pets':'מותר בעלי חיים','filter.label':'סינון',"
if old_he in content:
    content = content.replace(old_he, new_he); changes += 1; print('OK: HE dict')
else:
    print('FAIL: HE dict anchor')

# HTML spans - add data-i18n
replacements = [
    ('<span>От собственника</span>', '<span data-i18n="filter.owner">От собственника</span>'),
    ('<span>От агентства</span>', '<span data-i18n="filter.agency">От агентства</span>'),
    ('<span>Новые</span>', '<span data-i18n="filter.new">Новые</span>'),
    ('<span>Лифт</span>', '<span data-i18n="filter.elevator">Лифт</span>'),
    ('<span>Кондиционер</span>', '<span data-i18n="filter.ac">Кондиционер</span>'),
    ('<span>Мебель</span>', '<span data-i18n="filter.furnished">Мебель</span>'),
    ('<span>Можно с животными</span>', '<span data-i18n="filter.pets">Можно с животными</span>'),
    ('<span id="filterLbl">Фильтры</span>', '<span id="filterLbl" data-i18n="filter.label">Фильтры</span>'),
]
for old, new in replacements:
    if old in content:
        content = content.replace(old, new); changes += 1; print('OK:', old[:30])
    else:
        print('FAIL:', old[:30])

# toggleFCheck: use t() instead of hardcoded 'Фильтры'
old_fn = "if(lbl)lbl.textContent=n>0?('Фильтры ('+n+')'):'Фильтры';"
new_fn = "if(lbl)lbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');"
if old_fn in content:
    content = content.replace(old_fn, new_fn); changes += 1; print('OK: toggleFCheck uses t()')
else:
    print('FAIL: toggleFCheck anchor')

print('Total changes:', changes, '/ 12')
if changes == 12:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED - some anchors missing, send me this output')
