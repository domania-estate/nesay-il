content = open('Nesay_IL.html').read()
changes = 0
total = 4

# 1. Add modal HTML right before filterOvl (reuse same insertion point pattern)
old_anchor = '<div class="ovl" id="filterOvl" onclick="if(event.target===this)closeFilterPanel()">'
new_anchor = '''<div class="ovl" id="searchSavedOvl" onclick="if(event.target===this)closeSearchSavedModal()">
        <div style="background:#fff;border-radius:16px;padding:32px 28px;max-width:300px;width:100%;text-align:center">
          <div style="width:64px;height:64px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:30px">🔍</div>
          <div style="font-size:19px;font-weight:800;margin-bottom:8px;color:#111" data-i18n="search.modalTitle">Готово, поиск в кармане</div>
          <div style="font-size:13px;color:#888;margin-bottom:22px;line-height:1.5" data-i18n="search.modalDesc">Вернуться к нему можно в любой момент — кабинет → 🔍 Поиски</div>
          <button onclick="goToSavedSearches()" style="width:100%;padding:12px;border-radius:10px;border:none;background:#3167F1;color:#fff;font-weight:700;cursor:pointer;font-size:14px" data-i18n="search.goToSearches">Перейти к поискам</button>
        </div>
      </div>
      ''' + old_anchor

if old_anchor in content:
    content = content.replace(old_anchor, new_anchor); changes += 1; print('OK 1/4: modal HTML added')
else:
    print('FAIL 1/4: filterOvl anchor not found')

# 2. Replace toast call with modal call
old_toast = "if(res.ok)showToast('✅ '+t('search.saved')+' — '+t('search.hint'));"
new_toast = "if(res.ok)showSearchSavedModal();"
if old_toast in content:
    content = content.replace(old_toast, new_toast); changes += 1; print('OK 2/4: toast replaced with modal call')
else:
    print('FAIL 2/4: toast anchor not found')

# 3. Add JS functions (anchored after closeFavNameModal, reusing that area)
old_fn = '''function closeFavNameModal(){
  document.getElementById('favNameOvl').style.display='none';
}'''
new_fn = old_fn + '''
function showSearchSavedModal(){
  document.getElementById('searchSavedOvl').style.display='flex';
}
function closeSearchSavedModal(){
  document.getElementById('searchSavedOvl').style.display='none';
}
function goToSavedSearches(){
  closeSearchSavedModal();
  openCab();
  setTimeout(()=>swCab('searches'),150);
}'''
if old_fn in content:
    content = content.replace(old_fn, new_fn); changes += 1; print('OK 3/4: JS functions added')
else:
    print('FAIL 3/4: closeFavNameModal anchor not found')

# 4. i18n
i18n_adds = [
    ("'search.hint':'смотри в кабинете → 🔍 Поиски',", "'search.hint':'смотри в кабинете → 🔍 Поиски','search.modalTitle':'Готово, поиск в кармане','search.modalDesc':'Вернуться к нему можно в любой момент — кабинет → 🔍 Поиски','search.goToSearches':'Перейти к поискам',"),
    ("'search.hint':'find it in your cabinet → 🔍 Searches',", "'search.hint':'find it in your cabinet → 🔍 Searches','search.modalTitle':'Search saved','search.modalDesc':'Come back to it anytime — cabinet → 🔍 Searches','search.goToSearches':'Go to searches',"),
    ("'search.hint':'תמצא אותו בפרופיל → 🔍 חיפושים',", "'search.hint':'תמצא אותו בפרופיל → 🔍 חיפושים','search.modalTitle':'החיפוש נשמר','search.modalDesc':'תוכל לחזור אליו בכל עת — פרופיל → 🔍 חיפושים','search.goToSearches':'עבור לחיפושים',"),
]
ok_i18n = True
for old, new in i18n_adds:
    if old in content:
        content = content.replace(old, new)
    else:
        ok_i18n = False
        print('FAIL i18n:', old[:30])
if ok_i18n:
    changes += 1
    print('OK 4/4: i18n keys added')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
