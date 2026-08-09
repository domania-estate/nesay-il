content = open('Nesay_IL.html').read()
old = "if(!res.ok){showToast('❌ '+(data.error||'Ошибка'));return}"
new = "if(!res.ok){hideLoader();showToast('❌ '+(data.error||'Ошибка'));return}"
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
