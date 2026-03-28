/* =========================================
   data/activity/activity_week_base.js - PLAN SEMANAL
   ========================================= */

window.ACTIVITY_DATA = [
  {
    day: "Lunes",
    walk: {
      exercises: [
        { exerciseId: "caminar", sets: 1, reps: 1, stepsPerMin: 100, secPerRep: 4800 }
      ],
      description: "Actividad base diaria"
    },
    gym: {
      exercises: [
        { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
        { exerciseId: "sentadilla", sets: 4, reps: "6-10", weightKg: 40, secPerRep: 5 },
        { exerciseId: "press_banca", sets: 4, reps: "6-10", weightKg: 30, secPerRep: 4 },
        { exerciseId: "remo_barra", sets: 4, reps: "8-12", weightKg: 30, secPerRep: 4 },
        { exerciseId: "press_militar", sets: 3, reps: "8-10", weightKg: 20, secPerRep: 4 },
        { exerciseId: "peso_muerto_rumano", sets: 3, reps: "8-12", weightKg: 40, secPerRep: 4 },
        { exerciseId: "elevacion_gemelos", sets: 3, reps: "12-15", weightKg: 30, secPerRep: 3 },
        { exerciseId: "plancha", sets: 1, reps: 1, secPerRep: 180 },
        { exerciseId: "crunch", sets: 3, reps: "12-20", secPerRep: 2 },
        { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 240 }
      ],
      description: "Recorrido completo con énfasis en básicos."
    }
  },
  {
    day: "Martes",
    walk: {
      exercises: [
        { exerciseId: "caminar", sets: 1, reps: 1, stepsPerMin: 100, secPerRep: 4800 }
      ],
      description: "Actividad base diaria"
    },
    gym: {
      type: "rest",
      description: "Sin actividad de fuerza o cardio intenso en gimnasio"
    }
  },
  {
    day: "Miércoles",
    walk: {
      exercises: [
        { exerciseId: "caminar", sets: 1, reps: 1, stepsPerMin: 100, secPerRep: 4800 }
      ],
      description: "Actividad base diaria"
    },
    gym: {
      exercises: [
        { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
        { exerciseId: "press_inclinado", sets: 4, reps: "6-10", weightKg: 30, secPerRep: 4 },
        { exerciseId: "remo_mancuernas", sets: 3, reps: "8-12", weightKg: 20, secPerRep: 4 },
        { exerciseId: "press_militar", sets: 3, reps: "8-10", weightKg: 20, secPerRep: 4 },
        { exerciseId: "elevaciones_laterales", sets: 3, reps: "12-15", weightKg: 8, secPerRep: 3 },
        { exerciseId: "curl_biceps", sets: 3, reps: "10-12", weightKg: 10, secPerRep: 3 },
        { exerciseId: "extension_triceps", sets: 3, reps: "10-12", weightKg: 15, secPerRep: 3 },
        { exerciseId: "plancha_lateral", sets: 1, reps: 1, secPerRep: 240 },
        { exerciseId: "russian_twist", sets: 3, reps: "16-24", weightKg: 5, secPerRep: 2 },
        { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 240 }
      ],
      description: "Empuje y tracción de tren superior con accesorios."
    }
  },
  {
    day: "Jueves",
    walk: {
      exercises: [
        { exerciseId: "caminar", sets: 1, reps: 1, stepsPerMin: 100, secPerRep: 4800 }
      ],
      description: "Actividad base diaria"
    },
    gym: {
      exercises: [
        { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
        { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 480 }
      ],
      description: "Día libre o recuperación activa suave."
    }
  },
  {
    day: "Viernes",
    walk: {
      exercises: [
        { exerciseId: "caminar", sets: 1, reps: 1, stepsPerMin: 100, secPerRep: 4800 }
      ],
      description: "Actividad base diaria"
    },
    gym: {
      exercises: [
        { exerciseId: "movilidad_articular", sets: 1, reps: 1, secPerRep: 360 },
        { exerciseId: "sentadilla_goblet", sets: 4, reps: "8-12", weightKg: 20, secPerRep: 4 },
        { exerciseId: "peso_muerto", sets: 4, reps: "6-8", weightKg: 50, secPerRep: 5 },
        { exerciseId: "zancadas", sets: 3, reps: "10-12", weightKg: 12, secPerRep: 4 },
        { exerciseId: "hip_thrust", sets: 3, reps: "8-12", weightKg: 40, secPerRep: 4 },
        { exerciseId: "prensa_piernas", sets: 3, reps: "10-12", weightKg: 80, secPerRep: 4 },
        { exerciseId: "elevacion_gemelos", sets: 3, reps: "12-15", weightKg: 30, secPerRep: 3 },
        { exerciseId: "plancha", sets: 1, reps: 1, secPerRep: 180 },
        { exerciseId: "elevaciones_piernas", sets: 3, reps: "10-15", weightKg: 0, secPerRep: 2 },
        { exerciseId: "estiramientos", sets: 1, reps: 1, secPerRep: 240 }
      ],
      description: "Tren inferior + full body con énfasis en bisagra."
    }
  },
  {
    day: "Sábado",
    walk: {
      exercises: [
        { exerciseId: "caminar", sets: 1, reps: 1, stepsPerMin: 100, secPerRep: 4800 }
      ],
      description: "Actividad base diaria"
    },
    gym: {
      type: "rest",
      description: "Descanso completo sin actividad programada."
    },
    extra_activity: {
      exercises: [
        { exerciseId: "spinning", sets: 1, reps: 1, secPerRep: 1800 }
      ],
      description: "Spinning suave para evaluar el flujo de actividad extra."
    }
  },
  {
    day: "Domingo",
    walk: {
      exercises: [
        { exerciseId: "caminar", sets: 1, reps: 1, stepsPerMin: 100, secPerRep: 4800 }
      ],
      description: "Actividad base diaria"
    },
    gym: {
      type: "rest",
      description: "Descanso completo sin actividad programada."
    }
  }
];

