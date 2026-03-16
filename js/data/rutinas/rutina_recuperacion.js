/* =========================================
   data/rutina_recuperacion.js - DATOS
   ========================================= */

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.unshift({
  id: "recuperacion",
  name: "Recuperación",
  type: "recuperacion",
  activityKey: "recuperacion",
  macroRatios: { p: 0.30, c: 0.25, f: 0.45 },
  goal: "Día libre o recuperación activa suave.",
  structure: "Opcional: paseo suave + movilidad ligera",
  timings: { secPerRep: 4, restSec: 90 },
  exercises: [
    { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
    { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 480 }
  ]
});



