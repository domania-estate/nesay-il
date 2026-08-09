content = open('Nesay_IL.html').read()
old = ".ovl{position:fixed;inset:0;background:rgba(10,10,15,.55);z-index:500;display:none;align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:16px}"
new = ".ovl{position:fixed;inset:0;background:rgba(10,10,15,.55);z-index:9999;display:none;align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:16px}"
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
