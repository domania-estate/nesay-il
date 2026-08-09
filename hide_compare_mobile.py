content = open('Nesay_IL.html').read()
old = '''function init() {
  tab('map');
  syncFavIds();'''
new = '''function init() {
  tab('map');
  syncFavIds();
  var _cmpOvl=document.getElementById('cmpOvl');if(_cmpOvl){_cmpOvl.style.display='none';_cmpOvl.style.setProperty('display','none','important');}
  var _cmpBar=document.getElementById('cmpBar');if(_cmpBar){_cmpBar.style.display='none';_cmpBar.style.setProperty('display','none','important');}'''
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
