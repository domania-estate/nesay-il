content = open('Nesay_IL.html').read()
old = 'onclick="alert(document.getElementById(&#39;filterOvl&#39;)?&#39;el found&#39;:&#39;el MISSING&#39;);try{openFilterPanel();alert(&#39;opened ok, display=&#39;+document.getElementById(&#39;filterOvl&#39;).style.display)}catch(e){alert(&#39;ERROR: &#39;+e.message)}">'
new = 'onclick="openFilterPanel()">'
if old in content:
    content = content.replace(old, new)
    open('Nesay_IL.html', 'w').write(content)
    print('OK: SAVED')
else:
    print('FAIL: anchor not found')
