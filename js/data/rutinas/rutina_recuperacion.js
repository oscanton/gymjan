/* =========================================
   data/rutina_recuperacion.js - DATOS
   ========================================= */

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.unshift({
  id: "recuperacion",
  nombre: "Recuperación",
  tipo: "recuperacion",
  activityKey: "recuperacion",
  macroRatios: { p: 0.30, c: 0.25, f: 0.45 },
  objetivo: "Día libre o recuperación activa suave.",
  estructura: "Opcional: paseo suave + movilidad ligera",
  tiempos: { segPorRep: 4, descansoSeg: 90 },
  ejercicios: [
    { ejercicioId: "movilidad_articular", series: 1, reps: 1, segPorRep: 360 },
    { ejercicioId: "estiramientos", series: 1, reps: 1, segPorRep: 480 }
  ]
});

