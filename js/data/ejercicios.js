/* =========================================
   data/ejercicios.js - DATOS
   ========================================= */

// Convenciones:
// - tipo: "fuerza" | "cardio"
// - enfoque: tren_superior | tren_inferior | core | full_body | movilidad | recuperacion
// - unidad: "rep" | "min"
// - met: METs aproximados (kcal = MET * pesoKg * tiempoMin / 60)
// - tiempos (rep): segPorRep, descansoSeg, segTransicion

const EXERCISES = {
  /* =========================
     FUERZA - TREN SUPERIOR
     ========================= */
  flexiones: {
    name: "Flexiones",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "pecho, triceps, hombro",
    equipo: "ninguno",
    unidad: "rep",
    met: 6.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Empuje horizontal con control del core.",
    tecnica: "El movimiento se realiza apoyando manos bajo el pecho, cuerpo en linea recta desde cabeza a talones, flexionando codos para bajar hasta que el pecho se acerque al suelo, manteniendo el core activo y la cadera estable, y empujando de nuevo hasta extender los brazos sin bloquear."
  },
  press_banca: {
    name: "Press banca",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "pecho, triceps, hombro",
    equipo: "banco, barra",
    unidad: "rep",
    met: 5.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Basico de empuje para fuerza e hipertrofia.",
    tecnica: "El movimiento se realiza acostado en banco, con escÃ¡pulas retraÃ­das y pies firmes en el suelo; se baja la barra de forma controlada hasta el pecho medio, manteniendo los codos en un Ã¡ngulo cÃ³modo, y se empuja hacia arriba en lÃ­nea recta sin perder la estabilidad del tronco."
  },
  press_inclinado: {
    name: "Press inclinado",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "pecho superior, hombro, triceps",
    equipo: "banco inclinado, mancuernas o barra",
    unidad: "rep",
    met: 5.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Enfasis en porcion superior del pectoral.",
    tecnica: "El movimiento se realiza en banco inclinado (30-45 grados), bajando la carga de forma controlada hasta la parte alta del pecho y empujando hacia arriba sin bloquear los codos, manteniendo el tronco estable y las escÃ¡pulas activas."
  },
  aperturas_mancuernas: {
    name: "Aperturas con mancuernas",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "pecho",
    equipo: "mancuernas, banco",
    unidad: "rep",
    met: 4.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Aislamiento del pectoral con rango amplio.",
    tecnica: "El movimiento se realiza con codos ligeramente flexionados, abriendo los brazos en arco hasta sentir estiramiento del pectoral, manteniendo la tensiÃ³n sin rebotar, y cerrando de nuevo arriba sin chocar las mancuernas."
  },
  fondos_paralelas: {
    name: "Fondos en paralelas",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "pecho, triceps, hombro",
    equipo: "paralelas",
    unidad: "rep",
    met: 6.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Empuje vertical con alto reclutamiento.",
    tecnica: "El movimiento se realiza sujetando las paralelas con el cuerpo suspendido, inclinando ligeramente el tronco, flexionando codos para descender de forma controlada hasta un rango cÃ³modo y empujando para extender sin balanceos."
  },
  dominadas: {
    name: "Dominadas",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "espalda, biceps, core",
    equipo: "barra dominadas",
    unidad: "rep",
    met: 7.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Traccion vertical con carga corporal.",
    tecnica: "El movimiento se realiza colgado de la barra, activando las escÃ¡pulas primero, elevando el cuerpo hasta que el pecho se acerque a la barra, y descendiendo controlado hasta extensiÃ³n completa sin dejar que los hombros se colapsen."
  },
  jalon_pecho: {
    name: "Jalon al pecho",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "espalda, biceps",
    equipo: "polea",
    unidad: "rep",
    met: 5.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Alternativa a dominadas con carga regulable.",
    tecnica: "El movimiento se realiza sentado con el tronco estable, tirando de la barra hacia la parte alta del pecho con codos hacia abajo y atrÃ¡s, y retornando la carga lentamente sin perder la postura."
  },
  remo_barra: {
    name: "Remo con barra",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "espalda, biceps, core",
    equipo: "barra",
    unidad: "rep",
    met: 6.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Traccion horizontal para densidad de espalda.",
    tecnica: "El movimiento se realiza en bisagra de cadera con espalda neutra, llevando la barra hacia el ombligo con codos cerca del cuerpo, y bajando controlado sin encorvar ni balancear."
  },
  remo_mancuernas: {
    name: "Remo con mancuerna",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "espalda, biceps",
    equipo: "mancuerna, banco",
    unidad: "rep",
    met: 5.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Trabajo unilateral para equilibrio y control.",
    tecnica: "El movimiento se realiza apoyando una mano en el banco, con la espalda recta, llevando la mancuerna hacia la cadera con el codo pegado y bajando lentamente sin rotar el tronco."
  },
  face_pull: {
    name: "Face pull",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "deltoide posterior, espalda alta",
    equipo: "polea, cuerda",
    unidad: "rep",
    met: 4.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Salud del hombro y postura.",
    tecnica: "El movimiento se realiza tirando de la cuerda hacia la cara, con codos altos y separados, llevando las manos a la altura de las orejas y contrayendo la espalda alta antes de volver controlado."
  },
  press_militar: {
    name: "Press militar",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "hombro, triceps, core",
    equipo: "barra o mancuernas",
    unidad: "rep",
    met: 6.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Empuje vertical de pie.",
    tecnica: "El movimiento se realiza de pie, con glÃºteos y abdomen activos, empujando la barra desde el pecho hacia arriba en lÃ­nea recta, evitando arquear la zona lumbar, y bajando de forma controlada."
  },
  elevaciones_laterales: {
    name: "Elevaciones laterales",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "deltoide lateral",
    equipo: "mancuernas",
    unidad: "rep",
    met: 4.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Aislamiento de hombro para amplitud.",
    tecnica: "El movimiento se realiza con codos semidoblados, elevando los brazos hasta la altura del hombro sin balanceo, y descendiendo lentamente manteniendo la tensiÃ³n."
  },
  curl_biceps: {
    name: "Curl biceps",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "biceps",
    equipo: "mancuernas o barra",
    unidad: "rep",
    met: 3.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Aislamiento de flexores del codo.",
    tecnica: "El movimiento se realiza con codos pegados al torso, flexionando hasta llevar el peso hacia el hombro sin impulso, y bajando de forma lenta y completa."
  },
  curl_martillo: {
    name: "Curl martillo",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "biceps, braquiorradial",
    equipo: "mancuernas",
    unidad: "rep",
    met: 3.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Enfasis en antebrazo y braquial.",
    tecnica: "El movimiento se realiza con agarre neutro, codos estables, subiendo y bajando en recorrido completo sin balancear el tronco."
  },
  extension_triceps: {
    name: "Extension triceps",
    tipo: "fuerza",
    enfoque: "tren_superior",
    musculos: "triceps",
    equipo: "polea o mancuerna",
    unidad: "rep",
    met: 3.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Aislamiento del triceps.",
    tecnica: "El movimiento se realiza con codos fijos, extendiendo el antebrazo hasta completar la extensiÃ³n sin mover el hombro, y regresando controlado."
  },

  /* =========================
     FUERZA - TREN INFERIOR
     ========================= */
  sentadilla: {
    name: "Sentadilla",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "cuadriceps, gluteo, core",
    equipo: "barra o mancuernas",
    unidad: "rep",
    met: 6.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Basico de fuerza para piernas.",
    tecnica: "El movimiento se realiza flexionando rodillas y cadera para hacer bajar el cuerpo hacia el suelo sin perder la verticalidad, manteniendo la espalda neutra, y volviendo luego a la posiciÃ³n erguida empujando con los pies."
  },
  sentadilla_goblet: {
    name: "Sentadilla goblet",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "cuadriceps, gluteo, core",
    equipo: "mancuerna o kettlebell",
    unidad: "rep",
    met: 6.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Variante segura para tecnica.",
    tecnica: "El movimiento se realiza sujetando la carga al pecho, con codos hacia abajo, descendiendo en sentadilla profunda sin perder la postura y subiendo de forma controlada."
  },
  peso_muerto: {
    name: "Peso muerto",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "isquios, gluteo, espalda",
    equipo: "barra",
    unidad: "rep",
    met: 7.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Patron de bisagra de cadera.",
    tecnica: "El movimiento se realiza con la barra pegada al cuerpo, espalda neutra y cadera atrÃ¡s; se empuja el suelo con los pies y se extiende la cadera hasta quedar erguido, bajando luego con control."
  },
  peso_muerto_rumano: {
    name: "Peso muerto rumano",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "isquios, gluteo",
    equipo: "barra o mancuernas",
    unidad: "rep",
    met: 6.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Enfasis en isquios sin tocar el suelo.",
    tecnica: "El movimiento se realiza con rodillas semidobladas, llevando la cadera hacia atrÃ¡s, bajando la carga hasta sentir estiramiento en isquios, y subiendo manteniendo la espalda neutra."
  },
  zancadas: {
    name: "Zancadas",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "cuadriceps, gluteo, core",
    equipo: "ninguno o mancuernas",
    unidad: "rep",
    met: 6.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Trabajo unilateral y estabilidad.",
    tecnica: "El movimiento se realiza dando un paso largo, flexionando ambas rodillas hasta acercar la rodilla trasera al suelo, con el torso erguido, y empujando para volver a la posiciÃ³n inicial."
  },
  prensa_piernas: {
    name: "Prensa de piernas",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "cuadriceps, gluteo",
    equipo: "maquina",
    unidad: "rep",
    met: 6.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Carga alta con soporte de espalda.",
    tecnica: "El movimiento se realiza con la espalda apoyada, pies estables en la plataforma, bajando la carga de forma controlada sin despegar la pelvis, y extendiendo las piernas sin bloquear rodillas."
  },
  hip_thrust: {
    name: "Hip thrust",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "gluteo",
    equipo: "banco, barra",
    unidad: "rep",
    met: 5.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Maxima activacion de gluteo.",
    tecnica: "El movimiento se realiza con la espalda alta apoyada en banco, empujando con talones, extendiendo la cadera hasta alinear rodillas, cadera y hombros, y bajando controlado."
  },
  elevacion_gemelos: {
    name: "Elevacion de gemelos",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "gemelos",
    equipo: "maquina o mancuernas",
    unidad: "rep",
    met: 3.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Aislamiento de pantorrilla.",
    tecnica: "El movimiento se realiza elevando los talones hasta mÃ¡xima contracciÃ³n, manteniendo una breve pausa arriba, y descendiendo lentamente hasta estirar."
  },
  step_up: {
    name: "Step-up",
    tipo: "fuerza",
    enfoque: "tren_inferior",
    musculos: "cuadriceps, gluteo",
    equipo: "caja o banco",
    unidad: "rep",
    met: 5.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Subidas con control y estabilidad.",
    tecnica: "El movimiento se realiza apoyando un pie en la caja, subiendo el cuerpo con esa pierna sin impulso de la otra, y bajando lentamente manteniendo el equilibrio."
  },

  /* =========================
     FUERZA - CORE
     ========================= */
  plancha: {
    name: "Plancha",
    tipo: "fuerza",
    enfoque: "core",
    musculos: "abdominales, lumbar",
    equipo: "ninguno",
    unidad: "min",
    met: 3.5,
    descripcion: "Isometria para estabilidad central.",
    tecnica: "El movimiento se realiza en apoyo de antebrazos, con el cuerpo en lÃ­nea recta, abdomen y glÃºteos activos, evitando que la cadera caiga o se eleve."
  },
  plancha_lateral: {
    name: "Plancha lateral",
    tipo: "fuerza",
    enfoque: "core",
    musculos: "oblicuos, core",
    equipo: "ninguno",
    unidad: "min",
    met: 3.5,
    descripcion: "Estabilidad lateral del tronco.",
    tecnica: "El movimiento se realiza apoyando el antebrazo en el suelo, con el cuerpo alineado de pies a cabeza, cadera elevada y abdomen activo."
  },
  crunch: {
    name: "Crunch",
    tipo: "fuerza",
    enfoque: "core",
    musculos: "abdominales",
    equipo: "ninguno",
    unidad: "rep",
    met: 3.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Flexion de tronco controlada.",
    tecnica: "El movimiento se realiza tumbado, con rodillas flexionadas, elevando la parte alta del tronco pocos centÃ­metros sin tirar del cuello, y bajando controlado."
  },
  elevaciones_piernas: {
    name: "Elevaciones de piernas",
    tipo: "fuerza",
    enfoque: "core",
    musculos: "abdominales inferiores",
    equipo: "ninguno o barra",
    unidad: "rep",
    met: 4.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Enfasis en abdomen inferior.",
    tecnica: "El movimiento se realiza con la zona lumbar pegada al suelo, elevando las piernas juntas sin balanceo y bajando lentamente sin arquear la espalda."
  },
  russian_twist: {
    name: "Russian twist",
    tipo: "fuerza",
    enfoque: "core",
    musculos: "oblicuos",
    equipo: "ninguno o peso",
    unidad: "rep",
    met: 4.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Rotacion controlada del tronco.",
    tecnica: "El movimiento se realiza sentado con el tronco ligeramente inclinado, girando el torso de lado a lado de forma controlada sin encorvar la espalda."
  },

  /* =========================
     FUERZA - FULL BODY
     ========================= */
  burpees: {
    name: "Burpees",
    tipo: "fuerza",
    enfoque: "full_body",
    musculos: "cuerpo completo",
    equipo: "ninguno",
    unidad: "rep",
    met: 8.5,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Explosivo, eleva pulso y fuerza total.",
    tecnica: "El movimiento se realiza pasando de pie a plancha con apoyo de manos, realizando una flexiÃ³n, volviendo con los pies hacia las manos y finalizando con un salto vertical."
  },
  thrusters: {
    name: "Thrusters",
    tipo: "fuerza",
    enfoque: "full_body",
    musculos: "piernas, hombro, core",
    equipo: "mancuernas o barra",
    unidad: "rep",
    met: 9.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Sentadilla + press en un movimiento.",
    tecnica: "El movimiento se realiza bajando en sentadilla y, al subir, se continÃºa el impulso para hacer un press por encima de la cabeza sin pausas intermedias."
  },
  clean_press: {
    name: "Clean and press",
    tipo: "fuerza",
    enfoque: "full_body",
    musculos: "piernas, espalda, hombro",
    equipo: "barra o kettlebell",
    unidad: "rep",
    met: 9.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Levantamiento tecnico de potencia.",
    tecnica: "El movimiento se realiza impulsando la carga desde el suelo con piernas, recibiÃ©ndola en posiciÃ³n de rack sobre los hombros, y presionando por encima de la cabeza con control."
  },
  kettlebell_swing: {
    name: "Kettlebell swing",
    tipo: "fuerza",
    enfoque: "full_body",
    musculos: "gluteo, isquios, core",
    equipo: "kettlebell",
    unidad: "rep",
    met: 8.0,
    segPorRep: 4,
    descansoSeg: 90,
    segTransicion: 15,
    descripcion: "Bisagra de cadera con ritmo.",
    tecnica: "El movimiento se realiza con bisagra de cadera, espalda neutra, llevando la pesa atrÃ¡s y proyectÃ¡ndola al frente con la potencia de glÃºteos, sin tirar con los brazos."
  },

  /* =========================
     CARDIO - FULL BODY
     ========================= */
  caminar: {
    name: "Caminar",
    tipo: "cardio",
    enfoque: "full_body",
    musculos: "piernas, core",
    equipo: "ninguno",
    unidad: "min",
    met: 3.5,
    descripcion: "Actividad base de baja intensidad.",
    tecnica: "El movimiento se realiza con paso constante, postura erguida, brazos relajados y apoyo suave del pie."
  },
  correr: {
    name: "Correr",
    tipo: "cardio",
    enfoque: "full_body",
    musculos: "piernas, core",
    equipo: "ninguno",
    unidad: "min",
    met: 9.8,
    descripcion: "Cardio continuo de impacto moderado.",
    tecnica: "El movimiento se realiza con zancada corta, apoyo medio pie, cadencia estable y tronco ligeramente inclinado hacia delante."
  },
  hiit: {
    name: "HIIT",
    tipo: "cardio",
    enfoque: "full_body",
    musculos: "cuerpo completo",
    equipo: "variable",
    unidad: "min",
    met: 10.5,
    descripcion: "Intervalos cortos de alta intensidad.",
    tecnica: "El trabajo se realiza alternando intervalos de esfuerzo muy alto con descansos activos o completos, cuidando la tÃ©cnica en cada ejercicio."
  },
  saltar_cuerda: {
    name: "Saltar cuerda",
    tipo: "cardio",
    enfoque: "full_body",
    musculos: "piernas, hombro, core",
    equipo: "cuerda",
    unidad: "min",
    met: 11.5,
    descripcion: "Cardio coordinativo y rapido.",
    tecnica: "El movimiento se realiza con saltos bajos y rÃ¡pidos, girando la cuerda con las muÃ±ecas, manteniendo codos cerca del cuerpo y postura relajada."
  },
  jumping_jacks: {
    name: "Jumping jacks",
    tipo: "cardio",
    enfoque: "full_body",
    musculos: "piernas, hombro, core",
    equipo: "ninguno",
    unidad: "min",
    met: 8.0,
    descripcion: "Calentamiento dinamico y cardio suave.",
    tecnica: "El movimiento se realiza abriendo y cerrando piernas mientras los brazos suben y bajan, aterrizando suave y controlado."
  },
  mountain_climbers: {
    name: "Mountain climbers",
    tipo: "cardio",
    enfoque: "full_body",
    musculos: "core, hombro, piernas",
    equipo: "ninguno",
    unidad: "min",
    met: 9.0,
    descripcion: "Cardio en suelo con foco en core.",
    tecnica: "El movimiento se realiza en posiciÃ³n de plancha, llevando rodillas alternas al pecho con ritmo, manteniendo hombros sobre manos y cadera estable."
  },

  /* =========================
     CARDIO - TREN INFERIOR
     ========================= */
  bicicleta_carretera: {
    name: "Bicicleta carretera",
    tipo: "cardio",
    enfoque: "tren_inferior",
    musculos: "piernas",
    equipo: "bicicleta",
    unidad: "min",
    met: 8.0,
    descripcion: "Cardio continuo en ruta.",
    tecnica: "El movimiento se realiza con cadencia estable, postura relajada, core activo y ajustes de marcha segÃºn el terreno."
  },
  bicicleta_montana: {
    name: "Bicicleta montana",
    tipo: "cardio",
    enfoque: "tren_inferior",
    musculos: "piernas, core",
    equipo: "bicicleta",
    unidad: "min",
    met: 10.0,
    descripcion: "Mayor demanda por desnivel y terreno.",
    tecnica: "El movimiento se realiza anticipando el terreno, usando cambios adecuados y distribuyendo el peso para mantener tracciÃ³n."
  },
  spinning: {
    name: "Spinning",
    tipo: "cardio",
    enfoque: "tren_inferior",
    musculos: "piernas",
    equipo: "bicicleta estatica",
    unidad: "min",
    met: 8.5,
    descripcion: "Intervalos en bici estatica.",
    tecnica: "El trabajo se realiza manteniendo cadencia, ajustando resistencia segÃºn intervalos y evitando balancear el tronco."
  },
  eliptica: {
    name: "Eliptica",
    tipo: "cardio",
    enfoque: "tren_inferior",
    musculos: "piernas",
    equipo: "maquina eliptica",
    unidad: "min",
    met: 6.5,
    descripcion: "Cardio bajo impacto.",
    tecnica: "El movimiento se realiza con zancada fluida, sin bloquear rodillas y manteniendo el tronco estable."
  },
  escaladora: {
    name: "Escaladora",
    tipo: "cardio",
    enfoque: "tren_inferior",
    musculos: "piernas, gluteo",
    equipo: "maquina escaladora",
    unidad: "min",
    met: 8.8,
    descripcion: "Simula subir escaleras.",
    tecnica: "El movimiento se realiza con paso completo, apoyando todo el pie y sin apoyarse en exceso en los brazos."
  },
  trekking: {
    name: "Trekking",
    tipo: "cardio",
    enfoque: "tren_inferior",
    musculos: "piernas, core",
    equipo: "ninguno",
    unidad: "min",
    met: 6.5,
    descripcion: "Caminata en terreno irregular.",
    tecnica: "El movimiento se realiza con paso firme y regular, cuidando la postura y usando bastones si hay desnivel."
  },
  patinar: {
    name: "Patinar",
    tipo: "cardio",
    enfoque: "tren_inferior",
    musculos: "piernas, core",
    equipo: "patines",
    unidad: "min",
    met: 7.5,
    descripcion: "Cardio coordinativo y divertido.",
    tecnica: "El movimiento se realiza empujando de forma lateral, con rodillas flexionadas, core activo y mirada al frente."
  },

  /* =========================
     CARDIO - TREN SUPERIOR
     ========================= */
  remo_ergometro: {
    name: "Remo ergometro",
    tipo: "cardio",
    enfoque: "tren_superior",
    musculos: "espalda, piernas, core",
    equipo: "remo indoor",
    unidad: "min",
    met: 8.5,
    descripcion: "Cardio completo con tecnica.",
    tecnica: "El movimiento se realiza con la secuencia piernas-tronco-brazos en la tracciÃ³n, y brazos-tronco-piernas en el retorno, manteniendo ritmo constante."
  },
  boxeo_saco: {
    name: "Boxeo en saco",
    tipo: "cardio",
    enfoque: "tren_superior",
    musculos: "hombro, brazos, core",
    equipo: "saco",
    unidad: "min",
    met: 10.5,
    descripcion: "Intervalos de golpeo y movilidad.",
    tecnica: "El trabajo se realiza con guardia alta, rotando la cadera en cada golpe y respirando con el impacto."
  },
  natacion: {
    name: "Natacion",
    tipo: "cardio",
    enfoque: "tren_superior",
    musculos: "espalda, hombro, core",
    equipo: "piscina",
    unidad: "min",
    met: 9.5,
    descripcion: "Cardio sin impacto con gran demanda.",
    tecnica: "El movimiento se realiza con brazada larga, patada constante y respiraciÃ³n lateral o frontal segÃºn el estilo."
  },

  /* =========================
     CARDIO - MOVILIDAD / RECUPERACION
     ========================= */
  estiramientos: {
    name: "Estiramientos",
    tipo: "cardio",
    enfoque: "movilidad",
    musculos: "movilidad general",
    equipo: "ninguno",
    unidad: "min",
    met: 2.3,
    descripcion: "Mejora rango de movimiento y recuperacion.",
    tecnica: "El trabajo se realiza manteniendo cada postura 20-40 segundos sin rebotes, respirando de forma relajada."
  },
  yoga_suave: {
    name: "Yoga suave",
    tipo: "cardio",
    enfoque: "movilidad",
    musculos: "movilidad, core",
    equipo: "esterilla",
    unidad: "min",
    met: 2.5,
    descripcion: "Respiracion y control postural.",
    tecnica: "El trabajo se realiza con respiraciÃ³n lenta, transiciones suaves y posturas alineadas sin forzar el rango."
  },
  movilidad_articular: {
    name: "Movilidad articular",
    tipo: "cardio",
    enfoque: "movilidad",
    musculos: "articulaciones",
    equipo: "ninguno",
    unidad: "min",
    met: 2.0,
    descripcion: "Rutina corta para preparar el cuerpo.",
    tecnica: "El trabajo se realiza con movimientos circulares controlados, recorriendo todo el rango articular sin dolor."
  },
  sauna: {
    name: "Sauna",
    tipo: "cardio",
    enfoque: "recuperacion",
    musculos: "recuperacion",
    equipo: "sauna",
    unidad: "min",
    met: 1.5,
    descripcion: "Relajacion y recuperacion general.",
    tecnica: "La sesiÃ³n se realiza sentado o recostado, hidratÃ¡ndote bien y saliendo si hay mareo o exceso de calor."
  }
};

window.EXERCISES = EXERCISES;


