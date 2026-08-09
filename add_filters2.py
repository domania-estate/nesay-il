content = open('Nesay_IL.html').read()
changes = 0

old_tags_const = "  const tags=[{ru:['Безоп. комн. ✓','Балкон ✓','Лифт'],he:[\"ממ\\\"ד ✓\",'מרפסת ✓','מעלית'],en:['Safe room ✓','Balcony ✓','Elevator']},{ru:['Парковка','Сад','Балкон'],he:['חניה','גינה','מרפסת'],en:['Parking','Garden','Balcony']},{ru:['Вид на море ✓','Балкон'],he:['נוף ים ✓','מרפסת'],en:['Sea view ✓','Balcony']}];"
new_tags_const = """  const AMENITIES=[
    {ru:'Балкон',he:'מרפסת',en:'Balcony'},
    {ru:'Парковка',he:'חניה',en:'Parking'},
    {ru:'Сад',he:'גינה',en:'Garden'},
    {ru:'Вид на море',he:'נוף ים',en:'Sea view'},
    {ru:'Безоп. комн.',he:'ממ"ד',en:'Safe room'},
    {ru:'Лифт',he:'מעלית',en:'Elevator'},
    {ru:'Кондиц.',he:'מזגן',en:'A/C'},
    {ru:'Мебель',he:'מרוהטת',en:'Furnished'},
    {ru:'Можно с животными',he:'מותר בעלי חיים',en:'Pets allowed'},
    {ru:'Кладовая',he:'מחסן',en:'Storage'}
  ];
  function randomTags(){
    const n=2+Math.floor(Math.random()*3);
    const pool=[...AMENITIES].sort(()=>Math.random()-.5).slice(0,n);
    return {ru:pool.map(t=>t.ru),he:pool.map(t=>t.he),en:pool.map(t=>t.en)};
  }"""
if old_tags_const in content:
    content = content.replace(old_tags_const, new_tags_const)
    changes += 1
    print('OK: amenities pool added')
else:
    print('FAIL: tags const anchor not found')

old_usage = "const tg=tags[Math.floor(Math.random()*tags.length)];"
new_usage = "const tg=randomTags();"
if old_usage in content:
    content = content.replace(old_usage, new_usage)
    changes += 1
    print('OK: generator updated')
else:
    print('FAIL: usage anchor not found')

old_map = "agency:(d)=>d.agent.type==='agency'||d.agent.type==='agent',\n};"
new_map = "agency:(d)=>d.agent.type==='agency'||d.agent.type==='agent',\n  elevator:(d)=>d.tags.ru.some(t=>t.includes('Лифт')),\n  ac:(d)=>d.tags.ru.some(t=>t.includes('Кондиц')),\n  furnished:(d)=>d.tags.ru.some(t=>t.includes('Мебель')),\n  pets:(d)=>d.tags.ru.some(t=>t.includes('животными')),\n};"
if old_map in content:
    content = content.replace(old_map, new_map)
    changes += 1
    print('OK: FILTER_MAP updated')
else:
    print('FAIL: FILTER_MAP anchor not found')

old_btns = '<button class="fpill" data-filter="agency" onclick="toggleFPill(this)">От агентства</button>'
new_btns = old_btns + '\n        <button class="fpill" data-filter="elevator" onclick="toggleFPill(this)">Лифт</button>\n        <button class="fpill" data-filter="ac" onclick="toggleFPill(this)">Кондиционер</button>\n        <button class="fpill" data-filter="furnished" onclick="toggleFPill(this)">Мебель</button>\n        <button class="fpill" data-filter="pets" onclick="toggleFPill(this)">Можно с животными</button>'
if old_btns in content:
    content = content.replace(old_btns, new_btns)
    changes += 1
    print('OK: buttons added')
else:
    print('FAIL: button anchor not found')

if changes == 4:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED - ' + str(changes) + '/4 anchors matched, fix before retry')
