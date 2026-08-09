content = open('Nesay_IL.html').read()
changes = 0
total = 4

# 1. Nav button
old_nav = """<button class="ctab rt on" onclick="selCat(this,'all')"><span class="ctab-ico">🏠</span><span data-i18n="nav.all">Все</span></button>"""
new_nav = old_nav + """
    <button class="ctab" onclick="openFavoritesView()"><span class="ctab-ico">❤️</span><span data-i18n="nav.favorites">Избранное</span></button>"""
if old_nav in content:
    content = content.replace(old_nav, new_nav); changes += 1; print('OK 1/4: nav button added')
else:
    print('FAIL 1/4: nav anchor not found')

# 2. favTabs container
old_list = '<div class="cl2" id="cardsList"></div>'
new_list = '<div id="favTabs" style="display:flex;gap:6px;flex-wrap:wrap;padding:0 0 10px"></div>\n    <div class="cl2" id="cardsList"></div>'
if old_list in content:
    content = content.replace(old_list, new_list); changes += 1; print('OK 2/4: favTabs container added')
else:
    print('FAIL 2/4: cardsList anchor not found')

# 3. JS functions + hook into selCat
old_selcat = """function selCat(btn,cat){
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');activeCat=cat;"""
new_selcat = """let favLists=[], favItems=[], activeFavList=null, inFavoritesView=false;
async function openFavoritesView(){
  const token=localStorage.getItem('nesay_token');
  if(!token){showToast(t('toast.need_auth'));return;}
  inFavoritesView=true;
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));
  try{
    const res=await fetch(`${API}/listings/favorite-lists`,{headers:{Authorization:'Bearer '+token}});
    const data=await res.json();
    favLists=data.lists||[];
    const itemsRes=await fetch(`${API}/listings/favorites/mine`,{headers:{Authorization:'Bearer '+token}});
    favItems=await itemsRes.json();
  }catch(e){favLists=[];favItems=[];}
  activeFavList=null;
  renderFavTabs();
  renderFavView();
}
function renderFavTabs(){
  const defCount=favItems.filter(f=>!f.list_id).length;
  let html='<button class="fpill'+(activeFavList===null?' on':'')+'" onclick="switchFavTab(null)">'+t('fav.default')+' ('+defCount+')</button>';
  favLists.forEach(l=>{
    html+='<button class="fpill'+(activeFavList===l.id?' on':'')+'" onclick="switchFavTab(\\''+l.id+'\\')">'+l.name+' ('+l.count+')</button>';
  });
  html+='<button class="fpill" onclick="createFavList()">+ '+t('fav.new')+'</button>';
  html+='<button class="fpill" onclick="closeFavoritesView()" style="margin-left:auto">✕ '+t('fav.exit')+'</button>';
  const el=document.getElementById('favTabs');if(el)el.innerHTML=html;
}
function switchFavTab(id){activeFavList=id;renderFavTabs();renderFavView();}
function renderFavView(){
  const ids=favItems.filter(f=>(activeFavList===null?!f.list_id:f.list_id===activeFavList)).map(f=>String(f.listing_id));
  const data=listings.filter(l=>ids.includes(String(l.id)));
  renderCards(data);
}
async function createFavList(){
  const name=prompt(t('fav.prompt'));
  if(!name||!name.trim())return;
  const token=localStorage.getItem('nesay_token');
  try{
    const res=await fetch(`${API}/listings/favorite-lists`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name:name.trim()})});
    const l=await res.json();
    favLists.push({id:l.id,name:l.name,count:0});
    renderFavTabs();
  }catch(e){}
}
function closeFavoritesView(){
  inFavoritesView=false;
  const el=document.getElementById('favTabs');if(el)el.innerHTML='';
  applyFilter();
}
function selCat(btn,cat){
  inFavoritesView=false;
  const ft=document.getElementById('favTabs');if(ft)ft.innerHTML='';
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');activeCat=cat;"""
if old_selcat in content:
    content = content.replace(old_selcat, new_selcat); changes += 1; print('OK 3/4: JS functions added')
else:
    print('FAIL 3/4: selCat anchor not found')

# 4. i18n keys
i18n_adds = [
    ("'filter.apply':'Показать','filter.conditionTitle'", "'filter.apply':'Показать','nav.favorites':'Избранное','fav.default':'Себе','fav.new':'Новая подборка','fav.prompt':'Название подборки','fav.exit':'Показать все','filter.conditionTitle'"),
    ("'filter.apply':'Show','filter.conditionTitle'", "'filter.apply':'Show','nav.favorites':'Favorites','fav.default':'Saved','fav.new':'New list','fav.prompt':'List name','fav.exit':'Show all','filter.conditionTitle'"),
    ("'filter.apply':'הצג','filter.conditionTitle'", "'filter.apply':'הצג','nav.favorites':'מועדפים','fav.default':'שלי','fav.new':'רשימה חדשה','fav.prompt':'שם הרשימה','fav.exit':'הצג הכל','filter.conditionTitle'"),
]
ok_i18n = True
for old, new in i18n_adds:
    if old in content:
        content = content.replace(old, new)
    else:
        ok_i18n = False
        print('FAIL i18n:', old[:40])
if ok_i18n:
    changes += 1
    print('OK 4/4: i18n keys added')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED - send me this output')
