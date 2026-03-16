/* =========================================
   data/ejercicios.js - DATOS
   ========================================= */

// Conventions:
// - type: "fuerza" | "cardio"
// - focus: tren_superior | tren_inferior | core | full_body | movilidad | recuperacion
// - met: approximate METs (kcal = MET * weightKg * timeMin / 60)
//   timeMin is derived from sets x reps x secPerRep.
// - timings: defined in the routine (timings.secPerRep, timings.restSec)
//   For timed exercises: sets=1, reps=1, secPerRep=total_seconds.

const EXERCISES = {
  /* =========================
     FUERZA - TREN SUPERIOR
     ========================= */
  flexiones: {
    name: "Flexiones",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho, triceps, hombro",
    equipment: "ninguno",
    met: 6.0,
    description: "Empuje horizontal con control del core.",
    technique: "El movimiento se realiza apoyando manos bajo el pecho, cuerpo en linea recta desde cabeza a talones, flexionando codos para bajar hasta que el pecho se acerque al suelo, manteniendo el core activo y la cadera estable, y empujando de nuevo hasta extender los brazos sin bloquear."
  },
  press_banca: {
    name: "Press banca",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho, triceps, hombro",
    equipment: "banco, barra",
    met: 5.5,
    description: "Basico de empuje para fuerza e hipertrofia.",
    technique: "El movimiento se realiza acostado en banco, con escápulas retraídas y pies firmes en el suelo; se baja la barra de forma controlada hasta el pecho medio, manteniendo los codos en un ángulo cómodo, y se empuja hacia arriba en línea recta sin perder la estabilidad del tronco."
  },
  press_inclinado: {
    name: "Press inclinado",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho superior, hombro, triceps",
    equipment: "banco inclinado, mancuernas o barra",
    met: 5.5,
    description: "Enfasis en porcion superior del pectoral.",
    technique: "El movimiento se realiza en banco inclinado (30-45 grados), bajando la carga de forma controlada hasta la parte alta del pecho y empujando hacia arriba sin bloquear los codos, manteniendo el tronco estable y las escápulas activas."
  },
  aperturas_mancuernas: {
    name: "Aperturas con mancuernas",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho",
    equipment: "mancuernas, banco",
    met: 4.0,
    description: "Aislamiento del pectoral con rango amplio.",
    technique: "El movimiento se realiza con codos ligeramente flexionados, abriendo los brazos en arco hasta sentir estiramiento del pectoral, manteniendo la tensión sin rebotar, y cerrando de nuevo arriba sin chocar las mancuernas."
  },
  fondos_paralelas: {
    name: "Fondos en paralelas",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho, triceps, hombro",
    equipment: "paralelas",
    met: 6.5,
    description: "Empuje vertical con alto reclutamiento.",
    technique: "El movimiento se realiza sujetando las paralelas con el cuerpo suspendido, inclinando ligeramente el tronco, flexionando codos para descender de forma controlada hasta un rango cómodo y empujando para extender sin balanceos."
  },
  dominadas: {
    name: "Dominadas",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps, core",
    equipment: "barra dominadas",
    met: 7.0,
    description: "Traccion vertical con carga corporal.",
    technique: "El movimiento se realiza colgado de la barra, activando las escápulas primero, elevando el cuerpo hasta que el pecho se acerque a la barra, y descendiendo controlado hasta extensión completa sin dejar que los hombros se colapsen."
  },
  jalon_pecho: {
    name: "Jalon al pecho",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps",
    equipment: "polea",
    met: 5.0,
    description: "Alternativa a dominadas con carga regulable.",
    technique: "El movimiento se realiza sentado con el tronco estable, tirando de la barra hacia la parte alta del pecho con codos hacia abajo y atrás, y retornando la carga lentamente sin perder la postura."
  },
  remo_barra: {
    name: "Remo con barra",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps, core",
    equipment: "barra",
    met: 6.0,
    description: "Traccion horizontal para densidad de espalda.",
    technique: "El movimiento se realiza en bisagra de cadera con espalda neutra, llevando la barra hacia el ombligo con codos cerca del cuerpo, y bajando controlado sin encorvar ni balancear."
  },
  remo_mancuernas: {
    name: "Remo con mancuerna",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps",
    equipment: "mancuerna, banco",
    met: 5.5,
    description: "Trabajo unilateral para equilibrio y control.",
    technique: "El movimiento se realiza apoyando una mano en el banco, con la espalda recta, llevando la mancuerna hacia la cadera con el codo pegado y bajando lentamente sin rotar el tronco."
  },
  face_pull: {
    name: "Face pull",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "deltoide posterior, espalda alta",
    equipment: "polea, cuerda",
    met: 4.0,
    description: "Salud del hombro y postura.",
    technique: "El movimiento se realiza tirando de la cuerda hacia la cara, con codos altos y separados, llevando las manos a la altura de las orejas y contrayendo la espalda alta antes de volver controlado."
  },
  press_militar: {
    name: "Press militar",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "hombro, triceps, core",
    equipment: "barra o mancuernas",
    met: 6.0,
    description: "Empuje vertical de pie.",
    technique: "El movimiento se realiza de pie, con glúteos y abdomen activos, empujando la barra desde el pecho hacia arriba en línea recta, evitando arquear la zona lumbar, y bajando de forma controlada."
  },
  elevaciones_laterales: {
    name: "Elevaciones laterales",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "deltoide lateral",
    equipment: "mancuernas",
    met: 4.0,
    description: "Aislamiento de hombro para amplitud.",
    technique: "El movimiento se realiza con codos semidoblados, elevando los brazos hasta la altura del hombro sin balanceo, y descendiendo lentamente manteniendo la tensión."
  },
  curl_biceps: {
    name: "Curl biceps",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "biceps",
    equipment: "mancuernas o barra",
    met: 3.5,
    description: "Aislamiento de flexores del codo.",
    technique: "El movimiento se realiza con codos pegados al torso, flexionando hasta llevar el peso hacia el hombro sin impulso, y bajando de forma lenta y completa."
  },
  curl_martillo: {
    name: "Curl martillo",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "biceps, braquiorradial",
    equipment: "mancuernas",
    met: 3.5,
    description: "Enfasis en antebrazo y braquial.",
    technique: "El movimiento se realiza con agarre neutro, codos estables, subiendo y bajando en recorrido completo sin balancear el tronco."
  },
  extension_triceps: {
    name: "Extension triceps",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "triceps",
    equipment: "polea o mancuerna",
    met: 3.5,
    description: "Aislamiento del triceps.",
    technique: "El movimiento se realiza con codos fijos, extendiendo el antebrazo hasta completar la extensión sin mover el hombro, y regresando controlado."
  },

  /* =========================
     FUERZA - TREN INFERIOR
     ========================= */
  sentadilla: {
    name: "Sentadilla",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo, core",
    equipment: "barra o mancuernas",
    met: 6.5,
    description: "Basico de fuerza para piernas.",
    technique: "El movimiento se realiza flexionando rodillas y cadera para hacer bajar el cuerpo hacia el suelo sin perder la verticalidad, manteniendo la espalda neutra, y volviendo luego a la posición erguida empujando con los pies."
  },
  sentadilla_goblet: {
    name: "Sentadilla goblet",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo, core",
    equipment: "mancuerna o kettlebell",
    met: 6.0,
    description: "Variante segura para tecnica.",
    technique: "El movimiento se realiza sujetando la carga al pecho, con codos hacia abajo, descendiendo en sentadilla profunda sin perder la postura y subiendo de forma controlada."
  },
  peso_muerto: {
    name: "Peso muerto",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "isquios, gluteo, espalda",
    equipment: "barra",
    met: 7.0,
    description: "Patron de bisagra de cadera.",
    technique: "El movimiento se realiza con la barra pegada al cuerpo, espalda neutra y cadera atrás; se empuja el suelo con los pies y se extiende la cadera hasta quedar erguido, bajando luego con control."
  },
  peso_muerto_rumano: {
    name: "Peso muerto rumano",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "isquios, gluteo",
    equipment: "barra o mancuernas",
    met: 6.5,
    description: "Enfasis en isquios sin tocar el suelo.",
    technique: "El movimiento se realiza con rodillas semidobladas, llevando la cadera hacia atrás, bajando la carga hasta sentir estiramiento en isquios, y subiendo manteniendo la espalda neutra."
  },
  zancadas: {
    name: "Zancadas",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo, core",
    equipment: "ninguno o mancuernas",
    met: 6.0,
    description: "Trabajo unilateral y estabilidad.",
    technique: "El movimiento se realiza dando un paso largo, flexionando ambas rodillas hasta acercar la rodilla trasera al suelo, con el torso erguido, y empujando para volver a la posición inicial."
  },
  prensa_piernas: {
    name: "Prensa de piernas",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo",
    equipment: "maquina",
    met: 6.0,
    description: "Carga alta con soporte de espalda.",
    technique: "El movimiento se realiza con la espalda apoyada, pies estables en la plataforma, bajando la carga de forma controlada sin despegar la pelvis, y extendiendo las piernas sin bloquear rodillas."
  },
  hip_thrust: {
    name: "Hip thrust",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "gluteo",
    equipment: "banco, barra",
    met: 5.5,
    description: "Maxima activacion de gluteo.",
    technique: "El movimiento se realiza con la espalda alta apoyada en banco, empujando con talones, extendiendo la cadera hasta alinear rodillas, cadera y hombros, y bajando controlado."
  },
  elevacion_gemelos: {
    name: "Elevacion de gemelos",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "gemelos",
    equipment: "maquina o mancuernas",
    met: 3.5,
    description: "Aislamiento de pantorrilla.",
    technique: "El movimiento se realiza elevando los talones hasta máxima contracción, manteniendo una breve pausa arriba, y descendiendo lentamente hasta estirar."
  },
  step_up: {
    name: "Step-up",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo",
    equipment: "caja o banco",
    met: 5.5,
    description: "Subidas con control y estabilidad.",
    technique: "El movimiento se realiza apoyando un pie en la caja, subiendo el cuerpo con esa pierna sin impulso de la otra, y bajando lentamente manteniendo el equilibrio."
  },

  /* =========================
     FUERZA - CORE
     ========================= */
  plancha: {
    name: "Plancha",
    type: "fuerza",
    focus: "core",
    muscles: "abdominales, lumbar",
    equipment: "ninguno",
    met: 3.5,
    description: "Isometria para estabilidad central.",
    technique: "El movimiento se realiza en apoyo de antebrazos, con el cuerpo en línea recta, abdomen y glúteos activos, evitando que la cadera caiga o se eleve."
  },
  plancha_lateral: {
    name: "Plancha lateral",
    type: "fuerza",
    focus: "core",
    muscles: "oblicuos, core",
    equipment: "ninguno",
    met: 3.5,
    description: "Estabilidad lateral del tronco.",
    technique: "El movimiento se realiza apoyando el antebrazo en el suelo, con el cuerpo alineado de pies a cabeza, cadera elevada y abdomen activo."
  },
  crunch: {
    name: "Crunch",
    type: "fuerza",
    focus: "core",
    muscles: "abdominales",
    equipment: "ninguno",
    met: 3.0,
    description: "Flexion de tronco controlada.",
    technique: "El movimiento se realiza tumbado, con rodillas flexionadas, elevando la parte alta del tronco pocos centímetros sin tirar del cuello, y bajando controlado."
  },
  elevaciones_piernas: {
    name: "Elevaciones de piernas",
    type: "fuerza",
    focus: "core",
    muscles: "abdominales inferiores",
    equipment: "ninguno o barra",
    met: 4.0,
    description: "Enfasis en abdomen inferior.",
    technique: "El movimiento se realiza con la zona lumbar pegada al suelo, elevando las piernas juntas sin balanceo y bajando lentamente sin arquear la espalda."
  },
  russian_twist: {
    name: "Russian twist",
    type: "fuerza",
    focus: "core",
    muscles: "oblicuos",
    equipment: "ninguno o peso",
    met: 4.0,
    description: "Rotacion controlada del tronco.",
    technique: "El movimiento se realiza sentado con el tronco ligeramente inclinado, girando el torso de lado a lado de forma controlada sin encorvar la espalda."
  },

  /* =========================
     FUERZA - FULL BODY
     ========================= */
  burpees: {
    name: "Burpees",
    type: "fuerza",
    focus: "full_body",
    muscles: "cuerpo completo",
    equipment: "ninguno",
    met: 8.5,
    description: "Explosivo, eleva pulso y fuerza total.",
    technique: "El movimiento se realiza pasando de pie a plancha con apoyo de manos, realizando una flexión, volviendo con los pies hacia las manos y finalizando con un salto vertical."
  },
  thrusters: {
    name: "Thrusters",
    type: "fuerza",
    focus: "full_body",
    muscles: "piernas, hombro, core",
    equipment: "mancuernas o barra",
    met: 9.0,
    description: "Sentadilla + press en un movimiento.",
    technique: "El movimiento se realiza bajando en sentadilla y, al subir, se continúa el impulso para hacer un press por encima de la cabeza sin pausas intermedias."
  },
  clean_press: {
    name: "Clean and press",
    type: "fuerza",
    focus: "full_body",
    muscles: "piernas, espalda, hombro",
    equipment: "barra o kettlebell",
    met: 9.0,
    description: "Levantamiento tecnico de potencia.",
    technique: "El movimiento se realiza impulsando la carga desde el suelo con piernas, recibiéndola en posición de rack sobre los hombros, y presionando por encima de la cabeza con control."
  },
  kettlebell_swing: {
    name: "Kettlebell swing",
    type: "fuerza",
    focus: "full_body",
    muscles: "gluteo, isquios, core",
    equipment: "kettlebell",
    met: 8.0,
    description: "Bisagra de cadera con ritmo.",
    technique: "El movimiento se realiza con bisagra de cadera, espalda neutra, llevando la pesa atrás y proyectándola al frente con la potencia de glúteos, sin tirar con los brazos."
  },

  /* =========================
     CARDIO - FULL BODY
     ========================= */
  caminar: {
    name: "Caminar",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, core",
    equipment: "ninguno",
    met: 3.5,
    description: "Actividad base de baja intensidad.",
    technique: "El movimiento se realiza con paso constante, postura erguida, brazos relajados y apoyo suave del pie."
  },
  correr: {
    name: "Correr",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, core",
    equipment: "ninguno",
    met: 9.8,
    description: "Cardio continuo de impacto moderado.",
    technique: "El movimiento se realiza con zancada corta, apoyo medio pie, cadencia estable y tronco ligeramente inclinado hacia delante."
  },
  hiit: {
    name: "HIIT",
    type: "cardio",
    focus: "full_body",
    muscles: "cuerpo completo",
    equipment: "variable",
    met: 10.5,
    description: "Intervalos cortos de alta intensidad.",
    technique: "El trabajo se realiza alternando intervalos de esfuerzo muy alto con descansos activos o completos, cuidando la técnica en cada ejercicio."
  },
  saltar_cuerda: {
    name: "Saltar cuerda",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, hombro, core",
    equipment: "cuerda",
    met: 11.5,
    description: "Cardio coordinativo y rapido.",
    technique: "El movimiento se realiza con saltos bajos y rápidos, girando la cuerda con las muñecas, manteniendo codos cerca del cuerpo y postura relajada."
  },
  jumping_jacks: {
    name: "Jumping jacks",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, hombro, core",
    equipment: "ninguno",
    met: 8.0,
    description: "Calentamiento dinamico y cardio suave.",
    technique: "El movimiento se realiza abriendo y cerrando piernas mientras los brazos suben y bajan, aterrizando suave y controlado."
  },
  mountain_climbers: {
    name: "Mountain climbers",
    type: "cardio",
    focus: "full_body",
    muscles: "core, hombro, piernas",
    equipment: "ninguno",
    met: 9.0,
    description: "Cardio en suelo con foco en core.",
    technique: "El movimiento se realiza en posición de plancha, llevando rodillas alternas al pecho con ritmo, manteniendo hombros sobre manos y cadera estable."
  },

  /* =========================
     CARDIO - TREN INFERIOR
     ========================= */
  bicicleta_carretera: {
    name: "Bicicleta carretera",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas",
    equipment: "bicicleta",
    met: 8.0,
    description: "Cardio continuo en ruta.",
    technique: "El movimiento se realiza con cadencia estable, postura relajada, core activo y ajustes de marcha según el terreno."
  },
  bicicleta_montana: {
    name: "Bicicleta montana",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, core",
    equipment: "bicicleta",
    met: 10.0,
    description: "Mayor demanda por desnivel y terreno.",
    technique: "El movimiento se realiza anticipando el terreno, usando cambios adecuados y distribuyendo el peso para mantener tracción."
  },
  spinning: {
    name: "Spinning",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas",
    equipment: "bicicleta estatica",
    met: 8.5,
    description: "Intervalos en bici estatica.",
    technique: "El trabajo se realiza manteniendo cadencia, ajustando resistencia según intervalos y evitando balancear el tronco."
  },
  eliptica: {
    name: "Eliptica",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas",
    equipment: "maquina eliptica",
    met: 6.5,
    description: "Cardio bajo impacto.",
    technique: "El movimiento se realiza con zancada fluida, sin bloquear rodillas y manteniendo el tronco estable."
  },
  escaladora: {
    name: "Escaladora",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, gluteo",
    equipment: "maquina escaladora",
    met: 8.8,
    description: "Simula subir escaleras.",
    technique: "El movimiento se realiza con paso completo, apoyando todo el pie y sin apoyarse en exceso en los brazos."
  },
  trekking: {
    name: "Trekking",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, core",
    equipment: "ninguno",
    met: 6.5,
    description: "Caminata en terreno irregular.",
    technique: "El movimiento se realiza con paso firme y regular, cuidando la postura y usando bastones si hay desnivel."
  },
  patinar: {
    name: "Patinar",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, core",
    equipment: "patines",
    met: 7.5,
    description: "Cardio coordinativo y divertido.",
    technique: "El movimiento se realiza empujando de forma lateral, con rodillas flexionadas, core activo y mirada al frente."
  },

  /* =========================
     CARDIO - TREN SUPERIOR
     ========================= */
  remo_ergometro: {
    name: "Remo ergometro",
    type: "cardio",
    focus: "tren_superior",
    muscles: "espalda, piernas, core",
    equipment: "remo indoor",
    met: 8.5,
    description: "Cardio completo con tecnica.",
    technique: "El movimiento se realiza con la secuencia piernas-tronco-brazos en la tracción, y brazos-tronco-piernas en el retorno, manteniendo ritmo constante."
  },
  boxeo_saco: {
    name: "Boxeo en saco",
    type: "cardio",
    focus: "tren_superior",
    muscles: "hombro, brazos, core",
    equipment: "saco",
    met: 10.5,
    description: "Intervalos de golpeo y movilidad.",
    technique: "El trabajo se realiza con guardia alta, rotando la cadera en cada golpe y respirando con el impacto."
  },
  natacion: {
    name: "Natacion",
    type: "cardio",
    focus: "tren_superior",
    muscles: "espalda, hombro, core",
    equipment: "piscina",
    met: 9.5,
    description: "Cardio sin impacto con gran demanda.",
    technique: "El movimiento se realiza con brazada larga, patada constante y respiración lateral o frontal según el estilo."
  },

  /* =========================
     CARDIO - MOVILIDAD / RECUPERACION
     ========================= */
  estiramientos: {
    name: "Estiramientos",
    type: "cardio",
    focus: "movilidad",
    muscles: "movilidad general",
    equipment: "ninguno",
    met: 2.3,
    description: "Mejora rango de movimiento y recuperacion.",
    technique: "El trabajo se realiza manteniendo cada postura 20-40 segundos sin rebotes, respirando de forma relajada."
  },
  yoga_suave: {
    name: "Yoga suave",
    type: "cardio",
    focus: "movilidad",
    muscles: "movilidad, core",
    equipment: "esterilla",
    met: 2.5,
    description: "Respiracion y control postural.",
    technique: "El trabajo se realiza con respiración lenta, transiciones suaves y posturas alineadas sin forzar el rango."
  },
  movilidad_articular: {
    name: "Movilidad articular",
    type: "cardio",
    focus: "movilidad",
    muscles: "articulaciones",
    equipment: "ninguno",
    met: 2.0,
    description: "Rutina corta para preparar el cuerpo.",
    technique: "El trabajo se realiza con movimientos circulares controlados, recorriendo todo el rango articular sin dolor."
  },
  sauna: {
    name: "Sauna",
    type: "cardio",
    focus: "recuperacion",
    muscles: "recuperacion",
    equipment: "sauna",
    met: 1.5,
    description: "Relajacion y recuperacion general.",
    technique: "La sesión se realiza sentado o recostado, hidratándote bien y saliendo si hay mareo o exceso de calor."
  }
};

window.EXERCISES = EXERCISES;



