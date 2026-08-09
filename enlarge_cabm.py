content = open('Nesay_IL.html').read()
old = ".cabm{background:var(--white);border-radius:20px;width:640px;max-width:100%;max-height:88vh;overflow-y:auto;box-shadow:var(--shadow-lg)}"
new = ".cabm{background:var(--white);border-radius:20px;width:860px;max-width:95vw;max-height:92vh;overflow-y:auto;box-shadow:var(--shadow-lg)}"
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
