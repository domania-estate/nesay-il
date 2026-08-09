content = open('Nesay_IL.html').read()
old = "}catch(e){showToast('❌ '+t('server.down'));}"
new = "}catch(e){hideLoader();showToast('❌ '+t('server.down'));}"
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
