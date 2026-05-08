import re

file_path = 'index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove names
content = re.sub(r'<h3 class="product-card__name">.*?</h3>', '', content)
# Remove meta (category)
content = re.sub(r'<div class="product-card__meta">[\s\S]*?</div>', '', content)
# Clean up whitespace/empty lines left behind
content = re.sub(r'\n\s*\n', '\n', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
