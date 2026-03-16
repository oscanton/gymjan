/* =========================================
   data/rutina_descanso.js - DATOS
   ========================================= */

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.push({
  id: "descanso",
  name: "Descanso",
  type: "recuperacion",
  activityKey: "descanso",
  macroRatios: { p: 0.30, c: 0.20, f: 0.50 },
  goal: "Descanso completo sin actividad programada.",
  structure: "Sin entrenamiento ni ejercicio.",
  timings: { secPerRep: 4, restSec: 90 },
  exercises: []
});



