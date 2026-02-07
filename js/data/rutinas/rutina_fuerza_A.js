/* =========================================
   data/rutina_fuerza_A.js - DATOS
   ========================================= */

// Convenciones:
// - tipo: fuerza
// - duracionMin: estimada total (incluye calentamiento y descansos)
// - ejercicios: usa ids de EJERCICIOS (js/data/ejercicios.js)

window.RUTINAS_FUERZA = window.RUTINAS_FUERZA || [];

window.RUTINAS_FUERZA.push({
  id: "fuerza_a",
  nombre: "Fuerza A (50-60 min)",
  tipo: "fuerza",
  duracionMin: 55,
  objetivo: "Recorrido completo con enfasis en basicos.",
  estructura: "Calentamiento 8-10 min + Bloque principal + Core 6-8 min + Vuelta a la calma 3-5 min",
  ejercicios: [
    { ejercicioId: "movilidad_articular", tiempoMin: 6, notas: "Movilidad general y activacion." },
    { ejercicioId: "sentadilla", series: 4, reps: "6-10", descansoSeg: 120, notas: "Carga progresiva." },
    { ejercicioId: "press_banca", series: 4, reps: "6-10", descansoSeg: 120, notas: "Escapulas activas." },
    { ejercicioId: "remo_barra", series: 4, reps: "8-12", descansoSeg: 90, notas: "Espalda neutra." },
    { ejercicioId: "press_militar", series: 3, reps: "8-10", descansoSeg: 90, notas: "Core firme." },
    { ejercicioId: "peso_muerto_rumano", series: 3, reps: "8-12", descansoSeg: 90, notas: "Isquios y gluteo." },
    { ejercicioId: "elevacion_gemelos", series: 3, reps: "12-15", descansoSeg: 60, notas: "Pausa arriba." },
    { ejercicioId: "plancha", tiempoMin: 3, notas: "3 x 60s con 30s descanso." },
    { ejercicioId: "crunch", series: 3, reps: "12-20", descansoSeg: 45, notas: "Control sin tirar cuello." },
    { ejercicioId: "estiramientos", tiempoMin: 4, notas: "Pierna, pecho y espalda." }
  ]
});
