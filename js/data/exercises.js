/* =========================================
   data/exercises.js - DATOS
   ========================================= */

// Conventions:
// - type: "fuerza" | "cardio"
// - focus: tren_superior | tren_inferior | core | full_body | movilidad | recuperacion
// - met: approximate METs (kcal = MET * weightKg * timeMin / 60)
//   timeMin is derived from sets x reps x secPerRep.
// - restSec: descanso entre series para el ejercicio (se aplica en la rutina).
// - For timed exercises: sets=1, reps=1, secPerRep=total_seconds.

const EXERCISES = {
  /* =========================
     FUERZA - TREN SUPERIOR
     ========================= */
  flexiones: {
    id: "flexiones",
    name: "Flexiones",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho, triceps, hombro",
    equipment: "ninguno",
    relativeLoad: 0.32,
    met: 6.0,
    restSec: 90,
    description: "Empuje horizontal con control del core.",
    technique: "El movimiento se realiza apoyando manos bajo el pecho, cuerpo en linea recta desde cabeza a talones, flexionando codos para bajar hasta que el pecho se acerque al suelo, manteniendo el core activo y la cadera estable, y empujando de nuevo hasta extender los brazos sin bloquear."
  },
  press_banca: {
    id: "press_banca",
    name: "Press banca",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho, triceps, hombro",
    equipment: "banco, barra",
    relativeLoad: 0.42,
    met: 5.5,
    restSec: 120,
    description: "Basico de empuje para fuerza e hipertrofia.",
    technique: "El movimiento se realiza acostado en banco, con escápulas retraídas y pies firmes en el suelo; se baja la barra de forma controlada hasta el pecho medio, manteniendo los codos en un ángulo cómodo, y se empuja hacia arriba en línea recta sin perder la estabilidad del tronco."
  },
  press_inclinado: {
    id: "press_inclinado",
    name: "Press inclinado",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho superior, hombro, triceps",
    equipment: "banco inclinado, mancuernas o barra",
    relativeLoad: 0.4,
    met: 5.5,
    restSec: 120,
    description: "Enfasis en porcion superior del pectoral.",
    technique: "El movimiento se realiza en banco inclinado (30-45 grados), bajando la carga de forma controlada hasta la parte alta del pecho y empujando hacia arriba sin bloquear los codos, manteniendo el tronco estable y las escápulas activas."
  },
  aperturas_mancuernas: {
    id: "aperturas_mancuernas",
    name: "Aperturas con mancuernas",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho",
    equipment: "mancuernas, banco",
    relativeLoad: 0.22,
    met: 4.0,
    restSec: 60,
    description: "Aislamiento del pectoral con rango amplio.",
    technique: "El movimiento se realiza con codos ligeramente flexionados, abriendo los brazos en arco hasta sentir estiramiento del pectoral, manteniendo la tensión sin rebotar, y cerrando de nuevo arriba sin chocar las mancuernas."
  },
  fondos_paralelas: {
    id: "fondos_paralelas",
    name: "Fondos en paralelas",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "pecho, triceps, hombro",
    equipment: "paralelas",
    relativeLoad: 0.38,
    met: 6.5,
    restSec: 90,
    description: "Empuje vertical con alto reclutamiento.",
    technique: "El movimiento se realiza sujetando las paralelas con el cuerpo suspendido, inclinando ligeramente el tronco, flexionando codos para descender de forma controlada hasta un rango cómodo y empujando para extender sin balanceos."
  },
  dominadas: {
    id: "dominadas",
    name: "Dominadas",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps, core",
    equipment: "barra dominadas",
    relativeLoad: 0.4,
    met: 7.0,
    restSec: 120,
    description: "Traccion vertical con carga corporal.",
    technique: "El movimiento se realiza colgado de la barra, activando las escápulas primero, elevando el cuerpo hasta que el pecho se acerque a la barra, y descendiendo controlado hasta extensión completa sin dejar que los hombros se colapsen."
  },
  jalon_pecho: {
    id: "jalon_pecho",
    name: "Jalon al pecho",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps",
    equipment: "polea",
    relativeLoad: 0.34,
    met: 5.0,
    restSec: 90,
    description: "Alternativa a dominadas con carga regulable.",
    technique: "El movimiento se realiza sentado con el tronco estable, tirando de la barra hacia la parte alta del pecho con codos hacia abajo y atrás, y retornando la carga lentamente sin perder la postura."
  },
  remo_barra: {
    id: "remo_barra",
    name: "Remo con barra",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps, core",
    equipment: "barra",
    relativeLoad: 0.42,
    met: 6.0,
    restSec: 90,
    description: "Traccion horizontal para densidad de espalda.",
    technique: "El movimiento se realiza en bisagra de cadera con espalda neutra, llevando la barra hacia el ombligo con codos cerca del cuerpo, y bajando controlado sin encorvar ni balancear."
  },
  remo_mancuernas: {
    id: "remo_mancuernas",
    name: "Remo con mancuerna",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "espalda, biceps",
    equipment: "mancuerna, banco",
    relativeLoad: 0.35,
    met: 5.5,
    restSec: 90,
    description: "Trabajo unilateral para equilibrio y control.",
    technique: "El movimiento se realiza apoyando una mano en el banco, con la espalda recta, llevando la mancuerna hacia la cadera con el codo pegado y bajando lentamente sin rotar el tronco."
  },
  face_pull: {
    id: "face_pull",
    name: "Face pull",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "deltoide posterior, espalda alta",
    equipment: "polea, cuerda",
    relativeLoad: 0.2,
    met: 4.0,
    restSec: 60,
    description: "Salud del hombro y postura.",
    technique: "El movimiento se realiza tirando de la cuerda hacia la cara, con codos altos y separados, llevando las manos a la altura de las orejas y contrayendo la espalda alta antes de volver controlado."
  },
  press_militar: {
    id: "press_militar",
    name: "Press militar",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "hombro, triceps, core",
    equipment: "barra o mancuernas",
    relativeLoad: 0.4,
    met: 6.0,
    restSec: 90,
    description: "Empuje vertical de pie.",
    technique: "El movimiento se realiza de pie, con glúteos y abdomen activos, empujando la barra desde el pecho hacia arriba en línea recta, evitando arquear la zona lumbar, y bajando de forma controlada."
  },
  elevaciones_laterales: {
    id: "elevaciones_laterales",
    name: "Elevaciones laterales",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "deltoide lateral",
    equipment: "mancuernas",
    relativeLoad: 0.2,
    met: 4.0,
    restSec: 60,
    description: "Aislamiento de hombro para amplitud.",
    technique: "El movimiento se realiza con codos semidoblados, elevando los brazos hasta la altura del hombro sin balanceo, y descendiendo lentamente manteniendo la tensión."
  },
  curl_biceps: {
    id: "curl_biceps",
    name: "Curl biceps",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "biceps",
    equipment: "mancuernas o barra",
    relativeLoad: 0.22,
    met: 3.5,
    restSec: 60,
    description: "Aislamiento de flexores del codo.",
    technique: "El movimiento se realiza con codos pegados al torso, flexionando hasta llevar el peso hacia el hombro sin impulso, y bajando de forma lenta y completa."
  },
  curl_martillo: {
    id: "curl_martillo",
    name: "Curl martillo",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "biceps, braquiorradial",
    equipment: "mancuernas",
    relativeLoad: 0.22,
    met: 3.5,
    restSec: 60,
    description: "Enfasis en antebrazo y braquial.",
    technique: "El movimiento se realiza con agarre neutro, codos estables, subiendo y bajando en recorrido completo sin balancear el tronco."
  },
  extension_triceps: {
    id: "extension_triceps",
    name: "Extension triceps",
    type: "fuerza",
    focus: "tren_superior",
    muscles: "triceps",
    equipment: "polea o mancuerna",
    relativeLoad: 0.22,
    met: 3.5,
    restSec: 60,
    description: "Aislamiento del triceps.",
    technique: "El movimiento se realiza con codos fijos, extendiendo el antebrazo hasta completar la extensión sin mover el hombro, y regresando controlado."
  },

  /* =========================
     FUERZA - TREN INFERIOR
     ========================= */
  sentadilla: {
    id: "sentadilla",
    name: "Sentadilla",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo, core",
    equipment: "barra o mancuernas",
    relativeLoad: 0.45,
    met: 6.5,
    restSec: 120,
    description: "Basico de fuerza para piernas.",
    technique: "El movimiento se realiza flexionando rodillas y cadera para hacer bajar el cuerpo hacia el suelo sin perder la verticalidad, manteniendo la espalda neutra, y volviendo luego a la posición erguida empujando con los pies."
  },
  sentadilla_goblet: {
    id: "sentadilla_goblet",
    name: "Sentadilla goblet",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo, core",
    equipment: "mancuerna o kettlebell",
    relativeLoad: 0.4,
    met: 6.0,
    restSec: 90,
    description: "Variante segura para técnica.",
    technique: "El movimiento se realiza sujetando la carga al pecho, con codos hacia abajo, descendiendo en sentadilla profunda sin perder la postura y subiendo de forma controlada."
  },
  peso_muerto: {
    id: "peso_muerto",
    name: "Peso muerto",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "isquios, gluteo, espalda",
    equipment: "barra",
    relativeLoad: 0.48,
    met: 7.0,
    restSec: 150,
    description: "Patron de bisagra de cadera.",
    technique: "El movimiento se realiza con la barra pegada al cuerpo, espalda neutra y cadera atrás; se empuja el suelo con los pies y se extiende la cadera hasta quedar erguido, bajando luego con control."
  },
  peso_muerto_rumano: {
    id: "peso_muerto_rumano",
    name: "Peso muerto rumano",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "isquios, gluteo",
    equipment: "barra o mancuernas",
    relativeLoad: 0.45,
    met: 6.5,
    restSec: 120,
    description: "Enfasis en isquios sin tocar el suelo.",
    technique: "El movimiento se realiza con rodillas semidobladas, llevando la cadera hacia atrás, bajando la carga hasta sentir estiramiento en isquios, y subiendo manteniendo la espalda neutra."
  },
  zancadas: {
    id: "zancadas",
    name: "Zancadas",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo, core",
    equipment: "ninguno o mancuernas",
    relativeLoad: 0.4,
    met: 6.0,
    restSec: 90,
    description: "Trabajo unilateral y estabilidad.",
    technique: "El movimiento se realiza dando un paso largo, flexionando ambas rodillas hasta acercar la rodilla trasera al suelo, con el torso erguido, y empujando para volver a la posición inicial."
  },
  prensa_piernas: {
    id: "prensa_piernas",
    name: "Prensa de piernas",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo",
    equipment: "maquina",
    relativeLoad: 0.48,
    met: 6.0,
    restSec: 120,
    description: "Carga alta con soporte de espalda.",
    technique: "El movimiento se realiza con la espalda apoyada, pies estables en la plataforma, bajando la carga de forma controlada sin despegar la pelvis, y extendiendo las piernas sin bloquear rodillas."
  },
  hip_thrust: {
    id: "hip_thrust",
    name: "Hip thrust",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "gluteo",
    equipment: "banco, barra",
    relativeLoad: 0.45,
    met: 5.5,
    restSec: 120,
    description: "Maxima activacion de gluteo.",
    technique: "El movimiento se realiza con la espalda alta apoyada en banco, empujando con talones, extendiendo la cadera hasta alinear rodillas, cadera y hombros, y bajando controlado."
  },
  elevacion_gemelos: {
    id: "elevacion_gemelos",
    name: "Elevacion de gemelos",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "gemelos",
    equipment: "maquina o mancuernas",
    relativeLoad: 0.25,
    met: 3.5,
    restSec: 60,
    description: "Aislamiento de pantorrilla.",
    technique: "El movimiento se realiza elevando los talones hasta máxima contracción, manteniendo una breve pausa arriba, y descendiendo lentamente hasta estirar."
  },
  step_up: {
    id: "step_up",
    name: "Step-up",
    type: "fuerza",
    focus: "tren_inferior",
    muscles: "cuadriceps, gluteo",
    equipment: "caja o banco",
    relativeLoad: 0.38,
    met: 5.5,
    restSec: 90,
    description: "Subidas con control y estabilidad.",
    technique: "El movimiento se realiza apoyando un pie en la caja, subiendo el cuerpo con esa pierna sin impulso de la otra, y bajando lentamente manteniendo el equilibrio."
  },

  /* =========================
     FUERZA - CORE
     ========================= */
  plancha: {
    id: "plancha",
    name: "Plancha",
    type: "fuerza",
    focus: "core",
    muscles: "abdominales, lumbar",
    equipment: "ninguno",
    relativeLoad: 0.18,
    met: 3.5,
    restSec: 45,
    description: "Isometria para estabilidad central.",
    technique: "El movimiento se realiza en apoyo de antebrazos, con el cuerpo en línea recta, abdomen y glúteos activos, evitando que la cadera caiga o se eleve."
  },
  plancha_lateral: {
    id: "plancha_lateral",
    name: "Plancha lateral",
    type: "fuerza",
    focus: "core",
    muscles: "oblicuos, core",
    equipment: "ninguno",
    relativeLoad: 0.18,
    met: 3.5,
    restSec: 45,
    description: "Estabilidad lateral del tronco.",
    technique: "El movimiento se realiza apoyando el antebrazo en el suelo, con el cuerpo alineado de pies a cabeza, cadera elevada y abdomen activo."
  },
  crunch: {
    id: "crunch",
    name: "Crunch",
    type: "fuerza",
    focus: "core",
    muscles: "abdominales",
    equipment: "ninguno",
    relativeLoad: 0.18,
    met: 3.0,
    restSec: 45,
    description: "Flexión de tronco controlada.",
    technique: "El movimiento se realiza tumbado, con rodillas flexionadas, elevando la parte alta del tronco pocos centímetros sin tirar del cuello, y bajando controlado."
  },
  elevaciones_piernas: {
    id: "elevaciones_piernas",
    name: "Elevaciones de piernas",
    type: "fuerza",
    focus: "core",
    muscles: "abdominales inferiores",
    equipment: "ninguno o barra",
    relativeLoad: 0.2,
    met: 4.0,
    restSec: 45,
    description: "Enfasis en abdomen inferior.",
    technique: "El movimiento se realiza con la zona lumbar pegada al suelo, elevando las piernas juntas sin balanceo y bajando lentamente sin arquear la espalda."
  },
  russian_twist: {
    id: "russian_twist",
    name: "Russian twist",
    type: "fuerza",
    focus: "core",
    muscles: "oblicuos",
    equipment: "ninguno o peso",
    relativeLoad: 0.2,
    met: 4.0,
    restSec: 45,
    description: "Rotación controlada del tronco.",
    technique: "El movimiento se realiza sentado con el tronco ligeramente inclinado, girando el torso de lado a lado de forma controlada sin encorvar la espalda."
  },

  /* =========================
     FUERZA - FULL BODY
     ========================= */
  burpees: {
    id: "burpees",
    name: "Burpees",
    type: "fuerza",
    focus: "full_body",
    muscles: "cuerpo completo",
    equipment: "ninguno",
    relativeLoad: 0.3,
    met: 8.5,
    restSec: 90,
    description: "Explosivo, eleva pulso y fuerza total.",
    technique: "El movimiento se realiza pasando de pie a plancha con apoyo de manos, realizando una flexión, volviendo con los pies hacia las manos y finalizando con un salto vertical."
  },
  thrusters: {
    id: "thrusters",
    name: "Thrusters",
    type: "fuerza",
    focus: "full_body",
    muscles: "piernas, hombro, core",
    equipment: "mancuernas o barra",
    relativeLoad: 0.4,
    met: 9.0,
    restSec: 90,
    description: "Sentadilla + press en un movimiento.",
    technique: "El movimiento se realiza bajando en sentadilla y, al subir, se continúa el impulso para hacer un press por encima de la cabeza sin pausas intermedias."
  },
  clean_press: {
    id: "clean_press",
    name: "Clean and press",
    type: "fuerza",
    focus: "full_body",
    muscles: "piernas, espalda, hombro",
    equipment: "barra o kettlebell",
    relativeLoad: 0.42,
    met: 9.0,
    restSec: 120,
    description: "Levantamiento tecnico de potencia.",
    technique: "El movimiento se realiza impulsando la carga desde el suelo con piernas, recibiéndola en posición de rack sobre los hombros, y presionando por encima de la cabeza con control."
  },
  kettlebell_swing: {
    id: "kettlebell_swing",
    name: "Kettlebell swing",
    type: "fuerza",
    focus: "full_body",
    muscles: "gluteo, isquios, core",
    equipment: "kettlebell",
    relativeLoad: 0.35,
    met: 8.0,
    restSec: 90,
    description: "Bisagra de cadera con ritmo.",
    technique: "El movimiento se realiza con bisagra de cadera, espalda neutra, llevando la pesa atrás y proyectándola al frente con la potencia de glúteos, sin tirar con los brazos."
  },

  /* =========================
     CARDIO - FULL BODY
     ========================= */
  caminar: {
    id: "caminar",
    name: "Caminar",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, core",
    equipment: "ninguno",
    cadenceBase: 100,
    met: 3.5,
    restSec: 0,
    description: "Actividad base de baja intensidad.",
    technique: "El movimiento se realiza con paso constante, postura erguida, brazos relajados y apoyo suave del pie."
  },
  correr: {
    id: "correr",
    name: "Correr",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, core",
    equipment: "ninguno",
    cadenceBase: 170,
    met: 9.8,
    restSec: 0,
    description: "Cardio continuo de impacto moderado.",
    technique: "El movimiento se realiza con zancada corta, apoyo medio pie, cadencia estable y tronco ligeramente inclinado hacia delante."
  },
  hiit: {
    id: "hiit",
    name: "HIIT",
    type: "cardio",
    focus: "full_body",
    muscles: "cuerpo completo",
    equipment: "variable",
    cadenceBase: 160,
    met: 10.5,
    restSec: 0,
    description: "Intervalos cortos de alta intensidad.",
    technique: "El trabajo se realiza alternando intervalos de esfuerzo muy alto con descansos activos o completos, cuidando la técnica en cada ejercicio."
  },
  saltar_cuerda: {
    id: "saltar_cuerda",
    name: "Saltar cuerda",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, hombro, core",
    equipment: "cuerda",
    cadenceBase: 120,
    met: 11.5,
    restSec: 0,
    description: "Cardio coordinativo y rapido.",
    technique: "El movimiento se realiza con saltos bajos y rápidos, girando la cuerda con las muñecas, manteniendo codos cerca del cuerpo y postura relajada."
  },
  jumping_jacks: {
    id: "jumping_jacks",
    name: "Jumping jacks",
    type: "cardio",
    focus: "full_body",
    muscles: "piernas, hombro, core",
    equipment: "ninguno",
    cadenceBase: 100,
    met: 8.0,
    restSec: 0,
    description: "Calentamiento dinamico y cardio suave.",
    technique: "El movimiento se realiza abriendo y cerrando piernas mientras los brazos suben y bajan, aterrizando suave y controlado."
  },
  mountain_climbers: {
    id: "mountain_climbers",
    name: "Mountain climbers",
    type: "cardio",
    focus: "full_body",
    muscles: "core, hombro, piernas",
    equipment: "ninguno",
    cadenceBase: 120,
    met: 9.0,
    restSec: 0,
    description: "Cardio en suelo con foco en core.",
    technique: "El movimiento se realiza en posición de plancha, llevando rodillas alternas al pecho con ritmo, manteniendo hombros sobre manos y cadera estable."
  },

  /* =========================
     CARDIO - TREN INFERIOR
     ========================= */
  bicicleta_carretera: {
    id: "bicicleta_carretera",
    name: "Bicicleta carretera",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas",
    equipment: "bicicleta",
    cadenceBase: 80,
    met: 8.0,
    restSec: 0,
    description: "Cardio continuo en ruta.",
    technique: "El movimiento se realiza con cadencia estable, postura relajada, core activo y ajustes de marcha según el terreno."
  },
  bicicleta_montana: {
    id: "bicicleta_montana",
    name: "Bicicleta montana",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, core",
    equipment: "bicicleta",
    cadenceBase: 70,
    met: 10.0,
    restSec: 0,
    description: "Mayor demanda por desnivel y terreno.",
    technique: "El movimiento se realiza anticipando el terreno, usando cambios adecuados y distribuyendo el peso para mantener tracción."
  },
  spinning: {
    id: "spinning",
    name: "Spinning",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas",
    equipment: "bicicleta estatica",
    cadenceBase: 90,
    met: 8.5,
    restSec: 0,
    description: "Intervalos en bici estatica.",
    technique: "El trabajo se realiza manteniendo cadencia, ajustando resistencia según intervalos y evitando balancear el tronco."
  },
  eliptica: {
    id: "eliptica",
    name: "Eliptica",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas",
    equipment: "maquina eliptica",
    cadenceBase: 140,
    met: 6.5,
    restSec: 0,
    description: "Cardio bajo impacto.",
    technique: "El movimiento se realiza con zancada fluida, sin bloquear rodillas y manteniendo el tronco estable."
  },
  escaladora: {
    id: "escaladora",
    name: "Escaladora",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, gluteo",
    equipment: "maquina escaladora",
    cadenceBase: 90,
    met: 8.8,
    restSec: 0,
    description: "Simula subir escaleras.",
    technique: "El movimiento se realiza con paso completo, apoyando todo el pie y sin apoyarse en exceso en los brazos."
  },
  trekking: {
    id: "trekking",
    name: "Trekking",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, core",
    equipment: "ninguno",
    cadenceBase: 100,
    met: 6.5,
    restSec: 0,
    description: "Caminata en terreno irregular.",
    technique: "El movimiento se realiza con paso firme y regular, cuidando la postura y usando bastones si hay desnivel."
  },
  patinar: {
    id: "patinar",
    name: "Patinar",
    type: "cardio",
    focus: "tren_inferior",
    muscles: "piernas, core",
    equipment: "patines",
    cadenceBase: 110,
    met: 7.5,
    restSec: 0,
    description: "Cardio coordinativo y divertido.",
    technique: "El movimiento se realiza empujando de forma lateral, con rodillas flexionadas, core activo y mirada al frente."
  },

  /* =========================
     CARDIO - TREN SUPERIOR
     ========================= */
  remo_ergometro: {
    id: "remo_ergometro",
    name: "Remo ergometro",
    type: "cardio",
    focus: "tren_superior",
    muscles: "espalda, piernas, core",
    equipment: "remo indoor",
    cadenceBase: 24,
    met: 8.5,
    restSec: 0,
    description: "Cardio completo con técnica.",
    technique: "El movimiento se realiza con la secuencia piernas-tronco-brazos en la tracción, y brazos-tronco-piernas en el retorno, manteniendo ritmo constante."
  },
  boxeo_saco: {
    id: "boxeo_saco",
    name: "Boxeo en saco",
    type: "cardio",
    focus: "tren_superior",
    muscles: "hombro, brazos, core",
    equipment: "saco",
    cadenceBase: 120,
    met: 10.5,
    restSec: 0,
    description: "Intervalos de golpeo y movilidad.",
    technique: "El trabajo se realiza con guardia alta, rotando la cadera en cada golpe y respirando con el impacto."
  },
  natacion: {
    id: "natacion",
    name: "Natacion",
    type: "cardio",
    focus: "tren_superior",
    muscles: "espalda, hombro, core",
    equipment: "piscina",
    cadenceBase: 30,
    met: 9.5,
    restSec: 0,
    description: "Cardio sin impacto con gran demanda.",
    technique: "El movimiento se realiza con brazada larga, patada constante y respiración lateral o frontal según el estilo."
  },

  /* =========================
     CARDIO - MOVILIDAD / RECUPERACION
     ========================= */
  estiramientos: {
    id: "estiramientos",
    name: "Estiramientos",
    type: "cardio",
    focus: "movilidad",
    muscles: "movilidad general",
    equipment: "ninguno",
    cadenceBase: 40,
    met: 2.3,
    restSec: 0,
    description: "Mejora rango de movimiento y recuperacion.",
    technique: "El trabajo se realiza manteniendo cada postura 20-40 segundos sin rebotes, respirando de forma relajada."
  },
  yoga_suave: {
    id: "yoga_suave",
    name: "Yoga suave",
    type: "cardio",
    focus: "movilidad",
    muscles: "movilidad, core",
    equipment: "esterilla",
    cadenceBase: 50,
    met: 2.5,
    restSec: 0,
    description: "Respiración y control postural.",
    technique: "El trabajo se realiza con respiración lenta, transiciones suaves y posturas alineadas sin forzar el rango."
  },
  movilidad_articular: {
    id: "movilidad_articular",
    name: "Movilidad articular",
    type: "cardio",
    focus: "movilidad",
    muscles: "articulaciones",
    equipment: "ninguno",
    cadenceBase: 50,
    met: 2.0,
    restSec: 0,
    description: "Rutina corta para preparar el cuerpo.",
    technique: "El trabajo se realiza con movimientos circulares controlados, recorriendo todo el rango articular sin dolor."
  },
  sauna: {
    id: "sauna",
    name: "Sauna",
    type: "cardio",
    focus: "recuperacion",
    muscles: "recuperacion",
    equipment: "sauna",
    cadenceBase: 30,
    met: 1.5,
    restSec: 0,
    description: "Relajacion y recuperacion general.",
    technique: "La sesión se realiza sentado o recostado, hidratándote bien y saliendo si hay mareo o exceso de calor."
  }
};

window.EXERCISES = EXERCISES;




