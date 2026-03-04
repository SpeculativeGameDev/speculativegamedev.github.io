/* ============================================
   CONFIGURATION
   ============================================ */
const SITE_CONFIG = {
  // Logseq [[links]] point to GitHub blob view of the source repo
  logseqGithubBlobBase: 'https://github.com/SpeculativeGameDev/CG/blob/main/Documents/logseq/',
  // human-friendly site name used in <title> constructions
  siteTitle: 'Recachita Games',
};

/* ============================================
   SIDE PANEL / BURGER MENU
   ============================================ */
const burgerBtn  = document.getElementById('burger-btn');
const sidePanel  = document.getElementById('side-panel');
const overlay    = document.getElementById('panel-overlay');
const panelClose = document.getElementById('panel-close');

function openPanel() {
  sidePanel.classList.add('open');
  overlay.classList.add('open');
  burgerBtn.classList.add('open');
  burgerBtn.setAttribute('aria-expanded', 'true');
}

function closePanel() {
  sidePanel.classList.remove('open');
  overlay.classList.remove('open');
  burgerBtn.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded', 'false');
}

burgerBtn.addEventListener('click', () =>
  sidePanel.classList.contains('open') ? closePanel() : openPanel()
);
overlay.addEventListener('click', closePanel);
panelClose.addEventListener('click', closePanel);
document.querySelectorAll('.panel-nav a').forEach(a => a.addEventListener('click', closePanel));

(function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.panel-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href !== 'index.html' && path.includes(href.replace('.html', ''))) {
      a.classList.add('active');
    }
  });
})();

/* ============================================
   SLUGIFY
   ============================================ */
function slugify(text) {
  const map = { a:'áàäâãå', e:'éèëê', i:'íìïî', o:'óòöôõø', u:'úùüû', n:'ñ', c:'ç' };
  let s = text.trim().toLowerCase();
  for (const [base, chars] of Object.entries(map)) {
    s = s.replace(new RegExp('[' + chars + ']', 'g'), base);
  }
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
}

/* ============================================
   TABLE OF CONTENTS
   ============================================ */
function buildTOC(contentEl, tocEl) {
  if (!tocEl || !contentEl) return;
  const headings = contentEl.querySelectorAll('h2, h3, h4');
  const tocSection = document.getElementById('toc-section');

  if (headings.length === 0) {
    if (tocSection) tocSection.style.display = 'none';
    return;
  }
  if (tocSection) tocSection.style.display = '';

  const seen = {};
  const frag = document.createDocumentFragment();

  headings.forEach((h, i) => {
    if (!h.id) {
      let slug = slugify(h.textContent);
      if (seen[slug]) slug += '-' + i;
      seen[slug] = true;
      h.id = slug;
    }
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.className = 'toc-' + h.tagName.toLowerCase();
    a.addEventListener('click', closePanel);
    frag.appendChild(a);
  });

  tocEl.appendChild(frag);
}

/* ============================================
   FRONTMATTER PARSER
   Handles YAML --- blocks with robust regex
   ============================================ */
function parseFrontmatter(text) {
  const meta = {};
  let body = text;

  const match = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n([\s\S]*)$/);
  if (match) {
    match[1].split(/\r?\n/).forEach(line => {
      const colon = line.indexOf(':');
      if (colon < 1) return;
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key) meta[key] = val;
    });
    body = match[2];
  }

  return { meta, body };
}

function inferSection(src) {
  const parts = src.replace(/\?.*$/, '').split('/');
  if (parts.length >= 2) {
    const s = parts[parts.length - 2];
    if (['logseq', 'documents', 'content', 'main'].includes(s.toLowerCase())) return 'Journal';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return '';
}

/* ============================================
   LOGSEQ PREPROCESSOR
   ============================================ */
function preprocessLogseq(text, githubBlobBase) {
  const logseqMeta = {};

  // 1. Page properties: key:: value  (Logseq style, at start of line)
  text = text.replace(/^([\w][\w\s-]*):: (.+)$/gm, (_, key, val) => {
    logseqMeta[key.trim().toLowerCase()] = val.trim();
    return '';
  });

  // 2. {{embed [[PageName]]}} -> notice block with link
  text = text.replace(/\{\{embed \[\[([^\]]+)\]\]\}\}/gi, (_, page) => {
    const url = githubBlobBase + encodeURIComponent(page) + '.md';
    return `<div class="logseq-embed-notice">embed: <a href="${url}" target="_blank" rel="noopener">${page}</a></div>`;
  });

  // 3. {{query ...}} -> notice
  text = text.replace(/\{\{query[\s\S]*?\}\}/gi,
    '<div class="logseq-embed-notice"><em>Logseq query — not rendered in web view</em></div>'
  );

  // 4. [[PageName]] -> markdown link to GitHub blob
  text = text.replace(/\[\[([^\]]+)\]\]/g, (_, page) => {
    const url = githubBlobBase + encodeURIComponent(page) + '.md';
    return `[${page}](${url})`;
  });

  // 5. Inline #tags (not at line start — those are headings)
  text = text.replace(/(^|\s)(#[a-zA-ZÀ-ÿ][\w-]*)/gm, (_, pre, tag) => {
    return pre + `<span class="tag">${tag}</span>`;
  });

  // 6. Org-mode quote blocks
  text = text.replace(/#\+BEGIN_QUOTE\r?\n([\s\S]*?)#\+END_QUOTE/gi, (_, inner) =>
    inner.trim().split(/\r?\n/).map(l => '> ' + l).join('\n')
  );

  // 7. TODO / DONE markers in lists
  text = text.replace(/^(\s*)- TODO /gm, '$1- <span class="todo">TODO</span> ');
  text = text.replace(/^(\s*)- DONE /gm, '$1- <span class="todo done">DONE</span> ');

  // 8. Block refs ((uuid)) -> strip
  text = text.replace(/\(\([a-f0-9-]{36}\)\)/g, '');

  // Clean up blank lines left by removed properties
  text = text.replace(/\n{3,}/g, '\n\n').trimStart();

  return { text, logseqMeta };
}

