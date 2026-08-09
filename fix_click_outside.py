content = open('Nesay_IL.html').read()
old = "if(!e.target.closest('.sdd')){document.getElementById('smn')?.classList.remove('open');document.getElementById('fmn')?.classList.remove('open');}"
new = "if(!e.target.closest('.sdd')){document.getElementById('smn')?.classList.remove('open');document.getElementById('fmn')?.classList.remove('open');document.getElementById('dealMenu-rent')?.classList.remove('open');document.getElementById('dealMenu-sale')?.classList.remove('open');}"
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
