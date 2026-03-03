# Python Workbench — Demo

Un ejemplo de workbench interactivo con Pyodide. El código Python corre directamente en el browser, sin servidor.

## Cómo funciona

Pyodide compila CPython a WebAssembly. La primera ejecución tarda unos segundos mientras carga el runtime (~10MB). Las siguientes son instantáneas.

## Ejemplo básico

Edita el código y dale a **Run**:

<div class="workbench">
  <div class="workbench-header">
    <span class="workbench-label">Python 3 — Pyodide</span>
    <button class="workbench-run">Run</button>
  </div>
  <textarea class="workbench-code">
# Fibonacci sequence
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=' ')
        a, b = b, a + b

fib(15)
  </textarea>
  <div class="workbench-output">Output will appear here…</div>
</div>

## Ejemplo con listas y dicts

<div class="workbench">
  <div class="workbench-header">
    <span class="workbench-label">Python 3 — Pyodide</span>
    <button class="workbench-run">Run</button>
  </div>
  <textarea class="workbench-code">
data = {'name': 'Illán', 'age': 3, 'skills': ['curiosity', 'chaos', 'joy']}

for k, v in data.items():
    print(f'{k}: {v}')

print('\nSkills:')
for s in data['skills']:
    print(f'  - {s}')
  </textarea>
  <div class="workbench-output">Output will appear here…</div>
</div>

## Notas

- `import numpy`, `import pandas` etc. funcionan — Pyodide incluye los paquetes científicos principales.
- El stdout se captura y se muestra en el output. Los errores aparecen en rojo.
- No hay acceso al filesystem del host. Para I/O usa strings o la API de Pyodide.

## Embeds de vídeo

Para embeds de YouTube u otros, usa el div `.video-embed`:

<div class="video-embed">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>
</div>
