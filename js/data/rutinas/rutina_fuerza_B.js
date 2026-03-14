/* =========================================
   data/rutina_fuerza_B.js - DATOS
   ========================================= */

// Convenciones:
// - tipo: fuerza
// - ejercicios: usa ids de EXERCISES (js/data/ejercicios.js)

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.push({
  id: "fuerza_b",
  nombre: "Fuerza B (50-60 min)",
  tipo: "fuerza",
  activityKey: "fuerza_1h",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  objetivo: "Empuje y tracción de tren superior con accesorios.",
  estructura: "Calentamiento 8-10 min + Bloque principal + Accesorios + Core + Vuelta a la calma",
  tiempos: { segPorRep: 4, descansoSeg: 90 },
  ejercicios: [
    { ejercicioId: "movilidad_articular", series: 1, reps: 1, segPorRep: 360 },
    { ejercicioId: "press_inclinado", series: 4, reps: "6-10", pesoKg: 30, descansoSeg: 120, segPorRep: 4 },
    { ejercicioId: "remo_mancuernas", series: 3, reps: "8-12", pesoKg: 20, descansoSeg: 90, segPorRep: 4 },
    { ejercicioId: "press_militar", series: 3, reps: "8-10", pesoKg: 20, descansoSeg: 90, segPorRep: 4 },
    { ejercicioId: "elevaciones_laterales", series: 3, reps: "12-15", pesoKg: 8, descansoSeg: 60, segPorRep: 3 },
    { ejercicioId: "curl_biceps", series: 3, reps: "10-12", pesoKg: 10, descansoSeg: 60, segPorRep: 3 },
    { ejercicioId: "extension_triceps", series: 3, reps: "10-12", pesoKg: 15, descansoSeg: 60, segPorRep: 3 },
    { ejercicioId: "plancha_lateral", series: 1, reps: 1, segPorRep: 240 },
    { ejercicioId: "russian_twist", series: 3, reps: "16-24", pesoKg: 5, descansoSeg: 45, segPorRep: 2 },
    { ejercicioId: "estiramientos", series: 1, reps: 1, segPorRep: 240 }
  ]
});


