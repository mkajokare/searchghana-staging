#!/usr/bin/env python3
"""Regenerates sitemap.xml from real data -- the static pages plus one <url>
per real, active business (previously only static pages were listed, which
meant no business profile ever showed up in search engine indexing).

Run this again whenever you want the sitemap refreshed with newly-added
businesses (and, once the Content & Marketing migration lands, published
blog posts too -- see the TODO near the bottom).
"""
import urllib.request
import json
import datetime

SUPABASE_URL = 'https://goohnjcxbupbgpivqmok.supabase.co'
SUPABASE_KEY = 'sb_publishable_vPhlqLBI8bPLqHKk7xX3KQ_q0eHq23H'
SITE_ORIGIN = 'https://www.searchghana.com'

STATIC_PAGES = [
    ('/', '1.0', 'daily'),
    ('/Browse.html', '0.9', 'daily'),
    ('/Deals.html', '0.7', 'daily'),
    ('/Reviews.html', '0.7', 'weekly'),
    ('/AddBusiness.html', '0.7', 'monthly'),
    ('/Blog.html', '0.6', 'weekly'),
    ('/HelpCenter.html', '0.6', 'monthly'),
    ('/AboutUs.html', '0.5', 'monthly'),
    ('/Contact.html', '0.5', 'monthly'),
    ('/PrivacyPolicy.html', '0.3', 'yearly'),
    ('/TermsOfService.html', '0.3', 'yearly'),
]


def fetch_json(path):
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/{path}',
        headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode('utf-8'))


def iso_date(ts):
    if not ts:
        return datetime.date.today().isoformat()
    return ts[:10]


def url_entry(loc, lastmod, changefreq, priority):
    return (
        '  <url>\n'
        f'    <loc>{loc}</loc>\n'
        f'    <lastmod>{lastmod}</lastmod>\n'
        f'    <changefreq>{changefreq}</changefreq>\n'
        f'    <priority>{priority}</priority>\n'
        '  </url>'
    )


def main():
    today = datetime.date.today().isoformat()
    entries = [url_entry(SITE_ORIGIN + path, today, freq, pri) for path, pri, freq in STATIC_PAGES]

    businesses = fetch_json('businesses?select=id,created_at&status=eq.active&order=created_at.asc')
    for biz in businesses:
        lastmod = iso_date(biz.get('created_at'))
        loc = f'{SITE_ORIGIN}/Businesses.html?id={biz["id"]}'
        entries.append(url_entry(loc, lastmod, 'weekly', '0.6'))

    # TODO once migration_6 (blog_posts/deals) is live: also fetch
    # blog_posts where status=eq.published and add one <url> per
    # /BlogPost.html?slug=<slug>, priority 0.5, changefreq monthly.

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + '\n'.join(entries) + '\n'
        '</urlset>\n'
    )
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(xml)
    print(f'Wrote sitemap.xml with {len(STATIC_PAGES)} static pages + {len(businesses)} active business pages.')


if __name__ == '__main__':
    main()
