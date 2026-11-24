"""Regenerate the FAQ in both pages from content/faq.json (Python stdlib only)."""
from pathlib import Path
import html
import json
import re

root = Path(__file__).resolve().parents[1]
items = json.loads((root / 'content/faq.json').read_text(encoding='utf-8'))
markup = []
for i, item in enumerate(items, 1):
    open_class = ' is-open' if i == 1 else ''
    expanded = 'true' if i == 1 else 'false'
    symbol = '−' if i == 1 else '+'
    markup.append(
        f'<article class="accordion-item{open_class}"><button type="button" '
        f'aria-expanded="{expanded}" aria-controls="faq-answer-{i}" id="faq-question-{i}">'
        f'<span>{i:02}</span><strong>{html.escape(item["question"])}</strong>'
        f'<b aria-hidden="true">{symbol}</b></button><div class="accordion-panel" '
        f'id="faq-answer-{i}" role="region" aria-labelledby="faq-question-{i}">'
        f'<div class="accordion-answer"><p>{html.escape(item["answer"])}</p></div></div></article>'
    )
def region(body):
    return '<!-- FAQ:START -->\n' + body + '\n<!-- FAQ:END -->'


# Strona główna: pytania w trzech kolumnach (np. 12 pytań = 3 × 4).
per_column = -(-len(markup) // 3)
columns = [markup[i:i + per_column] for i in range(0, len(markup), per_column)]
regions = {
    'index.html': region('\n'.join(
        '<div class="faq-col">\n' + '\n'.join(column) + '\n</div>' for column in columns
    )),
    'kontakt.html': region('\n'.join(markup)),
}
for filename, replacement in regions.items():
    path = root / filename
    source = path.read_text(encoding='utf-8')
    source, count = re.subn(r'<!-- FAQ:START -->.*?<!-- FAQ:END -->', lambda _: replacement, source, flags=re.S)
    if count != 1:
        raise ValueError(f'Expected exactly one FAQ region in {filename}, got {count}')
    path.write_text(source, encoding='utf-8')
print(f'Synchronized {len(items)} FAQ entries in both pages.')
