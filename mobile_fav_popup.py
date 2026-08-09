content = open('Nesay_IL.html').read()
changes = 0
total = 3

# 1. Add modal HTML before </body>
modal_html = '''<div class="ovl" id="mobileFavOvl" onclick="if(event.target===this)closeMobileFavPopup()" style="align-items:flex-end">
  <div style="background:#fff;border-radius:20px 20px 0 0;padding:24px 20px;max-width:480px;width:100%;text-align:center">
    <div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:26px">❤️</div>
    <div style="font-size:17px;font-weight:800;margin-bottom:8px">Добавлено в избранное</div>
    <div style="font-size:13px;color:#888;margin-bottom:20px;line-height:1.5">Вы сохранили это объявление. Найти его можно в разделе «Избранное».</div>
    <button onclick="goToMobileFavorites()" style="width:100%;padding:13px;border-radius:12px;border:none;background:#3167F1;color:#fff;font-weight:700;font-size:14px;margin-bottom:10px">Перейти в избранное</button>
    <button onclick="dontShowFavPopup()" style="width:100%;padding:13px;border-radius:12px;border:none;background:none;color:#888;font-weight:600;font-size:13px">Больше не показывать</button>
  </div>
</div>
'''
body_close = content.rfind('</body>')
if body_close != -1:
    content = content[:body_close] + modal_html + content[body_close:]
    changes += 1; print('OK 1/3: popup HTML added')
else:
    print('FAIL 1/3: </body> not found')

# 2. Add JS functions
old_fn = '''function closeDealTypeModal(){
  document.getElementById('dealTypeOvl').style.display='none';
}'''
new_fn = old_fn + '''
function showMobileFavPopup(){
  if(localStorage.getItem('nesay_hide_fav_popup')==='1')return;
  document.getElementById('mobileFavOvl').style.display='flex';
}
function closeMobileFavPopup(){
  document.getElementById('mobileFavOvl').style.display='none';
}
function goToMobileFavorites(){
  closeMobileFavPopup();
  if(window.M&&M.tab)M.tab('fav');
}
function dontShowFavPopup(){
  localStorage.setItem('nesay_hide_fav_popup','1');
  closeMobileFavPopup();
}'''
if old_fn in content:
    content = content.replace(old_fn, new_fn); changes += 1; print('OK 2/3: JS functions added')
else:
    print('FAIL 2/3: closeDealTypeModal anchor not found')

# 3. Trigger popup from mobile toggleFav (only when liking, not unliking)
old_toggle = '''  } else {
    favIds.add(id);
    btn.textContent = '❤️';
    btn.classList.add('on');
  }'''
new_toggle = '''  } else {
    favIds.add(id);
    btn.textContent = '❤️';
    btn.classList.add('on');
    showMobileFavPopup();
  }'''
if old_toggle in content:
    content = content.replace(old_toggle, new_toggle); changes += 1; print('OK 3/3: popup wired into like action')
else:
    print('FAIL 3/3: toggleFav anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
