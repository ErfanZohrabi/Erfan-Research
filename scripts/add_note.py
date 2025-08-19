#!/usr/bin/env python3
"""
Copy a user-provided note (raw file) into the site folder without modification,
and update README.md with a link entry. Optionally attach a concept text file
which will be appended to the README under the "Concepts" section.

Usage:
  python3 scripts/add_note.py --src /path/to/note.html --dest notes/my-note.html --title "My Note" [--concept-file /path/to/concept.txt]

The script will:
- copy the source file bytes to the destination path inside this repo
- add a bullet in README.md Notes section with title, path, and date
- if --concept-file is provided, append the concept into README.md under Concepts

Important: the note content is copied as-is; no transformations are performed.
"""

import argparse
import sys
from pathlib import Path
from datetime import date
import shutil

ROOT = Path(__file__).resolve().parent.parent
README = ROOT / 'README.md'

MARKER_NOTES = '<!-- NOTES_LIST -->'
MARKER_CONCEPTS = '<!-- CONCEPTS -->'


def ensure_readme_has_sections():
    text = README.read_text(encoding='utf-8') if README.exists() else ''
    changed = False
    if MARKER_NOTES not in text:
        text += '\n\n## Notes\n\n' + MARKER_NOTES + '\n'
        changed = True
    if MARKER_CONCEPTS not in text:
        text += '\n\n## Concepts\n\n' + MARKER_CONCEPTS + '\n'
        changed = True
    if changed:
        README.write_text(text, encoding='utf-8')


def append_note_entry(dest_rel, title):
    text = README.read_text(encoding='utf-8')
    today = date.today().isoformat()
    entry = f'- [{title}]({dest_rel}) — {today}\n'
    if MARKER_NOTES in text:
        text = text.replace(MARKER_NOTES, MARKER_NOTES + '\n' + entry)
    else:
        text += '\n## Notes\n\n' + entry
    README.write_text(text, encoding='utf-8')


def append_concept(title, concept_text):
    text = README.read_text(encoding='utf-8')
    block = f'### {title}\n\n{concept_text}\n\n'
    if MARKER_CONCEPTS in text:
        text = text.replace(MARKER_CONCEPTS, MARKER_CONCEPTS + '\n' + block)
    else:
        text += '\n## Concepts\n\n' + block
    README.write_text(text, encoding='utf-8')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--src', required=True, help='Path to source note file (will be copied as-is)')
    p.add_argument('--dest', required=True, help='Destination path inside site (e.g. notes/my-note.html)')
    p.add_argument('--title', required=True, help='Title to show in README notes list')
    p.add_argument('--concept-file', help='Optional text file containing your concept/summary to add to README')
    args = p.parse_args()

    src = Path(args.src).expanduser()
    if not src.exists():
        print('Source file not found:', src, file=sys.stderr)
        sys.exit(1)

    dest = ROOT / args.dest
    dest.parent.mkdir(parents=True, exist_ok=True)

    # Copy as-is (binary-safe)
    shutil.copyfile(str(src), str(dest))
    print('Copied', src, '->', dest)

    ensure_readme_has_sections()
    append_note_entry(args.dest, args.title)
    print('Appended entry to README under Notes')

    if args.concept_file:
        cf = Path(args.concept_file).expanduser()
        if cf.exists():
            concept_text = cf.read_text(encoding='utf-8')
            append_concept(args.title, concept_text)
            print('Appended concept to README under Concepts')
        else:
            print('Concept file not found:', cf, file=sys.stderr)

    print('\nDone. To publish, commit the new file and push to GitHub.')


if __name__ == '__main__':
    main()
