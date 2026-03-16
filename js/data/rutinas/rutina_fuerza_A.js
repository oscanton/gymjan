/* =========================================
   data/rutina_fuerza_A.js - DATOS
   ========================================= */

// Convenciones:
// - type: strength
// - ejercicios: usa ids de EXERCISES (js/data/ejercicios.js)

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.push({
  id: "fuerza_a",
  name: "Fuerza A (50-60 min)",
  type: "fuerza",
  activityKey: "fuerza_1h",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  goal: "Recorrido completo con enfasis en basicos.",
  structure: "Calentamiento 8-10 min + Bloque principal + Core 6-8 min + Vuelta a la calma 3-5 min",
  timings: { secPerRep: 4, restSec: 90 },
  exercises: [
    { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
    { exerciseId: "sentadilla", sets: 4, reps: "6-10", weightKg: 40, restSec: 120, secPerRep: 5 },
    { exerciseId: "press_banca", sets: 4, reps: "6-10", weightKg: 30, restSec: 120, secPerRep: 4 },
    { exerciseId: "remo_barra", sets: 4, reps: "8-12", weightKg: 30, restSec: 90, secPerRep: 4 },
    { exerciseId: "press_militar", sets: 3, reps: "8-10", weightKg: 20, restSec: 90, secPerRep: 4 },
    { exerciseId: "peso_muerto_rumano", sets: 3, reps: "8-12", weightKg: 40, restSec: 120, secPerRep: 4 },
    { exerciseId: "elevacion_gemelos", sets: 3, reps: "12-15", weightKg: 30, restSec: 60, secPerRep: 3 },
    { exerciseId: "plancha", sets: 1, reps: 1, secPerRep: 180 },
    { exerciseId: "crunch", sets: 3, reps: "12-20", restSec: 45, secPerRep: 2 },
    { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 240 }
  ]
});




