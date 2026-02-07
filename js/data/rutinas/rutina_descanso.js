/* =========================================
   data/rutina_descanso.js - DATOS
   ========================================= */

window.RUTINAS_FUERZA = window.RUTINAS_FUERZA || [];

window.RUTINAS_FUERZA.unshift({
  id: "descanso",
  nombre: "Descanso / Recuperacion",
  tipo: "recuperacion",
  duracionMin: 0,
  objetivo: "Dia libre o recuperacion activa suave.",
  estructura: "Opcional: paseo suave + movilidad ligera",
  ejercicios: [
    { ejercicioId: "movilidad_articular", tiempoMin: 6, notas: "Movilidad general." },
    { ejercicioId: "estiramientos", tiempoMin: 8, notas: "Respiracion y relajacion." }
  ]
});
