content = open('Nesay_IL.html').read()
old = '<a href="#" class="logo"><img src="logo-icon.png" class="logo-ic-img" alt="Domania">omania</a>'
new = '<a href="#" class="logo"><img src="logo-full.png" class="logo-ic-img" alt="Domania"></a>'
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK, replaced')
else:
    print('NOT FOUND - proceeding to manual check needed')
