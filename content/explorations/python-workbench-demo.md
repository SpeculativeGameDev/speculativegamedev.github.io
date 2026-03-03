---
title: Python Workbench — Demo
date: 2025-03
section: Explorations
---

---
title: Python Workbench — Demo
date: 2025-03
section: Explorations
---

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

## Notas

- `import numpy`, `import pandas` etc. funcionan — Pyodide incluye los paquetes científicos principales.
- El stdout se captura y se muestra en el output. Los errores aparecen en rojo.
- No hay acceso al filesystem del host.
