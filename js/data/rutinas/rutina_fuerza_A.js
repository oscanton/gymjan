/* =========================================
   data/rutina_fuerza_A.js - DATOS
   ========================================= */

// Convenciones:
// - tipo: fuerza
// - ejercicios: usa ids de EXERCISES (js/data/ejercicios.js)

window.WORKOUT_ROUTINES = window.WORKOUT_ROUTINES || [];

window.WORKOUT_ROUTINES.push({
  id: "fuerza_a",
  nombre: "Fuerza A (50-60 min)",
  tipo: "fuerza",
  activityKey: "fuerza_1h",
  macroRatios: { p: 0.35, c: 0.40, f: 0.25 },
  objetivo: "Recorrido completo con enfasis en basicos.",
  estructura: "Calentamiento 8-10 min + Bloque principal + Core 6-8 min + Vuelta a la calma 3-5 min",
  ejercicios: [
    { ejercicioId: "movilidad_articular", tiempoMin: 6 },
    { ejercicioId: "sentadilla", series: 4, reps: "6-10", pesoKg: 40 },
    { ejercicioId: "press_banca", series: 4, reps: "6-10", pesoKg: 30 },
    { ejercicioId: "remo_barra", series: 4, reps: "8-12", pesoKg: 30 },
    { ejercicioId: "press_militar", series: 3, reps: "8-10", pesoKg: 20 },
    { ejercicioId: "peso_muerto_rumano", series: 3, reps: "8-12", pesoKg: 40 },
    { ejercicioId: "elevacion_gemelos", series: 3, reps: "12-15", pesoKg: 30 },
    { ejercicioId: "plancha", tiempoMin: 3 },
    { ejercicioId: "crunch", series: 3, reps: "12-20" },
    { ejercicioId: "estiramientos", tiempoMin: 4 }
  ]
});

