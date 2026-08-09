content = open('Nesay_IL.html').read()
changes = 0
total = 6

# 1. Replace nav buttons with dropdown-wrapped versions
old_nav = '''    <button class="ctab rt" onclick="selCat(this,'rent')"><span class="ctab-ico">🔵</span><span data-i18n="nav.rent">Аренда</span></button>
    <button class="ctab st" onclick="selCat(this,'sale')"><span class="ctab-ico">🟠</span><span data-i18n="nav.sale">Продажа</span></button>'''
new_nav = '''    <div class="sdd" style="position:relative;display:inline-block">
      <button class="ctab rt" onclick="event.stopPropagation();toggleDealDropdown('rent')"><span class="ctab-ico">🔵</span><span data-i18n="nav.rent">Аренда</span> ▾</button>
      <div class="smn" id="dealMenu-rent" style="min-width:190px">
        <div class="smi" onclick="pickDealType('rent',null)" data-i18n="nav.allTypes">Все типы</div>
        <div class="smi" onclick="pickDealType('rent','apartment')">🏢 <span data-i18n="type.apartment">Квартиры</span></div>
        <div class="smi" onclick="pickDealType('rent','house')">🏡 <span data-i18n="type.house">Дома и виллы</span></div>
        <div class="smi" onclick="pickDealType('rent','commercial')">🏬 <span data-i18n="type.commercial">Коммерция</span></div>
      </div>
    </div>
    <div class="sdd" style="position:relative;display:inline-block">
      <button class="ctab st" onclick="event.stopPropagation();toggleDealDropdown('sale')"><span class="ctab-ico">🟠</span><span data-i18n="nav.sale">Продажа</span> ▾</button>
      <div class="smn" id="dealMenu-sale" style="min-width:190px">
        <div class="smi" onclick="pickDealType('sale',null)" data-i18n="nav.allTypes">Все типы</div>
        <div class="smi" onclick="pickDealType('sale','apartment')">🏢 <span data-i18n="type.apartment">Квартиры</span></div>
        <div class="smi" onclick="pickDealType('sale','house')">🏡 <span data-i18n="type.house">Дома и виллы</span></div>
        <div class="smi" onclick="pickDealType('sale','commercial')">🏬 <span data-i18n="type.commercial">Коммерция</span></div>
      </div>
    </div>'''
if old_nav in content:
    content = content.replace(old_nav, new_nav); changes += 1; print('OK 1/6: nav dropdowns added')
else:
    print('FAIL 1/6: nav anchor not found')

# 2. Add propertyType to generator
old_gen = "const petsOpts=['yes','no','small_dog','small_cat'];const pets=petsOpts[Math.floor(Math.random()*petsOpts.length)];"
new_gen = old_gen + "const ptypes=['apartment','apartment','apartment','house','commercial'];const ptype=ptypes[Math.floor(Math.random()*ptypes.length)];"
if old_gen in content:
    content = content.replace(old_gen, new_gen); changes += 1; print('OK 2/6: generator var added')
else:
    print('FAIL 2/6: generator anchor')

old_push = "condition:cond,furnished:furn,petsPolicy:pets,hi:[0]"
new_push = "condition:cond,furnished:furn,petsPolicy:pets,propertyType:ptype,hi:[0]"
if old_push in content:
    content = content.replace(old_push, new_push); changes += 1; print('OK 3/6: propertyType added to listing')
else:
    print('FAIL 3/6: push anchor')

# 3. Add JS functions + global var
old_decl = "let lang='ru',activeCat='all',activeIdx=-1,loggedIn=false,selectedRole='user',authMode='login';"
new_decl = "let lang='ru',activeCat='all',activeIdx=-1,loggedIn=false,selectedRole='user',authMode='login',activePropertyType=null;\nfunction toggleDealDropdown(kind){\n  document.querySelectorAll('.smn').forEach(m=>{if(m.id!=='dealMenu-'+kind)m.classList.remove('open')});\n  document.getElementById('dealMenu-'+kind).classList.toggle('open');\n}\nfunction pickDealType(kind, ptype){\n  document.getElementById('dealMenu-'+kind).classList.remove('open');\n  const btn=document.querySelector(kind==='rent'?'.ctab.rt':'.ctab.st');\n  activePropertyType=ptype;\n  selCat(btn, kind);\n}"
if old_decl in content:
    content = content.replace(old_decl, new_decl); changes += 1; print('OK 4/6: JS functions added')
else:
    print('FAIL 4/6: decl anchor not found')

# 4. Filter by propertyType in getFiltered
old_gf = "if(activeType==='rent')d=d.filter(x=>x.dealType==='rent');"
new_gf = "if(activePropertyType)d=d.filter(x=>x.propertyType===activePropertyType);\n  if(activeType==='rent')d=d.filter(x=>x.dealType==='rent');"
if old_gf in content:
    content = content.replace(old_gf, new_gf); changes += 1; print('OK 5/6: propertyType filter wired in')
else:
    print('FAIL 5/6: getFiltered anchor not found')

# 5. i18n
i18n_adds = [
    ("'search.goToSearches':'Перейти к поискам',", "'search.goToSearches':'Перейти к поискам','nav.allTypes':'Все типы','type.apartment':'Квартиры','type.house':'Дома и виллы','type.commercial':'Коммерция',"),
    ("'search.goToSearches':'Go to searches',", "'search.goToSearches':'Go to searches','nav.allTypes':'All types','type.apartment':'Apartments','type.house':'Houses and villas','type.commercial':'Commercial',"),
    ("'search.goToSearches':'עבור לחיפושים',", "'search.goToSearches':'עבור לחיפושים','nav.allTypes':'כל הסוגים','type.apartment':'דירות','type.house':'בתים ופרטיות','type.commercial':'מסחרי',"),
]
ok_i18n = True
for old, new in i18n_adds:
    if old in content:
        content = content.replace(old, new)
    else:
        ok_i18n = False
        print('FAIL i18n:', old[:30])
if ok_i18n:
    changes += 1
    print('OK 6/6: i18n keys added')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
