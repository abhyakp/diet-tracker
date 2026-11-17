# Diet Tracker (PWA)

A small offline-capable web app for daily diet tracking. It has four tabs:

- **Today**: log weight, calories, protein, water, steps, exercise, sleep, habits, meals eaten as planned, and notes. It saves automatically.
- **Meal plan**: three 7-day Kerala plans (pure veg; non-veg with egg + chicken; busy workweek meal-prep with overnight oats, one-pot lunchboxes and salad dinners) plus the diet rules and meal-prep guide.
- **Progress**: weight chart with a 7-day average, weekly averages with an on-track status, 7-day averages, habit scores for the last 14 days, and blood test comparison.
- **Settings**: plan, start date, goal, targets, theme, install, backup/restore, CSV export.

It is plain HTML, CSS and JavaScript. There is no build step and no backend.

## Where the data lives

All entries are stored **in the phone's browser storage (localStorage)**, on that device only. The server only serves the static files and never receives your data.

- Use **Settings → Export backup** regularly. Restore with **Import backup** on a new phone.
- Clearing the browser's site data deletes your entries. Installing the app to the home screen makes the browser much less likely to clear it.
- Data does not sync between devices. That would need a small backend with a login.

## Free hosting on GitHub Pages

The app is fully static, so GitHub Pages can host it for free over HTTPS at `https://<username>.github.io/<repo-name>/`.

1. Create a new **public** repository on github.com (e.g. `diet-tracker`). Don't add a README.
2. From this folder, push the files:
   ```bash
   git init
   git add .
   git commit -m "Diet tracker PWA"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
   (Or use **Add file → Upload files** on the repo page and drag in everything, including the `icons/` folder and `.nojekyll`.)
3. On the repo go to **Settings → Pages → Build and deployment**, set **Source: Deploy from a branch**, **Branch: main / (root)**, then **Save**.
4. After a minute or two the site is live at `https://<username>.github.io/<repo-name>/`. Open it on your phone and use **Install app**.

Notes:
- Your diet entries are never uploaded to GitHub. They stay in each phone's browser storage, so a public repo only exposes the app code and meal plans.
- To update, push new commits. Bump `VERSION` in `sw.js` so phones pick up the new files quickly.
- `.nojekyll` stops GitHub from running the files through Jekyll. Keep it.

## Hosting on your server

**HTTPS is required.** Service workers and "Install app" only work over HTTPS (or on localhost).

1. Upload the whole folder (keep the `icons/` subfolder) to your web root or any subfolder, e.g. `https://example.com/diet/`. All paths are relative, so a subfolder works.
2. Make sure these MIME types are served:
   - `.webmanifest` → `application/manifest+json`
   - `.js` → `text/javascript`
   - `.svg` → `image/svg+xml`
3. Make sure `sw.js` is **not cached long-term** by the server or a CDN, so updates reach the phone.
4. Optional: point the server's 404 page to `404.html`.

### nginx example

```nginx
location /diet/ {
    alias /var/www/diet-tracker-pwa/;
    try_files $uri $uri/ =404;
    error_page 404 /diet/404.html;

    location = /diet/sw.js { add_header Cache-Control "no-cache"; }
    location ~* \.webmanifest$ { types { application/manifest+json webmanifest; } }
}
```

### Apache (.htaccess) example

```apache
AddType application/manifest+json .webmanifest
ErrorDocument 404 /diet/404.html
<Files "sw.js">
  Header set Cache-Control "no-cache"
</Files>
```

### Quick local test

```bash
python -m http.server 8765
```

Then open http://localhost:8765 (localhost counts as secure, so the service worker works there).

## Installing on your phone

- **Android (Chrome or Edge):** open the site, then tap **Install** in the app's banner or the browser menu → **Install app**.
- **iPhone (Safari):** tap **Share** → **Add to Home Screen**.

## Updating the app

After you change any file, edit `sw.js` and bump the version, e.g. `diet-tracker-v1` → `diet-tracker-v2`, then upload. Phones pick up the new version the next time the app is opened online. Your logged data is not affected.

To change the meal plans, edit `data.js`.

## Privacy and search engines

This is a personal health tracker, so it is deliberately kept out of search engines:

- `robots.txt` blocks all crawlers.
- Every page has `<meta name="robots" content="noindex">`.
- There is no sitemap or structured data.

Anyone with the link can still open the page. They will only see an empty tracker, because your entries stay on your phone. If you want the page itself private, add HTTP basic auth on the server.

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell |
| `styles.css` | Styles (light and dark) |
| `app.js` | App logic |
| `data.js` | Meal plans, rules, habits, blood test targets |
| `sw.js` | Service worker (offline cache) |
| `manifest.webmanifest` | Install metadata |
| `icons/` | App icons and the link-preview image |
| `robots.txt`, `404.html` | Crawler block, not-found page |

General diet guidance, not medical advice.
