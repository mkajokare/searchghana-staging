#!/usr/bin/env python3
"""Hide the staging copy of SearchGhana from search engines -- and un-hide it at launch.

    python staging_noindex.py add      # before deploying to the github.io staging site
    python staging_noindex.py remove   # right before going live on searchghana.com

It inserts (or strips) one marked <meta name="robots" content="noindex, nofollow">
tag at the top of <head> in every .html file in this folder. Only tags carrying the
marker comment are ever touched, so any robots tag a page already had stays as is.
Safe to run repeatedly.
"""
import io, re, sys, glob, os

MARK = '<!-- staging-noindex -->'
TAG = '<meta name="robots" content="noindex, nofollow">' + MARK
HEAD = re.compile(r'<head[^>]*>', re.I)
EXISTING = re.compile(r'[ \t]*' + re.escape(TAG) + r'(\r?\n)?')

def main(mode):
    here = os.path.dirname(os.path.abspath(__file__))
    changed = skipped = 0
    for path in sorted(glob.glob(os.path.join(here, '*.html'))):
        s = io.open(path, encoding='utf-8', newline='').read()
        nl = '\r\n' if '\r\n' in s else '\n'
        if mode == 'add':
            if MARK in s:
                skipped += 1; continue
            m = HEAD.search(s)
            if not m:
                print('  ! no <head> in', os.path.basename(path)); continue
            s = s[:m.end()] + nl + TAG + s[m.end():]
        else:
            if MARK not in s:
                skipped += 1; continue
            s = EXISTING.sub('', s, count=1)
            # drop the empty line the tag leaves behind right after <head>
            s = re.sub(r'(<head[^>]*>)(\r?\n)(\r?\n)', r'\1\2', s, count=1)
        io.open(path, 'w', encoding='utf-8', newline='').write(s)
        changed += 1
    print('%s: %d file(s) changed, %d already up to date' % (mode, changed, skipped))

if __name__ == '__main__' and len(sys.argv) == 2 and sys.argv[1] in ('add', 'remove'):
    main(sys.argv[1])
else:
    print(__doc__); sys.exit(1)
