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
    <span class="workbench-label">Python 3 workbench</span>
    <button class="workbench-run">Run</button>
  </div>
  <textarea class="workbench-code">
import random

class Individual:
    def __init__(self, age, sex):
        self.age = age
        self.sex = sex  # 0: Mujer, 1: Hombre
        self.is_alive = True

    def grow(self, years):
        self.age += years
        # Probabilidad de muerte: crece exponencialmente con la edad
        death_chance = (self.age / 105) ** 4  
        if random.random() < death_chance or self.age > 110:
            self.is_alive = False

class PopulationSim:
    def __init__(self, initial_pop, distribution, start_year=2024):
        self.population = []
        self.current_year = start_year
        self.start_year = start_year
        
        for rango, porcentajes in distribution.items():
            low, high = self._parse_range(rango)
            count = int(initial_pop * (sum(porcentajes.values()) / 100))
            for _ in range(count):
                # Usamos los porcentajes de la distribución para el sexo inicial
                prob_h = porcentajes['H'] / (porcentajes['H'] + porcentajes['M'])
                sex = 1 if random.random() < prob_h else 0
                self.population.append(Individual(random.uniform(low, high), sex))

    def _parse_range(self, rango):
        if '+' in rango: return 80, 100
        parts = rango.split('-')
        return int(parts[0]), int(parts[1])

    def run_step(self, years_step=10, birth_rate=2.1):
        for person in self.population:
            person.grow(years_step)
        
        self.population = [p for p in self.population if p.is_alive]

        # Solo las mujeres entre 15 y 45 años tienen hijos
        mujeres_fertiles = len([p for p in self.population if p.sex == 0 and 15 <= p.age <= 45])
        nacimientos = int(mujeres_fertiles * birth_rate)
        
        for _ in range(nacimientos):
            # Los bebés nacen con edad 0 y sexo aleatorio 50/50
            self.population.append(Individual(0, random.randint(0, 1)))
        
        self.current_year += years_step

    def get_stats(self):
        if not self.population:
            return None
        ages = [p.age for p in self.population]
        avg_age = sum(ages) / len(ages)
        mujeres = len([p for p in self.population if p.sex == 0])
        hombres = len(self.population) - mujeres
        ancianos = len([p for p in self.population if p.age >= 65])
        return {
            "media": avg_age,
            "pct_mujeres": (mujeres / len(self.population)) * 100,
            "pct_ancianos": (ancianos / len(self.population)) * 100,
            "total": len(self.population)
        }

    def print_pyramid(self, label=""):
        ranges = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"]
        data = {r: {"H": 0, "M": 0} for r in ranges}
        
        for p in self.population:
            if p.age >= 80: r = "80+"
            else: r = f"{int(p.age//10)*10}-{int(p.age//10)*10+9}"
            if r in data:
                if p.sex == 1: data[r]["H"] += 1
                else: data[r]["M"] += 1

        total = len(self.population)
        print(f"\n--- {label} | AÑO: {self.current_year} (Total: {total:,}) ---")
        
        max_v = max([max(v.values()) for v in data.values()]) if total > 0 else 1
        
        for r in reversed(ranges):
            h_count = data[r]["H"]
            m_count = data[r]["M"]
            h_bar = "█" * int(h_count / max_v * 20)
            m_bar = "█" * int(m_count / max_v * 20)
            print(f"{h_bar:>20} {h_count:5} | {r:^7} | {m_count:<5} {m_bar}")

# --- CONFIGURACIÓN ---
dist_inicial = {
    "0-19":  {"H": 10.0, "M": 9.5},
    "20-39": {"H": 15.0, "M": 14.5},
    "40-59": {"H": 12.0, "M": 12.0},
    "60-79": {"H": 8.0,  "M": 9.0},
    "80+":   {"H": 4.0,  "M": 6.0}
}

async def main():
    # Parámetros de tiempo
    YEAR_START = 1000
    YEAR_END = 2030
    STEP_YEARS = 10  # Saltos de tiempo en cada iteración
    
    # Parámetros demográficos
    POP_SIZE = 1000
    TASA_HIJOS = 2.1 # Tasa de reemplazo (prueba con 1.5 para ver el colapso)

    sim = PopulationSim(POP_SIZE, dist_inicial, start_year=YEAR_START)
    sim.print_pyramid("INICIO")

    # Bucle basado en el tiempo
    step_count = 1
    while sim.current_year < YEAR_END:
        sim.run_step(years_step=STEP_YEARS, birth_rate=TASA_HIJOS)
        sim.print_pyramid(f"PASO {step_count}")
        step_count += 1

        await asyncio.sleep(0)

        if len(sim.population) == 0:
            print("\n¡La población se ha extinguido!")
            break

    # --- ESTADÍSTICAS FINALES ---
    stats = sim.get_stats()
    print("\n" + "="*40)
    print(f" RESUMEN FINAL (Periodo {YEAR_START} - {sim.current_year})")
    print("="*40)
    if stats:
        print(f"Población final:    {stats['total']:,} habitantes")
        print(f"Edad media:         {stats['media']:.1f} años")
        print(f"Porcentaje mujeres: {stats['pct_mujeres']:.1f}%")
        print(f"Tasa de ancianos:   {stats['pct_ancianos']:.1f}% (mayores de 65)")
        
        if stats['media'] > 45:
            print("Estado: Sociedad envejecida (Carga alta para el sistema)")
        elif stats['media'] < 25:
            print("Estado: Sociedad muy joven (Expansión rápida)")
        else:
            print("Estado: Sociedad equilibrada")
    else:
        print("No queda nadie para contar la historia.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
  </textarea>
  <div class="workbench-output">Output will appear here…</div>
</div>