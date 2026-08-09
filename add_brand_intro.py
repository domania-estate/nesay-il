content = open('Nesay_IL.html').read()
changes = 0
total = 2

style_block = '''<style>
.bi-curtain{position:fixed;inset:0;z-index:99999;overflow:hidden;animation:bi-curtain-up .85s cubic-bezier(.76,0,.24,1) 3.25s forwards}
.bi-stage{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 40%,#28418a 0%,#182a52 55%,#0d1424 100%)}
.bi-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;animation:bi-lift-out .75s cubic-bezier(.7,0,.3,1) 3s forwards}
.bi-halo-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.bi-halo{width:46vmin;height:46vmin;border-radius:50%;background:rgba(49,103,241,.35);filter:blur(90px);opacity:0;animation:bi-halo 1.4s ease-out 1.55s forwards}
.bi-lockup{position:relative;width:min(78vw,720px);animation:bi-lockup-settle .9s cubic-bezier(.2,.8,.25,1) forwards}
.bi-mark{width:100%;height:auto;display:block}
.bi-draw{stroke-dasharray:var(--dash);stroke-dashoffset:var(--dash);animation:bi-draw 1.15s cubic-bezier(.65,0,.35,1) .25s forwards}
.bi-d{opacity:0;transform-origin:50% 60%;animation:bi-drop-in .85s cubic-bezier(.2,1.2,.3,1) .95s forwards}
.bi-word{transform-origin:left center;animation:bi-wipe .75s cubic-bezier(.66,0,.2,1) 1.35s forwards}
.bi-sheen-wrap{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.bi-sheen{height:100%;width:33%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);animation:bi-sheen 1s cubic-bezier(.4,0,.2,1) 2.05s forwards}
@keyframes bi-draw{from{stroke-dashoffset:var(--dash)}to{stroke-dashoffset:0}}
@keyframes bi-drop-in{0%{opacity:0;transform:translateY(-42%) scale(.86)}60%{opacity:1;transform:translateY(3%) scale(1.02)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes bi-wipe{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes bi-sheen{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(240%) skewX(-18deg)}}
@keyframes bi-halo{0%{opacity:0;transform:scale(.6)}45%{opacity:.85;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
@keyframes bi-lockup-settle{0%{transform:scale(1.06);filter:blur(6px);opacity:0}100%{transform:scale(1);filter:blur(0);opacity:1}}
@keyframes bi-lift-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.14)}}
@keyframes bi-curtain-up{from{transform:translateY(0)}to{transform:translateY(-101%)}}
@media (prefers-reduced-motion: reduce){.bi-curtain,.bi-curtain *{animation:none!important;opacity:1!important;transform:none!important}}
</style>
'''

html_block = '''<div class="bi-curtain" id="brandIntro" aria-hidden="true">
  <div class="bi-stage"></div>
  <div class="bi-halo-wrap"><div class="bi-halo"></div></div>
  <div class="bi-center">
    <div class="bi-lockup">
      <svg viewBox="0 0 1420 360" class="bi-mark" fill="none">
        <g stroke="#3167F1" stroke-width="20" stroke-linecap="round" stroke-linejoin="round">
          <path class="bi-draw" style="--dash:420" d="M22 132 L182 20 L342 132"/>
          <path class="bi-draw" style="--dash:700;animation-delay:0.55s" d="M40 126 V330 H324 V126"/>
        </g>
        <text class="bi-d" x="96" y="300" fill="#3167F1" font-weight="800" font-size="270">D</text>
        <defs><clipPath id="biWordClip"><rect class="bi-word" x="352" y="40" width="1060" height="300"/></clipPath></defs>
        <g clip-path="url(#biWordClip)">
          <text x="352" y="300" fill="#fff" font-weight="800" font-size="270" letter-spacing="-6">omania</text>
        </g>
      </svg>
      <div class="bi-sheen-wrap"><div class="bi-sheen"></div></div>
    </div>
  </div>
</div>
<script>setTimeout(function(){var el=document.getElementById('brandIntro');if(el)el.remove();},4300);</script>
'''

old_anchor = '<body>\n<nav>'
new_anchor = '<body>\n' + style_block + html_block + '<nav>'

if old_anchor in content:
    content = content.replace(old_anchor, new_anchor)
    changes += 1
    print('OK 1/1: brand intro injected')
else:
    print('FAIL: <body>\\n<nav> anchor not found')

if changes == 1:
    open('Nesay_IL.html', 'w').write(content)
    print('SAVED')
else:
    print('NOT SAVED')
