# Putting SearchGhana on GitHub Pages (staging)

This is a staging copy: every page carries a "noindex" tag so Google won't list it.

## 1. Create the repo (once)
1. github.com -> New repository. Name it e.g. `searchghana-staging`. Set it to **Public**
   (free accounts only get Pages from public repos). Don't add a README.
2. Click "uploading an existing file" and drag in everything from this folder
   **except** the `Claude outputs` folder (UAT workbooks and SQL, not part of the site).
   `staging_noindex.py`, `generate_sitemap.py` and this file can go up or stay local.
3. Commit to `main`.

## 2. Turn on Pages
Repo -> Settings -> Pages -> "Deploy from a branch" -> Branch `main`, folder `/ (root)` -> Save.
After about a minute the site is at `https://<your-username>.github.io/<repo-name>/`.

## 3. Tell Supabase about the new address (needed for sign-in to work)
Supabase dashboard -> Authentication -> URL Configuration:
- **Site URL**: `https://<your-username>.github.io/<repo-name>/`
- **Redirect URLs**: add `https://<your-username>.github.io/<repo-name>/**`
Without this, sign-up confirmation and reset-password emails link to the wrong place.
(If you use Google sign-in, also keep its existing callback settings as they are.)

## 4. Updating the staging site later
Edit files here, then on GitHub: Add file -> Upload files -> drop the changed ones, commit.
Pages redeploys on its own. If you add pages, run `python staging_noindex.py add` first.

## 5. Before the real launch (searchghana.com)
1. `python staging_noindex.py remove`  (removes the do-not-index tags)
2. Point the domain at the host, update Supabase Site URL / Redirect URLs to the real domain.
3. Delete the staging repo, or keep it private/unpublished.
