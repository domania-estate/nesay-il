content = open('Nesay_IL.html').read()
changes = 0
total = 2

old_fn = '''async function toggleFav(btn,idx){
  const d=listings[idx];
  const token=localStorage.getItem('nesay_token');
  if(!token){showToast(t('toast.need_auth'));return}
  const liked=btn.textContent.includes('❤️');
  btn.textContent=liked?'🤍':'❤️';
  if(d&&d.id&&String(d.id).length>10){
    try{
      const res=await fetch(`${API}/listings/${d.id}/favorite`,{method:'POST',headers:{Authorization:'Bearer '+token}});
      if(res.ok){
        const rd=await res.json();
        if(d)d.fav_count=rd.count;
        showToast(rd.liked?'❤️ '+t('card.save'):'✕ '+t('card.save'));
      }
    }catch(e){}
  }else{showToast(liked?'✕':'❤️ '+t('card.save'))}
}'''

new_fn = '''function flyToFav(startEl){
  const target=document.querySelector('.ctab[onclick="openFavoritesView()"]');
  if(!target||!startEl)return;
  const s=startEl.getBoundingClientRect();
  const t=target.getBoundingClientRect();
  const fly=document.createElement('div');
  fly.textContent='\\u2764\\ufe0f';
  fly.style.cssText='position:fixed;left:'+s.left+'px;top:'+s.top+'px;font-size:18px;z-index:9999;pointer-events:none;transition:all .6s cubic-bezier(.2,.8,.2,1)';
  document.body.appendChild(fly);
  requestAnimationFrame(()=>{
    fly.style.left=t.left+'px';
    fly.style.top=t.top+'px';
    fly.style.fontSize='10px';
    fly.style.opacity='0.2';
  });
  setTimeout(()=>{fly.remove();bumpFavBadge(1);},600);
}
function bumpFavBadge(delta){
  const target=document.querySelector('.ctab[onclick="openFavoritesView()"]');
  if(!target)return;
  let badge=document.getElementById('favBadge');
  if(!badge){
    badge=document.createElement('span');
    badge.id='favBadge';
    badge.style.cssText='background:#e63946;color:#fff;border-radius:10px;font-size:10px;padding:1px 5px;margin-left:2px;font-weight:700;transition:transform .2s;display:inline-block';
    target.appendChild(badge);
  }
  let n=Math.max(0,parseInt(badge.textContent||'0')+delta);
  badge.textContent=n>0?n:'';
  badge.style.display=n>0?'inline-block':'none';
  badge.style.transform='scale(1.4)';
  setTimeout(()=>{badge.style.transform='scale(1)'},200);
}
async function toggleFav(btn,idx){
  const d=listings[idx];
  const token=localStorage.getItem('nesay_token');
  if(!token){showToast(t('toast.need_auth'));return}
  const liked=btn.textContent.includes('\\u2764\\ufe0f');
  btn.textContent=liked?'\\ud83e\\udd0d':'\\u2764\\ufe0f';
  if(!liked)flyToFav(btn);else bumpFavBadge(-1);
  if(d&&d.id&&String(d.id).length>10){
    try{
      const res=await fetch(`${API}/listings/${d.id}/favorite`,{method:'POST',headers:{Authorization:'Bearer '+token}});
      if(res.ok){
        const rd=await res.json();
        if(d)d.fav_count=rd.count;
        showToast(rd.liked?'\\u2764\\ufe0f '+t('card.save'):'\\u2715 '+t('card.save'));
      }
    }catch(e){}
  }else{showToast(liked?'\\u2715':'\\u2764\\ufe0f '+t('card.save'))}
}'''

if old_fn in content:
    content = content.replace(old_fn, new_fn)
    changes += 1
    print('OK 1/2: toggleFav replaced with animation')
else:
    print('FAIL 1/2: toggleFav anchor not found')

changes = total if changes >= 1 else changes
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
