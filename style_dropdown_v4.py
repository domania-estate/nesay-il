content = open('Nesay_IL.html').read()
changes = 0
total = 3

ICON_ALL = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><rect x="10" y="14" width="4" height="6"/></svg>'
ICON_APT = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1"/><rect x="8" y="6.5" width="2.2" height="2.2"/><rect x="13.8" y="6.5" width="2.2" height="2.2"/><rect x="8" y="11" width="2.2" height="2.2"/><rect x="13.8" y="11" width="2.2" height="2.2"/><rect x="8" y="15.5" width="2.2" height="2.2"/><rect x="13.8" y="15.5" width="2.2" height="2.2"/></svg>'
ICON_HOUSE = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><rect x="10" y="14" width="4" height="6"/><path d="M6 10h12"/></svg>'
ICON_COM = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0"/><path d="M5 9v10h14V9"/></svg>'

def item(kind, ptype_lit, count_key, icon_svg, icon_color, label_key, label_text, bg):
    return f'<div class="smi" onclick="pickDealType(\'{kind}\',{ptype_lit})" style="display:flex;align-items:center;gap:12px;padding:8px;border-radius:8px"><div style="width:34px;height:34px;border-radius:50%;background:{bg};display:flex;align-items:center;justify-content:center;color:{icon_color};flex-shrink:0">{icon_svg}</div><div><div style="font-size:13px;font-weight:600" data-i18n="{label_key}">{label_text}</div><div style="font-size:11px;color:#999" id="cnt-{kind}-{count_key}">—</div></div></div>'

old_rent = '''<div class="smn" id="dealMenu-rent" style="min-width:190px">
        <div class="smi" onclick="pickDealType('rent',null)" data-i18n="nav.allTypes">Все типы</div>
        <div class="smi" onclick="pickDealType('rent','apartment')">🏢 <span data-i18n="type.apartment">Квартиры</span></div>
        <div class="smi" onclick="pickDealType('rent','house')">🏡 <span data-i18n="type.house">Дома и виллы</span></div>
        <div class="smi" onclick="pickDealType('rent','commercial')">🏬 <span data-i18n="type.commercial">Коммерция</span></div>
      </div>'''
new_rent = '<div class="smn" id="dealMenu-rent" style="min-width:230px;padding:8px">' + \
    item('rent','null','all',ICON_ALL,'#3167F1','nav.allTypes','Все типы','#EEF2FF') + \
    item('rent',"'apartment'",'apartment',ICON_APT,'#555','type.apartment','Квартиры','#F3F4F6') + \
    item('rent',"'house'",'house',ICON_HOUSE,'#555','type.house','Дома и виллы','#F3F4F6') + \
    item('rent',"'commercial'",'commercial',ICON_COM,'#555','type.commercial','Коммерция','#F3F4F6') + \
    '</div>'
if old_rent in content:
    content = content.replace(old_rent, new_rent); changes += 1; print('OK 1/3: rent menu restyled')
else:
    print('FAIL 1/3: rent menu anchor not found')

old_sale = '''<div class="smn" id="dealMenu-sale" style="min-width:190px">
        <div class="smi" onclick="pickDealType('sale',null)" data-i18n="nav.allTypes">Все типы</div>
        <div class="smi" onclick="pickDealType('sale','apartment')">🏢 <span data-i18n="type.apartment">Квартиры</span></div>
        <div class="smi" onclick="pickDealType('sale','house')">🏡 <span data-i18n="type.house">Дома и виллы</span></div>
        <div class="smi" onclick="pickDealType('sale','commercial')">🏬 <span data-i18n="type.commercial">Коммерция</span></div>
      </div>'''
new_sale = '<div class="smn" id="dealMenu-sale" style="min-width:230px;padding:8px">' + \
    item('sale','null','all',ICON_ALL,'#EA580C','nav.allTypes','Все типы','#FFF3E8') + \
    item('sale',"'apartment'",'apartment',ICON_APT,'#555','type.apartment','Квартиры','#F3F4F6') + \
    item('sale',"'house'",'house',ICON_HOUSE,'#555','type.house','Дома и виллы','#F3F4F6') + \
    item('sale',"'commercial'",'commercial',ICON_COM,'#555','type.commercial','Коммерция','#F3F4F6') + \
    '</div>'
if old_sale in content:
    content = content.replace(old_sale, new_sale); changes += 1; print('OK 2/3: sale menu restyled')
else:
    print('FAIL 2/3: sale menu anchor not found')

old_toggle = '''function toggleDealDropdown(kind){
  document.querySelectorAll('.smn').forEach(m=>{if(m.id!=='dealMenu-'+kind)m.classList.remove('open')});
  document.getElementById('dealMenu-'+kind).classList.toggle('open');
}'''
new_toggle = '''function toggleDealDropdown(kind){
  document.querySelectorAll('.smn').forEach(m=>{if(m.id!=='dealMenu-'+kind)m.classList.remove('open')});
  document.getElementById('dealMenu-'+kind).classList.toggle('open');
  updateDealMenuCounts();
}
function updateDealMenuCounts(){
  ['rent','sale'].forEach(kind=>{
    let allN=0;
    ['apartment','house','commercial'].forEach(pt=>{
      const n=listings.filter(l=>l.dealType===kind&&l.propertyType===pt).length;
      allN+=n;
      const el=document.getElementById('cnt-'+kind+'-'+pt);
      if(el)el.textContent=n+' '+t('count_obj');
    });
    const allEl=document.getElementById('cnt-'+kind+'-all');
    if(allEl)allEl.textContent=allN+' '+t('count_obj');
  });
}'''
if old_toggle in content:
    content = content.replace(old_toggle, new_toggle); changes += 1; print('OK 3/3: counts wired in')
else:
    print('FAIL 3/3: toggleDealDropdown anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
