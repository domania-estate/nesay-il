content = open('Nesay_IL.html').read()
changes = 0
total = 2

old_tabs = '''function renderFavTabs(){
  const defCount=favItems.filter(f=>!f.list_id).length;
  let html='<button class="fpill'+(activeFavList===null?' on':'')+'" onclick="switchFavTab(null)">'+t('fav.default')+' ('+defCount+')</button>';
  favLists.forEach(l=>{
    html+='<button class="fpill'+(activeFavList===l.id?' on':'')+'" onclick="switchFavTab(\\''+l.id+'\\')">'+l.name+' ('+l.count+')</button>';
  });
  html+='<button class="fpill" onclick="createFavList()">+ '+t('fav.new')+'</button>';
  html+='<button class="fpill" onclick="closeFavoritesView()" style="margin-left:auto">✕ '+t('fav.exit')+'</button>';
  const el=document.getElementById('favTabs');if(el)el.innerHTML=html;
}'''
new_tabs = '''function renderFavTabs(){
  activeFavList='__all__';
  const el=document.getElementById('favTabs');
  if(el)el.innerHTML='<button class="fpill" onclick="closeFavoritesView()">✕ '+t('fav.exit')+'</button>';
}'''
if old_tabs in content:
    content = content.replace(old_tabs, new_tabs); changes += 1; print('OK 1/2: tabs UI simplified')
else:
    print('FAIL 1/2: renderFavTabs anchor not found')

old_view = '''function renderFavView(){
  const ids=favItems.filter(f=>(activeFavList===null?!f.list_id:f.list_id===activeFavList)).map(f=>String(f.listing_id));
  const data=listings.filter(l=>ids.includes(String(l.id)));
  renderCards(data);
}'''
new_view = '''function renderFavView(){
  const ids=favItems.map(f=>String(f.listing_id));
  const data=listings.filter(l=>ids.includes(String(l.id)));
  renderCards(data);
}'''
if old_view in content:
    content = content.replace(old_view, new_view); changes += 1; print('OK 2/2: view shows all favorites')
else:
    print('FAIL 2/2: renderFavView anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
