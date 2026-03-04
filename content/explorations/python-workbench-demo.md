---
title: Python Workbench — Demo
date: 2025-03-03
section: Explorations
---

Un ejemplo de workbench interactivo con Pyodide. El código Python corre directamente en el browser, sin servidor.

## Cómo funciona

Pyodide compila CPython a WebAssembly. La primera ejecución tarda unos segundos mientras carga el runtime (~10MB). Las siguientes son instantáneas.

## Ejemplo básico

Edita el código y dale a **Run** (el botón ahora permanece visible en la esquina superior derecha del bloque de código, incluso al hacer scroll):

<div class="workbench">
  <div class="workbench-header">
    <span class="workbench-label">Python 3 — Pyodide</span>
    <button class="workbench-run">Run</button>
  </div>
  <textarea class="workbench-code">
def generar_piramide_genero(datos, poblacion_total, ancho_maximo=25):
    """
    Genera una pirámide poblacional ASCII con datos segregados por género.
    
    :param datos: Diccionario { "Rango": {"H": %_hombres, "M": %_mujeres} }
    :param poblacion_total: Entero
    :param ancho_maximo: Ancho de la barra para el porcentaje más alto
    """
    print(f"\n{'='*20} ANÁLISIS DEMOGRÁFICO {'='*20}")
    print(f"Población Total: {poblacion_total:,} habitantes\n")

    # Cabecera de la pirámide
    header = f"{'HOMBRES (%)':>{ancho_maximo}}   {'EDAD':^7}   {'MUJERES (%)':<{ancho_maximo}}"
    print(header)
    print("-" * len(header))

    # Encontrar el porcentaje máximo para escalar las barras visualmente
    max_p = max(max(v.values()) for v in datos.values())
    
    # Almacén para el desglose final
    desglose = []

    # Iterar sobre los rangos (usualmente de mayor a menor en pirámides)
    for rango, sexos in datos.items():
        ph = sexos["H"]
        pm = sexos["M"]
        
        # Cálculo de habitantes por género
        hab_h = int(poblacion_total * (ph / 100))
        hab_m = int(poblacion_total * (pm / 100))
        desglose.append((rango, hab_h, hab_m))

        # Cálculo de barras ASCII
        bar_h = "#" * int((ph / max_p) * ancho_maximo)
        bar_m = "#" * int((pm / max_p) * ancho_maximo)

        # Print de la línea de la pirámide
        # Formato: [Barra H] %H | Rango | %M [Barra M]
        linea_h = f"{bar_h} {ph:>4.1f}%"
        linea_m = f"{pm:<4.1f}% {bar_m}"
        print(f"{linea_h:>{ancho_maximo+6}} | {rango:^7} | {linea_m}")

    print("-" * len(header))
    
    # --- TABLA DE DESGLOSE DE PERSONAS ---
    print(f"\n{'*'*10} DESGLOSE POR NÚMERO DE PERSONAS {'*'*10}\n")
    tabla_header = f"{'RANGO':<10} | {'HOMBRES':>15} | {'MUJERES':>15} | {'TOTAL':>15}"
    print(tabla_header)
    print("-" * len(tabla_header))
    
    for rango, hh, hm in desglose:
        total_rango = hh + hm
        print(f"{rango:<10} | {hh:>15,} | {hm:>15,} | {total_rango:>15,}")

# --- Configuración de datos de ejemplo ---
# Los porcentajes suelen ser sobre el total de la población
poblacion_ejemplo = 47000000 
distribucion_genero = {
    "80+":   {"H": 1.2, "M": 2.1},
    "70-79": {"H": 3.5, "M": 4.2},
    "60-69": {"H": 5.8, "M": 6.1},
    "50-59": {"H": 7.5, "M": 7.6},
    "40-49": {"H": 8.2, "M": 8.1},
    "30-39": {"H": 7.1, "M": 6.9},
    "20-29": {"H": 5.5, "M": 5.3},
    "10-19": {"H": 4.8, "M": 4.6},
    "0-9":   {"H": 4.5, "M": 4.3}
}

generar_piramide_genero(distribucion_genero, poblacion_ejemplo)
  </textarea>
  <div class="workbench-output">Output will appear here…</div>
</div>

## Notas

- `import numpy`, `import pandas` etc. funcionan — Pyodide incluye los paquetes científicos principales.
- El stdout se captura y se muestra en el output. Los errores aparecen en rojo.
- No hay acceso al filesystem del host.
