content = open('Nesay_IL.html').read()
changes = 0
total = 6

# 1. Remove pets from AMENITIES pool
old_am = "    {ru:'Кондиц.',he:'מזגן',en:'A/C'},\n    {ru:'Можно с животными',he:'מותר בעלי חיים',en:'Pets allowed'},"
new_am = "    {ru:'Кондиц.',he:'מזגן',en:'A/C'},"
if old_am in content:
    content = content.replace(old_am, new_am); changes += 1; print('OK 1/6: amenities pool cleaned')
else:
    print('FAIL 1/6: amenities pool anchor')

# 2. Add petsPolicy random field to generator
old_gen = "const furns=['full','partial','none'];const furn=furns[Math.floor(Math.random()*furns.length)];"
new_gen = "const furns=['full','partial','none'];const furn=furns[Math.floor(Math.random()*furns.length)];const petsOpts=['yes','no','small_dog','small_cat'];const pets=petsOpts[Math.floor(Math.random()*petsOpts.length)];"
if old_gen in content:
    content = content.replace(old_gen, new_gen); changes += 1; print('OK 2/6: generator var added')
else:
    print('FAIL 2/6: generator anchor')

old_push = "condition:cond,furnished:furn,hi:[0]"
new_push = "condition:cond,furnished:furn,petsPolicy:pets,hi:[0]"
if old_push in content:
    content = content.replace(old_push, new_push); changes += 1; print('OK 3/6: petsPolicy added to listing')
else:
    print('FAIL 3/6: push anchor')

# 3. Remove old pets chip, insert new section before Удобства
old_chip = '\n            <button class="fchip" data-filter="pets" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.pets">Можно с животными</button>'
if old_chip in content:
    content = content.replace(old_chip, ''); changes += 1; print('OK 4/6: old pets chip removed')
else:
    print('FAIL 4/6: old pets chip anchor')

old_am_title = '          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.amenitiesTitle">Удобства</p>'
new_am_title = """          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.petsTitle">Можно ли с животными</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
            <button class="fpets" data-pets="yes" onclick="togglePets(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="pets.yes">Да</button>
            <button class="fpets" data-pets="no" onclick="togglePets(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="pets.no">Нет</button>
            <button class="fpets" data-pets="small_dog" onclick="togglePets(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="pets.smallDog">Маленькая собачка</button>
            <button class="fpets" data-pets="small_cat" onclick="togglePets(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="pets.smallCat">Маленький котик</button>
          </div>
          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.amenitiesTitle">Удобства</p>"""
if old_am_title in content:
    content = content.replace(old_am_title, new_am_title); changes += 1; print('OK 5/6: pets section inserted')
else:
    print('FAIL 5/6: amenities title anchor')

# 4. JS: toggle function + wire into decl/reset/apply + FILTER_MAP
old_decl = "let panelRooms=new Set(), panelSeller=null, panelAmenities=new Set(), panelCondition=null, panelFurnished=null;"
new_decl = "let panelRooms=new Set(), panelSeller=null, panelAmenities=new Set(), panelCondition=null, panelFurnished=null, panelPets=null;"
if old_decl in content:
    content = content.replace(old_decl, new_decl)
else:
    print('WARN: decl anchor not found')

old_toggle_fn = """function toggleFurnished(el){
  const f=el.dataset.furn;
  document.querySelectorAll('.ffurn').forEach(b=>paintToggle(b,false));
  if(panelFurnished===f){panelFurnished=null;}
  else{panelFurnished=f;paintToggle(el,true);}
}"""
new_toggle_fn = old_toggle_fn + """
function togglePets(el){
  const p=el.dataset.pets;
  document.querySelectorAll('.fpets').forEach(b=>paintToggle(b,false));
  if(panelPets===p){panelPets=null;}
  else{panelPets=p;paintToggle(el,true);}
}"""
if old_toggle_fn in content:
    content = content.replace(old_toggle_fn, new_toggle_fn)
else:
    print('WARN: toggleFurnished anchor not found')

old_reset = """  panelRooms.clear();panelSeller=null;panelAmenities.clear();panelCondition=null;panelFurnished=null;
  document.querySelectorAll('.froom,.fseller,.fchip,.fcond,.ffurn').forEach(b=>paintToggle(b,false));"""
new_reset = """  panelRooms.clear();panelSeller=null;panelAmenities.clear();panelCondition=null;panelFurnished=null;panelPets=null;
  document.querySelectorAll('.froom,.fseller,.fchip,.fcond,.ffurn,.fpets').forEach(b=>paintToggle(b,false));"""
if old_reset in content:
    content = content.replace(old_reset, new_reset)
else:
    print('WARN: reset anchor not found')

old_apply = """  if(panelCondition)activeFilters.add('cond_'+panelCondition);
  if(panelFurnished)activeFilters.add('furn_'+panelFurnished);
  applyFilter();
  const lbl=document.getElementById('filterLbl');
  const n=panelRooms.size+(panelSeller?1:0)+panelAmenities.size+(panelCondition?1:0)+(panelFurnished?1:0);"""
new_apply = """  if(panelCondition)activeFilters.add('cond_'+panelCondition);
  if(panelFurnished)activeFilters.add('furn_'+panelFurnished);
  if(panelPets)activeFilters.add('pets_'+panelPets);
  applyFilter();
  const lbl=document.getElementById('filterLbl');
  const n=panelRooms.size+(panelSeller?1:0)+panelAmenities.size+(panelCondition?1:0)+(panelFurnished?1:0)+(panelPets?1:0);"""
if old_apply in content:
    content = content.replace(old_apply, new_apply); changes += 1; print('OK 6/6: JS wiring done')
else:
    print('FAIL 6/6: apply anchor')

old_fmap = "furn_none:(d)=>d.furnished==='none',"
new_fmap = """furn_none:(d)=>d.furnished==='none',
  pets_yes:(d)=>d.petsPolicy==='yes',
  pets_no:(d)=>d.petsPolicy==='no',
  pets_small_dog:(d)=>d.petsPolicy==='small_dog',
  pets_small_cat:(d)=>d.petsPolicy==='small_cat',"""
if old_fmap in content:
    content = content.replace(old_fmap, new_fmap)
else:
    print('WARN: FILTER_MAP anchor not found')

# 5. i18n
i18n_adds = [
    ("'cond.new':'Новый'", "'filter.petsTitle':'Можно ли с животными','pets.yes':'Да','pets.no':'Нет','pets.smallDog':'Маленькая собачка','pets.smallCat':'Маленький котик','cond.new':'Новый'"),
    ("'cond.new':'New'", "'filter.petsTitle':'Pets allowed','pets.yes':'Yes','pets.no':'No','pets.smallDog':'Small dog','pets.smallCat':'Small cat','cond.new':'New'"),
    ("'cond.new':'חדש'", "'filter.petsTitle':'בעלי חיים','pets.yes':'כן','pets.no':'לא','pets.smallDog':'כלב קטן','pets.smallCat':'חתול קטן','cond.new':'חדש'"),
]
ok_i18n = True
for old, new in i18n_adds:
    if old in content:
        content = content.replace(old, new)
    else:
        ok_i18n = False
        print('FAIL i18n:', old)
if ok_i18n:
    print('OK: i18n keys added')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED - send me this full output')
