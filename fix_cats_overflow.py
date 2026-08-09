content = open('Nesay_IL.html').read()
old = ".cats{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;flex:1;padding:0 4px;min-width:0}"
new = ".cats{display:flex;gap:0;overflow:visible;scrollbar-width:none;flex:1;padding:0 4px;min-width:0}"
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
