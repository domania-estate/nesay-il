content = open('Nesay_IL.html').read()
changes = 0
total = 3

# 1. Add modal HTML right before </body>
modal_html = '''<div class="ovl" id="dealTypeOvl" onclick="if(event.target===this)closeDealTypeModal()">
  <div style="background:#fff;border-radius:16px;padding:20px;max-width:320px;width:100%">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <strong id="dealTypeTitle" style="font-size:16px"></strong>
      <span onclick="closeDealTypeModal()" style="cursor:pointer;font-size:18px">✕</span>
    </div>
    <div id="dealTypeContent"></div>
  </div>
</div>
'''
body_close = content.rfind('</body>')
if body_close != -1:
    content = content[:body_close] + modal_html + content[body_close:]
    changes += 1; print('OK 1/3: modal HTML inserted')
else:
    print('FAIL 1/3: </body> not found')

# 2. Add JS functions right before closeFilterPanel (reuse safe anchor point)
old_fn = '''function closeFilterPanel(){
  document.getElementById('filterOvl').style.display='none';
  applyPanelFilters();
}'''
new_fn = old_fn + '''
function openDealTypeModal(kind){
  const items=[
    {p:null,icon:'🏠',label:t('nav.allTypes')},
    {p:'apartment',icon:'🏢',label:t('type.apartment')},
    {p:'house',icon:'🏡',label:t('type.house')},
    {p:'commercial',icon:'🏬',label:t('type.commercial')}
  ];
  const html=items.map(function(it){
    const n=it.p?listings.filter(function(l){return l.dealType===kind&&l.propertyType===it.p}).length:listings.filter(function(l){return l.dealType===kind}).length;
    const pArg=it.p?("'"+it.p+"'"):'null';
    return '<div class="smi" style="display:flex;align-items:center;gap:12px;padding:10px 8px;border-radius:8px" onclick="pickDealType(\\''+kind+'\\','+pArg+');closeDealTypeModal()">'+
      '<div style="width:34px;height:34px;border-radius:50%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:16px">'+it.icon+'</div>'+
      '<div><div style="font-size:14px;font-weight:600">'+it.label+'</div><div style="font-size:11px;color:#999">'+n+' '+t('count_obj')+'</div></div>'+
      '</div>';
  }).join('');
  document.getElementById('dealTypeContent').innerHTML=html;
  document.getElementById('dealTypeTitle').textContent=kind==='rent'?t('nav.rent'):t('nav.sale');
  document.getElementById('dealTypeOvl').style.display='flex';
}
function closeDealTypeModal(){
  document.getElementById('dealTypeOvl').style.display='none';
}'''
if old_fn in content:
    content = content.replace(old_fn, new_fn); changes += 1; print('OK 2/3: JS functions added')
else:
    print('FAIL 2/3: closeFilterPanel anchor not found')

# 3. Wire mobile pills to open the modal
old_pills = '''    <button class="M-pill"       id="Mp-rent" onclick="M.type('rent',this)" data-i18n="map.rent">🔵 Аренда</button>
    <button class="M-pill"       id="Mp-sale" onclick="M.type('sale',this)" data-i18n="map.sale">🟠 Продажа</button>'''
new_pills = '''    <button class="M-pill"       id="Mp-rent" onclick="openDealTypeModal('rent')" data-i18n="map.rent">🔵 Аренда</button>
    <button class="M-pill"       id="Mp-sale" onclick="openDealTypeModal('sale')" data-i18n="map.sale">🟠 Продажа</button>'''
if old_pills in content:
    content = content.replace(old_pills, new_pills); changes += 1; print('OK 3/3: mobile pills wired to modal')
else:
    print('FAIL 3/3: mobile pills anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
