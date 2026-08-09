content = open('Nesay_IL.html').read()
changes = 0
total = 2

old1 = "if(!email){showToast(t('err.email'));return}"
new1 = "if(!email){const em=document.getElementById('authErr');if(em){em.textContent=t('err.email');em.style.display='block';}return}"
if old1 in content:
    content = content.replace(old1, new1); changes += 1; print('OK 1/2: empty email inline')
else:
    print('FAIL 1/2: email anchor not found')

old2 = "if(!pass||pass.length<8){showToast(t('err.pass'));return}"
new2 = "if(!pass||pass.length<8){const em=document.getElementById('authErr');if(em){em.textContent=t('err.pass');em.style.display='block';}return}"
if old2 in content:
    content = content.replace(old2, new2); changes += 1; print('OK 2/2: short password inline')
else:
    print('FAIL 2/2: pass anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
