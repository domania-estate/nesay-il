content = open('Nesay_IL.html').read()
changes = 0
total = 5

# 1. Replace whole dropdown block with trigger button + overlay panel
old_block = """      <div class="filters-scroll" id="filterPills" style="overflow:visible">
        <div class="sdd" style="position:relative;display:inline-block">
          <button class="sbt" onclick="document.getElementById('fmn').classList.toggle('open')">
            🔧 <span id="filterLbl" data-i18n="filter.label">Фильтры</span>▾
          </button>
          <div class="smn" id="fmn" style="min-width:230px;max-height:340px;overflow-y:auto">
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="owner" onchange="toggleFCheck(this)"><span data-i18n="filter.owner">От собственника</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="agency" onchange="toggleFCheck(this)"><span data-i18n="filter.agency">От агентства</span></label>
            <div style="height:1px;background:var(--line);margin:6px 4px"></div>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="rooms12" onchange="toggleFCheck(this)"><span data-i18n="filter.rooms12">1–2 комн.</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="rooms34" onchange="toggleFCheck(this)"><span data-i18n="filter.rooms34">3–4 комн.</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="safeRoom" onchange="toggleFCheck(this)"><span data-i18n="filter.saferoom">Безоп. комн.</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="parking" onchange="toggleFCheck(this)"><span data-i18n="filter.parking">Парковка</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="balcony" onchange="toggleFCheck(this)"><span data-i18n="filter.balcony">Балкон</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="garden" onchange="toggleFCheck(this)"><span data-i18n="filter.garden">Сад</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="sea" onchange="toggleFCheck(this)"><span data-i18n="filter.sea">Море 🌊</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="new" onchange="toggleFCheck(this)"><span data-i18n="filter.new">Новые</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="elevator" onchange="toggleFCheck(this)"><span data-i18n="filter.elevator">Лифт</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="ac" onchange="toggleFCheck(this)"><span data-i18n="filter.ac">Кондиционер</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="furnished" onchange="toggleFCheck(this)"><span data-i18n="filter.furnished">Мебель</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="pets" onchange="toggleFCheck(this)"><span data-i18n="filter.pets">Можно с животными</span></label>
          </div>
        </div>
      </div>"""

new_block = """      <div class="filters-scroll" id="filterPills">
        <button class="sbt" onclick="openFilterPanel()">🔧 <span id="filterLbl" data-i18n="filter.label">Фильтры</span></button>
      </div>
      <div class="ovl" id="filterOvl" onclick="if(event.target===this)closeFilterPanel()">
        <div style="background:#fff;border-radius:16px;padding:20px;max-width:360px;width:100%;max-height:80vh;overflow-y:auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <strong style="font-size:16px" data-i18n="filter.title">Фильтры</strong>
            <span onclick="closeFilterPanel()" style="cursor:pointer;font-size:18px">✕</span>
          </div>
          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.roomsTitle">Комнаты</p>
          <div style="display:flex;gap:6px;margin-bottom:14px">
            <button class="froom" data-rooms="1" onclick="toggleRoom(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:13px;cursor:pointer">1</button>
            <button class="froom" data-rooms="2" onclick="toggleRoom(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:13px;cursor:pointer">2</button>
            <button class="froom" data-rooms="3" onclick="toggleRoom(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:13px;cursor:pointer">3</button>
            <button class="froom" data-rooms="4plus" onclick="toggleRoom(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:13px;cursor:pointer">4+</button>
          </div>
          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.sellerTitle">Тип продавца</p>
          <div style="display:flex;gap:8px;margin-bottom:14px">
            <button class="fseller" data-seller="owner" onclick="toggleSeller(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer" data-i18n="filter.owner">От собственника</button>
            <button class="fseller" data-seller="agency" onclick="toggleSeller(this)" style="flex:1;padding:8px;border-radius:8px;border:1px solid #ddd;background:#fff;font-size:12px;cursor:pointer" data-i18n="filter.agency">От агентства</button>
          </div>
          <p style="font-size:12px;font-weight:700;color:#888;margin:0 0 6px" data-i18n="filter.amenitiesTitle">Удобства</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
            <button class="fchip" data-filter="safeRoom" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.saferoom">Безоп. комн.</button>
            <button class="fchip" data-filter="parking" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.parking">Парковка</button>
            <button class="fchip" data-filter="balcony" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.balcony">Балкон</button>
            <button class="fchip" data-filter="garden" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.garden">Сад</button>
            <button class="fchip" data-filter="sea" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.sea">Море 🌊</button>
            <button class="fchip" data-filter="new" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.new">Новые</button>
            <button class="fchip" data-filter="elevator" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.elevator">Лифт</button>
            <button class="fchip" data-filter="ac" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.ac">Кондиционер</button>
            <button class="fchip" data-filter="furnished" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.furnished">Мебель</button>
            <button class="fchip" data-filter="pets" onclick="toggleChip(this)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;font-size:11px;cursor:pointer" data-i18n="filter.pets">Можно с животными</button>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="resetFilterPanel()" style="flex:1;padding:10px;border-radius:10px;border:1px solid #ddd;background:#fff;font-weight:600;cursor:pointer" data-i18n="filter.reset">Сбросить</button>
            <button onclick="closeFilterPanel()" style="flex:1;padding:10px;border-radius:10px;border:none;background:#111;color:#fff;font-weight:600;cursor:pointer" data-i18n="filter.apply">Показать</button>
          </div>
        </div>
      </div>"""

