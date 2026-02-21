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
  ejercicios: [
    { ejercicioId: "movilidad_articular", tiempoMin: 6 },
    { ejercicioId: "estiramientos", tiempoMin: 8 }
  ]
});
