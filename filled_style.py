content = open('Nesay_IL.html').read()
old = '''function paintToggle(el,on){
  el.style.background=on?'#eef2ff':'#fff';
  el.style.borderColor=on?'#3167F1':'#ddd';
  el.style.color=on?'#3167F1':'#000';
}'''
new = '''function paintToggle(el,on){
  el.style.background=on?'#3167F1':'#fff';
  el.style.borderColor=on?'#3167F1':'#ddd';
  el.style.color=on?'#fff':'#000';
  el.style.fontWeight=on?'700':'400';
}'''
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
