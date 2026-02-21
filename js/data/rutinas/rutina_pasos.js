/* =========================================
   data/rutina_pasos.js - CONFIG MOVIMIENTO
   ========================================= */

window.STEP_ROUTINE = {
  id: "pasos",
  nombre: "Movimiento por pasos",
  tipo: "cardio",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  objetivo: "Movimiento diario",
  estructura: "Actividad base diaria",
  ejercicios: [
    { ejercicioId: "caminar", pasosPorMin: 100, totalPasos: 8000 }
  ]
};
