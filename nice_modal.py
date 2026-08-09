content = open('Nesay_IL.html', encoding='utf-8').read()
changes = 0
total = 2

old_anchor = '<div class="ovl" id="filterOvl" onclick="if(event.target===this)closeFilterPanel()">'
new_anchor = '''<div class="ovl" id="favNameOvl" onclick="if(event.target===this)closeFavNameModal()">
        <div style="background:#fff;border-radius:16px;padding:20px;max-width:320px;width:100%">
          <strong style="font-size:16px;display:block;margin-bottom:12px" data-i18n="fav.prompt">Название подборки</strong>
          <input type="text" id="favNameInput" placeholder="Например: Родителям" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #ddd;font-size:14px;margin-bottom:14px" onkeydown="if(event.key==='Enter')confirmCreateFavList()">
          <div style="display:flex;gap:8px">
            <button onclick="closeFavNameModal()" style="flex:1;padding:10px;border-radius:10px;border:1px solid #ddd;background:#fff;font-weight:600;cursor:pointer" data-i18n="filter.reset">Отмена</button>
            <button onclick="confirmCreateFavList()" style="flex:1;padding:10px;border-radius:10px;border:none;background:#111;color:#fff;font-weight:600;cursor:pointer" data-i18n="fav.create">Создать</button>
          </div>
        </div>
      </div>
      ''' + old_anchor

if old_anchor in content:
    content = content.replace(old_anchor, new_anchor)
    changes += 1
    print('OK 1/2: modal HTML added')
else:
    print('FAIL 1/2: filterOvl anchor not found')

old_fn = '''async function createFavList(){
  const name=prompt(t('fav.prompt'));
  if(!name||!name.trim())return;
  const token=localStorage.getItem('nesay_token');
  try{
    const res=await fetch(`${API}/listings/favorite-lists`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name:name.trim()})});
    const l=await res.json();
    favLists.push({id:l.id,name:l.name,count:0});
    renderFavTabs();
  }catch(e){}
}'''
new_fn = '''function createFavList(){
  document.getElementById('favNameInput').value='';
  document.getElementById('favNameOvl').style.display='flex';
  setTimeout(()=>document.getElementById('favNameInput').focus(),50);
}
function closeFavNameModal(){
  document.getElementById('favNameOvl').style.display='none';
}
async function confirmCreateFavList(){
  const name=document.getElementById('favNameInput').value;
  if(!name||!name.trim())return;
  closeFavNameModal();
  const token=localStorage.getItem('nesay_token');
  try{
    const res=await fetch(`${API}/listings/favorite-lists`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name:name.trim()})});
    const l=await res.json();
    favLists.push({id:l.id,name:l.name,count:0});
    renderFavTabs();
  }catch(e){}
}'''

if old_fn in content:
    content = content.replace(old_fn, new_fn)
    changes += 1
    print('OK 2/2: createFavList replaced')
else:
    print('FAIL 2/2: createFavList anchor not found')

i18n_pairs = [
    ("'fav.prompt':'Название подборки',", "'fav.prompt':'Название подборки','fav.create':'Создать',"),
    ("'fav.prompt':'List name',", "'fav.prompt':'List name','fav.create':'Create',"),
    ("'fav.prompt':'שם הרשימה',", "'fav.prompt':'שם הרשימה','fav.create':'צור',"),
]
for old, new in i18n_pairs:
    if old in content:
        content = content.replace(old, new)

print('Total:', changes, '/', total)
if changes == total:
    with open('Nesay_IL.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SAVED')
else:
    print('NOT SAVED')
