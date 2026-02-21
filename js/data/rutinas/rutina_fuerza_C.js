/* =========================================
   data/rutina_fuerza_C.js - DATOS
   ========================================= */

// Convenciones:
// - tipo: fuerza
// - ejercicios: usa ids de EXERCISES (js/data/ejercicios.js)

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.push({
  id: "fuerza_c",
  nombre: "Fuerza C (50-60 min)",
  tipo: "fuerza",
  activityKey: "fuerza_1h",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  objetivo: "Tren inferior + full body con énfasis en bisagra.",
  estructura: "Calentamiento 8-10 min + Bloque principal + Accesorios + Core + Vuelta a la calma",
  ejercicios: [
    { ejercicioId: "movilidad_articular", tiempoMin: 6 },
    { ejercicioId: "sentadilla_goblet", series: 4, reps: "8-12", pesoKg: 20 },
    { ejercicioId: "peso_muerto", series: 4, reps: "6-8", pesoKg: 50 },
    { ejercicioId: "zancadas", series: 3, reps: "10-12", pesoKg: 12 },
    { ejercicioId: "hip_thrust", series: 3, reps: "8-12", pesoKg: 40 },
    { ejercicioId: "prensa_piernas", series: 3, reps: "10-12", pesoKg: 80 },
    { ejercicioId: "elevacion_gemelos", series: 3, reps: "12-15", pesoKg: 30 },
    { ejercicioId: "plancha", tiempoMin: 3 },
    { ejercicioId: "elevaciones_piernas", series: 3, reps: "10-15", pesoKg: 0 },
    { ejercicioId: "estiramientos", tiempoMin: 4 }
  ]
});
