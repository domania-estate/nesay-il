content = open('Nesay_IL.html').read()
changes = 0
total = 1

old = '''    if(star && star.animate){
      star.animate([
        {transform:'rotateY(0deg) scale(1)', opacity:1},
        {transform:'rotateY(360deg) scale(1.2)', opacity:1, offset:0.4},
        {transform:'rotateY(360deg) scale(12)', opacity:0}
      ], {duration:1400, easing:'cubic-bezier(0.4,0,0.2,1)', fill:'forwards'});
    } else if(star){
      star.classList.add('spin');
    }'''

new = '''    var isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if(isSafari&&l){l.style.backdropFilter='none';l.style.webkitBackdropFilter='none';}
    if(star && star.animate){
      if(isSafari){
        star.animate([
          {transform:'scale(1)', opacity:1},
          {transform:'scale(1.15)', opacity:1, offset:0.4},
          {transform:'scale(8)', opacity:0}
        ], {duration:900, easing:'ease-out', fill:'forwards'});
      } else {
        star.animate([
          {transform:'rotateY(0deg) scale(1)', opacity:1},
          {transform:'rotateY(360deg) scale(1.2)', opacity:1, offset:0.4},
          {transform:'rotateY(360deg) scale(12)', opacity:0}
        ], {duration:1400, easing:'cubic-bezier(0.4,0,0.2,1)', fill:'forwards'});
      }
    } else if(star){
      star.classList.add('spin');
    }'''

if old in content:
    content = content.replace(old, new)
    changes += 1
    print('OK: Safari-specific lightweight animation added')
else:
    print('FAIL: anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
