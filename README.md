# SpeculativeGameDev

Static site. No build step. Works directly from the filesystem or GitHub Pages.

## Structure

```
index.html          — Homepage with post listings
post.html           — Universal post template (reads ?md= query param)
about.html          — About page (static HTML)
journal.html        — Section index
games.html          — Section index
explorations.html   — Section index
style.css           — Design system
main.js             — Burger menu, TOC, markdown loader, Pyodide workbenches

content/
  journal/          — .md files
  games/            — .md files
  explorations/     — .md files
```

## Adding a post

1. Create `content/journal/my-post.md`
2. Add a link in `journal.html` (and optionally `index.html`):

```html
<li>
  <a href="post.html?md=content/journal/my-post.md">My post title</a>
  <span class="post-date">2025-03</span>
</li>
```

The first `# H1` in the markdown becomes the page title. Everything else renders as body.

## Workbenches (Python / Pyodide)

Los workbenches incluyen un botón **Run** que ahora se queda siempre a la vista
al desplazarse por bloques largos de código. En móviles se añade un pequeño
espacio bajo el botón para que el primer renglón no quede pegado al mismo.


Inside any `.md` file, drop raw HTML:

```html
<div class="workbench">
  <div class="workbench-header">
    <span class="workbench-label">Python 3</span>
    <button class="workbench-run">Run</button>
  </div>
  <textarea class="workbench-code">
print("hello")
  </textarea>
  <div class="workbench-output">Output…</div>
</div>
```

Pyodide loads lazily on first Run click (~10MB, CDN-cached after first load).

## Video embeds

```html
<div class="video-embed">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>
</div>
```

## GitHub Pages

Push to `main` branch. Enable GitHub Pages in repo Settings → Pages → Source: Deploy from branch → `main` → `/ (root)`.

**Important**: `fetch()` requires a server (CORS). GitHub Pages serves over HTTPS so markdown loading works fine there. It does NOT work from `file://` locally — use a local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```