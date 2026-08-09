content = open('Nesay_IL.html').read()
old_anchor = '<div class="ovl" id="filterOvl" onclick="if(event.target===this)closeFilterPanel()">'
new_anchor = '<div class="ovl" id="favNameOvl" onclick="if(event.target===this)closeFavNameModal()"><div style="background:#fff;border-radius:16px;padding:20px;max-width:320px;width:100%"><strong style="font-size:16px;display:block;margin-bottom:12px" data-i18n="fav.prompt">Название подборки</strong><input type="text" id="favNameInput" placeholder="Например: Родителям" style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #ddd;font-size:14px;margin-bottom:14px" onkeydown="if(event.key===\'Enter\')confirmCreateFavList()"><div style="display:flex;gap:8px"><button onclick="closeFavNameModal()" style="flex:1;padding:10px;border-radius:10px;border:1px solid #ddd;background:#fff;font-weight:600;cursor:pointer" data-i18n="filter.reset">Отмена</button><button onclick="confirmCreateFavList()" style="flex:1;padding:10px;border-radius:10px;border:none;background:#111;color:#fff;font-weight:600;cursor:pointer" data-i18n="fav.create">Создать</button></div></div></div>' + old_anchor
if old_anchor in content:
    content = content.replace(old_anchor, new_anchor)
    open('Nesay_IL.html', 'w').write(content)
    print('OK_MODAL_PART1_SAVED')
else:
    print('FAIL_ANCHOR_NOT_FOUND')