/* ============================================
   MARKDOWN LOADER
   ============================================ */
function isLogseqSource(src) {
  return src.includes('raw.githubusercontent.com') ||
         src.includes('/logseq/') ||
         src.includes('/Documents/');
}

async function loadMarkdown() {
  const el = document.getElementById('md-content');
  if (!el) return;
  const src = el.dataset.md;
  if (!src) return;

  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + src);
    const raw = await res.text();

    if (typeof marked === 'undefined') {
      el.innerHTML = '<p style="color:#ff6b6b">Error: marked.js not loaded.</p>';
      return;
    }

    let { meta, body } = parseFrontmatter(raw);

    let logseqMeta = {};
    if (isLogseqSource(src)) {
      const result = preprocessLogseq(body, SITE_CONFIG.logseqGithubBlobBase);
      body = result.text;
      logseqMeta = result.logseqMeta;
    }

    // Resolve final metadata values
    const section = meta.section || logseqMeta.section || inferSection(src);
    const date    = meta.date    || logseqMeta.date    || logseqMeta.created || '';
    const title   = meta.title   || logseqMeta.title   || null;

    // Write metadata to DOM immediately (synchronous, before any await)
    const sectionEl = document.getElementById('post-section');
    const dateEl    = document.getElementById('post-date');
    if (sectionEl) sectionEl.textContent = section;
    if (dateEl)    dateEl.textContent    = date;

    // Protect <textarea> blocks from marked
    const textareas = [];
    const safeBody = body.replace(
      /<textarea([^>]*)>([\s\S]*?)<\/textarea>/gi,
      (_, attrs, content) => {
        const idx = textareas.length;
        textareas.push(content);
        return `<textarea${attrs} data-ph="${idx}"></textarea>`;
      }
    );

    // marked v9+ API: use marked.use() not marked.setOptions()
    marked.use({ gfm: true, breaks: false });
    el.innerHTML = marked.parse(safeBody);

    // Restore textarea contents
    el.querySelectorAll('textarea[data-ph]').forEach(ta => {
      const idx = parseInt(ta.dataset.ph, 10);
      ta.value = textareas[idx].replace(/^\n/, '');
      ta.removeAttribute('data-ph');
    });

    // Set page title
    const titleEl = document.querySelector('.post-title');
    const suffix = SITE_CONFIG.siteTitle ? ' \u2014 ' + SITE_CONFIG.siteTitle : '';
    if (title) {
      if (titleEl) titleEl.textContent = title;
      document.title = title + suffix;
    } else {
      const h1 = el.querySelector('h1');
      if (h1) {
        if (titleEl) titleEl.textContent = h1.textContent;
        document.title = h1.textContent + suffix;
        h1.remove();
      }
    }

    buildTOC(el, document.getElementById('toc'));
    initWorkbenches();

  } catch (e) {
    console.error('[site] loadMarkdown:', e);
    el.innerHTML = `<p style="color:#ff6b6b">Failed to load: ${e.message}</p>`;
  }
}

/* ============================================
   PYODIDE WORKBENCHES
   ============================================ */
let pyodide = null;
let pyodideLoading = false;
let pyodideCallbacks = [];

async function getPyodide() {
  if (pyodide) return pyodide;
  return new Promise((resolve, reject) => {
    pyodideCallbacks.push({ resolve, reject });
    if (pyodideLoading) return;
    pyodideLoading = true;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    script.onload = async () => {
      try {
        pyodide = await loadPyodide();
        pyodideCallbacks.forEach(cb => cb.resolve(pyodide));
      } catch (e) {
        pyodideCallbacks.forEach(cb => cb.reject(e));
      }
      pyodideCallbacks = [];
    };
    script.onerror = () => {
      pyodideCallbacks.forEach(cb => cb.reject(new Error('Failed to load Pyodide')));
      pyodideCallbacks = [];
    };
    document.head.appendChild(script);
  });
}

