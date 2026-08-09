content = open('Nesay_IL.html').read()
changes = 0
total = 7

# 1. Remove 'Мебель' from AMENITIES pool (now handled separately as tri-state)
old_am = "    {ru:'Кондиц.',he:'מזגן',en:'A/C'},\n    {ru:'Мебель',he:'מרוהטת',en:'Furnished'},\n    {ru:'Можно с животными',he:'מותר בעלי חיים',en:'Pets allowed'},"
new_am = "    {ru:'Кондиц.',he:'מזגן',en:'A/C'},\n    {ru:'Можно с животными',he:'מותר בעלי חיים',en:'Pets allowed'},"
if old_am in content:
    content = content.replace(old_am, new_am); changes += 1; print('OK 1/7: amenities pool cleaned')
else:
    print('FAIL 1/7: amenities pool anchor')

# 2. Add condition/furnished random fields to generator
old_gen = "const tg=randomTags();const ag=ags[Math.floor(Math.random()*ags.length)];"
new_gen = "const tg=randomTags();const ag=ags[Math.floor(Math.random()*ags.length)];const conds=['new','renovated','cosmetic','needs_repair'];const cond=conds[Math.floor(Math.random()*conds.length)];const furns=['full','partial','none'];const furn=furns[Math.floor(Math.random()*furns.length)];"
if old_gen in content:
    content = content.replace(old_gen, new_gen); changes += 1; print('OK 2/7: generator vars added')
else:
    print('FAIL 2/7: generator anchor')

old_push = "tags:tg,hi:[0],desc:{ru:'Уютная квартира в '+c.ru+'.',he:'דירה נחמדה ב'+c.he+'.',en:'Cozy apt in '+c.en+'.'},agent:ag,"
new_push = "tags:tg,condition:cond,furnished:furn,hi:[0],desc:{ru:'Уютная квартира в '+c.ru+'.',he:'דירה נחמדה ב'+c.he+'.',en:'Cozy apt in '+c.en+'.'},agent:ag,"
if old_push in content:
    content = content.replace(old_push, new_push); changes += 1; print('OK 3/7: condition/furnished added to listing')
else:
    print('FAIL 3/7: push anchor')

# 3. Insert new panel sections before "Удобства"
old_am_title = '          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.amenitiesTitle">Удобства</p>'
new_am_title = """          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.conditionTitle">Состояние</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
            <button class="fcond" data-cond="new" onclick="toggleCondition(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="cond.new">Новый</button>
            <button class="fcond" data-cond="renovated" onclick="toggleCondition(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="cond.renovated">Свежий ремонт</button>
            <button class="fcond" data-cond="cosmetic" onclick="toggleCondition(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="cond.cosmetic">Косметический</button>
            <button class="fcond" data-cond="needs_repair" onclick="toggleCondition(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="cond.needsRepair">Требует ремонта</button>
          </div>
          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.furnishedTitle">Мебель</p>
          <div style="display:flex;gap:8px;margin-bottom:14px">
            <button class="ffurn" data-furn="full" onclick="toggleFurnished(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer" data-i18n="furn.full">С мебелью</button>
            <button class="ffurn" data-furn="partial" onclick="toggleFurnished(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer" data-i18n="furn.partial">Частично</button>
            <button class="ffurn" data-furn="none" onclick="toggleFurnished(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer" data-i18n="furn.none">Без мебели</button>
          </div>
          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.amenitiesTitle">Удобства</p>"""
if old_am_title in content:
    content = content.replace(old_am_title, new_am_title); changes += 1; print('OK 4/7: panel sections inserted')
else:
    print('FAIL 4/7: amenities title anchor')

# 4. Remove old boolean furnished chip
old_chip = '\n            <button class="fchip" data-filter="furnished" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.furnished">Мебель</button>'
if old_chip in content:
    content = content.replace(old_chip, ''); changes += 1; print('OK 5/7: old furnished chip removed')
else:
    print('FAIL 5/7: old chip anchor')

