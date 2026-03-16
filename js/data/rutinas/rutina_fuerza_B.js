/* =========================================
   data/rutina_fuerza_B.js - DATOS
   ========================================= */

// Convenciones:
// - type: strength
// - ejercicios: usa ids de EXERCISES (js/data/ejercicios.js)

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.push({
  id: "fuerza_b",
  name: "Fuerza B (50-60 min)",
  type: "fuerza",
  activityKey: "fuerza_1h",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  goal: "Empuje y tracción de tren superior con accesorios.",
  structure: "Calentamiento 8-10 min + Bloque principal + Accesorios + Core + Vuelta a la calma",
  timings: { secPerRep: 4, restSec: 90 },
  exercises: [
    { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
    { exerciseId: "press_inclinado", sets: 4, reps: "6-10", weightKg: 30, restSec: 120, secPerRep: 4 },
    { exerciseId: "remo_mancuernas", sets: 3, reps: "8-12", weightKg: 20, restSec: 90, secPerRep: 4 },
    { exerciseId: "press_militar", sets: 3, reps: "8-10", weightKg: 20, restSec: 90, secPerRep: 4 },
    { exerciseId: "elevaciones_laterales", sets: 3, reps: "12-15", weightKg: 8, restSec: 60, secPerRep: 3 },
    { exerciseId: "curl_biceps", sets: 3, reps: "10-12", weightKg: 10, restSec: 60, secPerRep: 3 },
    { exerciseId: "extension_triceps", sets: 3, reps: "10-12", weightKg: 15, restSec: 60, secPerRep: 3 },
    { exerciseId: "plancha_lateral", sets: 1, reps: 1, secPerRep: 240 },
    { exerciseId: "russian_twist", sets: 3, reps: "16-24", weightKg: 5, restSec: 45, secPerRep: 2 },
    { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 240 }
  ]
});




