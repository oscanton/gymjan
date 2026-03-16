/* =========================================
   data/rutina_pasos.js - CONFIG MOVIMIENTO
   ========================================= */

window.STEP_ROUTINE = {
  id: "pasos",
  name: "Movimiento por pasos",
  type: "cardio",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  goal: "Movimiento diario",
  structure: "Actividad base diaria",
  exercises: [
    { exerciseId: "caminar", stepsPerMin: 100, totalSteps: 8000 }
  ]
};