/* ============================================
   CODEMIRROR LAZY LOADER
   ============================================ */
let codeMirrorLoading = false;
let codeMirrorCallbacks = [];

async function loadCodeMirror() {
  if (window.CodeMirror) return window.CodeMirror;
  return new Promise((resolve, reject) => {
    codeMirrorCallbacks.push({ resolve, reject });
    if (codeMirrorLoading) return;
    codeMirrorLoading = true;

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css';
    cssLink.crossOrigin = 'anonymous';
    document.head.appendChild(cssLink);

    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/dracula.min.css';
    themeLink.crossOrigin = 'anonymous';
    document.head.appendChild(themeLink);

    // Load core
    const coreScript = document.createElement('script');
    coreScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js';
    coreScript.crossOrigin = 'anonymous';
    coreScript.onload = () => {
      // Load Python mode
      const pythonScript = document.createElement('script');
      pythonScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/python/python.min.js';
      pythonScript.crossOrigin = 'anonymous';
      pythonScript.onload = () => {
        codeMirrorCallbacks.forEach(cb => cb.resolve(window.CodeMirror));
        codeMirrorCallbacks = [];
      };
      pythonScript.onerror = () => {
        codeMirrorCallbacks.forEach(cb => cb.reject(new Error('Failed to load CodeMirror Python mode')));
        codeMirrorCallbacks = [];
      };
      document.head.appendChild(pythonScript);
    };
    coreScript.onerror = () => {
      codeMirrorCallbacks.forEach(cb => cb.reject(new Error('Failed to load CodeMirror')));
      codeMirrorCallbacks = [];
    };
    document.head.appendChild(coreScript);
  });
}

/* ============================================
   CODEMIRROR WORKBENCHES
   ============================================ */
async function initWorkbenches() {
  const workbenches = document.querySelectorAll('.workbench');
  if (workbenches.length === 0) return; // No workbenches on this page

  // Load CodeMirror only if there are workbenches
  const CodeMirror = await loadCodeMirror();

  workbenches.forEach(wb => {
    if (wb.dataset.initialized) return;
    wb.dataset.initialized = 'true';

    const btn    = wb.querySelector('.workbench-run');
    const code   = wb.querySelector('.workbench-code');
    const output = wb.querySelector('.workbench-output');
    if (!btn || !code || !output) return;

    // Save the original textarea content
    const initialCode = code.value || '';

    // Create a container for CodeMirror and replace the textarea
    const cmContainer = document.createElement('div');
    cmContainer.className = 'workbench-editor';
    code.parentNode.replaceChild(cmContainer, code);

    // Initialize CodeMirror with Tab support for indentation
    const editor = CodeMirror(cmContainer, {
      value: initialCode,
      mode: 'python',
      theme: 'dracula',
      lineNumbers: true,
      indentUnit: 4,
      indentWithTabs: false,
      tabSize: 4,
      lineWrapping: true,
      extraKeys: {
        'Tab': (cm) => {
          if (cm.somethingSelected()) {
            cm.indentSelection('add');
          } else {
            cm.replaceSelection('    '); // 4 spaces for Python indent
          }
        },
        'Shift-Tab': (cm) => {
          cm.indentSelection('subtract');
        }
      }
    });

    // Auto-resize the editor based on content
    function resizeEditor() {
      const lines = editor.lineCount();
      const height = Math.max(100, lines * 19.19 + 10); // 24px per line + padding
      cmContainer.style.height = height + 'px';
      editor.refresh();
    }

    editor.on('change', resizeEditor);
    resizeEditor(); // Initial resize

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Loading\u2026';
      output.className = 'workbench-output';
      output.textContent = 'Initializing Python runtime\u2026';

      try {
        const py = await getPyodide();
        btn.textContent = 'Running\u2026';
        py.runPython('import sys, io\n_cap = io.StringIO()\nsys.stdout = _cap');
        try {
          py.runPython(editor.getValue());
          const out = py.runPython('_cap.getvalue()');
          output.textContent = out || '(no output)';
          output.className = 'workbench-output has-output';
        } catch (err) {
          output.textContent = err.message;
          output.className = 'workbench-output error';
        } finally {
          py.runPython('sys.stdout = sys.__stdout__');
        }
      } catch (e) {
        output.textContent = 'Error: ' + e.message;
        output.className = 'workbench-output error';
      }

      btn.textContent = 'Run';
      btn.disabled = false;
    });
  });
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadMarkdown();

  // Static pages (about.html etc.) have id="static-content" instead of data-md
  const staticContent = document.getElementById('static-content');
  if (staticContent) {
    buildTOC(staticContent, document.getElementById('toc'));
    initWorkbenches();
  }
});