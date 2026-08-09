content = open('Nesay_IL.html').read()
old = '''function init() {
  tab('map');'''
new = '''async function syncFavIds(){
  const token=localStorage.getItem('nesay_token');
  if(!token)return;
  try{
    const res=await fetch(`${API}/listings/favorites/mine`,{headers:{Authorization:'Bearer '+token}});
    const rows=await res.json();
    rows.forEach(function(r){favIds.add(String(r.listing_id))});
    const dot=document.getElementById('M-fav-dot');
    if(dot){dot.style.display=favIds.size>0?'flex':'none';dot.textContent=favIds.size;}
    renderCards();
  }catch(e){}
}
function init() {
  tab('map');
  syncFavIds();'''
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
