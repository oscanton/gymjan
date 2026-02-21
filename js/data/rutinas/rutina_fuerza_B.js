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
  objetivo: "Empuje y tracciÃ³n de tren superior con accesorios.",
  estructura: "Calentamiento 8-10 min + Bloque principal + Accesorios + Core + Vuelta a la calma",
  ejercicios: [
    { ejercicioId: "movilidad_articular", tiempoMin: 6 },
    { ejercicioId: "press_inclinado", series: 4, reps: "6-10", pesoKg: 30 },
    { ejercicioId: "remo_mancuernas", series: 3, reps: "8-12", pesoKg: 20 },
    { ejercicioId: "press_militar", series: 3, reps: "8-10", pesoKg: 20 },
    { ejercicioId: "elevaciones_laterales", series: 3, reps: "12-15", pesoKg: 8 },
    { ejercicioId: "curl_biceps", series: 3, reps: "10-12", pesoKg: 10 },
    { ejercicioId: "extension_triceps", series: 3, reps: "10-12", pesoKg: 15 },
    { ejercicioId: "plancha_lateral", tiempoMin: 4 },
    { ejercicioId: "russian_twist", series: 3, reps: "16-24", pesoKg: 5 },
    { ejercicioId: "estiramientos", tiempoMin: 4 }
  ]
});

