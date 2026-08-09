content = open('Nesay_IL.html').read()
old = "async function doAuth(){"
new = """async function doAuth(){
  const _errEl=document.getElementById('authErr');if(_errEl)_errEl.style.display='none';"""
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
