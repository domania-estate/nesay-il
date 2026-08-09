content = open('Nesay_IL.html').read()
changes = 0
total = 3

old_cabs = ".cabs{display:flex;border-bottom:1px solid var(--line);padding:0 22px}"
new_cabs = ".cabs{display:flex;border-bottom:1px solid var(--line);padding:0 22px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}\n.cabs::-webkit-scrollbar{display:none}"
if old_cabs in content:
    content = content.replace(old_cabs, new_cabs); changes += 1; print('OK 1/3: cabs scrollable')
else:
    print('FAIL 1/3: cabs anchor')

old_cabt = ".cabt{padding:12px 16px;font-size:13px;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;color:var(--ink3);background:none;border-top:none;border-left:none;border-right:none;font-family:var(--font);margin-bottom:-1px;transition:all .15s}"
new_cabt = ".cabt{padding:12px 12px;font-size:12px;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;color:var(--ink3);background:none;border-top:none;border-left:none;border-right:none;font-family:var(--font);margin-bottom:-1px;transition:all .15s;white-space:nowrap;flex-shrink:0}"
if old_cabt in content:
    content = content.replace(old_cabt, new_cabt); changes += 1; print('OK 2/3: cabt compacted')
else:
    print('FAIL 2/3: cabt anchor')

old_saved_toast = "if(res.ok)showToast('✅ '+t('search.saved'));"
new_saved_toast = "if(res.ok)showToast('✅ '+t('search.saved')+' — '+t('search.hint'));"
if old_saved_toast in content:
    content = content.replace(old_saved_toast, new_saved_toast); changes += 1; print('OK 3/3: hint added to toast')
else:
    print('FAIL 3/3: toast anchor')

# add i18n key for hint
i18n_adds = [
    ("'search.applied':'Поиск применён',", "'search.applied':'Поиск применён','search.hint':'смотри в кабинете → 🔍 Поиски',"),
    ("'search.applied':'Search applied',", "'search.applied':'Search applied','search.hint':'find it in your cabinet → 🔍 Searches',"),
    ("'search.applied':'החיפוש הופעל',", "'search.applied':'החיפוש הופעל','search.hint':'תמצא אותו בפרופיל → 🔍 חיפושים',"),
]
for old, new in i18n_adds:
    if old in content:
        content = content.replace(old, new)

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