if old_block in content:
    content = content.replace(old_block, new_block); changes += 1; print('OK 1/5: panel HTML')
else:
    print('FAIL 1/5: dropdown block anchor not found')

# 2. Add room-count entries to FILTER_MAP
old_map = "agency:(d)=>d.agent.type==='agency'||d.agent.type==='agent',\n  elevator:(d)=>d.tags.ru.some(t=>t.includes('Лифт')),"
new_map = "agency:(d)=>d.agent.type==='agency'||d.agent.type==='agent',\n  rooms1:(d)=>d.rooms<2,\n  rooms2:(d)=>d.rooms>=2&&d.rooms<3,\n  rooms3:(d)=>d.rooms>=3&&d.rooms<4,\n  rooms4plus:(d)=>d.rooms>=4,\n  elevator:(d)=>d.tags.ru.some(t=>t.includes('Лифт')),"
if old_map in content:
    content = content.replace(old_map, new_map); changes += 1; print('OK 2/5: FILTER_MAP rooms')
else:
    print('FAIL 2/5: FILTER_MAP anchor not found')

# 3. OR-within-rooms logic in getFiltered
old_logic = """  if(activeFilters.size>0){
    // group: if pills from same category are on, treat as OR; keep items matching any active filter
    // Простая реализация: показываем объявление если оно проходит ХОТЯ БЫ ОДИН из включённых фильтров
    // (так работает большинство площадок - не исключают, а приоритизируют)
    // Для корректного поведения: фильтры — пересечение (И)
    for(const f of activeFilters){
      if(FILTER_MAP[f])d=d.filter(FILTER_MAP[f]);
    }
  }"""
new_logic = """  if(activeFilters.size>0){
    const roomFilters=[...activeFilters].filter(f=>f.startsWith('rooms'));
    const otherFilters=[...activeFilters].filter(f=>!f.startsWith('rooms'));
    if(roomFilters.length>0)d=d.filter(x=>roomFilters.some(f=>FILTER_MAP[f]&&FILTER_MAP[f](x)));
    for(const f of otherFilters){
      if(FILTER_MAP[f])d=d.filter(FILTER_MAP[f]);
    }
  }"""
if old_logic in content:
    content = content.replace(old_logic, new_logic); changes += 1; print('OK 3/5: OR-within-rooms logic')
else:
    print('FAIL 3/5: getFiltered anchor not found')

