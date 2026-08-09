content = open('Nesay_IL.html').read()
changes = 0
total = 2

old_pills = '''  <div class="M-pill-row" id="M-pills">
    <button class="M-pill p-all" id="Mp-all"  onclick="M.type('all',this)">🏠 Все</button>
    <button class="M-pill"       id="Mp-rent" onclick="M.type('rent',this)" data-i18n="map.rent">🔵 Аренда</button>
    <button class="M-pill"       id="Mp-sale" onclick="M.type('sale',this)" data-i18n="map.sale">🟠 Продажа</button>
  </div>'''
new_pills = '''  <div class="M-pill-row" id="M-pills">
    <button class="M-pill p-all" id="Mp-all"  onclick="M.type('all',this)">🏠 Все</button>
    <button class="M-pill"       id="Mp-rent" onclick="M.type('rent',this)" data-i18n="map.rent">🔵 Аренда</button>
    <button class="M-pill"       id="Mp-sale" onclick="M.type('sale',this)" data-i18n="map.sale">🟠 Продажа</button>
    <button class="M-pill" onclick="openFilterPanel()">🔧 <span id="mFilterLbl" data-i18n="filter.label">Фильтры</span></button>
  </div>'''
if old_pills in content:
    content = content.replace(old_pills, new_pills); changes += 1; print('OK 1/2: mobile filter button added')
else:
    print('FAIL 1/2: pills anchor not found')

old_af = '''function applyFilter(){
  filteredListings=getFiltered();
  renderCards(filteredListings);
  rebuildMarkers(filteredListings);
}'''
new_af = '''function applyFilter(){
  filteredListings=getFiltered();
  renderCards(filteredListings);
  rebuildMarkers(filteredListings);
  if(typeof M!=='undefined'&&M.renderCards)M.renderCards();
  const mlbl=document.getElementById('mFilterLbl');
  if(mlbl){const n=activeFilters.size;mlbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');}
}'''
if old_af in content:
    content = content.replace(old_af, new_af); changes += 1; print('OK 2/2: applyFilter refreshes mobile too')
else:
    print('FAIL 2/2: applyFilter anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
