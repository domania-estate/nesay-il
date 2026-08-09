content = open('Nesay_IL.html').read()
changes = 0
total = 2

old_head = '''  <div class="M-list-head">
    <span class="M-cnt-lbl" id="M-cnt">Загрузка...</span>
    <span class="M-sort-btn" onclick="M.cycleSort()">
      <span id="M-sort-ico">🎯</span>
      <span id="M-sort-txt">Релевантность</span> ▾
    </span>
  </div>'''
new_head = '''  <div class="M-list-head">
    <span class="M-cnt-lbl" id="M-cnt">Загрузка...</span>
    <span class="M-sort-btn" onclick="openFilterPanel()">🔧 <span id="mFilterLbl2">Фильтры</span></span>
    <span class="M-sort-btn" onclick="M.cycleSort()">
      <span id="M-sort-ico">🎯</span>
      <span id="M-sort-txt">Релевантность</span> ▾
    </span>
  </div>'''
if old_head in content:
    content = content.replace(old_head, new_head); changes += 1; print('OK 1/2: filter button added to list head')
else:
    print('FAIL 1/2: list head anchor not found')

old_af = '''  if(typeof M!=='undefined'&&M.renderCards)M.renderCards();
  const mlbl=document.getElementById('mFilterLbl');
  if(mlbl){const n=activeFilters.size;mlbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');}
}'''
new_af = '''  if(typeof M!=='undefined'&&M.renderCards)M.renderCards();
  const mlbl=document.getElementById('mFilterLbl');
  if(mlbl){const n=activeFilters.size;mlbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');}
  const mlbl2=document.getElementById('mFilterLbl2');
  if(mlbl2){const n2=activeFilters.size;mlbl2.textContent=n2>0?(t('filter.label')+' ('+n2+')'):t('filter.label');}
}'''
if old_af in content:
    content = content.replace(old_af, new_af); changes += 1; print('OK 2/2: applyFilter updates both labels')
else:
    print('FAIL 2/2: applyFilter anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
