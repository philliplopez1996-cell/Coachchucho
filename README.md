# Photography Portfolio

A minimal, gallery-style photography portfolio site. Pure HTML/CSS/JS — no build step, no dependencies.

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

- **Site name**: currently "Aperture" — replace it in the `.brand` link in the `<header>` of each page.
- **Categories**: currently Portraits / Landscapes / Street / Travel. Update the filter buttons in `portfolio.html` and the `data-category` attribute on each `.portfolio-item` to match your own categories.
- **Bio**: edit the text in `about.html`.
- **Contact email / social links**: replace `hello@example.com` and the Instagram/500px links in the footer and about page.

## Viewing locally

Just open `index.html` in a browser, or run a local server from this folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
