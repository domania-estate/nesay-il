content = open('Nesay_IL.html').read()
old = '''<div class="ovl" id="dealTypeOvl" onclick="if(event.target===this)closeDealTypeModal()">
  <div style="background:#fff;border-radius:16px;padding:20px;max-width:320px;width:100%">'''
new = '''<div class="ovl" id="dealTypeOvl" onclick="if(event.target===this)closeDealTypeModal()" style="align-items:flex-start;padding:0">
  <div style="background:#fff;border-radius:0 0 20px 20px;padding:20px;max-width:480px;width:100%;box-shadow:0 8px 24px rgba(0,0,0,.15)">'''
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
