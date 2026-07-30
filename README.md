# Photography Portfolio — "35mm"

A high-contrast, film-canister-inspired photography portfolio site: black ground, Kodak-yellow accent, sprocket holes, frame counters. Pure HTML/CSS/JS — no build step, no dependencies.

## Structure

- `index.html` — home page with hero + featured work + category browse
- `portfolio.html` — full portfolio with category filters (Portraits, Landscapes, Street, Travel)
- `about.html` — bio / about + contact
- `assets/css/style.css` — all styling
- `assets/js/main.js` — mobile nav, category filter, lightbox

## Adding your real photos

Every photo slot right now is a placeholder tile (a gray diagonal pattern with a camera icon and a filename label like `portraits-01.jpg`). To swap one in:

1. Drop your image file into `assets/img/` (create category subfolders if you like, e.g. `assets/img/portraits/`).
2. Find the matching placeholder `<div class="ph-tile" data-label="...">...</div>` in the HTML and replace it with:
   ```html
   <img src="assets/img/portraits/your-photo.jpg" alt="Description of the photo">
   ```
3. Repeat for as many photos as you have — you don't need to keep the placeholder count, add or remove `.portfolio-item` / `.grid-item` blocks freely.

## Customizing

- **Site name**: currently "35mm" — replace it in the `.brand` link in the `<header>` of each page, and in `.footer-brand`.
- **Colors**: black `#000000`, off-white `#f5f3ec`, Kodak yellow `#ffc72c` — defined as CSS custom properties at the top of `assets/css/style.css` (`--black`, `--paper`, `--yellow`).
- **Categories**: currently Portraits / Landscapes / Street / Travel. Update the filter buttons in `portfolio.html` and the `data-category` attribute on each `.portfolio-item` to match your own categories.
- **Bio**: edit the text in `about.html`.
- **Contact email / social links**: replace `hello@example.com` and the Instagram/500px links in the footer and about page.

## Viewing locally

Just open `index.html` in a browser, or run a local server from this folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
