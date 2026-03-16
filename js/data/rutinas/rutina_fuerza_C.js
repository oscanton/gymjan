/* =========================================
   data/rutina_fuerza_C.js - DATOS
   ========================================= */

// Convenciones:
// - type: strength
// - ejercicios: usa ids de EXERCISES (js/data/ejercicios.js)

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.push({
  id: "fuerza_c",
  name: "Fuerza C (50-60 min)",
  type: "fuerza",
  activityKey: "fuerza_1h",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  goal: "Tren inferior + full body con énfasis en bisagra.",
  structure: "Calentamiento 8-10 min + Bloque principal + Accesorios + Core + Vuelta a la calma",
  timings: { secPerRep: 4, restSec: 90 },
  exercises: [
    { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
    { exerciseId: "sentadilla_goblet", sets: 4, reps: "8-12", weightKg: 20, restSec: 90, secPerRep: 4 },
    { exerciseId: "peso_muerto", sets: 4, reps: "6-8", weightKg: 50, restSec: 150, secPerRep: 5 },
    { exerciseId: "zancadas", sets: 3, reps: "10-12", weightKg: 12, restSec: 90, secPerRep: 4 },
    { exerciseId: "hip_thrust", sets: 3, reps: "8-12", weightKg: 40, restSec: 120, secPerRep: 4 },
    { exerciseId: "prensa_piernas", sets: 3, reps: "10-12", weightKg: 80, restSec: 120, secPerRep: 4 },
    { exerciseId: "elevacion_gemelos", sets: 3, reps: "12-15", weightKg: 30, restSec: 60, secPerRep: 3 },
    { exerciseId: "plancha", sets: 1, reps: 1, secPerRep: 180 },
    { exerciseId: "elevaciones_piernas", sets: 3, reps: "10-15", weightKg: 0, restSec: 45, secPerRep: 2 },
    { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 240 }
  ]
});



