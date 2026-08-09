content = open('Nesay_IL.html').read()
changes = 0
total = 5

# 1. Add "save search" button next to Filters button
old_btn = '''      <div class="filters-scroll" id="filterPills">
        <button class="sbt" onclick="openFilterPanel()">🔧 <span id="filterLbl" data-i18n="filter.label">Фильтры</span></button>
      </div>'''
new_btn = '''      <div class="filters-scroll" id="filterPills">
        <button class="sbt" onclick="openFilterPanel()">🔧 <span id="filterLbl" data-i18n="filter.label">Фильтры</span></button>
        <button class="sbt" onclick="saveCurrentSearch()">💾 <span data-i18n="search.save">Сохранить поиск</span></button>
      </div>'''
if old_btn in content:
    content = content.replace(old_btn, new_btn); changes += 1; print('OK 1/5: save button added')
else:
    print('FAIL 1/5: filterPills anchor not found')

# 2. Add cabinet tab button
old_tabs = '''<button class="cabt" id="modTabBtn" style="display:none" onclick="swCab('mod')"><span data-i18n="mod.tab">🛡️ Модерация</span></button>'''
new_tabs = old_tabs + '''
      <button class="cabt" onclick="swCab('searches')">🔍 <span data-i18n="cab.searches">Поиски</span></button>'''
if old_tabs in content:
    content = content.replace(old_tabs, new_tabs); changes += 1; print('OK 2/5: cabinet tab button added')
else:
    print('FAIL 2/5: tabs anchor not found')

# 3. Add cabinet panel content, anchored right before cab-list panel
old_panel = '''  <div class="cabp" id="cab-list">'''
new_panel = '''  <div class="cabp" id="cab-searches">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><div style="font-size:14px;font-weight:800" data-i18n="cab.searches">Поиски</div></div>
    <div id="cabSearchesList"></div>
  </div>
  <div class="cabp" id="cab-list">'''
if old_panel in content:
    content = content.replace(old_panel, new_panel); changes += 1; print('OK 3/5: cabinet panel added')
else:
    print('FAIL 3/5: cab-list anchor not found')

# 4. Update swCab tab array + JS functions
old_swcab = '''function swCab(tab){document.querySelectorAll('.cabt').forEach((b,i)=>b.classList.toggle('on',['dash','list','bill','prof','ref','mod'][i]===tab));document.querySelectorAll('.cabp').forEach(p=>p.classList.remove('on'));document.getElementById('cab-'+tab).classList.add('on');if(tab==='ref')loadRefStats();if(tab==='mod')loadModerationQueue();}'''
new_swcab = '''function swCab(tab){document.querySelectorAll('.cabt').forEach((b,i)=>b.classList.toggle('on',['dash','list','bill','prof','ref','mod','searches'][i]===tab));document.querySelectorAll('.cabp').forEach(p=>p.classList.remove('on'));document.getElementById('cab-'+tab).classList.add('on');if(tab==='ref')loadRefStats();if(tab==='mod')loadModerationQueue();if(tab==='searches')loadSavedSearches();}
let savedSearchesCache=[];
async function saveCurrentSearch(){
  const token=localStorage.getItem('nesay_token');
  if(!token){showToast(t('toast.need_auth'));return;}
  const q=(document.getElementById('searchInput')?.value||'').trim();
  const filters={q, activeType, activeFilters:[...activeFilters], sort:currentSort};
  let name=q;
  if(activeType==='rent')name+=(name?' · ':'')+'Аренда';
  else if(activeType==='sale')name+=(name?' · ':'')+'Продажа';
  if(activeFilters.size>0)name+=' · '+activeFilters.size+' '+t('search.filtersWord');
  if(!name)name=t('search.default_name');
  try{
    const res=await fetch(`${API}/listings/saved-searches`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name,filters})});
    if(res.ok)showToast('✅ '+t('search.saved'));
  }catch(e){}
}
async function loadSavedSearches(){
  const token=localStorage.getItem('nesay_token');
  const box=document.getElementById('cabSearchesList');
  if(!token||!box)return;
  try{
    const res=await fetch(`${API}/listings/saved-searches`,{headers:{Authorization:'Bearer '+token}});
    savedSearchesCache=await res.json();
    if(!savedSearchesCache.length){box.innerHTML='<div style="padding:20px;text-align:center;color:var(--ink3);font-size:13px">'+t('search.empty')+'</div>';return;}
    box.innerHTML=savedSearchesCache.map(r=>
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)">'+
      '<span style="font-size:13px;font-weight:600;cursor:pointer" onclick="applySavedSearch(\\''+r.id+'\\')">🔍 '+r.name+'</span>'+
      '<span style="cursor:pointer;color:var(--ink3)" onclick="deleteSavedSearch(\\''+r.id+'\\')">✕</span>'+
      '</div>'
    ).join('');
  }catch(e){}
}
function applySavedSearch(id){
  const s=savedSearchesCache.find(x=>String(x.id)===String(id));
  if(!s)return;
  const f=s.filters||{};
  if(document.getElementById('searchInput'))document.getElementById('searchInput').value=f.q||'';
  activeType=f.activeType||'all';
  activeFilters=new Set(f.activeFilters||[]);
  currentSort=f.sort||'rel';
  closeCab();
  applyFilter();
  showToast('✅ '+t('search.applied'));
}
async function deleteSavedSearch(id){
  const token=localStorage.getItem('nesay_token');
  try{
    await fetch(`${API}/listings/saved-searches/${id}`,{method:'DELETE',headers:{Authorization:'Bearer '+token}});
    loadSavedSearches();
  }catch(e){}
}'''
if old_swcab in content:
    content = content.replace(old_swcab, new_swcab); changes += 1; print('OK 4/5: JS functions added')
else:
    print('FAIL 4/5: swCab anchor not found')

# 5. i18n keys
i18n_adds = [
    ("'filter.apply':'Показать',", "'filter.apply':'Показать','search.save':'Сохранить поиск','cab.searches':'Поиски','search.filtersWord':'фильтра','search.default_name':'Мой поиск','search.saved':'Поиск сохранён','search.empty':'Пока нет сохранённых поисков','search.applied':'Поиск применён',"),
    ("'filter.apply':'Show',", "'filter.apply':'Show','search.save':'Save search','cab.searches':'Searches','search.filtersWord':'filters','search.default_name':'My search','search.saved':'Search saved','search.empty':'No saved searches yet','search.applied':'Search applied',"),
    ("'filter.apply':'הצג',", "'filter.apply':'הצג','search.save':'שמור חיפוש','cab.searches':'חיפושים','search.filtersWord':'סינונים','search.default_name':'החיפוש שלי','search.saved':'החיפוש נשמר','search.empty':'אין עדיין חיפושים שמורים','search.applied':'החיפוש הופעל',"),
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
    print('OK 5/5: i18n keys added')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
