content = open('Nesay_IL.html').read()
changes = 0
total = 2

old_wrap = '''#loader-star-wrap {
  transform-origin:50% 50%;
  transform-style:preserve-3d;
  -webkit-transform-style:preserve-3d;
  will-change:transform;
}'''
new_wrap = '''#loader-star-wrap {
  transform-origin:50% 50%;
  transform-style:preserve-3d;
  -webkit-transform-style:preserve-3d;
  will-change:transform;
  backface-visibility:hidden;
  -webkit-backface-visibility:hidden;
}
@supports (-webkit-touch-callout:none) {
  #nesay-loader { backdrop-filter:none!important; -webkit-backdrop-filter:none!important; }
}'''
if old_wrap in content:
    content = content.replace(old_wrap, new_wrap); changes += 1; print('OK 1/2: backdrop-filter disabled for Safari')
else:
    print('FAIL 1/2: loader-star-wrap anchor not found')

old_spin = '''#loader-star.spin {
  animation:starSpin3D 1.4s cubic-bezier(0.4,0,0.2,1) forwards !important;
}'''
new_spin = '''#loader-star.spin {
  animation:starSpin3D 1.4s cubic-bezier(0.4,0,0.2,1) forwards !important;
  backface-visibility:hidden;
  -webkit-backface-visibility:hidden;
}'''
if old_spin in content:
    content = content.replace(old_spin, new_spin); changes += 1; print('OK 2/2: backface-visibility added to spin')
else:
    print('FAIL 2/2: loader-star.spin anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
