content = open('Nesay_IL.html').read()
changes = 0
total = 3

old_html = '''      <button class="bsub" id="authBtn" onclick="doAuth()">Войти</button>
      <div class="dv">или</div>'''
new_html = '''      <div id="authErr" style="display:none;color:#e11d48;font-size:13px;font-weight:600;text-align:center;margin:-6px 0 12px;padding:8px;background:#fef2f2;border-radius:8px"></div>
      <button class="bsub" id="authBtn" onclick="doAuth()">Войти</button>
      <div class="dv">или</div>'''
if old_html in content:
    content = content.replace(old_html, new_html); changes += 1; print('OK 1/3: error box added to form')
else:
    print('FAIL 1/3: button anchor not found')

old_err1 = "if(!res.ok){hideLoader();showToast('❌ '+(data.error||'Ошибка'));return}"
new_err1 = "if(!res.ok){hideLoader();const em=document.getElementById('authErr');if(em){em.textContent=data.error||'Неверный логин или пароль';em.style.display='block';}return}"
if old_err1 in content:
    content = content.replace(old_err1, new_err1); changes += 1; print('OK 2/3: inline error on failed auth')
else:
    print('FAIL 2/3: err1 anchor not found')

old_err2 = "}catch(e){hideLoader();showToast('❌ '+t('server.down'));}"
new_err2 = "}catch(e){hideLoader();const em=document.getElementById('authErr');if(em){em.textContent=t('server.down');em.style.display='block';}}"
if old_err2 in content:
    content = content.replace(old_err2, new_err2); changes += 1; print('OK 3/3: inline error on network fail')
else:
    print('FAIL 3/3: err2 anchor not found')

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
