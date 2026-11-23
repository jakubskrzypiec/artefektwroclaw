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
replacement = '<!-- FAQ:START -->\n' + '\n'.join(markup) + '\n<!-- FAQ:END -->'
for filename in ['index.html', 'kontakt.html']:
    path = root / filename
    source = path.read_text(encoding='utf-8')
    source, count = re.subn(r'<!-- FAQ:START -->.*?<!-- FAQ:END -->', lambda _: replacement, source, flags=re.S)
    if count != 1:
        raise ValueError(f'Expected exactly one FAQ region in {filename}, got {count}')
    path.write_text(source, encoding='utf-8')
print(f'Synchronized {len(items)} FAQ entries in both pages.')