# 4. Add panel JS functions after toggleFCheck
old_fn = """function toggleFCheck(el){
  const f=el.dataset.filter;
  if(el.checked)activeFilters.add(f);
  else activeFilters.delete(f);
  applyFilter();
  const n=activeFilters.size;
  const lbl=document.getElementById('filterLbl');
  if(lbl)lbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');
}"""
new_fn = old_fn + """
let panelRooms=new Set(), panelSeller=null, panelAmenities=new Set();
function paintToggle(el,on){
  el.style.background=on?'#eef2ff':'#fff';
  el.style.borderColor=on?'#3167F1':'#ddd';
  el.style.color=on?'#3167F1':'#000';
}
function toggleRoom(el){
  const r=el.dataset.rooms;
  if(panelRooms.has(r)){panelRooms.delete(r);paintToggle(el,false);}
  else{panelRooms.add(r);paintToggle(el,true);}
}
function toggleSeller(el){
  const s=el.dataset.seller;
  document.querySelectorAll('.fseller').forEach(b=>paintToggle(b,false));
  if(panelSeller===s){panelSeller=null;}
  else{panelSeller=s;paintToggle(el,true);}
}
function toggleChip(el){
  const f=el.dataset.filter;
  if(panelAmenities.has(f)){panelAmenities.delete(f);paintToggle(el,false);}
  else{panelAmenities.add(f);paintToggle(el,true);}
}
function openFilterPanel(){document.getElementById('filterOvl').style.display='flex';}
function closeFilterPanel(){
  document.getElementById('filterOvl').style.display='none';
  applyPanelFilters();
}
function resetFilterPanel(){
  panelRooms.clear();panelSeller=null;panelAmenities.clear();
  document.querySelectorAll('.froom,.fseller,.fchip').forEach(b=>paintToggle(b,false));
  applyPanelFilters();
}
function applyPanelFilters(){
  activeFilters=new Set();
  panelRooms.forEach(r=>activeFilters.add('rooms'+r));
  if(panelSeller)activeFilters.add(panelSeller);
  panelAmenities.forEach(a=>activeFilters.add(a));
  applyFilter();
  const lbl=document.getElementById('filterLbl');
  const n=panelRooms.size+(panelSeller?1:0)+panelAmenities.size;
  if(lbl)lbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');
}"""
if old_fn in content:
    content = content.replace(old_fn, new_fn); changes += 1; print('OK 4/5: panel JS functions')
else:
    print('FAIL 4/5: toggleFCheck anchor not found')

# 5. Add i18n keys for panel labels
i18n_adds = [
    ("'filter.pets':'Можно с животными','filter.label':'Фильтры',",
     "'filter.pets':'Можно с животными','filter.label':'Фильтры','filter.title':'Фильтры','filter.roomsTitle':'Комнаты','filter.sellerTitle':'Тип продавца','filter.amenitiesTitle':'Удобства','filter.reset':'Сбросить','filter.apply':'Показать',"),
    ("'filter.pets':'Pets allowed','filter.label':'Filters',",
     "'filter.pets':'Pets allowed','filter.label':'Filters','filter.title':'Filters','filter.roomsTitle':'Rooms','filter.sellerTitle':'Seller type','filter.amenitiesTitle':'Amenities','filter.reset':'Reset','filter.apply':'Show',"),
    ("'filter.pets':'מותר בעלי חיים','filter.label':'סינון',",
     "'filter.pets':'מותר בעלי חיים','filter.label':'סינון','filter.title':'סינון','filter.roomsTitle':'חדרים','filter.sellerTitle':'סוג המוכר','filter.amenitiesTitle':'מאפיינים','filter.reset':'איפוס','filter.apply':'הצג',"),
]
ok5 = True
for old, new in i18n_adds:
    if old in content:
        content = content.replace(old, new)
    else:
        ok5 = False
        print('FAIL part of 5/5:', old[:40])
if ok5:
    changes += 1
    print('OK 5/5: i18n keys')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED - send me this full output')