# 5. Add JS toggle functions + wire into reset/apply
old_reset = """function resetFilterPanel(){
  panelRooms.clear();panelSeller=null;panelAmenities.clear();
  document.querySelectorAll('.froom,.fseller,.fchip').forEach(b=>paintToggle(b,false));
  applyPanelFilters();
}"""
new_reset = """function toggleCondition(el){
  const c=el.dataset.cond;
  document.querySelectorAll('.fcond').forEach(b=>paintToggle(b,false));
  if(panelCondition===c){panelCondition=null;}
  else{panelCondition=c;paintToggle(el,true);}
}
function toggleFurnished(el){
  const f=el.dataset.furn;
  document.querySelectorAll('.ffurn').forEach(b=>paintToggle(b,false));
  if(panelFurnished===f){panelFurnished=null;}
  else{panelFurnished=f;paintToggle(el,true);}
}
function resetFilterPanel(){
  panelRooms.clear();panelSeller=null;panelAmenities.clear();panelCondition=null;panelFurnished=null;
  document.querySelectorAll('.froom,.fseller,.fchip,.fcond,.ffurn').forEach(b=>paintToggle(b,false));
  applyPanelFilters();
}"""
if old_reset in content:
    content = content.replace(old_reset, new_reset); changes += 1; print('OK 6/7: toggle functions + reset updated')
else:
    print('FAIL 6/7: resetFilterPanel anchor')

old_decl = "let panelRooms=new Set(), panelSeller=null, panelAmenities=new Set();"
new_decl = "let panelRooms=new Set(), panelSeller=null, panelAmenities=new Set(), panelCondition=null, panelFurnished=null;"
if old_decl in content:
    content = content.replace(old_decl, new_decl)
else:
    print('WARN: panel var decl anchor not found (non-fatal)')

old_apply = """function applyPanelFilters(){
  activeFilters=new Set();
  panelRooms.forEach(r=>activeFilters.add('rooms'+r));
  if(panelSeller)activeFilters.add(panelSeller);
  panelAmenities.forEach(a=>activeFilters.add(a));
  applyFilter();
  const lbl=document.getElementById('filterLbl');
  const n=panelRooms.size+(panelSeller?1:0)+panelAmenities.size;
  if(lbl)lbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');
}"""
new_apply = """function applyPanelFilters(){
  activeFilters=new Set();
  panelRooms.forEach(r=>activeFilters.add('rooms'+r));
  if(panelSeller)activeFilters.add(panelSeller);
  panelAmenities.forEach(a=>activeFilters.add(a));
  if(panelCondition)activeFilters.add('cond_'+panelCondition);
  if(panelFurnished)activeFilters.add('furn_'+panelFurnished);
  applyFilter();
  const lbl=document.getElementById('filterLbl');
  const n=panelRooms.size+(panelSeller?1:0)+panelAmenities.size+(panelCondition?1:0)+(panelFurnished?1:0);
  if(lbl)lbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');
}"""
if old_apply in content:
    content = content.replace(old_apply, new_apply)
else:
    print('WARN: applyPanelFilters anchor not found (non-fatal)')

# 6. FILTER_MAP additions
old_fmap = "rooms4plus:(d)=>d.rooms>=4,"
new_fmap = """rooms4plus:(d)=>d.rooms>=4,
  cond_new:(d)=>d.condition==='new',
  cond_renovated:(d)=>d.condition==='renovated',
  cond_cosmetic:(d)=>d.condition==='cosmetic',
  cond_needs_repair:(d)=>d.condition==='needs_repair',
  furn_full:(d)=>d.furnished==='full',
  furn_partial:(d)=>d.furnished==='partial',
  furn_none:(d)=>d.furnished==='none',"""
if old_fmap in content:
    content = content.replace(old_fmap, new_fmap); changes += 1; print('OK 7/7: FILTER_MAP condition/furnished')
else:
    print('FAIL 7/7: FILTER_MAP anchor')

# 7. i18n keys
i18n_adds = [
    ("'filter.apply':'Показать',", "'filter.apply':'Показать','filter.conditionTitle':'Состояние','filter.furnishedTitle':'Мебель','cond.new':'Новый','cond.renovated':'Свежий ремонт','cond.cosmetic':'Косметический','cond.needsRepair':'Требует ремонта','furn.full':'С мебелью','furn.partial':'Частично','furn.none':'Без мебели',"),
    ("'filter.apply':'Show',", "'filter.apply':'Show','filter.conditionTitle':'Condition','filter.furnishedTitle':'Furnishing','cond.new':'New','cond.renovated':'Renovated','cond.cosmetic':'Cosmetic','cond.needsRepair':'Needs repair','furn.full':'Furnished','furn.partial':'Partially furnished','furn.none':'Unfurnished',"),
    ("'filter.apply':'הצג',", "'filter.apply':'הצג','filter.conditionTitle':'מצב','filter.furnishedTitle':'ריהוט','cond.new':'חדש','cond.renovated':'משופץ','cond.cosmetic':'קוסמטי','cond.needsRepair':'דורש שיפוץ','furn.full':'מרוהטת','furn.partial':'מרוהטת חלקית','furn.none':'לא מרוהטת',"),
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
