import re

with open('Nesay_IL.html', encoding='utf-8') as f:
    content = f.read()

start_marker = '<div class="ovl" id="filterOvl"'
start_idx = content.find(start_marker)
if start_idx == -1:
    print('FAIL: filterOvl start not found')
    raise SystemExit

# find the actual start of the <div ...> tag (walk back to '<')
tag_start = content.rfind('<', 0, start_idx + len(start_marker))

# now walk forward counting div depth to find the matching closing </div>
pos = content.find('>', start_idx) + 1
depth = 1
i = pos
div_open_re = re.compile(r'<div\b')
div_close_re = re.compile(r'</div>')
while depth > 0:
    next_open = content.find('<div', i)
    next_close = content.find('</div>', i)
    if next_close == -1:
        print('FAIL: no matching close found')
        raise SystemExit
    if next_open != -1 and next_open < next_close:
        depth += 1
        i = next_open + 4
    else:
        depth -= 1
        i = next_close + 6

block = content[tag_start:i]
print('Extracted block length:', len(block))
print('First 80 chars:', block[:80])
print('Last 40 chars:', block[-40:])

# remove block from original location
new_content = content[:tag_start] + content[i:]

# insert it right before </body>
body_close = new_content.rfind('</body>')
if body_close == -1:
    print('FAIL: </body> not found')
    raise SystemExit

new_content = new_content[:body_close] + block + '\n' + new_content[body_close:]

with open('Nesay_IL.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('SAVED: modal relocated to just before </body>')
