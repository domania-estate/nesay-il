content = open('Nesay_IL.html').read()
changes = 0
total = 6

ICON_HOME = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/></svg>'
ICON_HEART = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9.5-8.5C1 9 2.5 5.5 6 5c2-.3 3.7.8 6 3 2.3-2.2 4-3.3 6-3 3.5.5 5 4 3.5 7.5C19 16.65 12 21 12 21z"/></svg>'
ICON_KEY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="15" r="4"/><path d="M10 12l9-9M16 6l2 2M13 9l2 2"/></svg>'
ICON_TAG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12.5L12.5 20.5a2 2 0 01-2.8 0l-6.2-6.2a2 2 0 010-2.8L11.5 3.5H19a1.5 1.5 0 011.5 1.5v7.5z"/><circle cx="15" cy="8" r="1.2" fill="currentColor"/></svg>'
ICON_ADJ = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"/></svg>'
ICON_BOOKMARK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v16l-6-4-6 4V4z"/></svg>'

repls = [
    ('<span class="ctab-ico">🏠</span><span data-i18n="nav.all">Все</span>', f'<span class="ctab-ico">{ICON_HOME}</span><span data-i18n="nav.all">Все</span>'),
    ('<span class="ctab-ico">❤️</span><span data-i18n="nav.favorites">Избранное</span>', f'<span class="ctab-ico">{ICON_HEART}</span><span data-i18n="nav.favorites">Избранное</span>'),
    ('<span class="ctab-ico">🔵</span><span data-i18n="nav.rent">Аренда</span>', f'<span class="ctab-ico">{ICON_KEY}</span><span data-i18n="nav.rent">Аренда</span>'),
    ('<span class="ctab-ico">🟠</span><span data-i18n="nav.sale">Продажа</span>', f'<span class="ctab-ico">{ICON_TAG}</span><span data-i18n="nav.sale">Продажа</span>'),
    ('<button class="sbt" onclick="openFilterPanel()">🔧 <span id="filterLbl"', f'<button class="sbt" onclick="openFilterPanel()">{ICON_ADJ} <span id="filterLbl"'),
    ('<button class="sbt" onclick="saveCurrentSearch()">💾 <span data-i18n="search.save">', f'<button class="sbt" onclick="saveCurrentSearch()">{ICON_BOOKMARK} <span data-i18n="search.save">'),
]

for old, new in repls:
    if old in content:
        content = content.replace(old, new); changes += 1; print('OK:', old[:45])
    else:
        print('FAIL:', old[:45])

print('Total:', changes, '/', total)
if changes == total:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
