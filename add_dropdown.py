content = open('Nesay_IL.html').read()
changes = 0

old_block = """      <!-- Filter pills -->
      <div class="filters-scroll" id="filterPills">
        <button class="fpill" data-filter="rooms12" onclick="toggleFPill(this)" data-i18n="filter.rooms12">1–2 комн.</button>
        <button class="fpill" data-filter="rooms34" onclick="toggleFPill(this)" data-i18n="filter.rooms34">3–4 комн.</button>
        <button class="fpill" data-filter="safeRoom" onclick="toggleFPill(this)" data-i18n="filter.saferoom">Безоп. комн.</button>
        <button class="fpill" data-filter="parking" onclick="toggleFPill(this)" data-i18n="filter.parking">Парковка</button>
        <button class="fpill" data-filter="balcony" onclick="toggleFPill(this)" data-i18n="filter.balcony">Балкон</button>
        <button class="fpill" data-filter="garden" onclick="toggleFPill(this)" data-i18n="filter.garden">Сад</button>
        <button class="fpill" data-filter="sea" onclick="toggleFPill(this)" data-i18n="filter.sea">Море 🌊</button>
        <button class="fpill" data-filter="new" onclick="toggleFPill(this)">Новые</button>
        <button class="fpill" data-filter="owner" onclick="toggleFPill(this)">От собственника</button>
        <button class="fpill" data-filter="agency" onclick="toggleFPill(this)">От агентства</button>
        <button class="fpill" data-filter="elevator" onclick="toggleFPill(this)">Лифт</button>
        <button class="fpill" data-filter="ac" onclick="toggleFPill(this)">Кондиционер</button>
        <button class="fpill" data-filter="furnished" onclick="toggleFPill(this)">Мебель</button>
        <button class="fpill" data-filter="pets" onclick="toggleFPill(this)">Можно с животными</button>
      </div>"""

new_block = """      <!-- Filter dropdown -->
      <div class="filters-scroll" id="filterPills">
        <div class="sdd" style="position:relative;display:inline-block">
          <button class="sbt" onclick="document.getElementById('fmn').classList.toggle('open')">
            🔧 <span id="filterLbl">Фильтры</span>▾
          </button>
          <div class="smn" id="fmn" style="min-width:230px;max-height:340px;overflow-y:auto">
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="owner" onchange="toggleFCheck(this)"><span>От собственника</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="agency" onchange="toggleFCheck(this)"><span>От агентства</span></label>
            <div style="height:1px;background:var(--line);margin:6px 4px"></div>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="rooms12" onchange="toggleFCheck(this)"><span data-i18n="filter.rooms12">1–2 комн.</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="rooms34" onchange="toggleFCheck(this)"><span data-i18n="filter.rooms34">3–4 комн.</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="safeRoom" onchange="toggleFCheck(this)"><span data-i18n="filter.saferoom">Безоп. комн.</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="parking" onchange="toggleFCheck(this)"><span data-i18n="filter.parking">Парковка</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="balcony" onchange="toggleFCheck(this)"><span data-i18n="filter.balcony">Балкон</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="garden" onchange="toggleFCheck(this)"><span data-i18n="filter.garden">Сад</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="sea" onchange="toggleFCheck(this)"><span data-i18n="filter.sea">Море 🌊</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="new" onchange="toggleFCheck(this)"><span>Новые</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="elevator" onchange="toggleFCheck(this)"><span>Лифт</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="ac" onchange="toggleFCheck(this)"><span>Кондиционер</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="furnished" onchange="toggleFCheck(this)"><span>Мебель</span></label>
            <label class="fchk" style="display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;border-radius:8px"><input type="checkbox" data-filter="pets" onchange="toggleFCheck(this)"><span>Можно с животными</span></label>
          </div>
        </div>
      </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    changes += 1
    print('OK: dropdown HTML added')
else:
    print('FAIL: pills block anchor not found')

old_fn = """function toggleFPill(el){
  const f=el.dataset.filter;
  el.classList.toggle('on');
  if(el.classList.contains('on'))activeFilters.add(f);
  else activeFilters.delete(f);
  applyFilter();
}"""
new_fn = old_fn + """
function toggleFCheck(el){
  const f=el.dataset.filter;
  if(el.checked)activeFilters.add(f);
  else activeFilters.delete(f);
  applyFilter();
  const n=activeFilters.size;
  const lbl=document.getElementById('filterLbl');
  if(lbl)lbl.textContent=n>0?('Фильтры ('+n+')'):'Фильтры';
}"""
if old_fn in content:
    content = content.replace(old_fn, new_fn)
    changes += 1
    print('OK: toggleFCheck function added')
else:
    print('FAIL: toggleFPill anchor not found')

old_close = "if(!e.target.closest('.sdd'))document.getElementById('smn')?.classList.remove('open');"
new_close = "if(!e.target.closest('.sdd')){document.getElementById('smn')?.classList.remove('open');document.getElementById('fmn')?.classList.remove('open');}"
if old_close in content:
    content = content.replace(old_close, new_close)
    changes += 1
    print('OK: click-outside handler updated')
else:
    print('FAIL: click-outside anchor not found')

if changes == 3:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED - ' + str(changes) + '/3 anchors matched')
